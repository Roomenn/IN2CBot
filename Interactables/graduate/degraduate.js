const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { embedColor, graduationOn, id_alumni, id_coursM1, id_coursM2, prefix_eleve, prefix_privateChat, id_privateCat } = require('../../config.json');
const RoleUtil = require('../../Utils/RoleUtil.js');

module.exports = {
	name: "degraduate",
	async execute(interaction) {
		if (!graduationOn) return

        const guild = interaction.guild
		await guild.roles.fetch()
		.then(async () => {
			await guild.members.fetch()
			.then (async () => {
				await guild.channels.fetch()
				.then(async () => {
					
					this.deleteNewM1(guild)
				})
			})
		})

		let embed = new EmbedBuilder()
			.setColor(embedColor)
			.setTitle("Fonction de passage à l'année supérieure")
			.setDescription("Les rôles prendrons quelques minutes à être réattribuer.")
		
		await interaction.update({embeds: [embed], components: []})
	},

	async deleteNewM1(guild) {
		const channel = guild.channels.cache.find(channel => channel.name === prefix_privateChat + "discussion-m1")
		channel.delete()
		.then( async () => {

			const roleM1 = guild.roles.cache.find(role => role.name === prefix_eleve + "M1")
			roleM1.delete()
			.then( async () => {

				RoleUtil.removeRoleFromEveryone(guild, id_coursM1)
				.then( async () => {

					this.demoteM2(guild)
				})
			})
		})
	},

	async demoteM2(guild) {
		const roleM2 = guild.roles.cache.find(role => role.name === prefix_eleve + "M2")
		const channel = guild.channels.cache.find(channel => channel.name === prefix_privateChat + "discussion-m2")
		
		roleM2.setName(prefix_eleve + "M1")
		channel.setName(prefix_privateChat + "discussion-m1")

		RoleUtil.switchRole(guild, id_coursM2, id_coursM1)
		.then( async () => {

			this.lastYear(guild)
			.then( async year => {

				this.demoteLastPromo(guild, year)
			})
		})
	},

	async lastYear(guild) {
		let max = 0
		guild.roles.cache.forEach(async role => {
			if (role.name.includes(prefix_eleve+"Promo ")) {
				let s = role.name.split(prefix_eleve+"Promo ")
                let year = parseInt(s[1])
				if (year > max) max = year
			}
        })
		return max
	},

	async demoteLastPromo(guild, year) {
		const role = guild.roles.cache.find(role => role.name === prefix_eleve + "Promo " + year)
		const roleCours = guild.roles.cache.find(role => role.id === id_coursM2)
		const channel = guild.channels.cache.find(channel => channel.name == prefix_privateChat + "promo-" + year)
		
		channel.setName(prefix_privateChat + "discussion-M2")
		role.setName(prefix_eleve + "M2")

		guild.members.cache.forEach( async member => {
			if (member.roles.cache.has(role.id)){
				member.roles.remove(id_alumni)
				member.roles.add(roleCours)
			}
		})
	}
}