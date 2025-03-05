from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend
import os,shutil,json
from django.contrib.auth.hashers import check_password
from datetime import datetime
from django.contrib.auth import logout
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from django.views.generic import View
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.contrib import auth
from djoser.serializers import PasswordResetConfirmSerializer
from rest_framework import serializers,status
from djoser.views import UserViewSet
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import sanitize_string
from django.conf import settings
import requests

class CustomAuthBackend(BaseBackend):
    def authenticate(self, request,username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            emailval = sanitize_string(username)
            passwordval = sanitize_string(password)
            # print(emailval,password)
            user = UserModel.objects.get(email=emailval)
            if user.check_password(passwordval):
                print('password match',user)
                return user
        except UserModel.DoesNotExist:
            return None

        

        return None

    def get_user(self, user_id):
        UserModel = get_user_model()
        try:
            return UserModel.objects.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None

class CustomLogoutView(View):
    def get(self, request, *args, **kwargs):
        logout(request)
        return HttpResponseRedirect(reverse_lazy('login'))


class CustomUserDeleteBackend(UserViewSet):
    
    def destroy(self, request, *args, **kwargs):
        user = self.request.user
        print('starting',user)
        # Step 1: Get the password from the request body
        password = request.data.get("current_password")
        email = request.data.get('current_email')
        if not password or not email:
            return Response(
                {"error": "Credentials are required to delete your account."},
                status=status.HTTP_400_BAD_REQUEST
            )
        print('data: ',email,password)
        UserModel = get_user_model()
        # Step 2: Verify the user's password
        try:
            emailval = sanitize_string(email)
            passwordval = sanitize_string(password)
            user = UserModel.objects.get(email=emailval)
            if user.check_password(passwordval):
                # Step 3: Perform additional custom actions
                print('password match, performing custom actions')
                self.revoke_oAuth_token(emailval=emailval)
                self.perform_custom_actions(emailval)
                print('deleting user')
                # Step 4: Delete the user account
                user.delete()
                print('delete successful')
                return Response(
                    {"success": "Your account has been successfully deleted."},
                    status=status.HTTP_204_NO_CONTENT
                )
        except UserModel.DoesNotExist:
            print('password missmatch')
            return Response(
                {"error": "Invalid password. Could not verify account."},
                status=status.HTTP_401_UNAUTHORIZED
            )
       
    def revoke_oAuth_token(self, emailval):
        """
        revoke users existing access of your app and user's youtube
        """
        #removing entire user content details stored in the server
        try:
            folder_name = str(emailval)
            file_path = os.path.join(settings.MEDIA_ROOT, folder_name,'token.json')
            if os.path.exists(file_path):
                # Open and read the JSON file
                with open(file_path, 'r') as file:
                    token_data = json.load(file)

                # Retrieve the 'token' key
                access_token = token_data.get("token")

                response = requests.post(
                    "https://accounts.google.com/o/oauth2/revoke",
                    params={"token": access_token},
                    headers={"content-type": "application/x-www-form-urlencoded"},
                )
                if response.status_code == 200:
                    print("✅ OAuth token revoked successfully.")
                else:
                    print("⚠ Failed to revoke token:", response.json())
        except Exception as e:
            print(f'\nError {e} \n occured when trying to run the revoke token function')   

    def perform_custom_actions(self, emailval):
        """
        Custom actions to perform before deleting a user.
        Example: Logging, cleaning up related data, sending notifications, etc.
        """
        #removing entire user content details stored in the server
        folder_name = str(emailval)
        folder_path = os.path.join(settings.MEDIA_ROOT, folder_name)
        print('folderpath retreaved: ',folder_path,f'\n deleting folders')
        # Remove the folder
        if os.path.exists(folder_path):
            shutil.rmtree(folder_path)
        print('folders deleted successfuly')

    


class SetHeaderMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        
        response = self.get_response(request)
        request.META.pop('X-Powered-By', None)
        request.META.pop('Server', None)
        
        #response = self.get_response(request)
        csp_directives = {            
            "frame-ancestors": "'self' http://127.0.0.1:8000 http://localhost:8000 http://localhost:5173" ,
    
        }

        csp_header_value = '; '.join([f"{directive} {value}" for directive, value in csp_directives.items()])
        response['Content-Security-Policy'] = csp_header_value
        

        response['Content-Disposition'] = 'inline'
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'deny'
        return response   