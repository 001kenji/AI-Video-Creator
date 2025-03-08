from django.urls import re_path,path
from . import views
urlpatterns = [
    path('profile/',views.ProfileView.as_view(), name='index page '),
    path('merge/',views.MergeView.as_view(), name='index page '),
    path('audio_to_video_upload/',views.UploadAudioToVideoAudiosView.as_view(), name='index page '),
    path('profiledocs/',views.UploadProfileDocs.as_view(), name='uploading profile documents page '),
    path('logout/', views.LogoutView.as_view(),name="logut view"),
    #path('<str:room_name>/',views.room, name='room'),
    path('upload/', views.FileUploadView.as_view(), name='file-upload'),
]
