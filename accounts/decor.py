from django.core.urlresolvers import reverse
from django.shortcuts import redirect

def is_anonymous(f):
    def wrapper(request, **kwargs):
        if request.user.is_anonymous():
            return f(request, **kwargs)
        else:
            return redirect(reverse('personal:statistic'))
    return wrapper
