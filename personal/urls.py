from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required
from personal.views import Statistic, Settings, Marketing, Edit
from django.views.generic.base import TemplateView
from tastypie.api import Api
from personal.api.resources import *

urlpatterns = patterns('',
    url(r'^statistic$', login_required(Statistic.as_view()), name='statistic'),
    url(r'^marketing$', login_required(Marketing.as_view(template_name='personal/marketing.html')), name='marketing'),
    url(r'^edit$', login_required(Edit.as_view()), name='edit'),
    url(r'^settings$', login_required(Settings.as_view()), name='settings'),

    url(r'^add_banner$', 'personal.views.add_banner', name='add_banner'),
    url(r'^create_mailbox$', 'personal.views.create_mailbox', name='create_mailbox'),
    url(r'^create_smsbox$', 'personal.views.create_smsbox', name='create_smsbox'),
    url(r'^edit_customer_settings$', 'personal.views.edit_customer_settings', name='edit_customer_settings'),
    url(r'^send_message$', 'personal.views.send_message', name='send_message'),
    url(r'^delete_banner$', 'personal.views.delete_banner', name='delete_banner'),
    url(r'^upload_to_vk$', 'personal.views.upload_to_vk', name='vk'),
    url(r'^edit_point$', 'personal.views.edit_point', name='edit_point'),
    url(r'^advertisements$', 'personal.views.advertisements', name='advertisements'),
    url(r'^browse_banners$', 'personal.views.banners', name='banners'),
    url(r'^to_xls$', 'personal.views.to_xls', name='to_xls'),
)

v1_api = Api(api_name='v1')
v1_api.register(UserResource())
v1_api.register(GisResource())
v1_api.register(PointResource())
v1_api.register(AdvertisementResource())
v1_api.register(BannerResource())
v1_api.register(InVKResource())
v1_api.register(VisitorResource())
v1_api.register(VisitResource())
v1_api.register(PostResource())
v1_api.register(MetrikaResource())

urlpatterns += patterns('',
    url(r'^api/', include(v1_api.urls)),
)
