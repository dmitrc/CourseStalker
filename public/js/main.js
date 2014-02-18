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

    			var html = "";

    			if (data.profile) {
                    html = printCourses(data);
    			}
    			else if (data.course) {
    				html = printStudents(data);
    			}

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

var printStudents = function(data) {
    var html = '<p class="center text-muted">Displaying members of course</p>'; 
    html += '<div class="center"><p class="lead text-danger">'+data.course+' : </p></div>';
    html += "<ul>";
    for (var i = 0; i < data.active.length; i++) {
        html += '<li class="lead text-success">' + data.active[i] + '</li>'; 
    }
    for (var i = 0; i < data.locked.length; i++) {
        html += '<li class="lead text-warning">' + data.locked[i] + '</li>'; 
    }
    for (var i = 0; i < data.disabled.length; i++) {
        html += '<li class="lead text-muted">' + data.disabled[i] + '</li>'; 
    }
    html += "</ul>";

    return html;
};

var printCourses = function(data) {
    var html = '<p class="center text-muted">Displaying courses of</p>'; 
    html += '<div class="center"><p class="lead text-danger">'+data.profile+' : </p></div>';
    html += "<ul>";
    for (var i = 0; i < data.courses.length; i++) {
        html += '<li class="lead text-success">(' + data.courses[i].id + ') ' + data.courses[i].name + '</li>'; 
    }
    html += "</ul>";

    return html;
}