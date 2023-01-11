const { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedColor, graduationOn } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('graduate')
		.setDescription('Passe tous les élèves à l\'année supérieure')
		.addBooleanOption(option => option.setName('reverse').setDescription('Reverse')),
	
	async execute(interaction) {
		const reverse = interaction.options.getBoolean('reverse');
		let id = ""
		let title = ""
		if (reverse) {
			id = "degraduate"
			title = "Annulation du passage à l'année supérieure"
		} else {
			id = "graduate1"
			title = "Fonction de passage à l'année supérieure"
		} 
		
		const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId(id)
				.setLabel('Confirmer')
				.setStyle(ButtonStyle.Danger),
		);

		text = graduationOn ? "Commande activée" : "Commande désactivée"

		const embed = new EmbedBuilder()
			.setColor(embedColor)
			.setTitle(title)
			.setDescription(text)

		await interaction.reply({ embeds: [embed], components: [row] })
	}
}