"""
URL configuration for Messeger project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include,re_path
from django.shortcuts import redirect
from django.views.generic.base  import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from Chat.views import get_csrf_token
urlpatterns = [
    #path('admin/logout/', lambda request: redirect('/logout/', permanent=False)),
    path('admin/', admin.site.urls),
    path("cred/csrfToken/", get_csrf_token, name="get-csrf-token"),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('app/', include('Chat.urls')),

] +  static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [re_path(r'^.*', TemplateView.as_view(template_name='index.html'))]

if settings.DEBUG:
    #urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 1270.0.0.0/static/1.jpeg
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)