$(function() {
	$("*[data-role='import']").each(function() {
		var current = $(this);

		current.load(current.data('url'), function() {
			var obj = current.data();	
			for (var key in obj){
		        current.find('#' + key).html(obj[key]);
		    }
		});
	});
});