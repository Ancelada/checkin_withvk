from django.contrib import admin
from wifi.models import *
from django.contrib.admin import ModelAdmin

class VisitorView(ModelAdmin):
    search_fields = ['id','first_name', 'last_name', 'email', 'birthday', 'gender', 'telephone', 'mac']
    list_display = ['id','first_name', 'last_name', 'screen_name', 'email', 'birthday', 'gender', 'telephone', 'mac', 'ip']

class VisitView(ModelAdmin):
    search_fields = ['id','visitor', 'count', 'point']
    list_display = ['id','visitor', 'count', 'point']

class PostView(ModelAdmin):
    search_fields = ['resource', 'visit']
    list_display = ['resource', 'visit', 'link', 'datetime']

admin.site.register(Visitor, VisitorView)
admin.site.register(Visit, VisitView)
admin.site.register(Post, PostView)