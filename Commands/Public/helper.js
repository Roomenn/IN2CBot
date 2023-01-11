const { SlashCommandBuilder, EmbedBuilder, userMention } = require('@discordjs/builders');
const { helperId, adminId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('helper')
		.setDescription('Gestion des Helpers')
		.addSubcommand(subcommand =>
			subcommand
				.setName('ajouter')
				.setDescription('Ajoute un nouvel Helper')
				.addUserOption(option =>
					option.setName('target')
						.setDescription('User')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('demission')
				.setDescription('Vous retire le role Helper')),
	
	async execute(interaction) {
        const guild = interaction.guild
		
        if (interaction.options.getSubcommand() === 'ajouter') {
			const user = interaction.options.getUser('target');
            const member = await guild.members.fetch(user.id)
            const role = await guild.roles.cache.find(role => role.id === helperId)
            member.roles.add(role)

            const text = ":arrow_forward: Helper Ajouté:"
            const embed = new EmbedBuilder()
                .setTitle(text)
                .setDescription(userMention(user.id))

            await interaction.reply({ embeds: [embed], ephemeral: true, components: [] })
			  	
			  
		} else if (interaction.options.getSubcommand() === 'demission') {
			const member = await guild.members.fetch(interaction.user.id)
            member.roles.remove(helperId)
            member.roles.remove(adminId)

            const embed2 = new EmbedBuilder()
                .setTitle(":arrow_forward: Démission réussie ")
                .setDescription("Merci pour ton aide !")
                .setImage('https://c.tenor.com/pGx47sxMo4gAAAAC/bye-goodbye.gif')
            
            await interaction.reply({ embeds: [embed2], ephemeral: true, components: [] })
		}
	}
}