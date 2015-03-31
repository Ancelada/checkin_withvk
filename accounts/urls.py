from django.conf.urls import patterns, include, url

urlpatterns = patterns('accounts.views',
    url(r'^login/$', 'sign_in', name='login'),
    url(r'^logout/$', 'logout', name='logout'),
)