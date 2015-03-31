from django.conf.urls import patterns, include, url
from checkin.settings import *
from django.contrib import admin
from django.views.generic.base import TemplateView
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'checkin.views.index', name='index'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^wifi/', include('wifi.urls', namespace='wifi')),
    url(r'^privacy_policy$', TemplateView.as_view(template_name='policy.html'), name='policy'),
    url(r'^accounts/', include('accounts.urls', namespace='accounts')),
    url(r'^personal/', include('personal.urls', namespace='personal')),
    url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': MEDIA_ROOT}),
    url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': STATIC_ROOT}),
)
