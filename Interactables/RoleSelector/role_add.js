const { EmbedBuilder } = require('discord.js');
const { embedColor, text_roleSelection, id_alumni, id_aspirant, id_professionnel } = require('../../config.json');
const RoleUtil = require('../../Utils/RoleUtil.js');

module.exports = {
	name: "role_add",
	async execute(interaction) {
		if (!interaction.isStringSelectMenu()) return;
        
        const [_, ...params] = interaction.customId.split("#")
        if (params.length == 0) return;
        const target = params[0]

        const member = await interaction.guild.members.fetch(interaction.member.id)

        switch (target) {
            case "alumni":
                RoleUtil.giveRoleId(interaction.guild, member, id_alumni)
                break
            case "aspirant":
                RoleUtil.giveRoleId(interaction.guild, member, id_aspirant)
                break
			case "professionnel":
                RoleUtil.giveRoleId(interaction.guild, member, id_professionnel)
                break
            default:
                interaction.update({ content: 'Unknown Role Target!', embeds: [], ephemeral: true , components: []});
                return
        }
        
        
        text = `**Configuration Terminée !**`

		const embed = new EmbedBuilder()
		.setColor(embedColor)
		.setTitle(text_roleSelection)
		.setDescription(text)

		await interaction.update({ embeds: [embed], ephemeral: true, components: [] });
	},
};