"""
Django settings for checkin project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '=e!i+qy&!r&r-89p6ud@_gv1x0izh_^l&iax2+=ra6(@!fm53n'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

TEMPLATE_DEBUG = DEBUG

ALLOWED_HOSTS = '*'


# Application definition

INSTALLED_APPS = (
    'suit',
    'tastypie',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.sites',
    'django.contrib.staticfiles',
    'checkin',
    'accounts',
    'personal',
    'wifi',
)

SITE_ID = 1

XS_SHARING_ALLOWED_ORIGINS = 'http://wifi2work.ru'
XS_SHARING_ALLOWED_METHODS = ['POST', 'GET']
XS_SHARING_ALLOWED_HEADERS = ['https://api.instagram.com', 'https://api.twitter.com', 'http://vkontakte.ru']

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'checkin.middleware.TimezoneMiddleware',
    'checkin.middleware.XsSharing',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.i18n',
    'django.core.context_processors.request',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    "django.contrib.messages.context_processors.messages",
)

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

ROOT_URLCONF = 'checkin.urls'

WSGI_APPLICATION = 'checkin.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',#postgresql_psycopg2
        'NAME': 'db.checkin',
        #'USER': 'admin',
        #'PASSWORD': 'admin',
        #'HOST': 'localhost',
        #'PORT': '5432',
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'ru'

TIME_ZONE = 'Europe/Moscow'

USE_I18N = True

USE_L10N = True

USE_TZ = True

#suit
SUIT_CONFIG = {
    'ADMIN_NAME': 'Check In',
    'HEADER_DATE_FORMAT': 'l, j. F Y',
    'HEADER_TIME_FORMAT': 'H:i',
}

#image conf

IMAGE_FORMAT = ['.jpg', '.png']
IMAGE_WIDTH = 320
IMAGE_HEIGHT = 1024

#twitter
CONSUMER_KEY = 'fJAdldKirXWfXobisST7Nzx83'
CONSUMER_SECRET = 'OLwrNPbaAEEFGgOVAoD1E31d3nQUvtXnstoHmnpVpOZV9DezVw'
ACCESS_TOKEN = '3024719987-utPROtKAU1IgEpOQn2cV6bizlHPSbgiPdchp4jX'
ACCESS_TOKEN_SECRET = 'CxVdpo8HGNT9upOK3oxJW6jBHp5lumLu66ad4yF2aSYOF'
CALLBACK_URL = 'http://wifi2work.ru/wifi/free/twitter_auth'
# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/
SETTINGS_DIR = os.path.dirname(__file__)
PROJECT_PATH = os.path.join(SETTINGS_DIR, os.pardir)
PROJECT_PATH = os.path.abspath(PROJECT_PATH)

STATIC_ROOT = os.path.join(PROJECT_PATH, 'static')
STATIC_URL = '/static/'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(PROJECT_PATH, 'media')

#STATICFILES_DIRS = (
#   os.path.join(PROJECT_PATH, 'static'), #STATIC_ROOT,
#)

TEMPLATE_DIRS = (
    os.path.join(PROJECT_PATH, 'templates'),
)

#loging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format' : "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
            'datefmt' : "%d/%b/%Y %H:%M:%S"
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
        'wifi_file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': '../checkin/wifi.log',
            'formatter': 'verbose'
        },
        'db_file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': '../checkin/db.log',
        },
    },
    'loggers': {
        'wifi.views': {
            'handlers': ['wifi_file'],
            'level': 'ERROR',
        },
        'django.db.backends': {
            'handlers': ['db_file'],
            'level': 'ERROR',
            'propagate': False,
        },
    }
}