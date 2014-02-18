var ldap = require('ldapjs');
var express = require('express');
var utils = require('./utils.js');
var app = express();

var port = 3030;

app.use(express.json());
app.use(express.urlencoded());

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.send(200, JSON.stringify({error:"Something broke. Oops :("}));
});

app.post('/lookup', function(req,res) {

	var ldap_client = ldap.createClient({url:'ldap://jacobs.jacobs-university.de'});

	var user = req.body.username;
	var pass = req.body.password;
	var num = req.body.course;
	var profile = req.body.profile;

	if (!num && !profile) {
		res.send(200, JSON.stringify({error: "You should try to write either course ID or CampusNet profile, dude..."}));
		return;
	}

	if (num && profile) {
		res.send(200, JSON.stringify({error: "You should pick profile OR course ID, mate..."}));
		return;
	}

	ldap_client.bind(user+'@jacobs.jacobs-university.de', pass, function(err) {

		if (!(err === null)) {
			res.send(200, JSON.stringify({error:"Login failed! :("}));
			return;
		}
	 
	 	// Course members
		if (num) {
			utils.getCourseMembers(ldap_client, num, function(output) {
				res.send(200,JSON.stringify(output));
			});
		}

		// Courses of a person
		else if (profile) {
			utils.getStudentCourses(ldap_client, profile, function(output) {
				res.send(200,JSON.stringify(output));

				ldap_client.unbind(function(err) {
      				if (err) console.log(err);
      			});
			});
		}

		// How did this happen, again?
		else {
			res.send(200, JSON.stringify({error:"Something broke. Oops :("}))
		}
	});
});

// Serve files from ./public/
 app.get(/^(.+)$/, function(req, res) { 
 	res.sendfile('./public' + req.params[0]); 
 });

app.listen(port);
console.log('Listening on port '+port+'...');