const { Client, ActivityType } = require("discord.js")
const { botName, watching } = require('../../config.json');

module.exports = {
	name: "ready",
	once: true,
	/**
	 * 
	 * @param {Client} client
	 */
	execute(client) {
		console.log(`Client is now logged in as ${client.user.username}`)

		client.user.setActivity(watching, { type: ActivityType.Watching });
		client.user.setUsername(botName);
	}
}