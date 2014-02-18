exports.getCourseMembers = function(ldap, num, f) {
	var opts = {
		filter: null,
		scope: 'sub'
	};

	ldap.search('CN=GS-CAMPUSNET-COURSE-'+num+',OU=Groups,OU=CampusNet,DC=jacobs,DC=jacobs-university,DC=de', opts, function(err,search) {

			if (!(err === null)) {
				f({error: "Can't find the course :("});
				return;
			}

			search.on('searchEntry', function (entry) {

		  		var members = entry.object.member;
		  		var output = exports.exportStudents(members);

		  		var name = exports.filterCourseName(entry.object.description);
		  		if (name) {
		  			output.course = name;
		  		}
		  		else {
		  			output.course = num;
		  		}

		  		f(output);
			});
	});	
}

exports.getStudentCourses = function(ldap, profile, f) {
	var opts = {
		filter: '(sAMAccountName='+profile+')',
		scope: 'sub'
	};

	ldap.search('OU=Active,OU=Users,OU=CampusNet,DC=jacobs,DC=jacobs-university,DC=de', opts, function(err,search) {

		if (!(err === null)) {
			f({error: "Couldn't find student :("});
			return;
		}

  		search.on('searchEntry', function (entry) {
      		
      		var courses = entry.object.memberOf;
      		exports.exportCourses(ldap,courses, function(output) {
      			output.profile = entry.object.displayName;
      			f(output);
      		});
    	});
	});
}

exports.getCourseInformation = function(ldap, course, f) {

	if (course === course.replace("CN=GS-CAMPUSNET-COURSE-","")) {
		// Not a course...
		f(null);
		return;
	}

	var opts = {
		filter: null,
		scope: 'sub'
	};

	ldap.search(course, opts, function(err,search) {

			if (!(err === null)) {
				// Can't find the course - got deleted or smth..
				return;
			}

			search.on('searchEntry', function (entry) {

		  		var name = exports.filterCourseName(entry.object.description);
		  		var id = exports.filterCourseID(entry.object.displayName);

		  		if (name === null || id === null) {
		  			f(null);
		  			return;
		  		}

		  		var output = {name: name, id: id};
		  		f(output);
			});
	});	
}

exports.filterCourseName = function(s) {
	var regex = /\(.+\)/;
	var matches = regex.exec(s);

	if (!matches) {
		console.log("NO REGEX MATCHES: " + s);
		return null;
	}

	var result = matches[0];
	// Remove first and last characters -> ( )
	result = result.slice(1,result.length-1);
	return result;
}

exports.filterCourseID = function(s) {
	var result = s.replace("GS-CAMPUSNET-COURSE-","");

	return result;
}

exports.filterStudentString = function(s) {
	var result = {name: "", status: ""};

	var name;
	var status;

	// Get rid of the unnecessary information and get the status
	if ((name = s.replace(",OU=Active,OU=Users,OU=CampusNet,DC=jacobs,DC=jacobs-university,DC=de","")) !== s) {
		status = "active";
	}
	else if ((name = s.replace(",OU=Disabled,OU=Users,OU=CampusNet,DC=jacobs,DC=jacobs-university,DC=de","")) !== s) {
		status = "disabled";
	}
	else if ((name = s.replace(",OU=Locked,OU=Users,OU=CampusNet,DC=jacobs,DC=jacobs-university,DC=de","")) !== s) {
		status = "locked";
	}

	// Remove prefix and more useless characters
  	name = name.replace("CN=","");
	name = name.replace("\\,","");

	// Remove the id
  	name = name.replace(/ *\([^)]*\) */g, "");

  	result.name = name;
  	result.status = status;

  	return result;
}

exports.exportStudents = function(arr) {
	var active = [];
	var disabled = [];
	var locked = [];

	for (var i = 0; i < arr.length; i++) {

		var filtered = exports.filterStudentString(arr[i]);
		
	  	if (filtered.status = "active") {
	  		active.push(filtered.name);
	  	}
	  	else if (filtered.status = "disabled") {
	  		disabled.push(filtered.name);
	  	}
	  	else if (filtered.status = "locked") {
	  		locked.push(filtered.name);
	  	}
	 }

	var result = {active: active, disabled: disabled, locked: locked};
	return result;
}

exports.exportCourses = function(ldap, arr, f) {

//Seems fishy
	var courses = [];
	var counter = arr.length;

	for (var i = 0; i < arr.length; i++) {
		exports.getCourseInformation(ldap, arr[i], function(result) {
			if (result) {
				courses.push(result);
			}

			counter--;
			if (counter == 0) {
				var result = {courses: courses};
    			f(result);
			}
		});
    }
} 