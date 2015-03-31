# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import ObjectDoesNotExist
from checkin.models import VK, Twitter
import hashlib, uuid

class Gis(models.Model):
    region = models.CharField(max_length=2, default=u'РТ', verbose_name=u'Регион')
    city = models.CharField(max_length=50, null=False, verbose_name=u'Город')
    district = models.CharField(max_length=50, verbose_name=u'Район', null=False)
    place_name = models.CharField(max_length=50, verbose_name=u'Название заведения', null=False)

    class Meta:
        db_table = u'gis'
        verbose_name = u'Геоданные'
        verbose_name_plural = u'Геоданные'

    def __unicode__(self):
        return unicode(self.region + u', г.' + self.city + u', район ' +
                       self.district + u', заведение ' + self.place_name)

class Point(models.Model):
    identity = models.CharField(max_length=64, verbose_name=u'Идентификатор', primary_key=True)
    gis = models.ForeignKey(Gis, verbose_name=u'Геоположение точки')
    customer = models.ForeignKey(User, verbose_name=u'Заказчик')
    link = models.URLField(verbose_name=u'Ссылка', blank=True)

    class Meta:
        db_table = u'point'
        verbose_name = u'Точки доступа'
        verbose_name_plural = u'Точки доступа'

    def __unicode__(self):
        return unicode(self.identity)

class Banner(models.Model):
    customer = models.ForeignKey(User, verbose_name=u'Заказчик')
    banner = models.ImageField(upload_to='point_banner', null=True, verbose_name=u'Банер')

    class Meta:
        db_table = u'banner'
        verbose_name = u'Баннер'
        verbose_name_plural = u'Баннер'

    def __unicode__(self):
        return unicode(self.banner)

class Metrika(models.Model):
    uid = models.IntegerField(max_length=10, verbose_name='UID', primary_key=True)
    point = models.ForeignKey(Point, blank=False, verbose_name=u'Точка доступа')

    class Meta:
        db_table = 'metrika'
        verbose_name = u'Метрика'
        verbose_name_plural = u'Метрика'

    def __unicode__(self):
        return unicode(self.uid)

class Advertisement(models.Model):
    RESOURCE_CHOICES = (
        (u'base', u'base'),
        (u'vk', u'vk'),
        (u'twitter', u'twitter'),
        (u'facebook', u'facebook'),
        (u'instagram', u'instagram')
    )
    point = models.ForeignKey(Point, verbose_name=u'Точка доступа')
    title = models.CharField(max_length=420, null=True, verbose_name=u'Заголовок', blank=True)
    banner = models.ForeignKey(Banner, verbose_name=u'Баннер')
    resource = models.CharField(choices=RESOURCE_CHOICES, max_length=10, verbose_name=u'Принадлежность к ресурсу',
                                default=u'base')

    class Meta:
        db_table = u'advertisement'
        verbose_name = u'Реклама'
        verbose_name_plural = u'Реклама'

    def __unicode__(self):
        return unicode(self.title)

class InVK(models.Model):
    banner = models.ForeignKey(Banner, verbose_name=u'Баннер', primary_key=True)
    photo_id = models.CharField(max_length=100, verbose_name=u'id фото', blank=True)
    photo_name = models.CharField(max_length=100, verbose_name=u'Полное имя фотографии')
    link = models.URLField(verbose_name=u'Ссылка на баннер', blank=True)

    class Meta:
        db_table = u'in_vk'
        verbose_name = u'Реклама в vkontakte'
        verbose_name_plural = u'Реклама в vkontakte'

@receiver(post_save, sender=InVK)
def create_name(sender, **kwargs):
    invk = kwargs.get('instance')
    if kwargs.get('created'):
        vk = None
        try:
            vk = VK.objects.get()
        except ObjectDoesNotExist as e:
            raise

        try:
            invk = InVK.objects.select_for_update().get(banner=invk.banner)
            invk.photo_name = 'photo-' + str(vk.group_id) + '_' + str(invk.photo_id)
            invk.save(update_fields=['photo_name'])
        except:
            raise

class Mailgun(models.Model):
    customer = models.ForeignKey(User, verbose_name=u'Заказчик', primary_key=True)
    domain = models.CharField(max_length=150, verbose_name=u'Домен')
    key = models.CharField(max_length=150, verbose_name=u'Апи ключ')
    host = models.CharField(max_length=150, verbose_name=u'Хост')

    class Meta:
        db_table = u'mailgun'
        verbose_name = u'Почтовый ящик для рассылки'
        verbose_name_plural = u'Почтовый ящик для рассылки'

    def __unicode__(self):
        return unicode(self.domain)
