$(document).ready(function() {
    var $point = $('.points');
    var $user = $('#user').val();
    var $tabs = $('.social_tabs li');
    var $chageBanner = $('#changeBanner');
    var $newBanner = $('#upload_photo');
    var $formNewBanner = $('#upload_form');
    var $navType = $('.select_type li');
    var $editBlock = $('.edit');
    var $mainSettings = $($editBlock).find('.main');
    var $socialSettings = $($editBlock).find('.social');
    var user = $('#user').val();
    var $address = $('#address');
    var $link = $('#link');
    var id;
    var $variatyBanner = $('.variaty_banner');
    var $modalWindow = $('#changeBanner');
    var $mainBanner = $('#main_banner--img');
    var files;
    var type;
    var $title = $('.title_input input');
    var $saveChangeBanner = $('#save_change_banner');
    var $saveSecondBlock = $('.main_block--second button');
    var $saveFirstBlock = $('.main_block--first_button');
    var $saveSocial = $('.save_social_settings button');
    var $deleteImg = $('.modal-body');
    var idMainImg;
    window.point = {};

    //Вытаскиваем список точек
    $.ajax({
        type: 'GET',
        url: '/personal/api/v1/point/?format=json&customer__username='+$user,
        dataType: 'json',
        success: function(data) {
            var pointUl = $('.points tbody');
            var li, a, button, s, linkl, img;
            for(var i = 0; i < data.objects.length; i++) {
                var n = data.objects[i];
                window.point[data.objects[i].gis.id] = data.objects[i];

                $.ajax({
                    type: 'GET',
                    url: '/personal/api/v1/advertisement/?format=json&point__identity='+n.identity+'&resource=base',
                    dataType: 'json',
                    success: function(data) {
                        for(var key in window.point) {
                            if(window.point[key].gis.id == data.objects[0].point.gis.id) {
                                n = window.point[key];
                            }
                        }
                        a = $('<td><em id="point_name">'+n.identity+'</em></td>');
                        s = $('<td><em id="point_address">' + n.gis.region + ', ' + n.gis.city + ', ' + n.gis.district + ', ' + n.gis.place_name +'</em></td>');
                        img = $('<td id="img_banner"><img src="' + data.objects[0].banner.banner + '"></td>');
                        idMainImg = data.objects[0].banner.id;
                        li = $('<tr></tr>');
                        button = $('<td><button class="btn btn-primary">Редактировать</button></td>');
                        $(li).append(a);
                        $(li).append(s);
                        $(li).append(img);
                        $(li).append(button);
                        $(pointUl).append(li);
                    }
                });
            }

        }
    });

    //клик по кнопке редактировать
    $($point).on('click', 'button', function() {
        id = $(this).parent().parent().find('#point_name').text();
        var requests = [];
        var address;

        $('.edit').hide();

        $($navType).each(function() {
            if($(this).hasClass('active')) {
                type = $(this).find('a').text();
            }
        });

        if(type === 'Точки') {
            //заполняем поля основной информации по точке
            requests.push(
                $.ajax({
                    type: 'GET',
                    url: '/personal/api/v1/point/?format=json&point__customer__username='+ user +'&identity='+id,
                    dataType: 'json',
                    success: function(data) {

                        var gis = data.objects[0].gis;
                        address = gis.region+', '+gis.city+', '+gis.district+', '+gis.place_name
                        var link = data.objects[0].link;

                        $($address).val(address);
                        $($link).val(link);
                    }
                })
            );
            //основная картинка на стартовой странице
            requests.push(
                $.ajax({
                    type: 'GET',
                    url: '/personal/api/v1/advertisement/?format=json&point__identity='+id+'&resource=base',
                    dataType: 'json',
                    success: function(data) {
                        var img,str;
                        $($mainBanner).empty();
                        if(data.objects.length) {
                            $($title).val(data.objects[0]['title']);
                            img = $('<img data-img-id="'+data.objects[0].banner.id+'" src="'+data.objects[0].banner.banner+'">');
                            $(img).attr('data-img-id', data.objects[0].banner.id);
                            $($mainBanner).append(img);
                            $($variatyBanner).removeClass('disabled');
                        }else {
                            str = "Баннер отсутствует"
                            $($mainBanner).append(str);
                            $($variatyBanner).addClass('disabled');
                        }
                    }
                })
            );

            //отображаем после получения данных
            $.when.apply(null, requests).done(function() {
                $($editBlock).show();
                $($socialSettings).hide();
                $($mainSettings).show();
            });
        }else if(type === 'Реклама'){
            var $tabsSocial = $('.social_tabs li.active');
            var resource = $($tabsSocial).find('a').text();

            if(resource === 'Вконтакте') {
                resource = 'vk';
            }else {
                resource = resource.toLowerCase();
            }

            $($mainSettings).hide();

            $.ajax({
                type: 'GET',
                url: '/personal/api/v1/advertisement/?format=json&point__identity='+id+'&resource='+resource,
                dataType: 'json',
                success: function(data) {
                    if(!data.objects.length) {
                        $.ajax({
                            type: 'GET',
                            url: '/personal/api/v1/advertisement/?format=json&point__identity='+id+'&resource=base',
                            dataType: 'json',
                            success: function(data) {
                                var titlePost = data.objects[0].title;
                                var inputSocial = $('.social_fields_text--input input');
                                var imgBanner = $('<img data-img-id="'+data.objects[0].banner.id+'" src="'+data.objects[0].banner.banner+'">');
                                var imgPost = $('#social_post_banner');
                                $(imgPost).empty().append(imgBanner);
                                $(inputSocial).val(titlePost);
                                //
                                $($editBlock).show();
                                $($socialSettings).show();
                            }
                        });
                    }else {
                        var titlePost = data.objects[0].title;
                        var inputSocial = $('.social_fields_text--input input');
                        var imgBanner = $('<img data-img-id="'+data.objects[0].banner.id+'" src="'+data.objects[0].banner.banner+'">');
                        var imgPost = $('#social_post_banner');
                        $(imgPost).empty().append(imgBanner);
                        $(inputSocial).val(titlePost);
                        //
                        $($editBlock).show();
                        $($socialSettings).show();
                    }
                }
            });
        }

    });

    //клик по кнопке выбрать баннер для точки
    $($variatyBanner).on('click', function() {
        var li, img, close;
        var self = this;
        $.ajax({
            type: 'GET',
            url: '/personal/api/v1/banner/?format=json&point__identity='+id,
            dataType: 'json',
            success: function(data) {
                $($modalWindow).find('.modal-body ul').empty();
                //выдергиваем все баннеры от данной точки
                for(var i = 0; i < data.objects.length; i++) {
                    li = $('<li></li>');
                    close = $('<div class="close">&#xd7;</div>');
                    img = $('<img src="'+data.objects[i].banner+'">');
                    $(img).attr('data-img-id', data.objects[i].id);
                    $(li).append(img);
                    if(data.objects[i].id != idMainImg) {
                        $(li).append(close);
                    }
                    $($modalWindow).find('.modal-body ul').append(li);
                }
                $('#changeBanner').modal('show');
            }
        })
    });
    var q;
    //выбор баннер в модальном окне для поста
    $($saveChangeBanner).on('click', function(e) {
        e.preventDefault();
        var img = $($chageBanner).find('img');
        var imgSrc;
        var imgId;

        $(img).each(function() {
            if($(this).hasClass('selected')) {
                imgSrc = $(this).attr('src');
                q = imgSrc;
                imgId = $(this).attr('data-img-id');
            }
        });

        if(type === 'Точки') {
            $($mainBanner).find('img').attr('src', imgSrc);
            $($mainBanner).find('img').attr('data-img-id', imgId);
        }else if(type === 'Реклама'){
            $('#social_post_banner').find('img').attr('src', imgSrc);
            $('#social_post_banner').find('img').attr('data-img-id', imgId);
        }

        $(img).removeClass('selected');

        $('#changeBanner').modal('hide');

    });

    //сохраняем выбраный баннер и заголовок
    $($saveSecondBlock).on('click', function() {
        var requests = [];

        requests.push(
            $.ajax({
                type: 'POST',
                url: '/personal/advertisements',
                data: {
                    identity: id,
                    resource: 'base',
                    title: $($title).val(),
                    id: $($mainBanner).find('img').attr('data-img-id')
                },
                dataType: 'json'
            })
        );

        requests.push(
            $.ajax({
                type: 'POST',
                url: '/personal/upload_to_vk',
                dataType: 'json',
                data: {
                    id: $($mainBanner).find('img').attr('data-img-id')
                }
            })
        );

        $.when(requests).then(function() {
            $('.succes_window').css('left', 10);
                setTimeout(function() {
                    $('.succes_window').css('left', -500);
                },1500);
            });
            if(!q) {
                $($mainBanner).find('img').attr('data-img-id')
            }else {
                $('#img_banner').html('<img src="'+q+'">');
            }
    });

    //сохранение первого блока главной информации
    $($saveFirstBlock).on('click', function() {
        var $addressFirstBlock = $('.edit_address');
        var input = $($addressFirstBlock).find('input');
        var b = $($addressFirstBlock).find('b');
        var arr = $(input).val().split(',');
        var p = {};

        //проверяем все ли поля введены в инпут
        if(arr.length < 4) {
            $(b).css({
                textShadow: '0px 0px 5px red',
                color: 'red'
            });
            setTimeout(function() {
               $(b).css({
                    textShadow: '0px 0px 0px transparent',
                    color: 'black'
                });
            }, 300);
        }else if($($link).val() === '' && (/^(ftp|http|https):\/\/[^ "]+$/.test($($link).val()) == false)){
            $($link).css('border-color', 'rgb(255, 0, 0)')
            setTimeout(function() {
                $($link).css('border-color', 'rgb(123, 181, 227)')
            },150);
        }else {
            p = {
                identity: id,
                region: arr[0],
                city: arr[1],
                district: arr[2],
                place_name: arr[3],
                link: $($link).val()
            }
            $.ajax({
                type: 'POST',
                url: '/personal/edit_point',
                data: p,
                dataType: 'json',
                success: function(data) {
                    if(data.status === 'success') {
                        success();
                        $('#point_address').text($(input).val());
                    }
                }
            });
        }


    });

    //сохранение постов для соц сетей
    $($saveSocial).on('click', function() {
        var typeSocial = $('.social_tabs li.active a').text();
        var textPost = $('.social_fields_text--input input').val();
        var idImgPost = $('#social_post_banner img').attr('data-img-id');
        var requests = [];

        if(typeSocial === 'Вконтакте') {
            typeSocial = 'vk';
        }else {
            typeSocial = typeSocial.toLowerCase();
        }

        if(typeSocial === 'vk') {

            requests.push(
                $.ajax({
                    type: 'POST',
                    url: '/personal/upload_to_vk',
                    dataType: 'json',
                    data: {
                        id: idImgPost
                    }
                })
            );

            requests.push(
                $.ajax({
                    type: 'POST',
                    url: '/personal/advertisements',
                    data: {
                        identity: id,
                        resource: typeSocial,
                        title: textPost,
                        id: idImgPost
                    },
                    dataType: 'json'
                })
            );

            $.when(requests).then(function(data) {
                success();
            });

        }else {
            $.ajax({
                type: 'POST',
                url: '/personal/advertisements',
                data: {
                    identity: id,
                    resource: typeSocial,
                    title: textPost,
                    id: idImgPost
                },
                dataType: 'json',
                success: function(data) {
                    if(data.status === 'success') {
                        success();
                    }
                }
            });
        }

    });

    //клик по выбору баннера
    $($chageBanner).find('.modal-body').on('click', 'img', function() {
        $($chageBanner).find('img').removeClass('selected');
        $(this).addClass('selected');
    });

    //Клик по табам на соц сетях
    $($tabs).on('click', function() {
        var type = $(this).find('a').text();
        var blockImg = $('.social_fileds_banner');
        var blockText = $('.social_fields_text--text');
        $($tabs).removeClass('active');
        $(this).addClass('active');

        var $tabsSocial = $('.social_tabs li.active');
        var resource = $($tabsSocial).find('a').text();

        if(resource === 'Вконтакте') {
            resource = 'vk';
        }else {
            resource = resource.toLowerCase();
        }

        if(resource === 'instagram') {
            $(blockImg).hide();
            $(blockText).text('Ссылка на старницу в "Instagram"');
            $('.instagram_example').show();
        }else {
            $(blockImg).show();
            $(blockText).text('Текст для поста');
            $('.instagram_example').hide();
        }

        $($mainSettings).hide();

        $.ajax({
            type: 'GET',
            url: '/personal/api/v1/advertisement/?format=json&point__identity='+id+'&resource='+resource,
            dataType: 'json',
            success: function(data) {
                if(!data.objects.length) {
                    $.ajax({
                        type: 'GET',
                        url: '/personal/api/v1/advertisement/?format=json&point__identity='+id+'&resource=base',
                        dataType: 'json',
                        success: function(data) {
                            var titlePost = data.objects[0].title;
                            var inputSocial = $('.social_fields_text--input input');
                            var imgBanner = $('<img data-img-id="'+data.objects[0].banner.id+'" src="'+data.objects[0].banner.banner+'">');
                            var imgPost = $('#social_post_banner');
                            $(imgPost).empty().append(imgBanner);
                            $(inputSocial).val(titlePost);
                            //
                            $($editBlock).show();
                            $($socialSettings).show();
                        }
                    });
                }else {
                    var titlePost = data.objects[0].title;
                    var inputSocial = $('.social_fields_text--input input');
                    var imgBanner = $('<img data-img-id="'+data.objects[0].banner.id+'" src="'+data.objects[0].banner.banner+'">');
                    var imgPost = $('#social_post_banner');
                    $(imgPost).empty().append(imgBanner);
                    $(inputSocial).val(titlePost);
                    //
                    $($editBlock).show();
                    $($socialSettings).show();
                }
            }
        });

    });


    //навигация
    $($navType).on('click', function() {
        var type;

        $($navType).removeClass('active');
        $(this).addClass('active');

        $($navType).each(function() {
            if($(this).hasClass('active')) {
                type = $(this).find('a').text();
            }
        });

        if(type === 'Загрузить баннер') {
            $('.points').hide();
            $($editBlock).hide();
            $($socialSettings).hide();
            $($mainSettings).hide();
            $('.load_banner').show();
        }else {
            $('.points').show();
            $('.load_banner').hide();
            $($editBlock).hide();
            $($socialSettings).hide();
            $($mainSettings).hide();
        }
    });

    $('.load_banner').on('click', 'li', function() {
        $('#form_load_banner input[name="identity"]').val($(this).children('a').text());
        $('#form_load_banner').show();
    });


    if($('#messages')) {
//        $('#messages').css({left: 10});
//        setTimeout(function() {
//            $('#messages').css({left: -500})
//        },1500);
    }

    function success() {
        $('.succes_window').css('left', 10);
        setTimeout(function() {
            $('.succes_window').css('left', -500);
        },1500);
    }

    function delImg() {
        var img = $(this).parent().children('img');
        var idImg = $(img).attr('data-img-id');
        var li = $(this).parent();
        $(img).css('opacity', 0.3);

        $.ajax({
            type: 'POST',
            url: '/personal/delete_banner',
            dataType: 'json',
            data: {
                id: idImg
            },
            success: function(data) {
                $(li).remove();
            }
        });
    }

    $($deleteImg).on('click', 'li .close', delImg);

     if($("#messages .alert-error").length) {
     var t = $('#messages').find('p').get(0);
         var text = $(t).text();
         if(text.indexOf('fail') != -1) {
             $(t).text(text.slice(5, text.length));
             $(t).parent().parent().css('background', '#eb0000');
         }
        setTimeout(function() {
            $('#messages').css('top', -200);
        },3000);
    }

    if($('#messages .alert-success').length) {
        $('#messages').hide();
        success();
    }

    //превью загруженной картинки

    $('#upload_new_file').change(function(){
        var oFReader = new FileReader();
        oFReader.readAsDataURL(this.files[0]);
        oFReader.onload = function (oFREvent) {
            $('#preview_img').html('<img src="'+oFREvent.target.result+'">');
        };
    });

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
