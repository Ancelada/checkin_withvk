$(document).ready(function() {
	var newWin = false;
	$('#sender_text').on('focusout', function() {
		token_link = ''
		setTimeout(function(){
			newWin=window.open('https://oauth.vk.com/authorize?client_id=4853690&scope=messages,photos,video&redirect_uri=http://vk.com/app4853690&display=page&v=5.29&response_type=token', 'vkauth');
			console.log(newWin.location.href);
		}, 500);
	});
	if (newWin.location.href.indexOf('access_token')!=-1 ){
		console.log(newWin.location.href);
	}
});