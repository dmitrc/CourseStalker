$(document).ready(function(){
    resize();

    $(window).resize(function(){
        resize();
    });

    $('#submit').click(function() {
    	$.post('/lookup', 
    		{
    			username: $("#username").val(),
    			password: $("#password").val(),
    			course: $("#course").val(),
    			profile: $("#profile").val()
    		}, 
    		function(data) {
    			data = JSON.parse(data);
    			console.log(data);

    			if (data.error) {
    				alert(data.error);
    				return;
    			}

    			var list = data.result;
    			if (!list) {
    				alert("No results or smth :(");
    				return;
    			}

    			var html = "";

    			if (data.profile) {
    				html += '<div class="center"><p class="lead text-danger">Displaying courses of '+data.profile+' : </p></div>';
    			}
    			else if (data.course) {
    				html += '<div class="center"><p class="lead text-danger">Displaying members of course #'+data.course+' : </p></div>'
    			}

    			html += "<ul>";
    			for (var i = 0; i < list.length; i++) {
    				html += '<li class="lead text-success">' + list[i] + '</li>'; 
    			}
    			html += "</ul>";

  				$("#results").html(html);
  				resize();
    		});
    });
});

var resize =  function() {
    var new_margin = Math.max(Math.ceil(($(window).height() - $('#form').height()) / 2) - 20,0);
    $('#form').css('margin-top', new_margin + 'px');

    new_margin = Math.max(Math.ceil(($(window).height() - $('#results').height()) / 2) - 20,0);
    $('#results').css('margin-top', new_margin + 'px');
};