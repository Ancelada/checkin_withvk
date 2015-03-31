from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User


class CustomUserAdmin(UserAdmin):
    list_display = UserAdmin.list_display + ('is_customer', 'city', 'telephone')
    list_filter = UserAdmin.list_filter + ('is_customer', 'city', 'telephone')

    fieldsets = UserAdmin.fieldsets
    fieldsets[1][1]['fields'] = ('first_name', 'last_name', 'email', 'is_customer', 'city', 'telephone')

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)