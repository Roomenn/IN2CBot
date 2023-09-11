const { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder } = require('discord.js');
const { embedColor } = require('../../config.json');

module.exports = {
	name: "ticket_category",
	async execute(interaction) {
			
		const ticketTypeRow = new ActionRowBuilder()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('ticket_types')
				.setPlaceholder('Catégorie de ticket')
				.addOptions([
					{
						label: 'Matériel Informatique',
						description: 'Problème logiciel ou matériel de l\'uphf',
						value: 'ticket_modal#materiel_informatique',
						emoji: "🖥️",
					},
					{
						label: 'Salle de cours',
						description: 'Remarques et problématiques',
						value: 'ticket_modal#salle_de_cours',
						emoji: "👨‍🏫",
					}
				])
			);
		
		const embed = new EmbedBuilder()
			.setColor(embedColor)
			.setTitle("Choisis le type de ticket");

		await interaction.reply({ embeds: [embed], ephemeral: true , components: [ticketTypeRow] });
	},
};