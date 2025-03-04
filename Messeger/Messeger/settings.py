from pathlib import Path
import os, json,redis
from django.conf import settings
from datetime import timedelta
from dotenv import load_dotenv 
load_dotenv() 
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
SECRET_KEY = os.environ.get('SECRET_KEY')
import google.generativeai as genai


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True
# ALLOWED_HOSTS = [os.environ.get('ALLOWED_HOSTS_LIST'),os.environ.get('FRONTEND_URL'),os.environ.get('HostPath')] 
ALLOWED_HOSTS = [
    os.environ.get("ALLOWED_HOSTS_LIST", "127.0.0.1"),
    os.environ.get("FRONTEND_URL", "localhost"),
    os.environ.get("HostPath", "localhost"),
]

#to allow Django and the Django channel to connect with one another via a message broker

ASGI_APPLICATION = "Messeger.asgi.application" #Messeger.asgi will handle the ASGI
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],
        },
    },
}
redisConnection = redis.StrictRedis(host='localhost',port=6379,db=0)
JsonRedisConnection = '' #redis.StrictRedis(host='redis-18769.c336.samerica-east1-1.gce.redns.redis-cloud.com',password = 'LQeYmcBD0b6aVYyvL4KjqhHZ0K2YUeEF',port=18769)
#Application definition

INSTALLED_APPS = [
    "daphne",
    'channels',
    'channels_redis',
    'Chat',
    'rest_framework',
    "corsheaders",
    'djoser',
    'rest_framework_simplejwt.token_blacklist',
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',        
    'circuitbreaker',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'Chat.custom_auth.SetHeaderMiddleware',
]

ROOT_URLCONF = 'Messeger.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR,'dist'),os.path.join(BASE_DIR,'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

ASGI_APPLICATION = "Messeger.asgi.application"
WSGI_APPLICATION = 'Messeger.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
   'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': '5432'
    }
}
VITE_APP_DIR = os.path.join(BASE_DIR,'dist')
def load_json_from_dist(json_filename="manifest.json"):
    manifest_file_path = Path(str(settings.VITE_APP_DIR), "dist", json_filename)
    if not manifest_file_path.exists():
        raise OSError(
            f"Vite manifest file not found on path: {str(manifest_file_path)}"
        )
    with open(manifest_file_path, "r") as manifest_file:
        try:
            manifest = json.load(manifest_file)
        except json.JSONDecodeError as e:
            raise json.JSONDecodeError(
                f"Vite manifest file invalid. Maybe your {str(manifest_file_path)} file is empty?"
            ) from e
        else:
            return manifest

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 5,
        },
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR,'dist/assets'),
    os.path.join(BASE_DIR, "static"),
]

#STAIC_ROOT = os.path.join(BASE_DIR,'static')
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')  #where images will be stored
MEDIA_URL = '/media/'
# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = [
    os.environ.get('FRONTEND_URL'),
] 



CSRF_TRUSTED_ORIGINS = [os.environ.get('FRONTEND_URL')]

# settings.py

AUTH_USER_MODEL = 'Chat.Account'


#djoser here
# this is credentials for sending email and allowing django to use my email as a sending body 
EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 465
EMAIL_HOST_USER = 'machariabrian712@gmail.com'
EMAIL_HOST_PASSWORD= 'tmni cnhb nqho csqs'
EMAIL_USE_SSL = True


#for password hashes
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher", ## make sure argon 2 is up top since is the best
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
    "django.contrib.auth.hashers.ScryptPasswordHasher",
]

#to prevent downgrading https to http in PRODUCTION level
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
CORS_ALLOW_CREDENTIALS = True

ALLWOED_REDIRECT_URIS = [
    os.environ.get('FRONTEND_URL'),
    ]

# #to prevent csrf attack
# CSRF_COOKIE_NAME = "Inject"
# CSRF_COOKIE_SECURE = True # only for httpp
# SESSION_COOKIE_SECURE = False# only for httpp
# CSRF_COOKIE_HTTPONLY = False
# CSRF_COOKIE_SAMESITE = 'None'  # Change from 'Lax' to 'None'
# SESSION_COOKIE_SAMESITE = 'None'
# CIRCUIT_BREAKER_BACKEND = 'circuitbreaker.backends.memory.MemoryBackend'
# CIRCUIT_BREAKER_DEFAULT_TIMEOUT = 60  
# CIRCUIT_BREAKER_DEFAULT_FAILURE_THRESHOLD = 5
# CIRCUIT_BREAKER_DEFAULT_RECOVERY_TIMEOUT = 30  

#to prevent csrf attack
CSRF_COOKIE_NAME = "Inject"
CSRF_COOKIE_SECURE = True # only for httpp
SESSION_COOKIE_SECURE = True# only for httpp
CIRCUIT_BREAKER_BACKEND = 'circuitbreaker.backends.memory.MemoryBackend'
CIRCUIT_BREAKER_DEFAULT_TIMEOUT = 60  
CIRCUIT_BREAKER_DEFAULT_FAILURE_THRESHOLD = 5
CIRCUIT_BREAKER_DEFAULT_RECOVERY_TIMEOUT = 30  


DJOSER = {
    'LOGIN_FIELD': 'email', 
    'USER_CREATE_PASSWORD_RETYPE' : False,
    'USERNAME_CHANGED_EMAIL_CONFIRMATION': False,
    'PASSWORD_CHANGED_EMAIL_CONFIRMATION' : True,
    'SEND_CONFIRMATION_EMAIL' : True,
    'SET_USERNAME_RETYPE': True,
    'SET_PASSWORD_RETYPE': True,
    'PASSWORD_RESET_CONFIRM_URL': 'password/reset/confirm/{uid}/{token}',
    'ACTIVATION_URL' :'activate/{uid}/{token}',
    'SEND_ACTIVATION_EMAIL': True,
    "DELETE_USER_ON_REQUEST": False,  # Prevent automatic deletion via DELETE method
    'SERIALIZERS' : {
        'current_user' : 'Chat.serializers.UserSerializer',
        'user_create' : 'Chat.serializers.UserCreateSerializer',
        #'user_create' : None,
        'user' : 'Chat.serializers.UserCreateSerializer',
        'user_delete' : 'Chat.custom_auth.CustomUserDeleteBackend',
        #'password_reset_confirm' : 'Chat.custom_auth.CustomPasswordResetConfirmSerializer',
    }
}
 
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated'
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
         'rest_framework.authentication.TokenAuthentication', ### Aded
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    ## appliying throlling to prevent DDoS attacks
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '10/minutes',
        'user': '30/minutes',
        'ai' : '5/min',
        'VTV_AI' : '1/min',
        'csrf': '100/min',
        'DataThrottler' : '50/min',
        'fileUpload' : '5/min',
    }
}

SIMPLE_JWT = {
   'AUTH_HEADER_TYPES': ('JWT',),
   "ACCESS_TOKEN_LIFETIME": timedelta(hours=12),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
} 

# this is for telling djoser where the knowladge of handling hashed and salted password is
AUTHENTICATION_BACKENDS = (
    'Chat.custom_auth.CustomAuthBackend',
    # 'Chat.custom_auth.CustomUserDeleteBackend',
    'django.contrib.auth.backends.ModelBackend',
)

JAZZMIN_SETTINGS = {
    "site_title": "Daimac-Intel",
    "welcome_sign": "Welcome to Administrators",
    "site_header": "login admin",
    "site_brand": "DAIMAC",
    "copyright": "daimac@domain.com",
    "login_logo": None,
    "site_icon": None,
    "usermenu_links": [
        {"model": "auth.user", },
     
    ], 
    "search_model": ["auth.User"]
}


JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-success",
}


## AI SETUP
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
# Initialize the AI model
AI_MODEL = genai.GenerativeModel('gemini-1.5-flash')