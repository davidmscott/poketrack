var express = require("express");

var app = express();

var PORT = process.env.PORT || 8000;

var Sighting = require("./Sighting.js");

var bodyParser = require('body-parser');

var session = require('express-session');

var sightings = [];

var UserFtns = require("./UserFtns.js");

setInterval(function() {
	sightings = sightings.filter(function(sighting){
		return sighting.timestamp > Date.now() - 600000;
	});
}, 60000);

/*
	Experimental: Anything after this middleware requires
	the user to be logged in
*/
// app.use(function(req, res, next) {
// 	if (!req.session.user) {
// 		res.redirect("/login");
// 	} else {
// 		next();
// 	}
// });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
	secret: "Secret Key",
	resave: false,
	saveUninitialized: false
}));

app.get("/sighting", function(req, res) {
	if (!req.session.user) {
		res.redirect('/login');
		return;
	}
	res.send(JSON.stringify(sightings));
});

app.get("/sighting/id/:pokemonId", function(req, res) {
	if (!req.session.user) {
		res.redirect('/login');
		return;
	}
	res.send(JSON.stringify(sightings.filter(function(loc) {
					return loc.pokemonId == req.params.pokemonId;
				}
			)
		)
	);
});

app.get("/sighting/city/:cityName", function(req, res) {
	if (!req.session.user) {
		res.redirect('/login');
		return;
	}
	res.send(JSON.stringify(sightings.filter(function(loc) {
		return loc.locStr == req.params.cityName;
	})));
});

app.get("/search", function(req, res) {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	var searchResults = sightings;
	if (req.query.location) {
		searchResults = searchResults.filter(function(sighting) {
			return sighting.locStr === req.query.location;
		});
	}
	if (req.query.pokemon) {
		searchResults = searchResults.filter(function(sighting) {
			return sighting.pokemonId === req.query.pokemon;
		});
	}
	res.send(JSON.stringify(searchResults));
});

app.post("/sighting", function(req, res) {
	if (!req.session.user) {
		res.redirect('/login');
		return;
	}
	var newLoc = new Sighting(
		req.body.locStr,
		req.body.pokemonId,
		Date.now(),
		req.session.user);
	sightings.push(newLoc);
	res.send("success");
});


app.get('/login', function(req, res){
	res.sendFile(__dirname + "/public/login.html");
});

app.post('/login', function(req, res){
	if (UserFtns.checkLogin(req.body.username, req.body.password)) {
		req.session.user = req.body.username;
		res.send("success");
	} else {
		res.send("error");
	}
});

app.get('/map(.html)?', function(req,res) {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	res.sendFile(__dirname + "/public/map.html");
});

app.post('/register', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	if (UserFtns.userExists(username)) {
		if (UserFtns.checkLogin(username, password)) {
			req.session.user = username;
			res.send("success");
		} else {
			res.send("error");
		}
	} else {
		if(UserFtns.registerUser(username, password)) {
			req.session.user = username;
			res.send("success");
		} else {
			res.send("error");
		}
	}
});

app.get("/logout", function(req, res) {
	req.session.user = undefined;
	res.send("success");
});

app.use(express.static("public"));

app.use(function(req, res, next) {
	res.status(404);
	res.send("It's not very effective");
});

app.listen(PORT, function() {
	console.log("Gotta catch 'em all on port " + PORT);
});