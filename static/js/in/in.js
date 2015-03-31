var url = window.location.href;
var button = document.getElementsByClassName('in')[0];
var code;
var params;
var match = 'access_token';
var str;
var access_token;
var xhr;
var userInName;
var imgPost;
var imgIdIn;

$(document).ready(function() {
    var dataInput = JSON.parse($('#data').val());
    var find = false;
    var instId;
    
    if(dataInput.length) {
        for(var i = 0; i < dataInput.length; i++) {
            if(dataInput[i].fields.resource === 'instagram') {
                userInName = dataInput[i].fields.title;
                userInName = userInName.slice(21, userInName.length-1);
                imgPost = dataInput[i].fields.banner;
                find = true;
            }
        }
    }
    if(access_token) {
        $.ajax({
            type: 'GET',
            url: 'https://api.instagram.com/v1/users/search?q='+userInName+'&count=1&access_token='+access_token,
            dataType: 'jsonp',
            success: function(data) {
                instId = data.data[0].id;
                $.ajax({
                    type: 'GET',
                    url: 'https://api.instagram.com/v1/users/'+instId+'/media/recent/?count=1&access_token='+access_token,
                    dataType: 'jsonp',
                    success: function(data) {
                        imgIdIn = data.data[0].id;
                        $.ajax({
                            type: 'POST',
                            url: 'https://api.instagram.com/v1/media/'+imgIdIn+'/likes',
                            dataType: 'jsonp',
                            data: {
                                access_token: access_token
                            }
                        })
                    }
                });
                 $.ajax({
                    type: 'GET',
                    url: 'https://api.instagram.com/v1/users/self/?access_token='+access_token,
                    dataType: 'jsonp',
                    success: function(data) {
                        var data = data.data;
                        var user;

                        user = {
                            id: data.id,
                            email: '-',
                            first_name: data.full_name,
                            last_name: '-',
                            gender: '-',
                            link: 'http://instagram.com/'+data.username+'/',
                            birthday: '-',
                            telephone: '-',
                            resource: 'instagram',
                            csrfmiddlewaretoken: $('#csrf').val()
                        };

                        $.ajax({
                            type: 'POST',
                            url: '/wifi/free/create',
                            data: user
                        });
                    }
                });
                $.ajax({
                    type: 'POST',
                    url: 'https://api.instagram.com/v1/users/'+instId+'/relationship',
                    dataType: 'json',
                    crossDomain: true,
                    data: {
                        action: 'follow',
                        access_token: access_token,
                    },
                    success: function(data) {
                        $.ajax({
                            type: 'POST',
                            url: 'https://api.instagram.com/v1/users/'+instId+'/relationship/?access_token='+access_token,
                            dataType: 'jsonp',
                            crossDomain: true,
                            success: function(data) {
                                if(data.data.outgoing_status === 'follows') {
                                    $.ajax({
                                        type: 'GET',
                                        url: '/wifi/free/dst',
                                        success: function(data) {
                                            location.href = data+'#dologin=true';
                                        }
                                    });
                                }
                            }
                        });
                    },
                    error: function(e) {
                        $.ajax({
                            type: 'POST',
                            url: 'https://api.instagram.com/v1/users/'+instId+'/relationship/?access_token='+access_token,
                            dataType: 'jsonp',
                            crossDomain: true,
                            success: function(data) {
                                if(data.data.outgoing_status === 'follows') {
                                    $.ajax({
                                        type: 'GET',
                                        url: '/wifi/free/dst',
                                        success: function(data) {
                                            location.href = data+'#dologin=true';
                                        }
                                    });
                                }
                            }
                        });
                    }
                }); 
            }
        });   
    }
});


if(window.location.search.indexOf('?fbtoken') != -1) {
}else{
    if(url.indexOf('#access_token=') != -1) {
        code = window.location.hash.substring(1);
        params = code.split("&");

        for(var i = 0; i < params.length; i++) {
            str = params[i].split('=');
            if(str[0] === match) {
                str[1] = str[1].replace('\/', '');
                access_token = str[1];
            }
        }

    }
}

function getCookie(name) {
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
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        }
    } 
});

button.addEventListener('click', function() {
    
    window.location = 'https://api.instagram.com/oauth/authorize/?client_id=fc4b5a0a51664e55bbd38e5eeaed3cf4&redirect_uri=http://wifi2work.ru/wifi/free/?in&response_type=token&scope=basic+relationships+likes'
    
}, false);
(function() {
  if (window.__twitterIntentHandler) return;
  var intentRegex = /twitter\.com(\:\d{2,4})?\/intent\/(\w+)/,
      windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes',
      width = 550,
      height = 420,
      winHeight = screen.height,
      winWidth = screen.width;
 
  function handleIntent(e) {
    e = e || window.event;
    var target = e.target || e.srcElement,
        m, left, top;
 
    while (target && target.nodeName.toLowerCase() !== 'a') {
      target = target.parentNode;
    }
 
    if (target && target.nodeName.toLowerCase() === 'a' && target.href) {
      m = target.href.match(intentRegex);
      if (m) {
        left = Math.round((winWidth / 2) - (width / 2));
        top = 0;
 
        if (winHeight > height) {
          top = Math.round((winHeight / 2) - (height / 2));
        }
 
        window.open(target.href, 'intent', windowOptions + ',width=' + width +
                                           ',height=' + height + ',left=' + left + ',top=' + top);
        e.returnValue = false;
        e.preventDefault && e.preventDefault();
      }
    }
  }
 
  if (document.addEventListener) {
    document.addEventListener('click', handleIntent, false);
  } else if (document.attachEvent) {
    document.attachEvent('onclick', handleIntent);
  }
  window.__twitterIntentHandler = true;
}());