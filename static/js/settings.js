$(function() {
    var f = $('.container .nav li:first-child');
    var s = $('.container .nav li').get(1);
    var l = $('.container .nav li:last-child');

    $('#phone_private').mask('+0 (000) 000-00-00');
    $('#phone_twilio').mask('+00000000000');

    $(f).on('click', function() {
        $('.edit').hide();
        $('.checkmail').show();
        $('.smsbox').hide();
        $(l).removeClass('active');
        $(s).removeClass('active');
        $(this).addClass('active');
    });

    $(l).on('click', function() {
        $('.smsbox').show();
        $('.checkmail').hide();
        $('.edit').hide();
        $(f).removeClass('active');
        $(s).removeClass('active');
        $(this).addClass('active');
    });

    $(s).on('click', function() {
        $('.edit').show();
        $('.checkmail').hide();
        $('.smsbox').hide();
        $(f).removeClass('active');
        $(l).removeClass('active');
        $(this).addClass('active');
    });
});
