# -*- coding: utf-8 -*-
from django.db import models
from personal.models import Point

class Visitor(models.Model):
    GENDER_CHOICES = (
        (u'-', u'-'),
        (u'male', u'male'),
        (u'female', u'female'),
    )
    first_name = models.CharField(max_length=150, verbose_name=u'Имя посетителя', blank=True, default='-')
    last_name = models.CharField(max_length=150, verbose_name=u'Фамилие посетителя', blank=True, default='-')
    screen_name = models.CharField(max_length=150, verbose_name=u'Screen name(Twitter)', blank=True, default='-')
    email = models.EmailField(max_length=150, verbose_name=u'Email', blank=True, default='default@default.ru')
    birthday = models.CharField(max_length=120, verbose_name=u'День рождения', blank=True, default='-')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, verbose_name=u'Пол', blank=True, default='-')
    telephone = models.CharField(max_length=25, verbose_name=u'Телефон', blank=True, default='-')
    created = models.DateTimeField(auto_now=True, blank=True, verbose_name=u'Дата создания')
    status = models.BooleanField(default=False)
    mac = models.CharField(max_length=64, verbose_name=u'MAC адрес пользователя', blank=True)
    ip = models.IPAddressField(blank=True, default='0.0.0.0')

    class Meta:
        db_table = u'visitor'
        verbose_name = u'Посетители'
        verbose_name_plural = u'Посетители'

    def __unicode__(self):
        return unicode(self.first_name)

class Visit(models.Model):
    visitor = models.ForeignKey(Visitor, verbose_name=u'Посетитель')
    point = models.ForeignKey(Point, verbose_name=u'Точка доступа')
    count = models.IntegerField(null=False, verbose_name=u'Количество посещений')

    class Meta:
        db_table = u'visit'
        verbose_name = u'Посещения'
        verbose_name_plural = u'Посещения'

    def __unicode__(self):
        return unicode(self.id)

class Post(models.Model):
    RESOURCE_CHOICES = (
        (u'base', u'base'),
        (u'vk', u'vk'),
        (u'facebook', u'facebook'),
        (u'twitter', u'twitter'),
        (u'instagram', u'instagram'),
    )

    visit = models.ForeignKey(Visit, verbose_name=u'Посещение')
    resource = models.CharField(max_length=50, choices=RESOURCE_CHOICES, null=False, verbose_name=u'Название ресурса')
    link = models.URLField(verbose_name=u'Ссылка', blank=True)
    datetime = models.DateTimeField(auto_now=True, verbose_name=u'Время поста')

    class Meta:
        db_table = u'post'
        verbose_name = u'Посты'
        verbose_name_plural = u'Посты'

    def __unicode__(self):
        return unicode(self.resource)
