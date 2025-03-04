from djoser.serializers import UserCreateSerializer, ActivationSerializer
from django.contrib.auth import get_user_model

from rest_framework import serializers
from .models import AccountManager,FolderTable,FileTable
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
    # 
    class Meta:
        model = User
        
        fields = ( 
            'name','email','id','ProfilePic')

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
