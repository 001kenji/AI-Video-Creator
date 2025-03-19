from django.db import models
from django.shortcuts import get_list_or_404
from django.db.models import Prefetch
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager,Group,Permission
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework.authtoken.models import Token
from django.utils.html import escape, strip_tags
import re,json,os
from django.contrib.postgres.fields import JSONField
from django.core.validators import EmailValidator, RegexValidator
from django.core.exceptions import ValidationError
#for making a multiple select field in the admin panel site
#from multiselectfield import MultiSelectField
from channels.db import database_sync_to_async
import uuid,datetime
from django.core.exceptions import ValidationError

from django.conf import settings
from django.contrib.postgres.fields import ArrayField
def alphanumeric_validator(value): #for the name and text to  be validated and avoid attacks
    #regex = re.compile(r'^[a-zA-Z0-9]*$')
    regex = re.compile(r'^[a-zA-Z0-9.,\'\s]*$')
    if not regex.match(value):
        raise ValidationError('Only alphanumeric characters are allowed.')

def json_validator(value): #for the name and text to  be validated and avoid attacks
    try:
        data = json.loads(value)
        if not isinstance(data, list):
            raise ValidationError('ChatLog must be a list')
        for item in data:
            if not isinstance(item, dict):
                raise ValidationError('Each item in ChatLog must be a dictionary')
    except json.JSONDecodeError:
        raise ValidationError('Invalid JSON')


def sanitize_string(input_string):
    # Escape any HTML tags
    escaped_string = escape(input_string)

    # Remove all HTML tags
    sanitized_string = strip_tags(escaped_string)

    return sanitized_string

def generate_unique_id():
    return str(uuid.uuid4())[:16]  # Generates a unique ID with the first 8 characters of a UUID

def generate_e2e_id():
    return str(uuid.uuid4())[:32]  # Generates a unique ID with the first 8 characters of a UUID


class AccountManager(BaseUserManager):
   
    def create_user(self,email,name, password=None):
        if not email:
            raise ValueError("User must have an email address")
             
        
            
        email = self.normalize_email(email)
        name = sanitize_string(name)
        SanitizedName = sanitize_string(name)
        user = self.model(email=email, name=SanitizedName)        
        user.set_password(str(password))
        user.is_active = True 
        print(user.id)
        user.save(using=self._db)
       
        #creating a folder for each user as they are registered
        folder_name = str(email)
        folder_path = os.path.join(settings.MEDIA_ROOT, folder_name)

        # Create the folder
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
        return user

    def create_superuser(self,email, name,password=None):
        if not email:
            raise ValueError("User must have an email address")
        
        email = self.normalize_email(email)
        SanitizeName = sanitize_string(name)
        user = self.create_user( email=email, name=SanitizeName)        
        user.set_password(str(password))
        user.is_superuser = True
        user.is_staff = True
        user.is_active = True
      
        # assigning permission to the user
        content_types = ContentType.objects.all()
        for permission in Permission.objects.filter(content_type__in=content_types):
            user.user_permissions.add(permission)
        user.save(using=self._db)
        return user 


__all__ = ['Account']

class Account(AbstractBaseUser,PermissionsMixin):

    id = models.CharField(
        primary_key=True,
        default=uuid.uuid4,  # Use the custom generator
        editable=False,
    )
    email = models.EmailField(max_length=40, validators=[EmailValidator()], unique=True,db_index=True)
    name = models.CharField(max_length=30, validators=[alphanumeric_validator])
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    ProfilePic = models.ImageField(upload_to='images/',default='/images/fallback.jpeg',verbose_name='Profile Picture', blank=True )    
    ProfileRepository = models.JSONField(blank=True,null=True)
    ProfileAbout = models.JSONField(blank=True,null=True)
    YoutubeChannels = models.JSONField(blank=True,null=True)
    # Define available notification sound options
    NOTIFICATION_SOUND_CHOICES = [
       ('bell-notification-933.wav', 'Bell Notification'),
        ('bubble-pop-up-alert-notification-2357.wav', 'Bubble Pop-Up Alert'),
        ('correct-answer-tone-2870.wav', 'Correct Answer Tone'),
        ('gaming-lock-2848.wav', 'Gaming Lock'),
        ('happy-bells-notification-937.wav', 'Happy Bells Notification'),
        ('long-pop-2358.wav', 'Long Pop'),
        ('positive-notification-951.wav', 'Positive Notification'),
        ('sci-fi-click-900.wav', 'Sci-Fi Click'),
        ('software-interface-back-2575.wav', 'Software Interface Back'),
        ('software-interface-start-2574.wav', 'Software Interface Start'),
        ('sci-fi-confirmation.wav','sci-fi-confirmation.wav')
        # Add additional options as needed
    ]
    
    # Field for notification sound selection
    notification_sound = models.CharField(
        max_length=50,
        verbose_name= 'Notification effect',
        choices=NOTIFICATION_SOUND_CHOICES,
        default='sci-fi-confirmation.wav',  # Set a default sound if desired
        help_text="Select preferred notification sound effect."
    )
    groups = models.ManyToManyField(
        Group,
        related_name='useraccount_set',  # Custom related_name
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='useraccount_set',  # Custom related_name
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )


    
    
    def get_full_name(self):
        return self.name
    
    def get_short_name(self):
        return self.name
    
    def __str__(self):
        return f'{self.name} ※ {self.email}'
    objects = AccountManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
# this is for creating a balcklist method

class CreationStateManager(models.Model):
    id = models.CharField(
        primary_key=True,
        default=uuid.uuid4,  # Use the custom generator
        editable=False,
    )
    PostContentContainer = models.JSONField(blank=True,null=True)
    dateModified = models.CharField(max_length=60,blank=True,null=True)
    data = models.JSONField(blank=True,null=True)    
    AiPage = models.CharField(max_length=60,blank=True,null=True)
    RequestKind = models.CharField(max_length=60,blank=True,null=True)
    # Foreign key to Account model using the email field
    account_email = models.ForeignKey(
        Account,  # Refers to the custom user model (Account)
        to_field='email',          # Specifies that the foreign key references the email field
        on_delete=models.CASCADE,  # Deletes comment when the related Account is deleted
        related_name='state_manager'    # Allows reverse lookup from Account to PostComment
    )
    def __str__(self):
        return f'{self.account_email} ※ CreateState'


class BlacklistableToken(Token):
    def blacklist(self):
        self.is_active = False
        self.save()

class FolderTable(models.Model):
    id = models.CharField(
        primary_key=True,
        default=uuid.uuid4,  # Use the custom generator
        editable=False,
    )
    title = models.CharField(blank=True,null=True,max_length=100,validators=[alphanumeric_validator])
    dateCreated = models.CharField(max_length=60,blank=True,null=True)
    account_email = models.ForeignKey(
        Account,  # Refers to the custom user model (Account)
        to_field='email',          # Specifies that the foreign key references the email field
        on_delete=models.CASCADE,  # Deletes post when the related Account is deleted
        related_name='folders'       # Optional: Allows reverse lookup from Account to Post
    )

class FileTable(models.Model):
    id = models.CharField(
        primary_key=True,
        default=uuid.uuid4,  # Use the custom generator
        editable=False,
    )
    name = models.CharField(blank=True,null=True,max_length=100,validators=[alphanumeric_validator])
    dateCreated = models.CharField(max_length=60,blank=True,null=True)
    size = models.CharField(max_length=60,blank=True,null=True)
    fileUrl = models.TextField( validators=[alphanumeric_validator],blank=True,null=True)
    type = models.TextField( validators=[alphanumeric_validator],blank=True,null=True)
    # Foreign key to Post model using the id field
    folder_id = models.ForeignKey(
        FolderTable,  # Refers to the custom user model (Account)
        on_delete=models.CASCADE,  # Deletes comment when the related post is deleted
        related_name='files'       # Optional: Allows reverse lookup from Account to Post
    )
    # Foreign key to Account model using the email field
    account_email = models.ForeignKey(
        Account,  # Refers to the custom user model (Account)
        to_field='email',          # Specifies that the foreign key references the email field
        on_delete=models.CASCADE,  # Deletes comment when the related Account is deleted
        related_name='files'    # Allows reverse lookup from Account to PostComment
    )







# netstat -ano | findstr :8080
# taskkill /PID 1234 /F
