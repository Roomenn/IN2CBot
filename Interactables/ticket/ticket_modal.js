const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
	name: "ticket_modal",
	async execute(interaction) {
        if (!interaction.isStringSelectMenu()) { return }

        const option = interaction.component.options.find(
            (option) => option.value == interaction.values[0])
        const label = option.label;

        const modal = new ModalBuilder()
            .setCustomId("ticket_channel")
            .setTitle("Ticket: " + label);

        const ticketCategory = new TextInputBuilder()
            .setCustomId('ticket_category')
            .setLabel("Catégorie du ticket")
            .setStyle(TextInputStyle.Short)
            .setValue(label)
            .setRequired(true);

        const ticketDescription = new TextInputBuilder()
            .setCustomId('ticket_description')
            .setLabel("Description du problème")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const ticketCategoryRow = new ActionRowBuilder().addComponents(ticketCategory);
        const ticketDescriptionRow = new ActionRowBuilder().addComponents(ticketDescription);
        
        modal.addComponents(ticketCategoryRow, ticketDescriptionRow);
            
        await interaction.showModal(modal);
	}
};