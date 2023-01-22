const { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder } = require('discord.js');
const { embedColor, text_roleSelection, id_blacklisted } = require('../../config.json');
const RoleUtil = require('../../Utils/RoleUtil.js');

module.exports = {
	name: "role_main",
	async execute(interaction) {
		const member = await interaction.guild.members.fetch(interaction.member.id)
		const isBackListed = await member.roles.cache.has(id_blacklisted)

		if (isBackListed) {
			return await interaction.reply({ content: "Tu t'es trompé de mot de passe trop de fois. Contacte un administrateur", ephemeral: true });
		}
			
		const row = new ActionRowBuilder()
			.addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('role')
					.setPlaceholder('Sélectionne un Rôle')
					.addOptions([
						{
							label: 'Élève',
							description: 'Accèder aux espaces de cours et d\'échanges',
							value: 'role_password#eleve',
							emoji: "🎓",
						},
						{
							label: 'Enseignant',
							description: 'Accèder aux espaces de cours',
							value: 'role_password#prof',
							emoji: "👨‍🏫",
						},
                        {
							label: 'Alumni',
							description: 'Pour garder le contact',
							value: 'role_add#alumni',
							emoji: "📜",
						},
                        {
							label: 'Aspirant IN2C',
							description: 'Renseigne toi sur la formation',
							value: 'role_add#aspirant',
							emoji: "👨‍🎓",
						},
						{
							label: 'Professionnel',
							description: 'Échange avec les promotions',
							value: 'role_add#professionel',
							emoji: "🏗️",
						},
					]),
			);
		
		const text = ":arrow_forward: Choisissez votre **rôle**:"
		const embed = new EmbedBuilder()
			.setColor(embedColor)
			.setTitle(text_roleSelection)
			.setDescription(text)

		await interaction.reply({ embeds: [embed], ephemeral: true , components: [row] });
	},
};