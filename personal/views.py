# -*- coding: utf-8 -*-
from django.http import StreamingHttpResponse, HttpResponse
from checkin.settings import *
from personal.models import *
from wifi.models import *
from checkin.models import *
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render_to_response, render
from django.core.urlresolvers import reverse
import os
from django.db.models import Q, F
from django.db.transaction import atomic
import vk
import vkontakte
import re
import requests
import json
from django.contrib import messages
from django.template import RequestContext
from django.utils.translation import ugettext as _
from checkin.settings import IMAGE_FORMAT
from django.contrib.auth.models import User
from smtplib import SMTP_SSL
import email.utils
from email.mime.text import MIMEText
import smtplib
from django.views.generic.base import TemplateView
from django.views.decorators.http import require_POST
from django.core.serializers import serialize
import twilio
import twilio.rest
from django.core.files.images import get_image_dimensions
#from PIL import Image
from django.core.serializers import serialize
import xlwt
import StringIO
from django.views.decorators.csrf import csrf_exempt

class Statistic(TemplateView):
    template_name='personal/index.html'

    def get(self, request, *args, **kwargs):
        metrika = Metrika.objects.filter(point__customer=request.user.id)
        uids = []
        if metrika:
            for i in metrika:
                uids.append(i.uid)

        return render_to_response(self.template_name, RequestContext(request, {'ids': uids}))

class Settings(TemplateView):
    template_name = 'personal/settings.html'

    def get(self, request, *args, **kwargs):
        sms = None
        mail = None
        try:
            sms = SMSMessaging.objects.get(customer=request.user.id)
        except:
            sms = ''
        try:
            mail = Mailgun.objects.get(customer=request.user.id)
        except:
            mail = ''

        return render_to_response(self.template_name, RequestContext(request, {'sms': sms, 'mail': mail}))

class Marketing(TemplateView):
    template_name = 'personal/edit.html'

    def get(self, request, *args, **kwargs):
        sms_status = False
        mail_status = False
        if SMSMessaging.objects.filter(customer=request.user.id):
            sms_status = True
        if Mailgun.objects.filter(customer=request.user.id):
            mail_status = True

        return render_to_response(self.template_name, RequestContext(request, {'sms_status': sms_status, 'mail_status': mail_status}))

class Edit(TemplateView):
    template_name = 'personal/edit.html'

    def get(self, request, *args, **kwargs):
        banners = Banner.objects.filter(customer=request.user.id)

        return render_to_response(self.template_name, RequestContext(request, {'banners': banners}))

@login_required
@require_POST
def upload_to_vk(request):

    data = {
        'status': 'fail',
        'error': None
    }

    banner_id = request.POST['id']

    if InVK.objects.filter(banner__id=banner_id):
        data['status'] = 'success'
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

    vkontakte = None
    try:
        vkontakte = VK.objects.get()
    except ObjectDoesNotExist as e:
        data['error'] = 'Нет данных от соц сети vkontakte'
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

    banner = None
    try:
        banner = Banner.objects.get(Q(id=banner_id) & Q(customer=request.user.id))
    except ObjectDoesNotExist as e:
        data['error'] = 'Баннера не существует или баннер не принадлежит данному заказчику'
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

    vkapi = vk.API(vkontakte.app_id, vkontakte.username, vkontakte.password, scope='photos')
    vkapi = vk.API(access_token=vkapi.access_token)
    server = vkapi.photos.getUploadServer(group_id=vkontakte.group_id, album_id=vkontakte.album_id)

    path = open(MEDIA_ROOT.replace('\\', '/') + '/' + banner.banner.name, "rb")
    file_datas = requests.post(server['upload_url'], files={'file1': path}).json()

    banner_vk = InVK()

    with atomic():
        links = vkapi.photos.save(group_id=vkontakte.group_id, album_id=vkontakte.album_id, server=file_datas['server'],
                                  photos_list=file_datas['photos_list'], hash=file_datas['hash'])

        photo_json_format = json.loads(file_datas['photos_list'])[0]
        sizes = photo_json_format['sizes']
        for size in sizes:
            if str(photo_json_format['photo']).split(':')[1] in size:
                photo_name = size[3]
                for i in links[0].iteritems():
                    if str(i[1]).startswith('http:') and photo_name in str(i[1]):
                        banner_vk.link = i[1]

        banner_vk.photo_id = links[0]['id']
        banner_vk.banner = banner
        banner_vk.save()

    data['status'] = 'success'
    return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

@login_required
@require_POST
def edit_point(request):

    data = {
        'status': 'fail',
        'error': None
    }

    if request.is_ajax():

        identity = request.POST['identity']
        region = request.POST['region']
        city = request.POST['city']
        district = request.POST['district']
        place_name = request.POST['place_name']
        link = request.POST['link']

        if not link:
            link = 'http://yandex.ru'

        with atomic():

            point = None

            try:
                point = Point.objects.select_for_update().get(Q(identity=identity) & Q(customer=request.user.id))
            except ObjectDoesNotExist as e:
                data['error'] = 'Точки с таким идентификатором не существует или точка не принадлежит вам'
                return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

            gis = None

            try:
                gis = Gis.objects.select_for_update().get(id=point.gis.id)
            except ObjectDoesNotExist as e:
                data['error'] = 'Такого адреса не сущетсвует'
                return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

            try:
                point.link = link
                point.save(update_fields=['link'])
            except Exception, e:
                data['error'] = 'Произошли неполадки при сохранении ссылки на ваш ресурс'
                return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

            try:
                gis.city = city
                gis.region = region
                gis.district = district
                gis.place_name = place_name
                gis.save(update_fields=['region', 'city', 'district', 'place_name'])
            except:
                data['error'] = 'Произошли неполадки при сохранении адреса вашей точки'
                return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

        data['status'] = 'success'
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))
    else:
        data['error'] = 'not ajax request'
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

@login_required
@require_POST
def add_banner(request):

    data = {
        'status': 'fail',
        'error': None
    }
    banner = None
    try:
        banner = request.FILES['banner']
    except:
        data['error'] = u'Картинка не выбрана'
        messages.error(request, _(data['status'] + ':' + data['error']))
        return redirect(reverse('personal:settings'))

    if not str(banner.name).lower().endswith(tuple(IMAGE_FORMAT)):
        ext = (lambda arr: ''.join(exts + ', ' for exts in arr))(IMAGE_FORMAT)
        data['error'] = u'Неправильное рассширение картинки. (%s)' % ext
        messages.error(request, _(data['status'] + ':' + data['error']))
        return redirect(reverse('personal:settings'))

    create_banner = None
    with atomic():

        customer = User.objects.get(id=request.user.id)

        try:
            create_banner = Banner()
            create_banner.customer = customer
            create_banner.banner = banner
            create_banner.save()
        except Exception, e:
            data['error']=u'Баннер не сохранился в базе. Попробуйте повторить действия'
            messages.error(request, _(data['status'] + ':' + data['error']))
            return redirect(reverse('personal:settings'))

    messages.success(request, _(data['status']))
    return redirect(reverse('personal:edit'))

@login_required
@require_POST
def delete_banner(request):

    data = {
        'status': 'fail',
        'error': None
    }

    if request.is_ajax():
        banner_id = request.POST['id']
        banner = None
        try:
            banner = Banner.objects.get(Q(id=banner_id) & Q(customer=request.user.id))
        except ObjectDoesNotExist as e:
            data['error'] = 'Баннер не существует'
            return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

        if Advertisement.objects.filter(Q(banner=banner_id) & Q(point__customer=request.user.id)):
            data['error'] = 'Этот баннер закреплён за рекламой. Для удаления баннера смените его в рекламе'
            return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

        try:
            os.remove(str(banner.banner.path).replace('\\', '/'))
            banner.delete()
        except Exception, e:
            data['error'] = 'Банер не удалилися'
            return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

        data['status'] = 'success'
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))
    else:
        data['error'] = 'not ajax request'
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

@login_required
@require_POST
def advertisements(request):

    data = {
        'status': 'fail',
        'error': None
    }

    identity = request.POST['identity']
    resource = request.POST['resource']
    title = request.POST['title']
    name = request.POST['id']

    if not identity and not resource and not title and not name:
        data['error'] = 'Не хватает данных'
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

    choice = ['base', 'vk', 'twitter', 'facebook', 'instagram']

    if not str(resource) in tuple(choice):
        data['error'] = 'Неверный тип ресурса'
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

    banner = None
    try:
        banner = Banner.objects.get(Q(customer=request.user.id) & Q(id=name))
    except ObjectDoesNotExist, e:
        data['error'] = 'Баннер не существует'
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

    adv = Advertisement.objects.filter(Q(point__identity=identity) & Q(point__customer=request.user.id))

    with atomic():
        flag = False
        for i in adv:
            if str(i.resource) == resource:
                i.title = title
                i.banner = banner
                i.save(update_fields=['title', 'banner'])
                flag = True

        if not flag:

            point = None
            try:
                point = Point.objects.get(Q(customer=request.user.id) & Q(identity=identity))
            except ObjectDoesNotExist as e:
                data['error'] = 'Точка не существует'
                return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

            Advertisement(
                banner=banner,
                title=title,
                point=point,
                resource=resource
            ).save()

    data['status'] = 'success'
    return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

@login_required
@require_POST
@atomic
def edit_customer_settings(request):

    data = {
        'status': 'fail',
        'error': None
    }

    email = request.POST['email']
    telephone = request.POST['telephone']
    city = request.POST['city']

    customer = User.objects.get(id=request.user.id)

    i=0

    if email != '':
        customer.email = email
        i+=1

    if telephone != '':
        if not re.compile(r'\+7 \([0-9]{0,3}\) [0-9]{0,3}\-[0-9]{0,2}\-[0-9]{0,2}').match(str(telephone)):
            data['error'] = u'Невалидный номер телефона'
            messages.error(request, _(data['status'] + ':' + data['error']))
            return redirect(reverse('personal:settings'))
        else:
            customer.telephone = telephone
            i+=1

    if city != '':
        customer.city = city

    if i != 0:
        customer.save(update_fields=['email', 'telephone', 'city'])

    data['status'] = 'success'
    messages.success(request, _(data['status']))
    return redirect(reverse('personal:settings'))

@login_required
@require_POST
def create_smsbox(request):
    data = {
        'status': 'fail',
        'error': None
    }
    try:
        sid = request.POST['sid']
        token = request.POST['token']
        number = request.POST['number']
    except:
        return redirect(reverse('personal:settings'))

    if not sid and not token and number:
        data['error'] = u'Недостаточно данных'
        messages.error(request, _(data['status'] + ':' + data['error']))
        return redirect(reverse('personal:settings'))

    sms = SMSMessaging.objects.filter(customer=request.user.id)

    with atomic():
        if not sms:
            SMSMessaging(
                customer=User.objects.get(id=request.user.id),
                sid=sid,
                token=token,
                number=number
            ).save()

        else:
            sms[0].sid = sid
            sms[0].token = token
            sms[0].number = number
            sms[0].save(update_fields=['sid', 'token', 'number'])

    data['status'] = 'success'
    messages.success(request, _(data['status']))
    return redirect(reverse('personal:settings'))

@login_required
@require_POST
def create_mailbox(request):

    data = {
        'status': 'fail',
        'error': None
    }

    #mailbox
    domain = None
    host = None
    api_key = None

    try:
        domain = request.POST['domain']
        host = request.POST['hostname']
        api_key = request.POST['api']
    except:
        return redirect(reverse('personal:settings'))

    if not domain and not host and api_key:
        data['error'] = u'Недостаточно данных'
        messages.error(request, _(data['status'] + ':' + data['error']))
        return redirect(reverse('personal:settings'))

    mailgun = Mailgun.objects.filter(customer=request.user.id)
    with atomic():
        if mailgun:
            mailgun[0].domain = domain
            mailgun[0].host = host
            mailgun[0].key = api_key
            mailgun[0].save(update_fields=['domain', 'host', 'key'])
        else:
            try:
                Mailgun(
                    customer = User.objects.get(id=request.user.id),
                    domain = domain,
                    host = host,
                    key = api_key,
                ).save()
            except Exception, e:
                data['error'] = u'Произошла ошибка'
                messages.error(request, _(data['status'] + ':' + data['error']))
                return render_to_response('personal/settings.html', RequestContext(request))

    data['status'] = 'success'
    messages.success(request, _(data['status']))
    return redirect(reverse('personal:settings'))

@login_required
@require_POST
def send_message(request):

    data = {
        'status': 'fail',
        'error': None
    }

    type_ = None
    message = None
    users = None

    try:
        title = request.POST['title']
        type_ = request.POST['type']
        message = request.POST['text']
        users = request.POST.getlist('users[]')
    except Exception, e:
        data['error'] = 'Не хватает данных'
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

    if not users:
        data['error'] = 'Посетитель не выбран'
        return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

    if type_ == 'email':

        mailgun = None
        try:
            mailgun = Mailgun.objects.get(customer=request.user.id)
        except Exception, e:
            data['error'] = 'У вас нет почтового ящика для рассылки'
            return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

        to = []
        for user in users:
            visitor = None
            try:
                email = Visitor.objects.get(id=user).email
                if str(email) != 'default@default.ru':
                    to.append(str(email))
            except Exception, e:
                data['error'] = 'Посетитель не существует'
                return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

        customer_email = 'postmaster@%s' % str(mailgun.domain)

        status = None
        try:
            status = requests.post("https://api.mailgun.net/v2/%s/messages" % str(mailgun.domain),
                                    auth=("api", str(mailgun.key)),
                                    data={"from": "reklama-wifi <%s>" % customer_email,
                                          "to": to,
                                          "subject": title,
                                          "html": message,
                                          "content-type": "text/html",
                                          "charset": "utf-8"}).status_code
        except Exception, e:
            data['error'] = 'Произошла ошибка при отправке писем. Ошибка соединения'
            return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

        if int(status) == 404:
            data['error'] == 'Неверный домен'
            return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

        if int(status) == 401:
            data['error'] == 'Неверный api ключ и/или адресат(ы) не существует(ют)'
            return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

    elif type_ == 'sms':
        sms = None
        try:
            sms = SMSMessaging.objects.get(customer=request.user.id)
        except:
            data['error'] = 'У вас не подключен сервис смс рассылки'
            return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))
        
        try:
            client = twilio.rest.TwilioRestClient(sms.sid, sms.token)
            for user in users:

                telephone = str(Visitor.objects.get(id=user).telephone)
                
                if telephone[0] == '8':
                    t = telephone[0:1].replace('8', '+7') + telephone[1:]
                    telephone = t.replace('-','').replace(' ','').replace(')','').replace('(','')
                elif telephone[0:2] == '+7':
                    telephone = telephone.replace('-','').replace(' ','').replace(')','').replace('(','')
                
                if telephone != '-':
                    message = client.messages.create(
                        body=message,
                        to=telephone,
                        from_=sms.number
                    )
                    print message.sid
        except twilio.TwilioRestException as e:
            data['error'] = str(e)
            return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

    data['status'] = 'success'
    return StreamingHttpResponse(json.dumps(data, ensure_ascii=False).decode('utf8'))

@login_required
def banners(request):
    b = Banner.objects.filter(customer=request.user.id)
    return render_to_response('personal/banners.html', RequestContext(request, {'banners': b}))

@login_required
@csrf_exempt
def to_xls(request):
    '''
    get all points current user
    '''
    
    points = Point.objects.filter(customer=request.user.id)
    '''
    add new book
    '''
   
    book = xlwt.Workbook(encoding="utf-8")
    for point in points:
        
        identity = str(point.identity)

        '''
        add first page
        page name equel point identity name
        '''
        sheet = book.add_sheet(identity)
        '''
        add field in first line on the sheet
        '''
        sheet.write(0, 0, "Имя")
        sheet.write(0, 1, "Фамилия")
        sheet.write(0, 2, "День рождения")
        sheet.write(0, 3, "Пол")
        sheet.write(0, 4, "Телефон")
        sheet.write(0, 5, "Email")
        sheet.write(0, 6, "Псевдоним в Twitter")
        sheet.write(0, 7, "MAC")
        sheet.write(0, 8, "IP")
        sheet.write(0, 9, "Дата первого посещения")
        sheet.write(0, 10, "Количество посещений")

        visits = Visit.objects.filter(point__identity=point.identity)
        
        i=1
        for visit in visits:
            
            visitor = Visitor.objects.get(id=visit.visitor.id)

            if visitor.status:
                sheet.write(i, 0, visitor.first_name)
                sheet.write(i, 1, visitor.last_name)
                sheet.write(i, 2, str(visitor.birthday))
                sheet.write(i, 3, visitor.gender)
                sheet.write(i, 4, str(visitor.telephone))

                if str(visitor.email) == 'default@default.ru':
                    sheet.write(i, 5, '-')
                else:
                    sheet.write(i, 5, str(visitor.email))

                sheet.write(i, 6, visitor.screen_name)
                sheet.write(i, 7, str(visitor.mac))
                sheet.write(i, 8, str(visitor.ip))
                sheet.write(i, 9, str(visitor.created))
                sheet.write(i, 10, str(visit.count))

                i = i+1

    content = StringIO.StringIO()
    
    book.save(content)
    
    response = StreamingHttpResponse(content.getvalue(), mimetype='application/vnd.ms-excel; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename=%s' % 'st_v.xls'
    
    return response

def vksendresult(request):
  try:
    args = {}
    if request.POST['sender_text']:
      text = request.POST['sender_text'].encode('utf-8')
      args['text'] = text
    if request.POST['token']:
      token = request.POST['token'].encode('utf-8')
      ntoken = token.find('access_token')
      etoken = token.find('&', ntoken)
      args['token'] = token[ntoken+13:etoken]
    if request.POST['attachement_links']:
      attachment = request.POST['attachement_links']
      attachment = attachment.split('\n')
      attachment = ','.join(attachment)
      args['attachment'] = attachment
    queryset = list(Point.objects.raw("""
      select * from point
      where link like '%%id%%'
      """))  
    vkapi = vkontakte.API(token=args['token'])
    no = 0
    for i in queryset:
      stringlink = i.link
      nlink = stringlink.find('id')
      stringlink = int(stringlink[nlink+2:])
      args['stringlink'] = stringlink
      if request.POST['attachement_links']:
          vkapi.messages.send(user_id=args['stringlink'], message=args['text'], attachment=args['attachment'],
          version='5.29')
      else:
          vkapi.messages.send(user_id=args['stringlink'], message=args['text'], version='5.29')
    return redirect(reverse('personal:statistic'))
  except:
    return HttpResponse('пустое поле "текст" или "url после авторизации"')