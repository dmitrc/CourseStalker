var ldap = require('ldapjs');
var express = require('express');
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
	}

	if (num && profile) {
		res.send(200, JSON.stringify({error: "You should pick profile OR course ID, mate..."}));
	}

	ldap_client.bind(user+'@jacobs.jacobs-university.de', pass, function(err) {

		if (!(err === null)) {
			res.send(200, JSON.stringify({error:"Login failed! :(" + err}));
			return;
		}
	 
		if (num) {
			var opts = {
				filter: null,
				scope: 'sub'
			};

			ldap_client.search('CN=GS-CAMPUSNET-COURSE-'+num+',OU=Groups,OU=CampusNet,DC=jacobs,DC=jacobs-university,DC=de', opts, function(err,search) {
		  		search.on('searchEntry', function (entry) {
		      		var members = entry.object.member;

		      		for (var i = 0; i < members.length; i++) {
		      			// Separate function!
		      			members[i] = members[i].replace(",OU=Active,OU=Users,OU=CampusNet,DC=jacobs,DC=jacobs-university,DC=de","").replace(",OU=Disabled,OU=Users,OU=CampusNet,DC=jacobs,DC=jacobs-university,DC=de","").replace("CN=","").replace("\\,","").replace(/ *\([^)]*\) */g, "");
		      		}

		      		res.send(200,JSON.stringify({result: members, course: num}));
		    	});
			});	
		}
		else if (profile) {
			var opts = {
				filter: '(sAMAccountName='+profile+')',
				scope: 'sub'
			};

			ldap_client.search('OU=Active,OU=Users,OU=CampusNet,DC=jacobs,DC=jacobs-university,DC=de', opts, function(err,search) {
		  		search.on('searchEntry', function (entry) {
		      		var membership = entry.object.memberOf;

		      		for (var i = 0; i < membership.length; i++) {
		      			membership[i] = membership[i].replace(",OU=Groups,OU=CampusNet,DC=jacobs,DC=jacobs-university,DC=de","").replace("CN=GS-CAMPUSNET-COURSE-","");
		      		}

		      		membership = membership.filter(function(i) {
						var check = i.substr(0,2);
						return check != "CN";
					});

		      		res.send(200, JSON.stringify({result: membership, profile: profile}));
		    	});
			});
		}
		else {
			res.send(200, JSON.stringify({error:"Something broke. Oops :("}))
		}
	});
});

 app.get(/^(.+)$/, function(req, res) { 
 	res.sendfile('./public' + req.params[0]); 
 });

app.listen(port);
console.log('Listening on port '+port+'...');