# chat/consumers.py
import json,threading,datetime,aiohttp,requests, asyncio
import redis,aiofiles
from django.core.files.storage import FileSystemStorage
import time,os,shutil,base64
from django.conf import settings, Settings
from markdown import markdown
from asgiref.sync import sync_to_async,async_to_sync
from channels.generic.websocket import WebsocketConsumer,AsyncWebsocketConsumer
from django.core.exceptions import ValidationError
from .models import Account,FolderTable,FileTable
from channels.db import database_sync_to_async
from django.core.files.storage import default_storage
from django.db.models import Q
from .models import sanitize_string
from .serializers import FolderTableSerializer,FileTableSerializer
from circuitbreaker import circuit
import google.generativeai as genai
from django.conf import settings
from asyncio import Task, gather, CancelledError
import pollinations as pollinationsAi
from aiobreaker import CircuitBreaker
from PIL import Image, ImageDraw, ImageFont
from django.shortcuts import redirect
from django.conf import settings
## Youtube imports
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

from google_auth_oauthlib.flow import InstalledAppFlow
from google_auth_oauthlib.flow import Flow
from thumbnails import Thumbnail,get_thumbnail
from io import BytesIO
from moviepy import VideoFileClip
import google_auth_httplib2
import google_auth_oauthlib
import googleapiclient.discovery
import googleapiclient.errors
import googleapiclient.http
# Create an async circuit breaker
asyncCircuitBreaker = CircuitBreaker(fail_max=5, timeout_duration=60)
YoutubeCustomPrompt = """    
    strictly following YouTube's API schema for video uploads. Follow these rules:
    1. Each object MUST include:
    - A `snippet` object with:
        * `title` (string, 1-100 characters)
        * `description` (string, 0-5000 characters)
        * `tags` (array of 0-500 strings, each ≤ 70 characters)
        * `categoryId` (valid YouTube category ID string like "28")
    - A `status` object with:
        * `privacyStatus` (ONLY "public", "private", or "unlisted")
        * `madeForKids` (boolean) true
        * `selfDeclaredMadeForKids` true
    - A `audio` object with:
        * `script` write a 1 minute script in general of this object. The script should be a professional script and only words alone
    - A `ImageList` (array of objects, each object should contain a custom image name and image description ):
        * `name` a custom image name with '.jpg' extension. A name should not repeated it should be unique
        * `description` an image description for this object video description that can be used for this object video and should match it
        

    2. Structure EXACTLY like this:
    ```json
    {
    "snippet": {
        "title": "Text here",
        "description": "Text here",
        "tags": ["tag1", "tag2"],
        "categoryId": "27"
    },
    "status": {
        "privacyStatus": "private",
        "madeForKids": false,
        "selfDeclaredMadeForKids": True
    },
    "audio": {
        "script": "Text here"
    },
    "ImageList": [
            {
                "name" : "Text here",
                "description" : "Text here"
            }
        ]
    }
    
    3. Provide the spesified number of examples distinctively with:
        - Different YouTube categories
        - Varied privacyStatus values
        - Relevant tags matching the title/description
        - Relevant images description matching their parent object description
        `;
"""

YoutubeCustomPromptForAudioToVideo = """    
    strictly following YouTube's API schema for video uploads. Follow these rules:
    1. Each object MUST include:
    - A `snippet` object with:
        * `title` (string, 1-100 characters)
        * `description` (string, 0-5000 characters)
        * `tags` (array of 0-500 strings, each ≤ 70 characters)
        * `categoryId` (valid YouTube category ID string like "28")
    - A `status` object with:
        * `privacyStatus` (ONLY "public", "private", or "unlisted")
        * `madeForKids` (boolean) true
        * `selfDeclaredMadeForKids` true
    - A `ImageList` (array of objects, each object should contain a custom image name and image description ):
        * `name` a custom image name with '.jpg' extension. A name should not repeated it should be unique
        * `description` an image description for this object video description that can be used for this object video and should match it
        

    2. Structure EXACTLY like this:
    ```json
    {
    "snippet": {
        "title": "Text here",
        "description": "Text here",
        "tags": ["tag1", "tag2"],
        "categoryId": "27"
    },
    "status": {
        "privacyStatus": "private",
        "madeForKids": false,
        "selfDeclaredMadeForKids": True
    }
    "ImageList": [
            {
                "name" : "Text here",
                "description" : "Text here"
            }
        ]
    }
    
    3. Provide the spesified number of examples distinctively with:
        - Different YouTube categories
        - Varied privacyStatus values
        - Relevant tags matching the title/description
        - Relevant images description matching their parent object description
        `;
"""


class RetryCustomError(Exception):
    def __init__(self, retry, message):
        self.retry = retry
        self.message = message
        super().__init__(retry, message)


@asyncCircuitBreaker
async def RequestAIResponseFunc(prompt,email,NumberOfRequestRetry):
    """Generate AI text content asynchronously."""
    try:
        try:
            model = settings.AI_MODEL
            response = await asyncio.to_thread(model.generate_content, prompt)  # Run sync function in async environment
        except Exception as e:
            raise RetryCustomError("retry", "It seems there is an issue with your request. Try again later❌")
        #print(response,type(response))
        cleaned_json_string = response.text.strip("```json\n").strip("```")

        # Parse into JSON format
        json_data = json.loads(cleaned_json_string)
        # response_json = json.loads(demodata)
        #response.text
        reponseval = {'type' : 'success','status' : 'success','result' : json_data}
        return reponseval
    except RetryCustomError as e:
        print("Custom DownloadError caught:")
        print("Retry flag:", e.retry)
        print("Message:", e.message)
        responseval = {
                'type': e.retry,
                'status': 'error',
                'result': e.message,
                'NumberOfRequestRetry' : NumberOfRequestRetry
        }
        return responseval
    except Exception as e:
        print(e)
        responseval = {
            'type': 'error',
            'status': 'error',
            'result': 'It seems there is an issue with your request. Try again later'
        }
        return responseval

@asyncCircuitBreaker
async def RequestRequestClearServer(email):
    """Generate AI text content asynchronously."""
    try:
        folder_path = os.path.join(settings.MEDIA_ROOT, email, 'youtube')
        folder_exists = await asyncio.to_thread(os.path.exists, folder_path)
        if folder_exists:
            await asyncio.to_thread(shutil.rmtree, folder_path)
        
        responseval = {'type': 'success', 'result': 'Files cleared successfully'}
        return responseval
    except Exception as e:
        print(e)
        responseval = {
            'type': 'error',
            'status': 'error',
            'result': "It seems there is an issue while clearing your files. That shouldn't worry you"
        }
        return responseval

# function to download the iamges
@asyncCircuitBreaker
async def download_image(image_url, filename, emailval, SocialMediaType):
    async with aiohttp.ClientSession() as session:
        async with session.get(image_url) as response:
            if response.status == 200:
                
                content = await response.read()
                folder_path = os.path.join(settings.MEDIA_ROOT, emailval, SocialMediaType)
                file_path = os.path.join(folder_path, filename)
                
                # Check and remove existing file in a separate thread.
                exists = await asyncio.to_thread(os.path.exists, file_path)
                if exists:
                    try:
                        await asyncio.to_thread(os.remove, file_path)
                        print(f"Existing File deleted: {file_path}")
                    except Exception as e:
                        print(f"Error deleting existing file {file_path}: {e}")
                
                # Save file using Django's FileSystemStorage offloaded to a thread.
                def save_file():
                    custom_storage = FileSystemStorage(location=folder_path)
                    with custom_storage.open(filename, 'wb') as file:
                        file.write(content)
                await asyncio.to_thread(save_file)
                
                print(f"\n\nDownload Completed: {filename} ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅")
            else:
                print(f"\n\nFailed to download {filename} ❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌")
                raise RetryCustomError("retry", "An error occurred when downloading your images❌")
                
    return filename


@asyncCircuitBreaker
async def generate_image_async(description, title):
    try:
        # Create an asynchronous pollinations image model.
        image_model = pollinationsAi.Async.Image(
            model=pollinationsAi.Image.flux(),
            seed="random",
            width=1024,
            height=1024,
            enhance=False,
            nologo=True,
            private=True,
            safe=False,
            referrer="pollinations.py"
        )
        # Generate the image asynchronously.
        image = await image_model(prompt=f'{description}')
        # Offload the synchronous image.save() call to a thread.
        await asyncio.to_thread(image.save, file=f'{title}.jpg')
    except Exception as e:
        raise RetryCustomError("retry", "Seams like there is an issue when generating your image❌")


@asyncCircuitBreaker
async def RequestCreateImagesFunc(prompt, email, SocialMediaType,NumberOfRequestRetry):
    """Generate AI images content asynchronously."""
    try:
        dataval = prompt
        social_media_folder_path = os.path.join(settings.MEDIA_ROOT, email, SocialMediaType)
        
        # Ensure the folder is created asynchronously.
        folder_exists = await asyncio.to_thread(os.path.exists, social_media_folder_path)
        if not folder_exists:
            await asyncio.to_thread(os.mkdir, social_media_folder_path)
        else:
            await asyncio.to_thread(shutil.rmtree, social_media_folder_path)
            await asyncio.to_thread(os.mkdir, social_media_folder_path)
            
        loopval = 0
        for items in dataval:
            objectval = items.get("ImageList", [])
            i = 0
            for objectval_items in objectval:
                print(f'\n\n{i} - {objectval_items}\n\n')           
                title = objectval_items.get("name", f'{i}_{email}')  # Fallback title  
                # Image details
                ImageDescription = objectval_items.get("description", "A beautiful natural scene")
                width = 1024
                height = 1024
                seed = 42  # Each seed generates a new image variation
                model = 'flux'  # Using 'flux' as default if model is not provided

                # Construct API image URL.
                API_image_url = f"https://pollinations.ai/p/{ImageDescription}?width={width}&height={height}&seed={seed}&model={model}"
                

                # Generate image asynchronously.
                await generate_image_async(ImageDescription, title)
                # Download the generated image.
                await download_image(API_image_url, title, email, SocialMediaType)
                
                storage_name = f'{email}/{SocialMediaType}/{title}'
                print(f'\n\nAt object {loopval} generated {title}')
                i += 1
                print(f'\nRemaining images {i}/{len(objectval)} images')
            loopval += 1
            print(f'\nRemaining loops {loopval}/{len(dataval)} objects ')
       
        responseval = {
            'type': 'success',
            'status': 'success',
            'result': 'All images processed',
            'data': dataval
        }
        return responseval
    
    except RetryCustomError as e:
        print("Custom DownloadError caught:")
        print("Retry flag:", e.retry)
        print("Message:", e.message)
        responseval = {
                'type': e.retry,
                'status': 'error',
                'result': e.message,
                'NumberOfRequestRetry' : NumberOfRequestRetry
        }
        return responseval
    except Exception as e:
        print(e)
        responseval = {
            'type': 'error',
            'status': 'error',
            'result': 'It seems there is an issue with your request. Try again later'
        }
        return responseval

@asyncCircuitBreaker
async def RequestCreateImagesTranscriptFunc(prompt, email, SocialMediaType,NumberOfRequestRetry):
    """Generate AI images content asynchronously for transcripts."""
    try:
        dataval = prompt
        social_media_folder_path = os.path.join(settings.MEDIA_ROOT, email, SocialMediaType)
        
        # No need to create or delete folder if not required, or replicate as in RequestCreateImagesFunc.
        loopval = 0
        for items in dataval:
            objectval = items.get("ImageList", [])
            i = 0
            for objectval_items in objectval:
                print(f'\n\n{i} - {objectval_items}\n\n')           
                title = objectval_items.get("name", f'{i}_{email}')  # Fallback title  
                ImageDescription = objectval_items.get("description", "A beautiful natural scene")
                width = 1024
                height = 1024
                seed = 42
                model = 'flux'
                API_image_url = f"https://pollinations.ai/p/{ImageDescription}?width={width}&height={height}&seed={seed}&model={model}"
                
                await generate_image_async(ImageDescription, title)
                await download_image(API_image_url, title, email, SocialMediaType)
                storage_name = f'{email}/{SocialMediaType}/{title}'
                print(f'\n\nAt object {loopval} generated {title}')
                i += 1
                print(f'\nRemaining images {i}/{len(objectval)} images')
            loopval += 1
            print(f'\nRemaining loops {loopval}/{len(dataval)} objects ')
       
        responseval = {
            'type': 'success',
            'status': 'success',
            'result': 'All images processed',
            'data': dataval
        }
        return responseval
    except RetryCustomError as e:
        print("Custom DownloadError caught:")
        print("Retry flag:", e.retry)
        print("Message:", e.message)
        responseval = {
                'type': e.retry,
                'status': 'error',
                'result': e.message,
                'NumberOfRequestRetry' : NumberOfRequestRetry
        }
        return responseval
    except Exception as e:
        print(e)
        responseval = {
            'type': 'error',
            'status': 'error',
            'result': 'It seems there is an issue with your request. Try again later'
        }
        return responseval

# Redis connection
redisConnection = settings.REDIS_CONNECTION 
# redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)
SCOPES = ['https://www.googleapis.com/auth/youtube.upload']
async def get_authenticated_service(email, credential_file_path, token_path):
    """Authenticate and return YouTube service with persistent authentication in a non-blocking way."""
    try:
        credentials = None

        # Check if token exists asynchronously.
        token_exists = await asyncio.to_thread(os.path.exists, token_path)
        if token_exists:
            print("🔑 Loading existing token...")
            async with aiofiles.open(token_path, 'r') as token_file:
                token_content = await token_file.read()
                credentials_data = json.loads(token_content)
                # Wrap the synchronous call in a thread.
                credentials = await asyncio.to_thread(Credentials.from_authorized_user_info, credentials_data, SCOPES)

        # If credentials are missing or invalid, refresh or perform new OAuth flow.
        if not credentials or not credentials.valid:
            if credentials and credentials.expired and credentials.refresh_token:
                try:
                    print("🔄 Refreshing token...")
                    # Refresh credentials in a thread.
                    await asyncio.to_thread(credentials.refresh, Request())
                except Exception as e:
                    print(f"⚠ Token refresh failed: {e}")
                    credentials = None

            if not credentials:
                print("🔐 New authentication required...")

                # Define a helper to run the OAuth flow synchronously.
                def run_oauth_flow():
                    flow = google_auth_oauthlib.flow.InstalledAppFlow.from_client_secrets_file(
                        credential_file_path, SCOPES
                    )
                    # Example: generate a unique key for Redis (if needed)
                    auth_key = f"oauth_flow:{email}"
                    print('Store authentication state in Redis')
                    auth_url, state = flow.authorization_url(
                        access_type="offline",  # Ensures refresh token is issued.
                        prompt='consent'
                    )
                    # Assuming redisConnection is available and thread-safe.
                    redisConnection.set(auth_key, json.dumps({"flow_state": state, "email": email}), ex=300)
                    print('Authenticate user via local server (blocking call)')
                    creds = flow.run_local_server(
                        port=8080,
                        open_browser=True,
                        redirect_uri_trailing_slash=False
                    )
                    return creds

                # Run the blocking OAuth flow in a separate thread.
                credentials = await asyncio.to_thread(run_oauth_flow)

            # Save new token using asynchronous file I/O.
            print("💾 Saving new token for future use")
            async with aiofiles.open(token_path, 'w') as token_file:
                await token_file.write(credentials.to_json())

        # Build the YouTube service in a thread (since discovery.build is blocking).
        def build_youtube_service():
            return googleapiclient.discovery.build("youtube", "v3", credentials=credentials)
        youtube = await asyncio.to_thread(build_youtube_service)
        print("✅ Authentication successful!")
        return youtube
    except Exception as e:
        raise RetryCustomError("retry", "There seams to be a proble when authenticating you❌")


async def is_video_a_short(video_path):
    """Check asynchronously if the video is a YouTube Short"""
    try:
        # Run the blocking operation in a separate thread
        clip = await asyncio.to_thread(VideoFileClip, video_path)
        duration = clip.duration  # Duration in seconds
        is_short = (duration <= 60) 
        return is_short
    except Exception as e:
        print(f"Error checking video: {str(e)}")
        return False


@asyncCircuitBreaker
async def RequestUploadVideosFunc(prompt, email, SocialMediaType, VideoUrl,NumberOfRequestRetry):
    """Upload video to YouTube with metadata"""
    try:
        
        dataval = prompt
        
        folder_path = os.path.join(settings.MEDIA_ROOT,email)
        # Get authenticated service
        full_credential_file_path = os.path.join(settings.MEDIA_ROOT,'mela@mela','client_secret.json')
        full_token_path = os.path.join(folder_path, 'token.json')
        
        # Try using stored credentials
        ### MADE THE FUNCTION ASYNC 
        service = await get_authenticated_service(email = email,credential_file_path = full_credential_file_path,token_path=full_token_path)
        ### LOOPING SHOULD BEGGIN HERE
        #print(json.dumps(bodyval,indent=4))
        #### LOOP STARTS HERE
        print(f'\n\n\n 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀')
        position = 0
        video_id_list = []
        for items in dataval:
            full_video_path = os.path.join(settings.MEDIA_ROOT, VideoUrl[position])

            if not os.path.exists(full_video_path):
                raise FileNotFoundError(f"Video file missing: {full_video_path}")
            media = MediaFileUpload(full_video_path, 
                                chunksize=-1,
                                resumable=True,)
            
            insert_request = service.videos().insert(
                part="snippet,status",
                body={
                    "snippet": items.get("snippet", {}),
                    "status": items.get("status", {})
                },
                media_body=media
            )
            
            # Execute async upload
            response = await asyncio.to_thread(insert_request.execute)
            def execute_request():
                print('uploading starts: ')
                response = None
                while response is None:
                    status, response = insert_request.next_chunk()
                    if status:
                        print(f"Upload {int(status.progress() * 100)}%")
                return response
            
            response = await asyncio.to_thread(execute_request)

            print(f"Video uploaded with ID: {response['id']}")
            video_id = response['id']
            video_id_list.append(video_id)
            
            # Before thumbnail upload
             # Check if the video is a YouTube Short asynchronously.
            is_short = await is_video_a_short(full_video_path)
            if not is_short:
                # Build the thumbnail path.
                thumbnail_path = os.path.join(settings.MEDIA_ROOT, email, SocialMediaType, f'{position}_thumbnail.jpeg')
                
                # Check if the thumbnail exists in a non-blocking manner.
                thumbnail_exists = await asyncio.to_thread(os.path.exists, thumbnail_path)
                if not thumbnail_exists:
                    print('Thumbnail not found')
                else:
                    try:
                        # Prepare the MediaFileUpload (this call is synchronous).
                        media_thumbnail = MediaFileUpload(thumbnail_path)
                        # Offload the blocking thumbnail upload to a separate thread.
                        await asyncio.to_thread(
                            service.thumbnails().set(
                                videoId=video_id,
                                media_body=media_thumbnail
                            ).execute
                        )
                    except Exception as e:
                        print('Error when uploading thumbnail ❌:', e)
                    print('\n\nThumbnail uploaded')
                    
            position += 1

        print('\n\n\n ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅')
        return {
            'type': 'success',
            'status': 'success',
            'result': f'Video uploaded to {SocialMediaType} successfully',
            'video_id': video_id_list
        }
        
    except RetryCustomError as e:
        print("Custom DownloadError caught:")
        print("Retry flag:", e.retry)
        print("Message:", e.message)
        responseval = {
                'type': e.retry,
                'status': 'error',
                'result': e.message,
                'NumberOfRequestRetry' : NumberOfRequestRetry
        }
        return responseval
    except Exception as e:
        print(f"Upload error: {str(e)} ❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌")
        responseval = {
            'type': 'error',
            'status': 'error',
            'result': f'Video upload failed. Please try again. {str(e)}'
        }
        return responseval



@circuit
@database_sync_to_async
def EditProfileFunc(about,email,name,ProfilePic = None):
    try:
        x = Account.objects.all().filter(email = email)
        #picval = f'http://127.0.0.1:8000/media/{ProfilePic}'

        x.update(name = name,about=about)
        # if ProfilePic != 'null':
        #     x.update(name = name,about=about)
        # else:
        #     x.update(name = name,about=about)
        Account.save

        responseval =  {'status' : 'success','message' : 'Profile Updated'}

        return responseval
    except Exception as e:
        responseval =  {'status' : 'error','message' : 'invalid account'}
        return responseval   


@circuit
@sync_to_async
def RequestFolderDataFunc(email):
    try:
        if email :
            emailval = email
            if emailval == 'null' or emailval == '' or emailval == 'gestuser@gmail.com':
                responseval = {'type' : 'error','result' : 'Sign Up to manage repository'}
                return responseval
            accountref = Account.objects.get(email = emailval) 
            foldetData = accountref.folders.all().order_by('id')
            foldet_val = FolderTableSerializer(foldetData,many=True)
            responseval = {'type' : 'success','result' : 'successful','list' : foldet_val.data}
            return responseval
        else:
            responseval = {'type' : 'error','result' : 'invalid data'}
            return responseval
    except Exception as e:
        #print(e)
        reponseval = {'type' : 'error','status' : 'error','result' : 'invalid data'}
        return reponseval

@circuit
@sync_to_async
def RequestAddFolderFunc(email,foldername):
    try:
        if email and foldername:
            emailval = email
            if emailval == 'null' or emailval == '' or emailval == 'gestuser@gmail.com':
                responseval = {'type' : 'error','result' : 'Sign Up to manage repository'}
                return responseval
            now = datetime.datetime.now()
            short_date = now.strftime("%d-%m-%Y")
            accountref = Account.objects.get(email = emailval)    
            FolderTable.objects.create(
                title = foldername,
                dateCreated = str(short_date),
                account_email = accountref
            )
            foldetData = accountref.folders.all().order_by('id')
            foldet_val = FolderTableSerializer(foldetData,many=True)
            responseval = {'type' : 'success','result' : 'Folder added','list' : foldet_val.data}
            return responseval
        else:
            responseval = {'type' : 'error','result' : 'invalid data'}
            return responseval
    except Exception as e:
        #print(e)
        reponseval = {'type' : 'error','status' : 'error','result' : 'invalid data'}
        return reponseval

@circuit
@sync_to_async
def RequestFolderFilesFunc(email,folderId):
    try:
        if email != None and folderId != None:
            emailval = email
            if emailval == 'null' or emailval == '' or emailval == 'gestuser@gmail.com':
                responseval = {'type' : 'error','result' : 'Sign Up to manage repository'}
                return responseval
            accountref = Account.objects.get(email = emailval) 
            foldetData = FolderTable.objects.get(account_email = accountref,id = folderId)
            fileData = foldetData.files.all().order_by('id')
            file_val = FileTableSerializer(fileData,many=True)
            responseval = {'type' : 'success','result' : 'successful','list' : file_val.data}
            return responseval
        else:
            responseval = {'type' : 'error','result' : 'invalid data'}
            return responseval
    except Exception as e:
        #print(e)
        reponseval = {'type' : 'error','status' : 'error','result' : 'invalid data'}
        return reponseval

@circuit
@sync_to_async
def RequestEditfolderNameFunc(data):
    try:
        emailval = sanitize_string(data['AccountEmail'])
        folderId = sanitize_string(data['folderId'])
        foldername = sanitize_string(data['name'])
        if emailval != None and folderId != None and foldername != '':            
            if emailval == 'null' or emailval == '' or emailval == 'gestuser@gmail.com':
                responseval = {'type' : 'error','result' : 'Sign Up to manage repository'}
                return responseval
            accountref = Account.objects.get(email = emailval) 
            xval =  FolderTable.objects.filter(account_email = accountref,id = folderId)
            xval.update(title = foldername)
            foldetData = accountref.folders.all().order_by('id')
            folder_val = FolderTableSerializer(foldetData,many=True)
            responseval = {'type' : 'success','result' : 'Folder successfully edited','list' : folder_val.data}
            return responseval
        else:
            responseval = {'type' : 'error','result' : 'invalid data'}
            return responseval
    except Exception as e:
        #print(e)
        reponseval = {'type' : 'error','status' : 'error','result' : 'invalid data'}
        return reponseval

@circuit
@sync_to_async
def RequestDeleteFolderFunc(email,folderId):
    try:
        if email != None and folderId != None:
            emailval = email
            if emailval == 'null' or emailval == '' or emailval == 'gestuser@gmail.com':
                responseval = {'type' : 'error','result' : 'Sign Up to manage repository'}
                return responseval
            accountref = Account.objects.get(email = emailval)
            folderref = FolderTable.objects.get(id = folderId,account_email = email) 
            filesData = FileTable.objects.filter(folder_id = folderref,account_email = accountref)
            filesVal = FileTableSerializer(filesData,many=True)
            filesSerialized = filesVal.data
            folder_path = os.path.join(settings.MEDIA_ROOT, emailval)
            x = 0
            if os.path.exists(folder_path):
                for x in filesSerialized:
                    fileurl = x['name']
                    idval = x['id']
                    FileTable.objects.filter(id = idval,account_email= accountref,folder_id = folderref).delete()
                  
                    Post_file_path = os.path.join(settings.MEDIA_ROOT,emailval,'repository',fileurl)
                    os.remove(Post_file_path)
            else:
                responseval = {'type' : 'error','result' : 'invalid data'}
                return responseval
            #deleting folder
            folderref.delete()
            
            #returning folders data list
            foldetData =  accountref.folders.all().order_by('id')         
            folder_val = FolderTableSerializer(foldetData,many=True)  
            responseval = {'type' : 'success','result' : 'Folder Deleted','list' : folder_val.data}
            return responseval
        else:
            responseval = {'type' : 'error','result' : 'invalid data'}
            return responseval
    except Exception as e:
        #print(e)
        reponseval = {'type' : 'error','status' : 'error','result' : 'invalid data'}
        return reponseval


@circuit
@sync_to_async
def RequestDeleteRepositoryFileFunc(data):
    email = sanitize_string(data['AccountEmail'])
    FileId = sanitize_string(data['fileId'])
    filename = sanitize_string(data['filename'])
    folderId = sanitize_string(data['FolderId'])
    try:
        if email != None and FileId != None and folderId != None:
            emailval = email
            if emailval == 'null' or emailval == '' or emailval == 'gestuser@gmail.com':
                responseval = {'type' : 'error','result' : 'Sign Up to manage repository'}
                return responseval
            accountref = Account.objects.get(email = emailval) 
            #deleting file
            folder_path = os.path.join(settings.MEDIA_ROOT, email)
            if os.path.exists(folder_path):
                Post_file_path = os.path.join(settings.MEDIA_ROOT,email,'repository',filename)
                os.remove(Post_file_path)
            #file deleted
            FileTable.objects.filter(account_email=accountref,id= FileId).delete()
            foldetData = FolderTable.objects.get(account_email = accountref,id = folderId)
            fileData = foldetData.files.all().order_by('id')
            file_val = FileTableSerializer(fileData,many=True)
            responseval = {'type' : 'success','result' : 'Deleted successful','list' : file_val.data}
            return responseval
        else:
            responseval = {'type' : 'error','result' : 'invalid data'}
            return responseval
    except Exception as e:
        #print(e)
        reponseval = {'type' : 'error','status' : 'error','result' : 'invalid data'}
        return reponseval

class AIConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.tasks = set()  # Keep track of running tasks


    async def connect(self):    
        self.emailConnected = self.scope['url_route']['kwargs']['email']
        await self.accept() 
        

    async def disconnect(self, close_code):  
        # Cancel all running tasks
        for task in self.tasks:
            task.cancel()
        try:
            await gather(*self.tasks, return_exceptions=True)  # Wait for task cancellations
        except CancelledError:
            pass  # Ignore cancellation errors
        finally:
            self.tasks.clear()
    async def send_msg(self, data,type,online = None):
        
        await self.send(
            text_data=json.dumps(
                {
                    'type' : type,
                    "message": data,
                }
            )
        )   

    async def receive(self, text_data=None,bytes_data=None):
        date = datetime.datetime.now()
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        if(message == 'RequestAIResponse'):
                email = sanitize_string(text_data_json['email'])
                promptConstructed = text_data_json['prompt']
                numberOfImagesPerObject = sanitize_string(text_data_json['images'])
                NumberOfRequestRetry = int(sanitize_string(text_data_json['NumberOfRequestRetry']))
                SocialMediaPromptSelected = YoutubeCustomPrompt
                image_list_script = f'each objects ImageList should have {numberOfImagesPerObject} objects'
                prompt = f'{promptConstructed['prompt']} {SocialMediaPromptSelected} {image_list_script}'    
                # Track the task
                task = asyncio.create_task(self.handle_request_ai_response(prompt, email,NumberOfRequestRetry))
                self.tasks.add(task)
                task.add_done_callback(self.tasks.discard)
        elif(message == 'RequestAITranscriptResponse'):
                email = sanitize_string(text_data_json['email'])
                promptConstructed = text_data_json['prompt']
                numberOfImagesPerObject = sanitize_string(text_data_json['images'])
                SocialMediaPromptSelected = YoutubeCustomPromptForAudioToVideo
                NumberOfRequestRetry = int(sanitize_string(text_data_json['NumberOfRequestRetry']))
                prompt = f'{promptConstructed['prompt']} {SocialMediaPromptSelected}'    
                # Track the task
                task = asyncio.create_task(self.handle_request_ai_transcript_response(prompt, email,NumberOfRequestRetry))
                self.tasks.add(task)
                task.add_done_callback(self.tasks.discard)
        elif(message == 'RequestCreateImages'):
                email = sanitize_string(text_data_json['email'])
                prompt = json.loads(text_data_json['prompt'])
                SocialMediaType = sanitize_string(text_data_json['SocialMediaType'])
                NumberOfRequestRetry = int(sanitize_string(text_data_json['NumberOfRequestRetry']))
                # Track the task
                task = asyncio.create_task(self.handle_request_create_images(prompt, email,SocialMediaType,NumberOfRequestRetry))
                self.tasks.add(task)
                task.add_done_callback(self.tasks.discard)
        elif(message == 'RequestCreateImagesTranscript'):
                email = sanitize_string(text_data_json['email'])
                prompt = json.loads(text_data_json['prompt'])
                SocialMediaType = sanitize_string(text_data_json['SocialMediaType'])
                NumberOfRequestRetry = int(sanitize_string(text_data_json['NumberOfRequestRetry']))

                # Track the task
                task = asyncio.create_task(self.handle_request_create_images_transcript(prompt, email,SocialMediaType,NumberOfRequestRetry))
                self.tasks.add(task)
                task.add_done_callback(self.tasks.discard)
        elif(message == 'RequestUploadVideos'):
                email = sanitize_string(text_data_json['email'])
                prompt = text_data_json['prompt']
                VideoUrl = text_data_json['VideoUrl']
                SocialMediaType = sanitize_string(text_data_json['SocialMediaType'])
                NumberOfRequestRetry = int(sanitize_string(text_data_json['NumberOfRequestRetry']))
                # Track the task
                task = asyncio.create_task(self.handle_request_upload_videos(prompt, email,SocialMediaType,VideoUrl,NumberOfRequestRetry))
                self.tasks.add(task)
                task.add_done_callback(self.tasks.discard)
        elif(message == 'RequestClearServer'):
                email = sanitize_string(text_data_json['email'])
                # Track the task
                task = asyncio.create_task(self.handle_request_clear_server(email))
                self.tasks.add(task)
                task.add_done_callback(self.tasks.discard)

    async def handle_request_ai_response(self, prompt, email,NumberOfRequestRetry):
        val = await RequestAIResponseFunc(prompt=prompt, email=email,NumberOfRequestRetry=NumberOfRequestRetry)
        await self.send_msg(data=val, type='RequestAIResponse')
    async def handle_request_ai_transcript_response(self, prompt, email,NumberOfRequestRetry):
        val = await RequestAIResponseFunc(prompt=prompt, email=email,NumberOfRequestRetry=NumberOfRequestRetry)
        await self.send_msg(data=val, type='RequestAITranscriptResponse')
    async def handle_request_clear_server(self, email):
        val = await RequestRequestClearServer(email=email)
        await self.send_msg(data=val, type='RequestClearServer')
    async def handle_request_create_images(self, prompt, email,SocialMediaType,NumberOfRequestRetry):
        val = await RequestCreateImagesFunc(prompt=prompt, email=email,SocialMediaType=SocialMediaType,NumberOfRequestRetry=NumberOfRequestRetry)
        await self.send_msg(data=val, type='RequestCreateImages')
    async def handle_request_create_images_transcript(self, prompt, email,SocialMediaType,NumberOfRequestRetry):
        val = await RequestCreateImagesTranscriptFunc(prompt=prompt, email=email,SocialMediaType=SocialMediaType,NumberOfRequestRetry=NumberOfRequestRetry)
        await self.send_msg(data=val, type='RequestCreateImagesTranscript')
    async def handle_request_upload_videos(self, prompt, email,SocialMediaType,VideoUrl,NumberOfRequestRetry):
        val = await RequestUploadVideosFunc(prompt=prompt, email=email,SocialMediaType=SocialMediaType,VideoUrl=VideoUrl,NumberOfRequestRetry=NumberOfRequestRetry)
        await self.send_msg(data=val, type='RequestUploadVideos')
    


   
class ChatList(AsyncWebsocketConsumer):


    async def connect(self):    
        self.emailConnected = self.scope['url_route']['kwargs']['email']
        await self.accept() 
        

    async def disconnect(self, close_code):  
        pass


    async def send_msg(self, data,type,online = None):
        
        await self.send(
            text_data=json.dumps(
                {
                    'type' : type,
                    "message": data
                }
            )
        )   

    #recieve message from websocket
    async def receive(self, text_data=None,bytes_data=None):
        file_name = ''
        #return
        if isinstance(bytes_data,bytes):         
            
            file_buffer =bytes_data
            #file_name = 'loginPreview.png'  # Replace with a unique file name
            if default_storage.exists(file_name):
                pass
                # Duplicate found, handle it (e.g., raise an error, rename the file)
            else:
                with default_storage.open(file_name, 'wb') as f:
                    f.write(file_buffer)
            # Handle the uploaded file as needed
            
            await self.send_msg(data='Success',type='Upload')
        else:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            if(message == 'EditProfile'):
                email = sanitize_string(text_data_json['email'])
                if email != 'null' and email != 'gestuser@gmail.com' and email != '' :
                    name = sanitize_string(text_data_json['name'])
                    #ProfilePic = sanitize_string(text_data_json['ProfilePic'])
                    about = sanitize_string(text_data_json['about'])     
                    val = await EditProfileFunc(about=about,name=name,email=email)           
       
                    await self.send_msg(data=val,type='EditProfile')
                else:
                    val = {'status' : 'error','message' : 'invalid account'}
                    await self.send_msg(data=val,type='EditProfile')
            elif (message == 'RequestFolderData'):
                emailval = sanitize_string(text_data_json['AccountEmail'])
                val = await RequestFolderDataFunc(email=emailval)
                await self.send_msg(data=val,type='RequestFolderData')
            elif (message == 'RequestAddFolder'):
                emailval = sanitize_string(text_data_json['AccountEmail'])
                folderName = sanitize_string(text_data_json['folderName'])
                val = await RequestAddFolderFunc(email=emailval,foldername = folderName)
                await self.send_msg(data=val,type='RequestAddFolder')  
            elif (message == 'RequestFolderFiles'):
                emailval = sanitize_string(text_data_json['AccountEmail'])
                folderId = sanitize_string(text_data_json['folderId'])
                val = await RequestFolderFilesFunc(email=emailval,folderId = folderId)
                await self.send_msg(data=val,type='RequestFolderFiles')
            elif (message == 'RequestDeleteFolder'):
                emailval = sanitize_string(text_data_json['AccountEmail'])
                folderId = sanitize_string(text_data_json['folderId'])
                val = await RequestDeleteFolderFunc(email=emailval,folderId = folderId)
                await self.send_msg(data=val,type='RequestDeleteFolder')
            elif (message == 'RequestEditfolderName'):
                dataval = text_data_json['data']
                val = await RequestEditfolderNameFunc(data=dataval)
                await self.send_msg(data=val,type='RequestEditfolderName')
            elif (message == 'RequestDeleteRepositoryFile'):
                data = text_data_json['data']
                val = await RequestDeleteRepositoryFileFunc(data=data)
                await self.send_msg(data=val,type='RequestDeleteRepositoryFile') 
   
