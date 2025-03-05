from django.shortcuts import render,HttpResponse
import json,os,datetime,requests,ffmpeg,aiofiles,asyncio,glob
from django.core.files.storage import default_storage
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.throttling import UserRateThrottle
from django.views.decorators.csrf import csrf_exempt,ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator
#from AuthApp.excel_py.form1s import ReadWithFullRange
from circuitbreaker import circuit
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from .models import Account
from .models import sanitize_string
from moviepy import AudioFileClip
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.db.models import QuerySet
from PIL import Image, ImageDraw, ImageFont
from asgiref.sync import sync_to_async
class Datathrottler(UserRateThrottle):
    scope = 'DataThrottler'

class fileUploadthrottler(UserRateThrottle):
    scope = 'fileUpload'

class csrfTokenThrottler(UserRateThrottle):
    scope = 'csrf'

class AiTokenThrottler(UserRateThrottle):
    scope = 'ai'

class VTV_AITokenThrottler(UserRateThrottle):
    scope = 'VTV_AI'



def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'Success': 'CSRF cookie set', 'encryptedToken': token})

@method_decorator(csrf_exempt,name='dispatch')
class LogoutView(APIView):
     permission_classes = (IsAuthenticated,)
     throttle_classes = [csrfTokenThrottler]

     def post(self, request):
          
          try:
            refresh_token = request.data["refresh_token"]
            #token = BlacklistableToken.objects.get(key=refresh_token)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
          except Exception as e:
            
            return Response(status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt,name='dispatch')
class ProfileView(APIView):
     permission_classes = (AllowAny,)
     throttle_classes = [csrfTokenThrottler]

     def post(self, request):
          
          try:
            #print('reading')           
            data = request.data[0]
            Scope = data['scope']
           
            if Scope == 'ReadProfile' : 
                emailval = sanitize_string(data['AccountEmail'])
                IsOwner = sanitize_string(data['IsOwner'])
                profile = list(Account.objects.filter(email= emailval).values('id','name','email','ProfilePic','ProfileAbout'))
                
                x = {'scope': 'ReadProfile',
                     'IsOwner' : IsOwner,
                     }
                profile.insert(0,x)

                return Response(profile,status=200)
            elif Scope == 'UsernameUpdate':
               
                emailval = request.data[1] 
                nameval = sanitize_string(data['Username'])
                x = Account.objects.filter(email = emailval)
                x.update(name = nameval)
                Account.save
                responseval = {'success' : 'Saved'}
                return Response(responseval,status=200)
          except Exception as e:
            print(e)
            responseval = {'failed' : 'The data you requested cannot be found at the moment.'}
            return Response(responseval,status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt,name='dispatch')
class UploadProfileDocs(APIView):
    permission_classes = (IsAuthenticated,)
    throttle_classes = [fileUploadthrottler]
    @circuit
    def post(self, request):        
        try:
            data = request.data
            scope = data['scope']
            if scope == 'ProfilePictureUpdate':
                emailval = sanitize_string(data['email'])
                file_name = sanitize_string(data['name'])
                splited_file_name = str(file_name).split('.')
                full_file_name = f'profile_picture.{splited_file_name[1]}'
                storage_name = f'/{emailval}/profile_picture.{splited_file_name[1]}'
                file_buffer = data['ProfilePicture']               
                folder_name = str(emailval)
                folder_path = os.path.join(settings.MEDIA_ROOT, folder_name)
                profile_picture_path = os.path.join(settings.MEDIA_ROOT, folder_name, 'profile_picture')

                # Find all matching files (e.g., profile_picture.jpg, profile_picture.png, etc.)
                matching_files = glob.glob(profile_picture_path + ".*")

                if matching_files:
                    for file in matching_files:
                        try:
                            os.remove(file)
                            print(f"Deleted: {file}")
                        except Exception as e:
                            print(f"Error deleting {file}: {e}")
                else:
                    print("No matching profile picture found.")
                #print('folder path: ',folder_path)
                if os.path.exists(folder_path):
                    #print('saving beggins .......')
                    custom_storage = FileSystemStorage(location=folder_path)
                    with custom_storage.open(full_file_name, 'wb') as f:
                        file_data = file_buffer.read()
                        f.write(file_data)
                        
                    #print('saving ends..........')
                x = Account.objects.filter(email = emailval)
                x.update(ProfilePic=storage_name)
                Account.save
                return Response( status=status.HTTP_200_OK)
            if scope == 'GoogleAPICredentialFileUpload':
                emailval = sanitize_string(data['email'])
                file_name = sanitize_string(data['name'])
                file_buffer = data['file']               
                folder_name = str(emailval)
                folder_path = os.path.join(settings.MEDIA_ROOT, folder_name)
                profile_picture_path = os.path.join(settings.MEDIA_ROOT, folder_name, file_name)


                if os.path.exists(profile_picture_path):
                    try:
                        os.remove(profile_picture_path)
                        print(f"Deleted: {profile_picture_path}")
                    except Exception as e:
                        print(f"Error deleting {profile_picture_path}: {e}")
                else:
                    print("No matching profile picture found.")
                #print('folder path: ',folder_path)
                if os.path.exists(folder_path):
                    #print('saving beggins .......')
                    custom_storage = FileSystemStorage(location=folder_path)
                    with custom_storage.open(file_name, 'wb') as f:
                        file_data = file_buffer.read()
                        f.write(file_data)
                        
                    #print('saving ends..........')
                x = Account.objects.filter(email = emailval)
                xval = list(x.values())
                if xval[0]['ProfileAbout'] == None:
                    AboutBody = {
                        'GoogleAPICredentialFile' : file_name
                    }
                else:
                    AboutBody = xval[0]['ProfileAbout']
                    AboutBody['GoogleAPICredentialFile'] = file_name

                x.update(ProfileAbout=AboutBody)
                AboutBody['Scope'] = 'GoogleAPICredentialFile'
                responseval = {'success':'file uploaded successfuly','Scope' : 'GoogleAPICredentialFileUpload','AboutBody' : AboutBody}
                return Response(responseval,status=status.HTTP_200_OK)
               
        except Exception as e:
            print(e)
            responseval = {'failed' : e}
            return Response(responseval,status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt,name='dispatch')
class FileUploadView(APIView):
    permission_classes = (IsAuthenticated,)
    throttle_classes = [fileUploadthrottler]
    @circuit
    def post(self, request):        

        data = request.data
        file_name = sanitize_string(data['name'])
        file_buffer = data['file']

        if default_storage.exists(file_name):
            pass
            # Duplicate found, handle it (e.g., raise an error, rename the file)
        else:
            with default_storage.open(file_name, 'wb') as f:
                file_data = file_buffer.read()
                f.write(file_data)
        return Response( status=status.HTTP_200_OK)


def delete_file(file_path: str):
    """Asynchronously delete a file if it exists."""
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
            print(f"File deleted: {file_path}")
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")
    
    return


async def get_account(email: str) -> QuerySet:
    """Fetch account reference asynchronously"""
    return await sync_to_async(Account.objects.filter, thread_sensitive=True)(email=email)


def create_thumbnail(image_url, thumbnail_path, size=(128, 128)):
    """Create thumbnail from a locally downloaded image file"""
    try:
        print('generating thumbnail')
        # Process in executor to avoid blocking
        with Image.open(image_url) as img:
            # Convert to RGB if needed
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
                
            # Use modern resampling filter
            img.thumbnail(
                size,
                resample=Image.Resampling.LANCZOS  # Replacement for ANTIALIAS
            )
            img.save(thumbnail_path, "JPEG", quality=85)
        #_generate_thumbnail_from_file(image_url, thumbnail_path, size)
        print('thumbnail generated')
        
        return True
    except Exception as e:
        print(f"Thumbnail error: {str(e)}")
        return False


@method_decorator(csrf_exempt,name='dispatch')
class MergeView(APIView):
    permission_classes = (IsAuthenticated,)
    throttle_classes = [fileUploadthrottler]
    @circuit
    def post(self, request):        
        try:
            data = request.data
            emailval = sanitize_string(data['email'])
            dataval = json.loads(data['data'])
            AudioScope = data['AudioScope']
            SocialMediaType = sanitize_string(data['SocialMediaType'])
            folder_path = os.path.join(settings.MEDIA_ROOT, emailval,SocialMediaType)
            accountref = Account.objects.filter(email = emailval)
            custom_storage = FileSystemStorage(location=folder_path)
            if not accountref.exists():
                responseval = {'failed' : 'This account does not exist.Login to proceed.'}
                return Response(responseval,status=status.HTTP_400_BAD_REQUEST) 
            
            if AudioScope == 'OneForAll':
                audio_file = data['audio']
                audio_name = data['audioName']

                if not audio_file or not dataval or not SocialMediaType or SocialMediaType == '':
                    return Response({'error': 'Missing required files'}, status=400)

                # Save the audio file
                
                custom_storage = FileSystemStorage(location=folder_path)
                custom_storage_audio_path = os.path.join(folder_path,audio_name)

                delete_file(custom_storage_audio_path)
                if not custom_storage.exists(audio_name):
                    audio_path = custom_storage.save(audio_name, audio_file)
                
                # Extract audio duration
                audio_clip = AudioFileClip(custom_storage_audio_path)
                audio_duration = audio_clip.duration  # Get duration in seconds
                audio_clip.close()
            elif AudioScope == 'AllForAll':
                audio_files = request.data.getlist("audio")
                if not audio_files or not SocialMediaType or SocialMediaType == '':
                    return Response({'error': 'Missing required files'}, status=400)

                # Save the audio file
                
                
                custom_storage_audio_list = []
                audio_duration_list = []
                i = 0
                for audio in audio_files:
                    filename = os.path.join(folder_path, audio.name)
                    delete_file(filename)
                    with open(filename, "wb") as destination:
                        for chunk in audio.chunks():
                            destination.write(chunk)
                    custom_storage_audio_list.append(filename)                
                
                    # Extract audio duration
                    audio_clip = AudioFileClip(filename)
                    audio_duration = audio_clip.duration  # Get duration in seconds
                    audio_duration_list.append(audio_duration)
                    audio_clip.close()
                    print(f'saved audio {i}/{len(audio_files)} audios')
                    i += 1
            
            

            position = 0
            response_url = []
            
            for items in dataval:
                print(f'\n\n\n 🚀🚀🚀🚀🚀🚀🚀🚀🚀 {position}')
                # Extract image paths
                image_image_list = items.get("ImageList", "")
                print(image_image_list)
                
                image_paths = [os.path.normpath(os.path.join(settings.MEDIA_ROOT,emailval,'youtube', item.get("name", "").strip())) for item in image_image_list if "name" in item]
                # for path in image_paths:
                #         print(path)  # This will show single backslashes

                num_images = len(image_paths)
                if num_images == 0:
                    responseval = {'failed' : 'There were no images identified'}
                    return Response(responseval,status=status.HTTP_400_BAD_REQUEST)
                
                # Calculate duration per image
                duration_per_image = audio_duration / num_images

                # Create FFmpeg-compatible text file for images
                image_list_file = os.path.join(folder_path, f"{emailval}_images.txt")
                delete_file(image_list_file)
                with custom_storage.open(f"{emailval}_images.txt", 'w') as f:
                    for img in image_paths:
                        img = img.replace("\\", "/")  # Convert to forward slashes
                        f.write(f"file '{img}'\n")
                        f.write(f"duration {duration_per_image}\n")
                        
            
                # Define output video paths
                if AudioScope == 'AllForAll':
                    
                    custom_videos_name = f'all_for_all_audio_{position}'
                elif AudioScope == 'OneForAll':
                    custom_videos_name = f'one_for_all_audio_{position}'
                video_no_audio = os.path.join(folder_path,f'{custom_videos_name}_no_audio.mp4')
                final_video = os.path.join(folder_path,f'{custom_videos_name}_with_audio.mp4')
                delete_file(video_no_audio)
                delete_file(final_video)
                # print(video_no_audio,final_video)
                # Generate video from images
                print('Generate video from images')
                ffmpeg.input(image_list_file, format='concat', safe=0) \
                    .output(video_no_audio, vcodec='libx264', pix_fmt='yuv420p', r=25) \
                    .run(overwrite_output=True)
                

                # Merge video with audio
                print('Merge video with audio')
                audio_path_val = custom_storage_audio_path if AudioScope == 'OneForAll' else custom_storage_audio_list[position]
                (
                    ffmpeg
                    .concat(ffmpeg.input(video_no_audio), ffmpeg.input(audio_path_val), v=1, a=1)
                    .output(final_video, vcodec='libx264', acodec='aac', strict='experimental')
                    .run(overwrite_output=True)
                )
                # genearate video thumbnail
                image_url_thumbnail = image_image_list[0]['name'] if image_image_list[0] else False
                print(image_url_thumbnail) 
                if image_url_thumbnail != False:
                    image_url_thumbnail_val = os.path.join(settings.MEDIA_ROOT,emailval,'youtube',image_url_thumbnail)
                    thumbnail_path= os.path.join(folder_path,f"{position}_thumbnail.jpeg") 
                    #delete an existing thumbnail
                    delete_file(thumbnail_path)
                    print('\nconfigs: ',image_url_thumbnail_val, thumbnail_path)
                    create_thumbnail(image_url_thumbnail_val, thumbnail_path)
                
                response_url.append(f'{emailval}/{SocialMediaType}/{custom_videos_name}_with_audio.mp4')
                position += 1
                print('\n\n\n ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅')

            
            return Response({
                'success' : 'Your video is successfuly created',
                "video_url": response_url
            }, status=200)

               
        except Exception as e:
            print(e)
            responseval = {'failed' : 'Error occured when processing your request ❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌'}
            return Response(responseval,status=status.HTTP_400_BAD_REQUEST)
