$(document).ready(function() {
    $('#number').mask('+00000000000');
    var phone = document.getElementsByClassName('ph')[0];
    var sectionPhone = document.getElementsByClassName('ph_number')[0];
    var sectionPassword = document.getElementsByClassName('ph_password')[0];
    var id = $('#identity').val();
    phone.addEventListener('click', function() {
        if(this.push) {
            sectionPhone.style.height = '0px';
            sectionPhone.style.marginTop = '0';
            this.push = false;
        }else {
            sectionPhone.style.height = '31px';
            sectionPhone.style.marginTop = '10px';
            this.push = true;
        }
    }, false);
    
    function sendNumber() {
        var input = $('#number');
        var number = $(input).val();
        
        if(number === '') {
            $(input).css('border', '1px solid red');
        }else {
            $(input).css('border', '1px solid #ccc');
            sectionPhone.style.height = '0px';
            sectionPhone.style.marginTop = '0px';
            sectionPassword.style.height = '31px';
            sectionPassword.style.marginTop = '10px';
            $.ajax({
                type: 'POST',
                url: '/wifi/free/sms',
                data: {
                    telephone: number
                },
                success: function(data) {
                }
            });
        }
        
    };
    
    function sendPsw() {
        var pas = $('#password').val();
        var input = $('.ph_password input');
        var csrf = $('#csrf').val();
        if(pas === '') {
            $(input).css('border', '1px solid red');
        }else {
            $(input).css('border', '1px solid #ccc');
            $.ajax({
                type: 'POST',
                url: '/wifi/free/sms_auth',
                data: {
                    key: pas,
                    csrfmiddlewaretoken: csrf
                },
                success: function(data) {
                    if(data.indexOf('http') != -1) {
                        location.href = data+'#dologin=true';
                    }else {
                        alert(data); 
                    }
                },error: function(e) {
                    console.log(e);
                }
            })
        }
    }
    
    $('.send').on('click', sendNumber);
    $('.ph_password .login').on('click', sendPsw);
    
});

function getCookie(name)
{
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
 
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
 
$.ajaxSetup({ 
     beforeSend: function(xhr, settings) {
         if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
             // Only send the token to relative URLs i.e. locally.
             xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
         }
     } 
});