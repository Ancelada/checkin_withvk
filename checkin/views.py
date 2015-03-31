from django.shortcuts import redirect
from django.core.urlresolvers import reverse

def index(request):
    if not request.user.is_authenticated():
        return redirect(reverse('accounts:login'))
    else:
        return redirect(reverse('personal:statistic'))