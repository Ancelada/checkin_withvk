$(document).ready(function(){

    $('.select_time').on('click', selectTime);
    var points = [];
    var metriks = [];

    $('.datepicker').datetimepicker({
        icons: {
            format: 'dd/MM/YYYY'
        }
    });

    getCountSocial(null, null);

    function selectTime() {
        var date1 = $('#date1');
        var date2 = $('#date2');
        var parseDate1, parseDate2;

        if($(date1).val() > $(date2).val()) {
            alert('Не верный формат даты');
        }else if($(date1).val() !== '' && $(date2).val() !== '') {
            parseDate1 = $(date1).val().split(' ')[0].split('/');
            parseDate2 = $(date2).val().split(' ')[0].split('/');
            parseDate1 = parseDate1[2] + parseDate1[0] + parseDate1[1];
            parseDate2 = parseDate2[2] + parseDate2[0] + parseDate2[1];
            getYandexMetrika(parseDate1, parseDate2, metriks);
            getCountSocial(parseDate1, parseDate2);
        }

    }

    $.ajax({
        url: '/personal/api/v1/point/?format=json&customer='+$('#user_id').val(),
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            var requests = [];
            for(var i = 0; i < data.objects.length; i++) {
                points.push(data.objects[i].identity);
            }
            for(var i = 0; i < points.length; i++) {
                requests.push(
                    $.ajax({
                        url: '/personal/api/v1/metrika/?format=json&point=' + points[i],
                        type: 'GET',
                        dataType: 'json',
                        success: function(data) {
                            for(var i = 0; i < data.objects.length; i++) {
                                metriks.push(data.objects[i].uid);
                            }
                        }
                    })
                );
            }

            $.when.apply(null, requests).done(function() {
                getYandexMetrika(null, null, metriks);
            });

        }
    });

$('.xml').on('click', function() {
  var users = [];

  $('.wrap_visit tbody tr').each(function() {
    users.push($(this).attr('data-user-id'));
  });

  $.ajax({
    type: 'POST',
    url: '/personal/to_xls',//тут урл для xml
    dataType: 'json',
    data: {
      users: users
    },
    success: function(data) {
      window.open(data);
    }
  })

});

window.visit = {};

  $.ajax({
    type: 'GET',
    url: '/personal/api/v1/visitor/?format=json&point__customer='+$('#user_id').val(),
    dataType: 'json',
    success: function(data) {
      var visitorUser = {};
      var req = [];

      for(var i = 0; i < data.objects.length; i++) {
        visitorUser[data.objects[i].id] = {
          name: '',
          date: '',
          bday: '',
          gender: '',
          email: '',
          vk: '',
          fb: '',
          tw: '',
          inst: '',
          phone: '',
          count: 0
        }

        req.push($.ajax({
            type: 'GET',
            url: '/personal/api/v1/post/?format=json&visit__visitor='+data.objects[i].id,
            dataType: 'json',
            success: function(data) {
              if(data.objects[0]) {
                for(var j = 0; j < data.objects.length; j++) {
                  var d = data.objects[0];
                  var userUid = data.objects[j].visit.visitor.id;

                  if(visitorUser[userUid]['name'] === undefined) {
                    visitorUser[userUid]['name'] = '';
                  }
                  if(visitorUser[userUid]['date'] === undefined) {
                    visitorUser[userUid]['date'] = '';
                  }
                  if(visitorUser[userUid]['bday'] === undefined) {
                    visitorUser[userUid]['bday'] = '';
                  }
                  if(visitorUser[userUid]['gender'] === undefined) {
                    visitorUser[userUid]['gender'] = '';
                  }
                  if(visitorUser[userUid]['email'] === undefined) {
                    visitorUser[userUid]['email'] = '';
                  }
                  if(visitorUser[userUid]['vk'] === undefined) {
                    visitorUser[userUid]['vk'] = '';
                  }
                  if(visitorUser[userUid]['fb'] === undefined) {
                    visitorUser[userUid]['fb'] = '';
                  }
                  if(visitorUser[userUid]['inst'] === undefined) {
                    visitorUser[userUid]['inst'] = '';
                  }
                  if(visitorUser[userUid]['tw'] === undefined) {
                    visitorUser[userUid]['tw'] = '';
                  }
                  if(visitorUser[userUid]['phone'] === undefined) {
                    visitorUser[userUid]['phone'] = '';
                  }
                  if(visitorUser[userUid]['count'] === undefined) {
                    visitorUser[userUid]['count'] = 0;
                  }

                  visitorUser[userUid]['name'] = d.visit.visitor.first_name + ' ' + d.visit.visitor.last_name;
                  visitorUser[userUid]['date'] = d.datetime;
                  visitorUser[userUid]['bday'] = d.visit.visitor.birthday;
                  visitorUser[userUid]['gender'] = d.visit.visitor.gender;
                  visitorUser[userUid]['count'] += d.visit.count;
                  if(d.visit.visitor.email == 'default@default.ru') {
                      visitorUser[userUid]['email'] = '';
                  }
                  visitorUser[userUid]['phone'] = d.visit.visitor.telephone;

                  if(data.objects[j].resource === 'vk') {
                      visitorUser[userUid]['vk'] = data.objects[j].link;
                  }

                  if(data.objects[j].resource === 'facebook') {
                      visitorUser[userUid]['fb'] = data.objects[j].link;
                  }

                  if(data.objects[j].resource === 'twitter') {
                      visitorUser[userUid]['tw'] = data.objects[j].link;
                  }

                  if(data.objects[j].resource === 'instagram') {
                      visitorUser[userUid]['inst'] = data.objects[j].link;
                  }
                }
              }
            }
          }));
      }
      $.when.apply(null, req).then(function() {
        var tbody = $('.wrap_visit tbody');
        var name, time, bday, gender, email, phone, vk, inst, fb, tw, tr, count;
        for(var key in visitorUser) {
          if(visitorUser[key]['name'] !== '') {
            name = $('<td>' +visitorUser[key]['name']+ '</td>')
            time = $('<td>' + visitorUser[key]['date'] + '</td>');
            bday = $('<td> ' + visitorUser[key]['bday'] + ' </td>');
            gender = $('<td> ' + visitorUser[key]['gender'] + ' </td>');
            email = $('<td> ' +  visitorUser[key]['email'] + ' </td>');
            phone = $('<td> ' + visitorUser[key]['phone'] + ' </td>');
            vk = $('<td> <a href="' + visitorUser[key]['vk'] + '">'+visitorUser[key]['vk']+'</a> </td>');
            inst = $('<td> <a href="' + visitorUser[key]['inst'] + '">'+visitorUser[key]['inst']+'</a> </td>');
            fb = $('<td> <a href="' + visitorUser[key]['fb'] + '">'+visitorUser[key]['fb']+'</a> </td>');
            tw = $('<td> <a href="' + visitorUser[key]['tw'] + '">'+visitorUser[key]['tw']+'</a> </td>');
            count = $('<td>'+visitorUser[key]['count']+'</td>');
            tr = $('<tr></tr>');
            $(tr)
            .append(name)
            .append(time)
            .append(bday)
            .append(gender)
            .append(email)
            .append(phone)
            .append(vk)
            .append(fb)
            .append(tw)
            .append(inst)
            .append(count);
            $(tr).attr('data-user-id', key);
            $(tbody).append(tr);
          }
        }
      });
    }
  });
});

function getYandexMetrika(date1, date2, id) {
    if(!date1 && !date2) {
        var d = new Date();
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1;
        var curr_year = d.getFullYear();
        if(curr_date < 10) {
            curr_date = '0' + curr_date + '';
        }
        if(curr_month < 10) {
            curr_month = '0' + curr_month + '';
        }
        var date = (curr_year+''+curr_month+''+curr_date);
        date1 = date;
        date2 = date;
    }
    var own = {
        'oauth_token': '4aa9c3239570465abe25c92a75aab195',
        'format': 'json',
        'title': 'Title',
        'content': 'Content',
        'date1': date1,
        'date2': date2
    };
    var all = [],
        ids = [],
        deffers = [],
        deffersAge = [],
        deffersOs = [],
        deffersDevice = [],
        deffersBrowser = [],
        browser = [],
        browserArr = [],
        browserPie = [],
        browserObj = {},
        gender = [],
        os = [],
        osArr = [],
        osPie = [],
        osObj = {},
        deviceArr = [],
        device = [],
        deviceObj = {
            "Мобильные телефоны и КПК": {
                value: 0,
                label: "Мобильные телефоны и КПК",
                color: "#"+((1<<24)*Math.random()|0).toString(16)
            },
            "Не мобильные устройства": {
                value: 0,
                label: "Не мобильные устройства",
                color: "#"+((1<<24)*Math.random()|0).toString(16)
            }
        },
        objGender = [],
        ageArr = [],
        ageObj = {
            "17": {
                value: 0,
                label: "младше 18 лет",
                color: "#"+((1<<24)*Math.random()|0).toString(16)
            },
            "18": {
                value: 0,
                label: "18-24 лет",
                color: "#"+((1<<24)*Math.random()|0).toString(16)
            },
            "25": {
                value: 0,
                label: "25-34 лет",
                color: "#"+((1<<24)*Math.random()|0).toString(16)
            },
            "35": {
                value: 0,
                label: "35-44 лет",
                color: "#"+((1<<24)*Math.random()|0).toString(16)
            },
            "45": {
                value: 0,
                label: "45 лет и старше",
                color: "#"+((1<<24)*Math.random()|0).toString(16)
            }
        },
        views = 0,
        visitors = 0,
        clicks = 0,
        men = 0,
        girl = 0;
    //random color "#"+((1<<24)*Math.random()|0).toString(16);
    $.ajax({
        dataType: 'jsonp',
        type: 'POST',
        data: own,
        url: 'http://api-metrika.yandex.ru/counters.json',
        success: function(r) {
            all = r['counters'];
            for(var key in all) {
                ids.push(all[key]['id']);
            }
            all = [];
            if(id) {
                ids = id;
            }else {
                return;
            }
            for(var i = 0; i < ids.length; i++) {
                deffers.push(
                    $.ajax({
                        dataType: 'jsonp',
                        type: 'POST',
                        data: own,
                        url: 'http://api-metrika.yandex.ru/stat/traffic/summary.json?id='+ids[i],
                        success: function(r) {
                           all.push(r);
                        },
                        error: function(e) {console.log(e);}
                    })
                );
                deffersAge.push(
                    $.ajax({
                        dataType: 'jsonp',
                        type: 'POST',
                        data: own,
                        url: 'http://api-metrika.yandex.ru/stat/demography/age_gender.json?id='+ids[i],
                        success: function(r) {
                            gender.push(r);
                        }
                    })
                );
                deffersOs.push(
                    $.ajax({
                        dataType: 'jsonp',
                        type: 'POST',
                        data: own,
                        url: 'http://api-metrika.yandex.ru/stat/tech/os.json?per_page=6&table_mode=tree&id='+ids[i],
                        success: function(r) {
                            os.push(r);
                        }
                    })
                );
                deffersDevice.push(
                    $.ajax({
                        dataType: 'jsonp',
                        type: 'POST',
                        data: own,
                        url: 'http://api-metrika.yandex.ru/stat/tech/mobile.json?table_mode=tree&id='+ids[i],
                        success: function(r) {
                            device.push(r);
                        }
                    })
                );
                deffersBrowser.push(
                    $.ajax({
                        dataType: 'jsonp',
                        type: 'POST',
                        data: own,
                        url: 'http://api-metrika.yandex.ru/stat/tech/browsers.json?per_page=6&table_mode=tree&id='+ids[i],
                        success: function(r) {
                            browser.push(r);
                        }
                    })
                );
            }

            //All

            $.when.apply(null, deffers).done(function() {
               for(var key in all) {
                   views += +all[key]['totals']['page_views'];
               }
                $('.views_element_count').html(views);
            });

            //gender and age

            $.when.apply(null, deffersAge).done(function() {
               for(var key in gender) {
                   if(gender[key]['data_gender'].length) {
                       men += +gender[key]['data_gender'][0]['visits_percent'];
                       girl += +gender[key]['data_gender'][1]['visits_percent'];
                   }
                   for(var a in gender[key]['data']) {
                       var y = gender[key]['data'][a];
                       ageObj[y['id']]['value'] += y['visits_percent'];
                   }
               }
                for(var key in ageObj) {
                    ageArr.push(ageObj[key]);
                }
                objGender = [{
                    'label': 'Мужчины',
                    'value': men,
                    'color': "#"+((1<<24)*Math.random()|0).toString(16)
                },
                {
                    'label': 'Женщины',
                    'value': girl,
                    'color': "#"+((1<<24)*Math.random()|0).toString(16)
                }];
                createPie('gender', objGender);
                createPie('age', ageArr);
            });

            //OS

            $.when.apply(null, deffersOs).done(function() {
                for(var key in os) {
                    osArr = os[key]['data'];

                    for(var i = 0;i < osArr.length; i++) {
                        osObj[osArr[i]['name']] = {}
                        if(osObj[osArr[i]['value']] === undefined) {
                            osObj[osArr[i]['value']] = 0;
                        }
                        osObj[osArr[i]['name']] = {
                            label: osArr[i]['name'],
                            value: +osObj[osArr[i]['value']] + +osArr[i]['page_views'],
                            color: "#"+((1<<24)*Math.random()|0).toString(16)
                        }
                    }

                }
                for(var key in osObj) {
                    if(key != undefined) {
                        osPie.push(osObj[key]);
                    }
                }
                createPie('os', osPie);
            });

            //Device

             $.when.apply(null, deffersDevice).done(function() {
                 var j = 0;
                 for(var key in device) {
                     deviceArr = device[key]['data_group'];
                     for(var i = 0; i < deviceArr.length; i++) {
                         deviceObj[deviceArr[i]['name']]['value'] += +deviceArr[i]['page_views'];
                     }
                 }
                 deviceArr = [];
                 for(var key in deviceObj) {
                     deviceArr.push(deviceObj[key]);
                 }
                 createPie('device', deviceArr);
             });

            //Browser

            $.when.apply(null, deffersBrowser).done(function() {
                for(var key in browser) {
                    browserArr = browser[key]['data'];
                    for(var i = 0; i < browserArr.length; i++) {

                        browserObj[browserArr[i]['name']] = {};
                        if(browserObj[browserArr[i]['name']]['value'] === undefined) {
                            browserObj[browserArr[i]['name']]['value'] = 0;
                        }

                        browserObj[browserArr[i]['name']] = {
                            label: browserArr[i]['name'],
                            value: +browserObj[browserArr[i]['name']]['value'] + +browserArr[i]['page_views'],
                            color: "#"+((1<<24)*Math.random()|0).toString(16)
                        }
                    }
                }
                for(var key in browserObj) {
                    browserPie.push(browserObj[key]);
                }
                createPie('browser', browserPie);
            });

        },
        error: function(e) {console.log(e);}
    });

    //кол-во постов


    //click navigation in statistics
    // sorry za govnokod

    $('.nav_stat li').on('click', function() {
       $('.nav_stat li.active').removeClass('active');
        $(this).addClass('active');
        if($(this).text() == 'Посты') {
            $('.wrap_posts').show();
            $('.highchart').show();
            $('.wrap_views').hide();
            $('.wrap_visit').hide();
            $('.date').show();
        }else if($(this).text() == 'Просмотры'){
            $('.wrap_posts').hide();
            $('.highchart').hide();
            $('.wrap_views').show();
            $('.wrap_visit').hide();
            $('.date').show();
        }else {
            $('.wrap_visit').show();
            $('.wrap_posts').hide();
            $('.highchart').hide();
            $('.wrap_views').hide();
            $('.date').hide();
        }
    });


}

function getCountSocial(date1, date2) {
    if(date1 && date2) {
        var userId = $("#user_id").val();
        var info = {'vk': {}, 'fb': {}, 'tw': {}, 'in': {}, 'phone': {}};
        var y = date1.slice(0, 4);
        var m1 = date1.slice(4, 6);
        var m2 = date2.slice(4, 6);
        var d1 = date1.slice(6, 8);
        var d2 = date2.slice(6, 8);
        var dates = [];
        var day = d2;

        for(var i = 0; i < d2-d1+1; i++) {
            if(day <= 0) {
                m2 - 1;
                if((m2%2) == 0) {
                    day = 30;
                }else if(m2 == 02) {
                    day = 28;
                }else {
                    day = 31;
                }
            }

            if(day < 10) {
                day = '0'+day;
            }

            dates.push(y+''+m2+''+day);
            day--;
        }

        dates = dates.reverse();

        for(var key in info) {

            for(var i = 0; i < dates.length; i++) {
                info[key][dates[i]] = 0;
            }

        }

        $.ajax({
            type: 'GET',
            url: '/personal/api/v1/visit/?format=json&point__customer='+userId,
            dataType: 'json',
            success: function(data) {
                var ids = [];
                var requests = [];
                var obj = {
                    vk: 0,
                    fb: 0,
                    in: 0,
                    tw: 0,
                    ph: 0,
                }
                for(var i = 0; i < data.objects.length; i++) {
                    ids.push(data.objects[i].id);
                }
                for(var i = 0; i < ids.length; i++) {
                    requests.push(
                        $.ajax({
                            type: 'GET',
                            url: '/personal/api/v1/post/?format=json&visit='+ids[i],
                            dataType: 'json',
                            success: function(data) {
                                for(var i = 0; i < data.objects.length; i++) {
                                    var link = data.objects[i].resource;
                                    var curDate = data.objects[i].datetime.split('T')[0].split('-').join('');

                                    if(curDate >= date1 && curDate <= date2) {
                                        if(link.indexOf('vk') != -1) {
                                            obj['vk'] += 1;
                                        }else if(link.indexOf('facebook') != -1) {
                                            obj['fb'] += 1;
                                        }else if(link.indexOf('instagram') != -1) {
                                            obj['in'] += 1;
                                        }else if(link.indexOf('twitter') != -1) {
                                            obj['tw'] += 1;
                                        }
                                        else if(link.indexOf('base') != -1) {
                                            obj['ph'] += 1;
                                        }
                                    }

                                    //hightcharts information

                                    for(var j = 0; j < dates.length; j++) {
                                        if(curDate == dates[j]){
                                            if(link.indexOf('vk') != -1) {
                                                info['vk'][curDate] += 1;
                                            }else if(link.indexOf('facebook') != -1) {
                                                info['fb'][curDate] += 1;
                                            }else if(link.indexOf('instagram') != -1) {
                                                info['in'][curDate] += 1;
                                            }else if(link.indexOf('twitter') != -1) {
                                                info['tw'][curDate] += 1;
                                            }else if(link.indexOf('base') != -1) {
                                                info['phone'][curDate] += 1;
                                            }
                                        }
                                    }
                                }
                            }
                        })
                    );

                }
                $.when.apply($, requests).done(function() {
                    var vk = $('#vk');
                    var fb = $('#fb');
                    var tw = $('#tw');
                    var inst = $('#in');
                    var ph = $('#phone');
                    var infoForHighcharts = [];

                    var content = [];
                    for(var key in info) {
                        var objV = {};
                        var arr = [];

                        for(var elem in info[key]) {
                            arr.push(info[key][elem]);
                        }
                        objV = {
                            name: key,
                            data: arr
                        }
                        content.push(objV);
                    }
                    for(var j = 0; j < dates.length; j++) {
                        dates[j] = dates[j].slice(0, 4)+' '+dates[j].slice(4, 6)+' '+dates[j].slice(6, 8);
                    }
                    createHighchart('graphic', dates, content);

                    $(vk).text(obj['vk']);
                    $(fb).text(obj['fb']);
                    $(tw).text(obj['tw']);
                    $(inst).text(obj['in']);
                    $(ph).text(obj['ph']);
                });
            }
        });
    }else {
        var d = new Date();
        var dates = [];
        var info = {'vk': {}, 'fb': {}, 'tw': {}, 'in': {}, 'phone': {}};
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1;
        var curr_year = d.getFullYear();
        if(curr_date < 10) {
            curr_date = '0' + curr_date + '';
        }
        if(curr_month < 10) {
            curr_month = '0' + curr_month + '';
        }
        var date = (curr_year+''+curr_month+''+curr_date);
        var date1 = date;
        var date2 = date;
        var day = curr_date;

        for(var i = 0; i < 7; i++) {
            if(day <= 0) {
                curr_month - 1;
                if((curr_month%2) == 0) {
                    day = 30;
                }else if(curr_month == 02) {
                    day = 28;
                }else {
                    day = 31;
                }
            }

            if(day < 10) {
                day = '0'+day;
            }

            dates.push(curr_year+''+curr_month+''+day);
            day--;
        }

        dates = dates.reverse();

        for(var key in info) {

            for(var i = 0; i < dates.length; i++) {
                info[key][dates[i]] = 0;
            }

        }

        var userId = $("#user_id").val();
        $.ajax({
            type: 'GET',
            url: '/personal/api/v1/visit/?format=json&point__customer='+userId,
            dataType: 'json',
            success: function(data) {
                var ids = [];
                var requests = [];
                var obj = {
                    vk: 0,
                    fb: 0,
                    in: 0,
                    tw: 0,
                    ph: 0,
                }

                for(var i = 0; i < data.objects.length; i++) {
                    ids.push(data.objects[i].id);
                    // sorry za govnokod
                }

                for(var i = 0; i < ids.length; i++) {
                    requests.push(
                        $.ajax({
                            type: 'GET',
                            url: '/personal/api/v1/post/?format=json&visit='+ids[i],
                            dataType: 'json',
                            success: function(data) {
                                for(var i = 0; i < data.objects.length; i++) {
                                    var link = data.objects[i].resource;
                                    var curDate = data.objects[i].datetime.split('T')[0].split('-').join('');

                                    if(curDate >= date1 && curDate <= date2) {
                                        if(link.indexOf('vk') != -1) {
                                            obj['vk'] += 1;
                                        }else if(link.indexOf('facebook') != -1) {
                                            obj['fb'] += 1;
                                        }else if(link.indexOf('instagram') != -1) {
                                            obj['in'] += 1;
                                        }else if(link.indexOf('twitter') != -1) {
                                            obj['tw'] += 1;
                                        }else if(link.indexOf('base') != -1) {
                                            obj['ph'] += 1;
                                        }
                                    }

                                    //hightcharts information

                                    for(var j = 0; j < dates.length; j++) {
                                        if(curDate == dates[j]){
                                            if(link.indexOf('vk') != -1) {
                                                info['vk'][curDate] += 1;
                                            }else if(link.indexOf('facebook') != -1) {
                                                info['fb'][curDate] += 1;
                                            }else if(link.indexOf('instagram') != -1) {
                                                info['in'][curDate] += 1;
                                            }else if(link.indexOf('twitter') != -1) {
                                                info['tw'][curDate] += 1;
                                            }else if(link.indexOf('base') != -1) {
                                                info['phone'][curDate] += 1;
                                            }
                                        }
                                    }

                                }
                            }
                        })
                    );
                }
                $.when.apply(null, requests).done(function() {
                    var vk = $('#vk');
                    var fb = $('#fb');
                    var tw = $('#tw');
                    var inst = $('#in');
                    var ph = $('#phone');
                    var infoForHighcharts = [];

                    var content = [];
                    for(var key in info) {
                        var objNew = {};
                        var arr = [];

                        for(var elem in info[key]) {
                            arr.push(info[key][elem]);
                        }
                        objNew = {
                            name: key,
                            data: arr
                        }
                        content.push(objNew);
                    }
                    for(var j = 0; j < dates.length; j++) {
                        dates[j] = dates[j].slice(0, 4)+' '+dates[j].slice(4, 6)+' '+dates[j].slice(6, 8);
                    }
                    createHighchart('graphic', dates, content);

                    $(vk).text(obj['vk']);
                    $(fb).text(obj['fb']);
                    $(tw).text(obj['tw']);
                    $(inst).text(obj['in']);
                    $(ph).text(obj['ph']);

                });
            }
        });
    }

}

function createPie(select, data, h, w) {
    $('#'+select).empty();
    var height = 300,
        width = 555;
    if(h && w) {
        height = h;
        width = w;
    }
    var pie = new d3pie(select, {
        "footer": {
            "color": "#999999",
            "fontSize": 10,
            "font": "open sans",
            "location": "bottom-left"
        },
        "size": {
            "canvasHeight": height,
            "canvasWidth": width
        },
        "data": {
            "sortOrder": "value-desc",
            "content": data
        },
        "labels": {
            "outer": {
                "pieDistance": 32
            },
            "inner": {
                "hideWhenLessThanPercentage": 3
            },
            "mainLabel": {
                "fontSize": 11
            },
            "percentage": {
                "color": "#ffffff",
                "decimalPlaces": 0
            },
            "value": {
                "color": "#adadad",
                "fontSize": 11
            },
            "lines": {
                "enabled": true
            }
        },
        "effects": {
            "pullOutSegmentOnClick": {
                "effect": "linear",
                "speed": 400,
                "size": 8
            }
        },
        "misc": {
            "gradient": {
                "enabled": true,
                "percentage": 100
            }
        }
    });
}

function createHighchart(element, categories, content, data1, data2) {

    $('#'+element).highcharts({
        chart: {
            type: 'column',
            backgroundColor:'rgb(250, 250, 250)'
        },
        title: {
            text: 'Количество постов'
        },
        xAxis: {
            categories: categories,
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Количество'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:1f}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: content
    });
}
