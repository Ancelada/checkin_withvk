from django.contrib import admin
from checkin.models import *
from django.contrib.admin import ModelAdmin

class VKView(ModelAdmin):
    list_display = ['app_id', 'group_id', 'username', 'password']

class TwitterView(ModelAdmin):
    list_display = ['consumer_token', 'consumer_secret_token', 'access_token', 'access_secret_token']

class SMSMessagingView(ModelAdmin):
	list_display = ['customer', 'sid', 'token', 'number']

admin.site.register(VK, VKView)
admin.site.register(Twitter, TwitterView)
admin.site.register(SMSMessaging, SMSMessagingView)