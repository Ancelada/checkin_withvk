$(document).ready(function() {
    if($('#message_user').length) {
        var textarea = CKEDITOR.replace('message_user', {
            filebrowserBrowseUrl: '/personal/browse_banners',
            filebrowserUploadUrl: '/personal/add_image'
        });
    }
    var $tr = $('.users');
    var $checkbox = $('.users .checkbox-inline input');
    var $sendMessage = $('.send_message');
    var $changeType = $('.change_textarea li');
    var type = 'email';
    var count = 0;
    var haveEmail = false;
    var haveSms = false;

    CKEDITOR.on( 'dialogDefinition', function( ev )
       {
          // Take the dialog name and its definition from the event
          // data.
          var dialogName = ev.data.name;
          var dialogDefinition = ev.data.definition;

          // Check if the definition is from the dialog we're
          // interested on (the Link and Image dialog).
          if ( dialogName == 'link' || dialogName == 'image' )
          {
             // remove Upload tab
             dialogDefinition.removeContents( 'Upload' );
          }
       });

    function selectUsers() {
       if($(this).data('check') === true) {
           $(this).removeClass('success');
           $(this).data('check', false);
           count = 0;
       }else {
            if(type == 'sms') {
                if(count != 1) {
                    $(this).addClass('success');
                    $(this).data('check', true);
                }
                count = 1;
            }else if(count == 0){
               $(this).addClass('success');
               $(this).data('check', true);
               count = 0;
            }
       }
    }

    function sendMessage() {
        var text = textarea.getData();
        var trs = $('.users tbody tr');
        var title = $('#title_message').val();
        var users = [];

        $(trs).each(function() {
            if($(this).hasClass('success')) {
                users.push($(this).attr('data-id'));
            }
        });

        if(type == 'sms') {
            text = $('#message_user_sms').val();
        }

        if(users.length) {
            if(text === '') {
                alert('Введите текст для отправки');
            }else {
                if(type == 'sms') {
                    $('.send_message').attr('disabled', 'disabled');
                    setTimeout(function() {
                        $('.send_message').removeAttr('disabled');
                    },3000);
                }else {
                    $('.send_message').attr('disabled', 'disabled');
                }
                $.ajax({
                    url: '/personal/send_message',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        text: text,
                        title: title,
                        type: type,
                        users: users,
                    },
                    success: function(data) {

                        if(data.status === 'fail') {
                            var f = $('.fail');
                            $(f).css('background', '#ff0000');
                            $(f).text(data.error);
                            $(f).show();
                            setTimeout(function() {
                                $(f).hide();
                            }, 5000);
                        }else if(data.status === 'success') {
                            var f = $('.fail');
                            $(f).text('Сообщение отправлено');
                            $(f).css('background', '#4cae4c');
                            $(f).show();
                            setTimeout(function() {

                                $(f).hide();
                                $('.send_message').removeAttr('disabled');
                                $('.mail_textarea input').val('');
                                $('.sms_textarea textarea').val('');
                                textarea.setData('');


                            }, 5000);
                        }

                    }
                });

            }
        }else {
            alert('Выберите пользователей для отправки');
        }

    }

    function changeTypeForMessage() {
        var t = $(this).text();
        var smsT = $('.sms_textarea');
        var emailT = $('.mail_textarea');

        $('.change_textarea li.active').removeClass('active');
        $(this).addClass('active');

        type = t.toLowerCase();

        if(type === 'sms') {
            $(smsT).show();
            $(emailT).hide();
            $('.check_users_all').hide();
            if(haveSms) {
                $('.sms_textarea').show();
                $('.users').show();
                $('.send').show();
            } else {
                $('.sms_textarea').hide();
                $('.users').hide();
                $('.send').hide();
            }
        }else {
          $(emailT).show();
          $(smsT).hide();
          $('.check_users_all').show();
          if(haveEmail === true) {
            $('.mail_textarea').show();
            $('.users').show();
            $('.send').show();
          } else {
            $('.mail_textarea').hide();
            $('.users').hide();
            $('.send').hide();
          }
        }

    }

    $($tr).on('click', 'tbody tr', selectUsers);
    $($sendMessage).on('click', sendMessage);
    $($changeType).on('click', changeTypeForMessage);

    $($checkbox).change(function() {
        if($(this).prop('checked') !== true) {
           $($tr).find('tbody tr').removeClass('success');
        }else {
           $($tr).find('tbody tr').addClass('success');
           $($tr).find('tbody tr').data('check', true);
        }
    });

    $.ajax({
        type: 'GET',
        url: '/personal/api/v1/visit/?format=json&point__customer='+$('#user_id').val(),
        dataType: 'json',
        success: function(data) {
            var points = [];
            var requests = [];

            for(var i = 0; i < data.objects.length; i++) {
                points.push(data.objects[i].id);
            }

            if(points.length == 0) {
                $('.mail_textarea').hide();
                $('.sms_textarea').hide();
                $('.send').hide();
                $('.change_textarea').hide();
                $('.users').hide();
                $('.change_textarea').hide();
                $('.features').text('На данный момент у вас не было пользователей которые оставили свои контактные данные.');
            }
            var nRequests = [];
            var wR = [];
            for(var i = 0; i < points.length; i++) {
                wR.push($.ajax({
                    type: 'GET',
                    url: '/personal/api/v1/visitor/?format=json&id='+points[i],
                    dataType: 'json',
                    success: function(data) {
                        var name, age, gender, mail, phone, resource, tr;
                        var oData = data.objects;

                        if(data.objects.length) {
                            nRequests.push(
                                $.ajax({
                                    type: 'GET',
                                    url: '/personal/api/v1/visit/?format=json&visitor='+data.objects[0].id,
                                    dataType: 'json',
                                    success: function(data) {
                                      if(data.objects.length) {
                                        var idTable = data.objects[0].point.identity;
                                        var tabDom = $('#'+idTable);

                                        for(var i = 0; i < oData.length; i++) {

                                            if(oData[i].email != 'default@default.ru' && oData[i].email != '-') {
                                                haveEmail = true;
                                            }
                                            if(oData[i].telephone != '-') {
                                                haveSms = true;
                                            }
                                            if(oData[i].email != 'default@default.ru' && oData[i].email != '-' || oData[i].telephone != '-') {
                                                var p = oData[i];
                                                var g = p.gender;
                                                var e = p.email;
                                                tr = $('<tr></tr>').attr('data-id',p.id);
                                                name = $('<td>'+p.first_name+ ' '+ p.last_name +'</td>');
                                                age = $('<td>'+p.birthday+'</td>');
                                                gender = $('<td>'+g+'</td>');
                                                mail = $('<td>'+e+'</td>');
                                                phone = $('<td>'+p.telephone+'</td>');
                                                $(tr)
                                                .append(name)
                                                .append(age)
                                                .append(gender)
                                                .append(mail)
                                                .append(phone);
                                                if(!tabDom.length) {
                                                    tabDom = document.getElementById('clone').cloneNode(true);
                                                    $(tabDom).find('thead').prepend('<strong>' + idTable + '</strong>');
                                                    tabDom.id = idTable;
                                                    $('.tables').append(tabDom);
                                                    $(tabDom).append(tr);
                                                }else {
                                                    $(tabDom).append(tr);
                                                }
                                            }
                                        }
                                      }
                                    }
                                }));
                        }
                    }
                }));
            }

            $.when.apply(null, wR).then(function() {
                $.when.apply(null, nRequests).then(function() {
                    if(!haveEmail) {
                        $('.mail_textarea').hide();
                        $('.users').hide();
                        $('.send').hide();
                    }else {
                        $('.mail_textarea').show();
                        $('.users').show();
                        $('.send').show();
                    }


                    if(!haveSms && !haveEmail) {
                        $('.change_textarea').hide();
                        $('.features').text('На данный момент у вас не было пользователей которые оставили свои контактные данные.');
                    }
                });
            });

        }
    });

window.HandlePopupResult = function(result) {
    $('#cke_72_textInput').val(result);
}

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
