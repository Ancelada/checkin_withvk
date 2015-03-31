# -*- coding: utf-8 -*-
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from tastypie.models import create_api_key

User.add_to_class('is_customer', models.BooleanField(default=False, verbose_name=u'Вы заказчик?'))
User.add_to_class('telephone', models.CharField(default='-', blank=True, max_length=20, verbose_name=u'Телефон заказчика'))
User.add_to_class('city', models.CharField(default='-', blank=True, max_length=50, verbose_name=u'Город'))

@receiver(post_save, sender=User)
def create_user_api_key(sender, **kwargs):
    user = kwargs.get('instance')
    if user.is_customer or user.is_superuser:
        if kwargs.get('created') or kwargs.get('update_fields'):
            create_api_key(User, **kwargs)