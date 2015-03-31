/*
* CKEditor Maxlength Plugin
*
* Adds a character count to the path toolbar of a CKEditor instance
*
* @package maxlength
* @author Sage McEnery
* @version 1
* @copyright divgo 2012
* based on Word Count plugin from : http://www.n7studios.co.uk/2010/03/01/ckeditor-word-count-plugin/
*/
(function () {
	CKEDITOR.plugins.maxlength = {
	};

	var plugin = CKEDITOR.plugins.maxlength;

	function doCharacterCount(evt) {
		var editor = evt.editor;
			setTimeout(function () {
                var charCount = editor.getData().length;
                
				if (charCount > editor.config.max_length) {
					alert('Ограничение: 250 символов!');
					editor.execCommand('undo');
				} else if (charCount == editor.config.max_length) {
					editor.fire('saveSnapshot');
                    
				} else {
					
				};
			}, 100);
	}

	/**
	* Adds the plugin to CKEditor
	*/
	CKEDITOR.plugins.add('maxlength', {
		init: function (editor) {
            
			if ($("#" + editor.name).attr("maxlength")) {
				editor.config.max_length = $("#" + editor.name).attr("maxlength");
			} else if ($("#" + editor.name).hasAttr("data-maxlen")) {
				editor.config.max_length = $("#" + editor.name).attr("data-maxlen");
			} else {
				editor.config.max_length = 0;
			};

			setTimeout(function () {
				if (editor.config.max_length > 0) {
					$(".cke_bottom").append("<span id='cke_maxlength_" + editor.name + "'>Character: " + editor.getData().length + '/' + editor.config.max_length + "</span>");
				} else {
					$(".cke_bottom").append("<span id='cke_maxlength_" + editor.name + "'>Character: " + editor.getData().length + '/' + editor.config.max_length + "</span>");
				}
			}, 1000);

			editor.on('key', doCharacterCount);
		}
	});
})();

// Plugin options
CKEDITOR.config.max_length = 250; 