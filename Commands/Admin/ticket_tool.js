const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedColor } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ticket_tool')
		.setDescription('Créer un utilitaire de ticketing'),
	
	async execute(interaction) {
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("ticket_category")
					.setLabel('🏷 Nouveau ticket')
					.setStyle(ButtonStyle.Danger),
			);

		const text = "Un problème ou une remarque à faire remonter à l'administration ?\nCréé un salon d'échange dédié en 2 clics !"

		const embed = new EmbedBuilder()
			.setColor(embedColor)
			.setTitle("Création d'un ticket administratif")
			.setDescription(text)

		await interaction.reply({ embeds: [embed], components: [row] })
	}
}