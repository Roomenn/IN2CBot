const { CommandInteraction } = require("discord.js")

module.exports = {
	name: "interactionCreate",
	/**
	 * 
	 * @param {CommandInteraction} interaction
	 */
	execute(interaction, client) {

		var command = null;

        if (interaction.isChatInputCommand()) {
            command = client.commands.get(interaction.commandName);

        } else if (interaction.isButton()) {
            const [name, ...params] = interaction.customId.split("#");
	        command = client.interacts.get(name);

        } else if (interaction.isStringSelectMenu()) {
			let name = ""
			let params = []
			interaction.values.forEach(value => {
				const [valueName, ...valueParams] = value.split("#");
				if (name == "") {
					name = valueName
				} else {
					if (name != valueName){
						console.error("Different names : "+valueName+" "+name)
					}
				}
				params.push(...valueParams)
			});
	        command = client.interacts.get(name);

        } else if (interaction.isModalSubmit()) {
			const name = interaction.customId.split("#")[0];
			command = client.interacts.get(name);

		} else {
            return;
        }

        if(!command) {
			return interaction.reply({content: "This command is outdated.", ephemeral: true })
		}

        try {
            command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }

	}
}