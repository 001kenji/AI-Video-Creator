# chat/consumers.py
import json,threading,datetime,aiohttp,requests, asyncio
import redis
from django.core.files.storage import FileSystemStorage
import time,os,shutil, asyncio,base64
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

@asyncCircuitBreaker
async def RequestAIResponseFunc(prompt,email):
    """Generate AI text content asynchronously."""
    try:
        model = settings.AI_MODEL
      
        response = await asyncio.to_thread(model.generate_content, prompt)  # Run sync function in async environment
        #print(response,type(response))
        cleaned_json_string = response.text.strip("```json\n").strip("```")

        # Parse into JSON format
        json_data = json.loads(cleaned_json_string)
        # response_json = json.loads(demodata)
        #response.text
        reponseval = {'type' : 'success','status' : 'success','result' : json_data}
        return reponseval
    except Exception as e:
        print(e)
        reponseval = {'type' : 'error','status' : 'error','result' : 'It seams there is an issue with your request. Try again later'}
        return reponseval

@asyncCircuitBreaker
async def RequestRequestClearServer(email):
    """Generate AI text content asynchronously."""
    try:
        folder_path = os.path.join(settings.MEDIA_ROOT, email,'youtube')
        if os.path.exists(folder_path):
            shutil.rmtree(folder_path)
        
        reponseval = {'type' : 'success','result' : 'Files cleared successfuly'}
        return reponseval
    except Exception as e:
        print(e)
        reponseval = {'type' : 'error','status' : 'error','result' : 'It seams there is an issue while clearing your files. That shouldn\'t worry you'}
        return reponseval



async def create_thumbnail(image_url, thumbnail_path, size=(128, 128)):
    """Create thumbnail from a locally downloaded image file"""
    try:
        # Process in executor to avoid blocking
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,  # Uses default executor
            lambda: _generate_thumbnail_from_file(image_url, thumbnail_path, size)
        )
        
        return True
    except Exception as e:
        print(f"Thumbnail error: {str(e)}")
        return False

def _generate_thumbnail_from_file(image_path, output_path, size):
    """Synchronous thumbnail generation from local file"""
    with Image.open(image_path) as img:
        # Convert to RGB if needed
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
            
        # Use modern resampling filter
        img.thumbnail(
            size,
            resample=Image.Resampling.LANCZOS  # Replacement for ANTIALIAS
        )
        img.save(output_path, "JPEG", quality=85)

# function to download the iamges
@asyncCircuitBreaker
async def download_image(image_url, filename,emailval,SocialMediaType):
    async with aiohttp.ClientSession() as session:
        async with session.get(image_url) as response:
            if response.status == 200:
                content = await response.read()
                folder_path = os.path.join(settings.MEDIA_ROOT, emailval,SocialMediaType)
                #print('folder path: ',folder_path)
                #print('saving beggins .......')
                custom_storage = FileSystemStorage(location=folder_path)
                with custom_storage.open(f'{filename}', 'wb') as file:
                    file.write(content)
                
                print(f'\n\nDownload Completed: {filename}.jpg ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅')
            else:
                print(f'\n\nFailed to download {filename}.jpg ❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌')    
    return filename


@asyncCircuitBreaker
# Wrap synchronous pollinations code
async def generate_image_async(description, title):
   
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
    )  # or pollinations.Image() to use defaults

    image = await image_model(prompt=f'{description}')
    image.save(file= f'{title}.jpg')
    

@asyncCircuitBreaker
async def RequestCreateImagesFunc(prompt,email,SocialMediaType):
    """Generate AI images content asynchronously."""
    try:
        
        loopval = 0
        dataval = prompt
        social_media_folder_path = os.path.join(settings.MEDIA_ROOT, email,SocialMediaType)
        if not os.path.exists(social_media_folder_path):
            os.mkdir(social_media_folder_path)
        else:
            shutil.rmtree(social_media_folder_path)
            os.mkdir(social_media_folder_path)
            
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
                seed = 42 # Each seed generates a new image variation
                model = 'flux' # Using 'flux' as default if model is not provided

                API_image_url = f"https://pollinations.ai/p/{ImageDescription}?width={width}&height={height}&seed={seed}&model={model}"
                
                # Generate image URL asynchronously
                await generate_image_async(ImageDescription, title)
                await download_image(API_image_url, title,email,SocialMediaType)
                storage_name = f'{email}/{SocialMediaType}/{title}'
                print(f'\n\nAt object {loopval} generated {title}')

                i += 1
                print(f'\nRemainig images {i}/{len(objectval)} images')

            loopval += 1
            print(f'\nRemainig loops {loopval}/{len(dataval)} objects ')

       
        reponseval = {'type' : 'success','status' : 'success','result' : 'All images processed','data' : dataval}
        return reponseval
    except Exception as e:
        print(e)
        reponseval = {'type' : 'error','status' : 'error','result' : 'It seams there is an issue with your request. Try again later'}
        return reponseval


# Redis connection
redisConnection = settings.REDIS_CONNECTION 
# redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)
SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

def get_authenticated_service(email, credential_file_path, token_path):
    """Authenticate and return YouTube service with persistent authentication"""

    # If token exists, load it to avoid re-authentication
    credentials = None
    if os.path.exists(token_path):
        print("🔑 Loading existing token...")
        with open(token_path, 'r') as token_file:
            credentials_data = json.load(token_file)
            credentials = Credentials.from_authorized_user_info(credentials_data, SCOPES)
        

    # If credentials are invalid, refresh or re-authenticate
    if not credentials or not credentials.valid:
        if credentials and credentials.expired and credentials.refresh_token:
            try:
                print("🔄 Refreshing token...")
                credentials.refresh(Request())
            except Exception as e:
                print(f"⚠ Token refresh failed: {e}")
                credentials = None

        if not credentials:
            print("🔐 New authentication required...")

            # Load client secrets file
            client_secrets_file = credential_file_path

            # Create OAuth Flow
            print('Create OAuth Flow')
            flow = google_auth_oauthlib.flow.InstalledAppFlow.from_client_secrets_file(
                client_secrets_file, SCOPES
            )

            # Generate unique key for Redis (to track authentication state)
            auth_key = f"oauth_flow:{email}"

            # Store authentication state in Redis
            print('Store authentication state in Redis')
            auth_url, state = flow.authorization_url(
                access_type="offline",  # ✅ Ensures refresh token is issued
                prompt='consent')
            redisConnection.set(auth_key, json.dumps({"flow_state": state, "email": email}), ex=300)  # Expires in 5 minutes

            # Authenticate user via local server (non-blocking)
            print('Authenticate user via local server (non-blocking)')
            credentials = flow.run_local_server(
                port=8080,
                open_browser=True,
                redirect_uri_trailing_slash=False
            )

        # Save new token for future use
        print('ave new token for future use')
        with open(token_path, 'w') as token_file:
            token_file.write(credentials.to_json())

    # Build YouTube service
    print("✅ Authentication successful!")
    youtube = googleapiclient.discovery.build("youtube", "v3", credentials=credentials)
    print('returning youtube build googleapi')
    return youtube


def is_video_a_short(video_path):
    """Check if the video is a YouTube Short"""
    try:
        clip = VideoFileClip(video_path)
        duration = clip.duration  # Duration in seconds
        # YouTube Shorts criteria:
        # - Duration <= 60 seconds
        is_short = (duration <= 60) 
        return is_short
    except Exception as e:
        print(f"Error checking video: {str(e)}")
        return False

@asyncCircuitBreaker
async def RequestUploadVideosFunc(prompt, email, SocialMediaType, VideoUrl,credential_file_path):
    """Upload video to YouTube with metadata"""
    try:
        
        dataval = prompt
        
        folder_path = os.path.join(settings.MEDIA_ROOT,email)
        # Get authenticated service
        full_credential_file_path = os.path.join(folder_path, credential_file_path)
        full_token_path = os.path.join(folder_path, 'token.json')
        
        # Try using stored credentials
        service = get_authenticated_service(email = email,credential_file_path = full_credential_file_path,token_path=full_token_path)
        ### LOOPING SHOULD BEGGIN HERE
        #print(json.dumps(bodyval,indent=4))
        # Upload video
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
            is_short = is_video_a_short(full_video_path)  # Implement this function
            if not is_short:
                ##### CHANGE THIS
                thumbnail_position = 0
                thumbnail_path = os.path.join(settings.MEDIA_ROOT, email,SocialMediaType,f'{thumbnail_position}_thumbnail.jpeg')

                if not os.path.exists(thumbnail_path):
                    print('thumbnail not found')
                else:
                    # Upload thumbnail
                    
                    media_thumbnail = MediaFileUpload(thumbnail_path)
                    await asyncio.to_thread(
                        service.thumbnails().set(
                            videoId=video_id,
                            media_body=media_thumbnail
                        ).execute
                )
                    
            position += 1

        print('\n\n\n ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅')
        return {
            'type': 'success',
            'status': 'success',
            'result': f'Video uploaded to {SocialMediaType} successfully',
            'video_id': video_id_list
        }
        
    except Exception as e:
        print(f"Upload error: {str(e)} ❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌")
        return {
            'type': 'error',
            'status': 'error',
            'result': f'Video upload failed. Please try again. {str(e)}'
        }



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
                SocialMediaPromptSelected = YoutubeCustomPrompt
                image_list_script = f'each objects ImageList should have {numberOfImagesPerObject} objects'
                prompt = f'{promptConstructed['prompt']} {SocialMediaPromptSelected} {image_list_script}'    
                # Track the task
                task = asyncio.create_task(self.handle_request_ai_response(prompt, email))
                self.tasks.add(task)
                task.add_done_callback(self.tasks.discard)
        elif(message == 'RequestCreateImages'):
                email = sanitize_string(text_data_json['email'])
                prompt = json.loads(text_data_json['prompt'])
                SocialMediaType = sanitize_string(text_data_json['SocialMediaType'])
                # Track the task
                task = asyncio.create_task(self.handle_request_create_images(prompt, email,SocialMediaType))
                self.tasks.add(task)
                task.add_done_callback(self.tasks.discard)
        elif(message == 'RequestUploadVideos'):
                email = sanitize_string(text_data_json['email'])
                prompt = text_data_json['prompt']
                VideoUrl = text_data_json['VideoUrl']
                SocialMediaType = sanitize_string(text_data_json['SocialMediaType'])
                GoogleAPICredentialFile = sanitize_string(text_data_json['GoogleAPICredentialFile'])
                # Track the task
                task = asyncio.create_task(self.handle_request_upload_videos(prompt, email,SocialMediaType,VideoUrl,credential_file_path=GoogleAPICredentialFile))
                self.tasks.add(task)
                task.add_done_callback(self.tasks.discard)
        elif(message == 'RequestClearServer'):
                email = sanitize_string(text_data_json['email'])
                # Track the task
                task = asyncio.create_task(self.handle_request_clear_server(email))
                self.tasks.add(task)
                task.add_done_callback(self.tasks.discard)

    async def handle_request_ai_response(self, prompt, email):
        val = await RequestAIResponseFunc(prompt=prompt, email=email)
        await self.send_msg(data=val, type='RequestAIResponse')
    async def handle_request_clear_server(self, email):
        val = await RequestRequestClearServer(email=email)
        await self.send_msg(data=val, type='RequestClearServer')
    async def handle_request_create_images(self, prompt, email,SocialMediaType):
        val = await RequestCreateImagesFunc(prompt=prompt, email=email,SocialMediaType=SocialMediaType)
        await self.send_msg(data=val, type='RequestCreateImages')
    async def handle_request_upload_videos(self, prompt, email,SocialMediaType,VideoUrl,credential_file_path):
        if credential_file_path == None or credential_file_path == '':
           responseval = {'type' : 'error','status' : 'warning','result' : 'It seams there is no GoogleAPICredentialFile uploaded to your account. Navigate to Profile page to upload'}
           await self.send_msg(data=responseval, type='RequestUploadVideos')
        val = await RequestUploadVideosFunc(prompt=prompt, email=email,SocialMediaType=SocialMediaType,VideoUrl=VideoUrl,credential_file_path=credential_file_path)
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
   
