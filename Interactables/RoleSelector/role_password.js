const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { text_roleSelection } = require('../../config.json');

module.exports = {
	name: "role_password",
	async execute(interaction) {
        if (!interaction.isStringSelectMenu()) { return }

        const [_, ...params] = interaction.values[0].split("#");
        if (params.length == 0) return
        const id = "role_verify#" + params[0]

        const modal = new ModalBuilder()
            .setCustomId(id)
            .setTitle(text_roleSelection);

        const rolePasswordInput = new TextInputBuilder()
            .setCustomId('rolePasswordInput')
            .setLabel("Mot de Passe Élève")
            .setStyle(TextInputStyle.Short);

        const rolePasswordRow = new ActionRowBuilder().addComponents(rolePasswordInput);
        modal.addComponents(rolePasswordRow);
            
        await interaction.showModal(modal);
        
		
	}
};