window.fbAsyncInit = function() {
    FB.init({
        appId      : '342720552593135',
        cookie     : true,  // enable cookies to allow the server to access 
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.1' // use version 2.1
    });
};

(function(d, s, id) {
var js, fjs = d.getElementsByTagName(s)[0];
if (d.getElementById(id)) return;
js = d.createElement(s); js.id = id;
js.src = "//connect.facebook.net/en_US/all.js";
fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

window.onload = function() {
    
    var dataInput = JSON.parse($('#data').val());
    var textPostFb;
    var imgPost;
    var find = false;
        
    if(dataInput.length) {
        for(var i = 0; i < dataInput.length; i++) {
            if(dataInput[i].fields.resource === 'facebook') {
                textPostFb = dataInput[i].fields.title;
                imgPost = dataInput[i].fields.banner;
                find = true;
            }
        }
        if(!find) {
            for(var i = 0; i < dataInput.length; i++) {
                if(dataInput[i].fields.resource === 'base') {
                    textPostFb = dataInput[i].fields.title;
                    imgPost = dataInput[i].fields.banner;
                    find = true;
                }
            }
        }
    }
    
    if(window.location.search.indexOf('?fbtoken') != '-1') {
        var token = window.location.hash.split('&')[0].slice(14, window.location.hash.split('&')[0].length);
        var userId;
        var user = {};

        FB.api('me', {
            'access_token': token
        }, function(data) {
            id = data.id;
            var gender;

            if(data.gender === 'male') {
                gender = 'male'
            }else {
                gender = 'female'
            }
            var filed1, field2;
            filed1 = gender;
            if(!data.gender) {
                filed1 = '-';
            }
            field2 = data.email;
            if(!data.email) {
                field2 = '-';
            }
            user = {
                id: data.id,
                email: filed2,
                first_name: data.first_name,
                last_name: data.last_name,
                gender: filed1,
                link: data.link,
                birthday: '-',
                telephone: '-',
                resource: 'facebook'
            }

            $.ajax({
                type: 'POST',
                url: '/wifi/free/fbpost',
                data: {
                    'id': id,
                    'access_token': token,
                    text: textPostFb,
                    id: imgPost,
                    link: $('#link').val()
                },
                success: function(data) {
                    $.ajax({
                        type: 'POST',
                        url: '/wifi/free/create',
                        data: user,
                    });
                    $.ajax({
                        type: 'GET',
                        url: '/wifi/free/dst',
                        success: function(data) {
                            location.href = data+'#dologin=true';
                        }
                    });
                }
            });
        });
    }
}


function loginFB() {
    window.location.href="https://www.facebook.com/dialog/oauth?client_id=342720552593135&redirect_uri=http://wifi2work.ru/wifi/free/?fbtoken&response_type=token&scope=email,publish_actions&granted_scopes"
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