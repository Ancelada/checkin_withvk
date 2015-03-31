from django.contrib import messages
from django.contrib.auth import authenticate, login, logout as logout_user
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response, redirect
from django.template import RequestContext
from django.utils.translation import ugettext as _
from django.views.decorators.http import require_GET
from accounts.decor import is_anonymous


@is_anonymous
def sign_in(request):
    if request.POST:
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return redirect(reverse('index'))
            else:
                messages.error(request, _('Your account is disabled.  Make sure you have activated your account.'))
        else:
            messages.error(request, _('Invalid username/password'))
    return render_to_response('accounts/login.html', context_instance=RequestContext(request))

@require_GET
@login_required
def logout(request):
    logout_user(request)
    return redirect(reverse('index'))