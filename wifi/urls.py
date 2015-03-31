from django.conf.urls import patterns, include, url
from wifi.views import Twitter_, Base

urlpatterns = patterns('wifi.views',
    url(r'^free/create$', 'create', name='create'),
    url(r'^free/sms$', 'sms', name='sms'),
    url(r'^free/sms_auth$', 'sms_auth', name='sms_auth'),
    url(r'^free/$', Base.as_view(), name='free'),
    url(r'^free/twitter$', Twitter_.as_view(), name='twitter'),
    url(r'^free/twitter_auth$', 'twitter_auth', name='twitter_auth'),
    url(r'^free/fbpost$', 'fbpost', name='fb_post'),
    url(r'^free/dst$', 'get_server_address', name='dst'),
    url(r'^free/dst_vk$', 'get_server_address_forvk', name='dst_vk'),
)