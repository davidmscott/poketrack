function Sighting(locStr, pokemonId, timestamp, user) {
	this.locStr = locStr;
	this.pokemonId = pokemonId;
	this.timestamp = timestamp;
	this.user = user;
}

module.exports = Sighting;