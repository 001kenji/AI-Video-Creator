from django.contrib import admin
from django import forms
from .models import Account,AccountManager
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.contrib import admin
from django.contrib.auth.models import Group
from datetime import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
admin.site.site_title = 'login admin'
admin.site.site_header = 'LOGIN'
admin.site.site_index = 'Welcome Back'
from django.contrib.admin import site
import time, asyncio, json,os,datetime
from django.urls import reverse
from django.http import HttpResponseRedirect
from django.contrib import messages
from django.conf import settings
from pathlib import Path
import shutil

from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
BASE_DIR = Path(__file__).resolve().parent.parent


class OutstandingTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at','expires_at')
    search_fields = ('user__email', 'user__username')
    list_filter = ('created_at',)

class BlacklistedTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token', 'blacklist_date','blacklist_at')
    search_fields = ('user__email', 'user__username', 'token')
    list_filter = ('blacklist_date',)


ActiveUser = Account.objects.all()
class UserAccountAdmin (admin.ModelAdmin):
    
    list_display=('name','email','is_staff')
    list_filter=['is_staff','is_active','is_superuser']

    def get_actions(self, request):
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions
    
    def get_readonly_fields(self, request, obj=None):
        readonly_fields = super().get_readonly_fields(request, obj)
        if obj and obj.email == "daimac@gmail.com":
            # Make all fields read-only for the user with email "daimac@gmail.com"
            return [field.name for field in self.model._meta.fields]
        return readonly_fields

    

    def response_add(self, request, obj, post_url_continue=None):
        folder_name = str(obj.email)
        folder_path = os.path.join(settings.MEDIA_ROOT, folder_name)

        # Create the folder
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
           
        # Call the parent's response_add method to continue with the default behavior
        
        return super().response_add(request, obj, post_url_continue)

    def save_model(self, request, obj, form, change):
        is_new = not Account.objects.filter(pk=obj.pk).exists()
        # print('Called save_model: is_new =', is_new)
        if is_new:  # If this is a new object
            
            obj.set_password(form.cleaned_data['password'])
           
        super().save_model(request, obj, form, change)
    
    def delete_model(self, request, obj):
        if obj.email == "daimac@gmail.com" or obj.email == 'kenjicladia@gmail.com' or obj.email == 'gestuser@gmail.com':
            # Prevent deletion of the user with email "daimac@gmail.com"
            message = "You are not allowed to delete the Sole Administrator."
            self.message_user(request, message, level='ERROR')
            return False
        else:
            #removing entire user content details stored in the server
            folder_name = str(obj.email)
            folder_path = os.path.join(settings.MEDIA_ROOT, folder_name)
            # Create the folder
            if os.path.exists(folder_path):
                shutil.rmtree(folder_path)
            super().delete_model(request, obj)
        
    def response_delete(self, request, obj_display, obj_id):
        opts = self.model._meta
        preserved_filters = self.get_preserved_filters(request)

        if obj_display:
            deleted_objects = [obj_display]
        else:
            deleted_objects = [self.model._meta.verbose_name]

        if request.POST.get('_delete_confirmation') != '1':
            return HttpResponseRedirect(request.path)

        self.message_user(request, 'Successfully deleted %s.' % ' '.join(deleted_objects), messages.SUCCESS)
        # Instead of showing the success message, return to the change list
        return HttpResponseRedirect(reverse('admin:%s_%s_changelist' % (opts.app_label, opts.model_name)) + '?' + preserved_filters)


    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        if not obj:
            New_fieldsets = (
                (None, {
                'fields': ('email', 'name','password','is_active', 'is_staff','is_superuser')
            }),
            ('Profile',{
                'fields' : ('ProfilePic','ProfileAbout','YoutubeChannels')
            })
            ,)
        else:
            New_fieldsets = (
                (None, {
                'fields': ('email', 'name','is_active', 'is_staff','is_superuser')
            }),
            ('Profile',{
                'fields' : ('ProfilePic','ProfileAbout','YoutubeChannels')
            })
            ,)
        return New_fieldsets 
    
    readonly_fields=('id',)
    



admin.site.unregister(Group)
admin.site.register(Account, UserAccountAdmin)

