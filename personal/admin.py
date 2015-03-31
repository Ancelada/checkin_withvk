from django.contrib import admin
from personal.models import *
from django.contrib.admin import ModelAdmin

class GisView(ModelAdmin):
    search_fields = ['id', 'region', 'city', 'district', 'place_name']
    list_display = ['id', 'region', 'city', 'district', 'place_name']

class PointView(ModelAdmin):
    search_fields = ['identity', 'gis', 'customer']
    list_display = ['identity', 'gis', 'customer', 'link']

class BannerView(ModelAdmin):
    list_display = ['id', 'customer', 'banner']

class AdvertisementView(ModelAdmin):
    search_fields = ['resource', 'title', 'point']
    list_display = ['resource', 'title', 'banner', 'point']

class InVKView(ModelAdmin):
    list_display = ['banner', 'photo_id', 'link', 'photo_name']

class MetrikaView(ModelAdmin):
    list_display = ['uid', 'point']

class MailgunView(ModelAdmin):
    search_fields = ['customer', 'domain']
    list_display = ['customer', 'domain', 'host', 'key']

admin.site.register(Gis, GisView)
admin.site.register(Point, PointView)
admin.site.register(Advertisement, AdvertisementView)
admin.site.register(InVK, InVKView)
admin.site.register(Banner, BannerView)
admin.site.register(Metrika, MetrikaView)
admin.site.register(Mailgun, MailgunView)