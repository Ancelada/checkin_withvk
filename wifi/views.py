# -*- coding: utf-8 -*-
from django.http import HttpResponse, StreamingHttpResponse, Http404
from django.http import HttpResponseRedirect
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.db.transaction import atomic
from django.views.generic.base import TemplateView
from django.db.models import F, Q
from django.db.models import ObjectDoesNotExist
from birdy.twitter import UserClient
from django.shortcuts import redirect, render_to_response
import facebook
from checkin.settings import CONSUMER_SECRET, CALLBACK_URL, CONSUMER_KEY, MEDIA_ROOT
from checkin.models import *
from wifi.models import *
from personal.models import *
import json
from django.core.serializers import serialize
from twython import Twython
from django.contrib import messages
from django.template import RequestContext
from django.utils.translation import ugettext as _
from django.contrib.sites.models import Site
from django.core.urlresolvers import reverse
import random
import string
import twilio
import twilio.rest
import re
import logging

log = logging.getLogger(__name__)

class Base(TemplateView):
    template_name = 'index.html'

    @csrf_exempt
    def dispatch(self, request, *args, **kwargs):
        return super(Base, self).dispatch(request, args, kwargs)

    def post(self, request, *args, **kwargs):
        identity = None
        mac = None
        ip = None
        server_address = None
        try:
            identity = request.POST['identity']
            mac = request.POST['mac']
            ip = request.POST['ip']
            server_address = request.POST['server-address']
        except:
            return redirect(reverse('accounts:login'))

        request.session['identity'] = identity
        request.session['mac'] = mac
        request.session['ip'] = ip
        request.session['server-address'] = server_address

        v = Visitor.objects.filter(mac=mac)
        if not v:
            with atomic():
                Visitor(
                    mac=mac,
                    ip=ip
                ).save()

        link = None
        try:
            link = Point.objects.get(identity=identity).link
        except Exception, e:
            return redirect(reverse('accounts:login'))

        adv = Advertisement.objects.filter(point__identity=identity)

        data = serialize('json', list(adv), fields=('title', 'banner', 'resource',))

        uid = None
        try:
            uid = Metrika.objects.get(point__identity=identity).uid
        except:
            return redirect(reverse('accounts:login'))

        banner = None
        for i in adv:
            if str(i.resource) == 'base':
                banner=Banner.objects.get(id=i.banner.id).banner.url

        return render_to_response('index.html', RequestContext(request,
            {'identity': identity, 'data': data, 'banner': banner, 'link': link, 'id': str(uid)}))


    def get(self, request, *args, **kwargs):
        identity = None
        server_address = None
        try:
            identity = request.session['identity']
            server_address = request.session['server-address']
        except:
            return redirect(reverse('accounts:login'))
        #request.session['identity']='MikroTik'
        #request.session['mac']='68:94:23:41:E3:57'
        link = None
        try:
            link = Point.objects.get(identity=identity).link
        except Exception, e:
            return redirect(reverse('accounts:login'))

        adv = Advertisement.objects.filter(point__identity=identity)
        data = serialize('json', list(adv), fields=('title', 'banner', 'resource',))

        uid = None
        try:
            uid = Metrika.objects.get(point__identity=identity).uid
        except:
            return redirect(reverse('accounts:login'))

        banner = None
        for i in adv:
            if str(i.resource) == 'base':
                banner=Banner.objects.get(id=i.banner.id).banner.url

        return render_to_response('index.html', RequestContext(request,
                                    {'identity': identity, 'data': data, 'banner': banner, 'link': link, 'id': str(uid)}))

def create_visitor(identity, data, first_name, last_name, screen_name, email, birthday,
                                                                gender, telephone, visitor, resource, link):

    try:

        if first_name != '-':
            visitor.first_name=first_name
        if last_name != '-':
            visitor.last_name=last_name
        if str(email) != 'default@default.ru':
            visitor.email=email
        if str(birthday) != '-':
            visitor.birthday=birthday
        if str(gender) != '-':
            visitor.gender=gender
        if str(telephone) != '-':
            visitor.telephone=telephone
        if str(screen_name) != '-':
            visitor.screen_name = screen_name

        visitor.status=True

        visitor.save(update_fields=['first_name', 'last_name', 'email', 'birthday', 'gender', 'telephone',
                                                                                                    'status', 'screen_name'])
    except Exception, e:
        data['error'] = 'Ошибка при вводе данных посетителя'
        return data

    point = None
    try:
        point = Point.objects.get(identity=identity)
    except Exception, e:
        data['error'] = 'Точки с данным идентификатором не существует'
        return data

    visit = Visit()
    try:
        visit.visitor=visitor
        visit.point=point
        visit.count=1
        visit.save()
    except Exception, e:
        data['error'] = 'Ошибка при вводе данных о посещении пользователя данной точки'
        return data
    try:
        Post(
            resource=resource,
            link=link,
            visit=visit
        ).save()
    except Exception, e:
        data['error'] = 'Ошибка при вводе данных поста оставленный посетителем'
        return data

    data['status'] = 'success'
    return data


def create_visit(visitor, identity, resource, link, data):

    point = None
    try:
        point = Point.objects.get(identity=identity)
    except Exception, e:
        data['error'] = 'Точки с данным идентификатором не существует'
        return data

    visit = Visit()

    try:
        visit.visitor = visitor
        visit.point = point
        visit.count = 1
        visit.save()
    except Exception, e:
        data['error'] = 'Ошибка при вводе данных о посещении пользователя данной точки'
        return data

    try:
        Post(
            resource=resource,
            link=link,
            visit=visit
        ).save()
    except Exception, e:
        data['error'] = 'Ошибка при вводе данных поста оставленный посетителем'
        return data

    data['status'] = 'success'
    return data

def update_visit(visitor, identity, resource, link, data):

    visit = None
    try:
        visit = Visit.objects.get(Q(point__identity=identity) & Q(visitor=visitor))
    except Exception, e:
        data['error'] = 'Посещения с идентификатором такой точки не существует или данная точка не принадлежит вам'
        return data

    try:
        visit = visit
        visit.count = F('count') + 1
        visit.save(update_fields=['count'])
    except Exception, e:
        data['error'] = 'Ошибка при обнавлении данных'
        return data

    try:
        Post(
            resource=resource,
            link=link,
            visit=visit
        ).save()
    except Exception, e:
        ata['error'] = 'Ошибка при вводе данных поста оставленный посетителем'
        return data

    data['status'] = 'success'
    return data

@require_POST
def create(request):

    data = {
        'status': 'fail',
        'error': None
    }

    if request.is_ajax():

        first_name = None
        last_name = None
        email = None
        birthday = None
        gender = None
        telephone = None

        try:
            #visitor data
            first_name = request.POST['first_name']#'Linar'
            last_name = request.POST['last_name']#'Giniyatullin'
            email = request.POST['email']#'lintutusg@mail.ru'
            birthday = request.POST['birthday']#'04.01.1994'
            gender = request.POST['gender']#'male'
            telephone = request.POST['telephone']
        except:
            log.error(u'Некоторые данные о пользователе отсутствуют')
            return StreamingHttpResponse(u'Некоторые данные о пользователе отсутствуют')

        link = None
        resource = None
        try:
            #post data
            link = request.POST['link']#'https://twitter.com/lintutus94'
            resource = request.POST['resource']#'twitter'
        except:
            log.error(u'Некоторые данные о посте отсутствуют')
            return StreamingHttpResponse(u'Некоторые данные о посте отсутствуют')

        try:
            #mikrotik data
            identity = request.session['identity']
            user_mac = request.session['mac']
        except:
            log.error(u'Неверные данные о точке доступа или/и пользователе')
            return StreamingHttpResponse(u'Неверные данные о точке доступа или/и пользователе')

        with atomic():

            try:

                visitor = Visitor.objects.select_for_update().filter(mac=user_mac)

                flag = False
                if visitor:

                    visit = Visit.objects.select_for_update().filter(visitor=visitor[0].id)

                    screen_name='-'

                    if not visit:

                        data = create_visitor(identity, data, first_name, last_name, screen_name, email, birthday,
                                                                            gender, telephone, visitor[0], resource, link)

                        if data['status'] == 'fail':
                            log.error(data['error'])

                    else:

                        try:

                            if first_name != '-':
                                visitor[0].first_name = first_name
                            if last_name != '-':
                                visitor[0].last_name = last_name
                            if str(visitor[0].telephone) == '-':
                                visitor[0].telephone = telephone
                            if str(visitor[0].birthday) == '-':
                                visitor[0].birthday = birthday
                            if str(visitor[0].email) == 'default@default.ru':
                                visitor[0].email = email
                            if str(visitor[0].gender) == '-':
                                visitor[0].gender = gender

                            visitor[0].save(update_fields=['first_name', 'last_name', 'telephone', 'birthday', 'email', 'gender'])
                        except:
                            log.error(u'Данные пользователя не обновились')

                        for v in visit:

                            if str(v.point) == str(identity):

                                data = update_visit(visitor[0], identity, resource, link, data)

                                if data['status'] == 'success':
                                    flag = True
                                else:
                                    log.error(data['error'])

                        if not flag:

                            data = create_visit(visitor[0], identity, resource, link, data)

                            if data['status'] == 'fail':
                                log.error(data['error'])

                else:
                    log.error(u'Посетитель не существует')
                    return StreamingHttpResponse(u'Посетитель не существует')

            except Exception, e:
                log.error(u'Произошли технические неполадки')

        data['status'] = 'success'
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))
    else:
        data['error'] = 'not ajax request'
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

class Twitter_(TemplateView):
    template_name = 'index.html'
    callback_url = CALLBACK_URL

    def dispatch(self, request, *args, **kwargs):
        return super(Twitter_, self).dispatch(request, args, kwargs)

    def get(self, request, *args, **kwargs):
        #get twiiter data from db
        twitter = Twitter.objects.get()
        #auth in twitter
        client = UserClient(twitter.consumer_token, twitter.consumer_secret_token)
        token = client.get_signin_token(CALLBACK_URL)
        #add session
        request.session['ACCESS_TOKEN'] = token.oauth_token
        request.session['ACCESS_TOKEN_SECRET'] = token.oauth_token_secret
        return redirect(str(token.auth_url))

@csrf_exempt
def twitter_auth(request):
    #mikrotik data
    identity = None
    mac = None
    try:
        mac = request.session['mac']
        identity = request.session['identity']
    except:
        return redirect(reverse('accounts:login'))

    #request data
    OAUTH_VERIFIER = None
    try:
        OAUTH_VERIFIER = request.GET['oauth_verifier']
    except:
        return redirect(reverse('accounts:login'))

    #get twitter data
    twitter = Twitter.objects.get()
    #auth in twitter
    client = UserClient(twitter.consumer_token, twitter.consumer_secret_token, request.session['ACCESS_TOKEN'],
                                                                                    request.session['ACCESS_TOKEN_SECRET'])
    token = client.get_access_token(OAUTH_VERIFIER)
    twitter = Twython(twitter.consumer_token, twitter.consumer_secret_token, token.oauth_token, token.oauth_token_secret)

    adv = Advertisement.objects.filter(point__identity=identity)
    title = None
    if adv:
        banner = None
        for i in adv:
            if str(i.resource) == 'twitter':
                banner = Banner.objects.get(id=i.banner.id).banner
                title = i.title
            elif str(i.resource) == 'base':
                banner = Banner.objects.get(id=i.banner.id).banner
                title = i.title

        path = open(MEDIA_ROOT.replace('\\', '/') + '/' + banner.name, "rb")
        twitter.update_status_with_media(status=title, media=path)

    result = twitter.verify_credentials()

    data = {
        'first_name': '-',
        'last_name': '-'
    }

    #twitter data
    name = result['name']
    screen_name = result['screen_name']

    line = name.split()
    if len(line) == 2:
        data['first_name'] = line[0]
        data['last_name'] = line[1]
    else:
        data['first_name'] = line[0]

    #post data
    link = 'https://twitter.com/' + str(screen_name)
    resource = 'twitter'

    visitor = None
    try:
        visitor = Visitor.objects.get(mac=mac)
    except:
        log.error(u'Посетитель не существует')
        return redirect(reverse('accounts:login'))

    visit = Visit.objects.filter(visitor=visitor.id)

    with atomic():
        try:

            screen_name='@' + str(screen_name)
            email = 'default@default.ru'
            birthday = '-'
            gender = '-'
            telephone = '-'

            if not visit:

                data = create_visitor(identity, {'status': 'fail', 'error': None}, data['first_name'], data['last_name'],
                                                                screen_name, email, birthday, gender, telephone, visitor, resource, link)

                if data['status'] == 'fail':
                    log.error(data['error'])

            else:
                try:
                    if data['first_name'] != '-':
                        visitor.first_name = data['first_name']
                    if data['last_name'] != '-':
                        visitor.last_name = data['last_name']
                    if str(visitor.screen_name) == '-':
                        visitor.screen_name = screen_name
                except:
                    log.error(u'Данные не обновились')

                visitor.save(update_fields=['first_name', 'last_name', 'screen_name'])

                for v in visit:

                    if str(v.point) == str(identity):

                        data = update_visit(visitor, identity, resource, link, {'status': 'fail', 'error': None})

                        if data['status'] == 'success':
                            flag = True
                        else:
                            log.error(data['error'])

                if not flag:

                    data = create_visit(visitor, identity, resource, link, {'status': 'fail', 'error': None})

                    if data['status'] == 'fail':
                        log.error(data['error'])

        except:
            log.error(u'Произошла ошибка')

    server_address = request.session['server-address']
    return HttpResponseRedirect('http://' + server_address+'/'+'login#dologin=true')

@require_POST
def fbpost(request):

    access_token = request.POST['access_token']
    text = request.POST['text']
    banner_id = request.POST['id']
    link = request.POST['link']

    graph = facebook.GraphAPI(access_token=access_token)

    banner = None
    try:
        banner = Banner.objects.get(id=banner_id).banner
    except Exception, e:
        messages.error(request, _(u'Баннер не существует'))
        return render_to_response('index.html', RequestContext(request))

    current_site = None
    try:
        current_site = Site.objects.get_current()
    except Exception, e:
        messages.error(request, _(u'Произошла ошибка'))
        return render_to_response('index.html', RequestContext(request))

    path = 'http://' + str(current_site.domain) + str(banner.url)

    attachment = {
        'link': str(link),
        'picture': str(path)
    }

    try:
        graph.put_wall_post(message=text, attachment=attachment)
    except Exception, e:
        messages.error(request, _(u'Пост не удался'))
        return render_to_response('index.html', RequestContext(request))

    return redirect(reverse('wifi:free'))

@require_POST
def sms(request):

    data = {
        'status': 'fail',
        'error': None
    }
    #request data
    telephone = request.POST['telephone']
    #session mikrotik data
    identity = None
    mac = None
    try:
        identity = request.session['identity']
        mac = request.session['mac']
    except:
        data['error'] = 'Нет данных по точке доступа и мак адресу пользователя'
        log.error(data['error'])
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))
    
    if not re.compile('\\+7[0-9]{0,9}').match(telephone):
        data['error'] = 'Неверный формат номера телефона'
        log.error(data['error'])
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))
    
    send_data = SMSMessaging.objects.filter(customer__username='admin')

    if send_data:

        visitor = None
        try:
            visitor = Visitor.objects.get(mac=mac)
        except Exception, e:
            data['error'] = 'Посетитель не существует'
            log.error(data['error'])
            return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

        visit = Visit.objects.filter(visitor=visitor.id)

        try:
            first_name = '-'
            last_name = '-'
            screen_name ='-'
            email = 'default@default.ru'
            birthday = '-'
            gender = '-'
            resource = 'base'
            link = ''

            if not visit:

                data = create_visitor(identity, data, first_name, last_name,
                                                                screen_name, email, birthday, gender, telephone, visitor, resource, link)

                if data['status'] == 'fail':
                    log.error(data['error'])
            else:
                try:
                    if str(visitor.telephone) == '-':
                        visitor.telephone = telephone
                except:
                    log.error(u'Данные не обновились')

                visitor.save(update_fields=['telephone'])

                for v in visit:

                    if str(v.point) == str(identity):

                        data = update_visit(visitor, identity, resource, link, {'status': 'fail', 'error': None})

                        if data['status'] == 'success':
                            flag = True
                        else:
                            log.error(data['error'])

                if not flag:

                    data = create_visit(visitor, identity, resource, link, {'status': 'fail', 'error': None})

                    if data['status'] == 'fail':
                        log.error(data['error'])

        except:
            log.error(u'Произошла ошибка')

        key = ''.join(random.choice(string.digits) for x in range(5))
        body = u'Код для входа в сеть: %s' % key
        t = request.session['key'] = str(key)

        try:
            client = twilio.rest.TwilioRestClient(send_data[0].sid, send_data[0].token)

            message = client.messages.create(
                body=body,
                to=telephone,
                from_=send_data[0].number
            )
            print message.sid
        except twilio.TwilioRestException as e:
            data['error'] = str(e)
            log.error(data['error'])
    else:
        data['error'] = 'Опция рассылки смс не подключена'
        log.error(u'Опция рассылки смс не подключена')
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

    data['status'] = 'success'
    return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))


@require_POST
def sms_auth(request):
    key = None
    try:
        key = request.POST['key']
    except:
        return StreamingHttpResponse(u'Не введен секретный код')

    if request.session['key'] == key:
        '''
        redirect to mikrotik
        '''
        dst_server = request.session['server-address']

        return StreamingHttpResponse('http://' + dst_server+'/login')
    else:
        return StreamingHttpResponse(u'Неверный секретный код')


def get_server_address(request):
    return StreamingHttpResponse('http://'+request.session['server-address']+'/login')
