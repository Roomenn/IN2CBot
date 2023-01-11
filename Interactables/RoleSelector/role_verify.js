const { EmbedBuilder } = require('discord.js');
const { embedColor, text_roleSelection, prefix_eleve, id_coursM1, id_coursM2, id_teacher, id_blacklisted, maxPasswordAttemps, id_logchannel } = require('../../config.json');
const RoleUtil = require('../../Utils/RoleUtil.js');
const InputUtil = require('../../Utils/InputUtil.js');
require('dotenv').config()

module.exports = {
	name: "role_verify",
	async execute(interaction) {
        if (!interaction.isModalSubmit()) return;
        
        const [_, ...params] = interaction.customId.split("#")
        if (params.length == 0) return;
        const target = params[0]

        const passwordInput = interaction.fields.getTextInputValue('rolePasswordInput')
        const verifiedInput = InputUtil.verifyInput(interaction, passwordInput)
        if (!verifiedInput) return

        const member = await interaction.guild.members.fetch(interaction.member.id)
        let wrong_password = false
        let text = "";

        switch (target) {
            case "eleve":
                if (passwordInput == process.env.M1_PASSWORD) {
                    RoleUtil.giveRole(interaction.guild, member, prefix_eleve + "M1")
                    RoleUtil.giveRoleId(interaction.guild, member, id_coursM1)
                    text = `**Bienvenue chez les IN2C M1 !** 🎉 \n Configuration Terminée`

                } else if (passwordInput == process.env.M2_PASSWORD) {
                    RoleUtil.giveRole(interaction.guild, member, prefix_eleve + "M2")
                    RoleUtil.giveRoleId(interaction.guild, member, id_coursM2)
                    text = `**Bienvenue chez les IN2C M2 !** 🎉 \n Configuration Terminée`

                } else {
                    wrong_password = true
                }
                break
            case "prof":
                if (passwordInput == process.env.TEACHER_PASSWORD) {
                    RoleUtil.giveRoleId(interaction.guild, member, id_teacher)
                    text = `**Configuration Terminée !** 🎉`

                } else {
                    wrong_password = true
                }
                break
            default:
                interaction.update({ content: 'Unknown Role Target!', embeds: [], ephemeral: true , components: []});
                return
        }
		
        if (wrong_password) {
            const client = interaction.client
            let count = client.blacklist.get(member.id)

            if (count) {
                count -= 1
                if(count == 0) {
                    RoleUtil.giveRoleId(interaction.guild, member, id_blacklisted)
                    client.blacklist.set(member.id, maxPasswordAttemps)
                    text = "Mot de passe incorrect. Contacte un administrateur"

                    const channel = client.channels.cache.get(id_logchannel);
                    channel.send("User " + member.displayName + " have been blacklisted");

                } else {
                    client.blacklist.set(member.id, count)
                    text = "Mot de passe incorrect "+ count +" essais restants"
                } 
            } else {
                count = maxPasswordAttemps-1
                client.blacklist.set(member.id, count)
                text = "Mot de passe incorrect "+ count +" essais restants"
            }
        }
		
		const embed = new EmbedBuilder()
			.setColor(embedColor)
			.setTitle(text_roleSelection)
			.setDescription(text)

		await interaction.update({ embeds: [embed], ephemeral: true, components: [] });
	},
};