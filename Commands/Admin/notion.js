const { SlashCommandBuilder } = require('@discordjs/builders');
const NotionUtil = require('../../Utils/NotionUtil.js');
const ConfigUtil = require('../../Utils/ConfigUtil.js');
var { id_wikiUpdateChannel } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('notion')
		.setDescription('Utilitaire Notion')
		.addSubcommand(subcommand =>
			subcommand
				.setName('update_now')
				.setDescription('Publier les mises à jour du Notion'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('set_last_updated')
				.setDescription('Ignorer les mises à jour Notion précédent cette commande')),
	
	async execute(interaction) {
		var reply = ""
		if (interaction.options.getSubcommand() === 'update_now'){
			const channel = interaction.guild.channels.cache.get(id_wikiUpdateChannel)
			const published = await NotionUtil.queryUpdates(channel)

			if (published != null) {
				var reply = "Update Done"
			} else {
				var reply = "Nothing to Update"
			}

		} else if (interaction.options.getSubcommand() === 'set_last_updated'){
			ConfigUtil.setLastNotionUpdate()
			reply = "Date de référence mise à jour"
		}
		
		await interaction.reply({ content: reply, ephemeral: true })
		
	}
}