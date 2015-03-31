from tastypie import fields
from tastypie.resources import ModelResource, ALL_WITH_RELATIONS
from tastypie.authorization import Authorization
from tastypie.authentication import ApiKeyAuthentication, SessionAuthentication, MultiAuthentication
from personal.models import *
from wifi.models import *

class UserResource(ModelResource):
    class Meta:
        queryset = User.objects.all()
        resource_name = 'auth/user'
        list_allowed_methods = ['post', 'get']
        authentication = MultiAuthentication(ApiKeyAuthentication(), SessionAuthentication())
        authorization = Authorization()
        excludes = ['email', 'password', 'is_superuser']
        filtering = {
            'id': ALL_WITH_RELATIONS,
            'username': ALL_WITH_RELATIONS,
        }

class GisResource(ModelResource):
    class Meta:
        queryset = Gis.objects.all()
        resource_name = 'gis'
        list_allowed_methods = ['post', 'get']
        authentication = MultiAuthentication(ApiKeyAuthentication(), SessionAuthentication())
        authorization = Authorization()
        filtering = {
            'region': ALL_WITH_RELATIONS,
            'city': ALL_WITH_RELATIONS,
            'district': ALL_WITH_RELATIONS,
            'place_name': ALL_WITH_RELATIONS,
        }


class PointResource(ModelResource):

    gis = fields.ForeignKey(GisResource, 'gis', full=True)
    customer = fields.ForeignKey(UserResource, 'customer', full=True)

    class Meta:
        queryset = Point.objects.all()
        resource_name = 'point'
        list_allowed_methods = ['post', 'get']
        authentication = MultiAuthentication(ApiKeyAuthentication(), SessionAuthentication())
        authorization = Authorization()

        filtering = {
            'identity': ALL_WITH_RELATIONS,
            'gis': ALL_WITH_RELATIONS,
            'customer': ALL_WITH_RELATIONS,
        }

    def get_object_list(self, request):
        return super(PointResource, self).get_object_list(request).all()

class BannerResource(ModelResource):

    customer = fields.ForeignKey(UserResource, 'customer')

    class Meta:
        queryset = Banner.objects.all()
        list_allowed_methods = ['get', 'post']
        authentication = MultiAuthentication(ApiKeyAuthentication(), SessionAuthentication())
        authorization = Authorization()
        resource_name = 'banner'

        filtering = {
            'banner': ALL_WITH_RELATIONS,
            'customer': ALL_WITH_RELATIONS,
        }

class AdvertisementResource(ModelResource):

    point = fields.ForeignKey(PointResource, 'point', full=True)
    banner = fields.ForeignKey(BannerResource, 'banner', full=True)

    class Meta:
        queryset = Advertisement.objects.all()
        list_allowed_methods = ['get', 'post']
        authentication = MultiAuthentication(ApiKeyAuthentication(), SessionAuthentication())
        authorization = Authorization()
        resource_name = 'advertisement'

        filtering = {
            'title': ALL_WITH_RELATIONS,
            'banner': ALL_WITH_RELATIONS,
            'point': ALL_WITH_RELATIONS,
            'resource': ALL_WITH_RELATIONS,
        }

class InVKResource(ModelResource):

    banner = fields.ForeignKey(BannerResource, 'banner', full=True)

    class Meta:
        queryset = InVK.objects.all()
        list_allowed_methods = ['get', 'post']
        resource_name = 'in_vk'

        filtering = {
            'banner': ALL_WITH_RELATIONS,
            'photo_id': ALL_WITH_RELATIONS,
            'photo_name': ALL_WITH_RELATIONS,
        }

class VisitorResource(ModelResource):

    class Meta:
        queryset = Visitor.objects.all()
        list_allowed_methods = ['get', 'post']
        authentication = MultiAuthentication(ApiKeyAuthentication(), SessionAuthentication())
        authorization = Authorization()
        resource_name = 'visitor'

        filtering = {
            'first_name': ALL_WITH_RELATIONS,
            'last_name': ALL_WITH_RELATIONS,
            'id': ALL_WITH_RELATIONS,
        }

class VisitResource(ModelResource):

    point = fields.ForeignKey(PointResource, 'point', full=True)
    visitor = fields.ForeignKey(VisitorResource, 'visitor', full=True)

    class Meta:
        queryset = Visit.objects.all()
        list_allowed_methods = ['get', 'post']
        authentication = MultiAuthentication(ApiKeyAuthentication(), SessionAuthentication())
        authorization = Authorization()
        resource_name = 'visit'

        filtering = {
            'point': ALL_WITH_RELATIONS,
            'visitor': ALL_WITH_RELATIONS,
        }

class PostResource(ModelResource):

    visit = fields.ForeignKey(VisitResource, 'visit', full=True)

    class Meta:
        queryset = Post.objects.all()
        list_allowed_methods = ['get', 'post']
        authentication = MultiAuthentication(ApiKeyAuthentication(), SessionAuthentication())
        authorization = Authorization()
        resource_name = 'post'

        filtering = {
            'visit': ALL_WITH_RELATIONS,
            'resource': ALL_WITH_RELATIONS,
            'link': ALL_WITH_RELATIONS,
        }

class MetrikaResource(ModelResource):

    point = fields.ForeignKey(PointResource, 'point', full=True)

    class Meta:
        queryset = Metrika.objects.all()
        list_allowed_methods = ['get', 'post']
        authentication = MultiAuthentication(ApiKeyAuthentication(), SessionAuthentication())
        authorization = Authorization()
        resource_name = 'metrika'

        filtering = {
            'uid': ALL_WITH_RELATIONS,
            'point': ALL_WITH_RELATIONS,
        }
