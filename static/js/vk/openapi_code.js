window.vkAsyncInit = function() {
    VK.init({
        apiId: 4775646,
        nameTransportPath: 'xd_receiver.html'
    });
};
(function() {
    var el = document.createElement('script');
    el.type = 'text/javascript';
    el.src = 'http://vkontakte.ru/js/api/openapi.js';
    el.charset="windows-1251";
    el.async = true;
    document.getElementById('vk_api_transport').appendChild(el);
}());

var textPost;
var imgPost;
var imgVk;
var link = $('#link').val();

$(document).ready(function() {
    var dataInput = JSON.parse($('#data').val());
    var find = false;

    if(dataInput.length) {
        for(var i = 0; i < dataInput.length; i++) {
            if(dataInput[i].fields.resource === 'vk') {
                textPost = dataInput[i].fields.title;
                imgPost = dataInput[i].fields.banner;
                find = true;
                $.ajax({
                    type: 'GET',
                    url: '/personal/api/v1/in_vk/?format=json&banner='+imgPost,
                    dataType: 'json',
                    success: function(data) {
                        console.log(data);
                        imgVk = data.objects[0].photo_name;
                    }
                })
            }
        }
        if(!find) {
            for(var i = 0; i < dataInput.length; i++) {
                if(dataInput[i].fields.resource === 'base') {
                    textPost = dataInput[i].fields.title;
                    imgPost = dataInput[i].fields.banner;
                    find = true;
                    $.ajax({
                        type: 'GET',
                        url: '/personal/api/v1/in_vk/?format=json&banner='+imgPost,
                        dataType: 'json',
                        success: function(data) {
                            imgVk = data.objects[0].photo_name;
                        }
                    })
                }
            }
        }
    }
});

$(document).ready(function() {
    var VRegExp = new RegExp(/AppleWebKit\/[0-9\.]*\([A-Za-z\,\ ]*\)\ Mobile.*/);
    var VResult = VRegExp.exec(navigator.userAgent);
    var divs = $('body div,section');
    var standalone = window.navigator.standalone,
    userAgent = window.navigator.userAgent.toLowerCase(),
    safari = /safari/.test( userAgent ),
    ios = /iphone/.test( userAgent );

    if(ios) {
        if (!safari) {
            $(divs).hide();
            $('.sorry').show();
        }
    }
});

function doLogin(callback) {
    VK.Auth.login(
        callback,
        VK.access.FRIENDS | VK.access.WIKI | VK.access.PHOTOS
    );
}

// авторизуемся
function loginOpenAPI(){
    doLogin(doPublic);
    return false;
}

function doPublic(data) {
    if(data.session) {
        id = data.session.mid;
        VK.api('users.get', {
            user_ids: id,
            fields: 'sex,bdate,contacts,interests'
        }, function(data) {
            var user;
            var sex;
            var field1, field2, filed3;
            if(data.response[0].sex === 1) {
                sex = 'female';
            }else {
                sex = 'male';
            }
            var data = data.response[0];
            field1 = data.bdate;
            field2 = data.mobile_phone;
            if(!sex) {
                sex = '-';
            }
            if(!field1) {
                field1 = '-';
            }
            if(!field2) {
                field2 = '-';
            }
            user = {
                email: 'default@default.ru',
                first_name: data.first_name,
                last_name: data.last_name,
                gender: sex,
                link: 'https://vk.com/id'+data.uid,
                birthday: field1,
                telephone: field2,
                resource: 'vk',
            }
            $.ajax({
                type: 'POST',
                url: '/wifi/free/create',
                data: user,
            });
            $.ajax({
                type: 'GET',
                url: '/wifi/free/dst',
                success: function(data) {
                    window.location.href = data+'#dologin=true';
                }
            });
        });
    }
}

function error() {
    $(".error").css('opacity', 1);
    setTimeout(function() {
        $(".error").css('opacity', 0);
    },2000);
}

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
