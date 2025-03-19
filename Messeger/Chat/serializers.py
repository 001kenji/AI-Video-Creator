from djoser.serializers import UserCreateSerializer, ActivationSerializer
from django.contrib.auth import get_user_model

from rest_framework import serializers
from .models import AccountManager,FolderTable,FileTable,CreationStateManager
User = get_user_model()
import datetime

class UserCreateSerializer(UserCreateSerializer):
    #id = serializers.UUIDField(format='hex')  # Converts UUID to a string
    class Meta (UserCreateSerializer.Meta):
        model = User
        fields = (
            'id','email',
            'is_active',
            'name','password',            
            )

    
class UserSerializer(serializers.ModelSerializer):
    #id = serializers.UUIDField(format='hex')  # Converts UUID to a string
    #including an extra external field
    # A read-only field that returns all possible choices
    notification_sound_choices = serializers.SerializerMethodField()

    class Meta:
        model = User
        
        fields = ( 
            'name','email','id','ProfilePic','YoutubeChannels','notification_sound','ProfileAbout','notification_sound_choices'
        )

    def get_notification_sound_choices(self, obj):
        """
        Return the notification sound choices in a friendly format, e.g.:
        [
          {"value": "bell-notification-933.wav", "label": "Bell Notification"},
          ...
        ]
        """
        return [
            {"value": choice[0], "label": choice[1]}
            for choice in User.NOTIFICATION_SOUND_CHOICES
        ]    

        
class UserAboutSerializer(serializers.ModelSerializer):
    #id = serializers.UUIDField(format='hex')  # Converts UUID to a string
    #including an extra external field
    # 
    class Meta:
        model = User
        
        fields = ( 
            'ProfileAbout','YoutubeChannels','notification_sound')

class FolderTableSerializer(serializers.ModelSerializer):
    #id = serializers.UUIDField(format='hex')  # Converts UUID to a string
    class Meta:
        model = FolderTable
        fields = ['id','title','dateCreated']


class FileTableSerializer(serializers.ModelSerializer):
    #id = serializers.UUIDField(format='hex')  # Converts UUID to a string
    class Meta:
        model = FileTable
        fields = ['id','name','dateCreated','size','fileUrl','type']

class CreationStateManagerSerializer(serializers.ModelSerializer):
    #id = serializers.UUIDField(format='hex')  # Converts UUID to a string
    class Meta:
        model = CreationStateManager
        fields = ['PostContentContainer','dateModified','data','AiPage','RequestKind']
