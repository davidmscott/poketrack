var fs = require("fs");

var usersArr;
try {
	usersArr = JSON.parse(fs.readFileSync("./users.json"));
} catch (e) {
	usersArr = [];
}

function userExists(username) {
	for (var i = 0; i < usersArr.length; i++) {
		if (usersArr[i].username === username) {
			return usersArr[i];
		}
	}
	return undefined;
}

function checkLogin (username, password) {
	var user = userExists(username);
	if (user && user.password === password) {
		return true;
	}
	return false;
}

function registerUser(username, password) {
	if (userExists(username)) {
		return false;
	}
	usersArr.push({
		username: username,
		password: password
	});
	saveAllUsers();
	return true;
}

function saveAllUsers() {
	fs.writeFile(
		"./users.json",
		JSON.stringify(usersArr),
		function(err) {
			if (err) {
				console.log(err);
			}
		}
	);
}

module.exports = {
	userExists : userExists,
	checkLogin : checkLogin,
	registerUser : registerUser,
	saveAllUsers : saveAllUsers
};