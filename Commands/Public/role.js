const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedColor, text_roleSelection } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Créer un sélecteur de rôle'),
	
	async execute(interaction) {
        const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('role_main')
					.setLabel('Click !')
					.setStyle(ButtonStyle.Primary),
			);
		
		const embed = new EmbedBuilder()
				.setColor(embedColor)
				.setTitle(text_roleSelection)
		
		await interaction.channel.send({ embeds: [embed], components: [row] })
		await interaction.reply({ content: 'Bouton Permanent créé !', ephemeral: true });
	},
};