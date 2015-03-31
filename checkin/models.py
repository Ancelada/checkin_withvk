# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User

class VK(models.Model):
    username = models.CharField(max_length=100, verbose_name=u'Логин', null=False)
    password = models.CharField(max_length=50, verbose_name=u'Пароль', null=False)
    group_id = models.IntegerField(verbose_name=u'id группы', blank=True)
    album_id = models.IntegerField(verbose_name=u'id альбома', blank=True)
    app_id = models.IntegerField(verbose_name=u'id приложения', primary_key=True)

    class Meta:
        db_table = u'vk'
        verbose_name = u'vk'
        verbose_name_plural = u'vk'

class Twitter(models.Model):
    consumer_token = models.CharField(max_length=100, verbose_name=u'Публичный токен приложения', unique=True)
    consumer_secret_token = models.CharField(max_length=100, verbose_name=u'Секретный токен приложения', unique=True)
    access_token = models.CharField(max_length=100, verbose_name=u'Публичный токен доступа', unique=True)
    access_secret_token = models.CharField(max_length=100, verbose_name=u'Секретный токен доступа', unique=True)

    class Meta:
        db_table = u'twitter'
        verbose_name = u'twitter'
        verbose_name_plural = u'twitter'

class SMSMessaging(models.Model):
    customer = models.ForeignKey(User, verbose_name=u'Заказчик')
    sid = models.CharField(max_length=50, null=False)
    token = models.CharField(max_length=50, null=True)
    number = models.CharField(max_length=18, null=False, verbose_name=u'Номер телефона')

    class Meta:
        db_table = u'messaging'
        verbose_name = u'SMS'
        verbose_name_plural = u'SMS'

    def __unicode__(self):
        return unicode(self.number)
