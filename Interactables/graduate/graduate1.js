const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { embedColor, graduationOn, id_alumni, id_coursM1, id_coursM2, prefix_eleve, prefix_privateChat, id_privateCat } = require('../../config.json');
const RoleUtil = require('../../Utils/RoleUtil.js');

module.exports = {
	name: "graduate1",
	async execute(interaction) {
		if (!graduationOn) return

        const guild = interaction.guild
		await guild.roles.fetch()
		.then(async () => {
			await guild.members.fetch()
			.then (async () => {
				await guild.channels.fetch()
				.then(async () => {
					this.rolesCours(guild)
					this.rolesPromo(guild)
				})
			})
		})

		let embed = new EmbedBuilder()
			.setColor(embedColor)
			.setTitle("Fonction de passage à l'année supérieure")
			.setDescription("Les rôles prendrons quelques minutes à être réattribuer.")
		
		await interaction.update({embeds: [embed], components: []})
	},

	async rolesCours(guild) {
		RoleUtil.removeRoleFromEveryone(guild, id_coursM2)
		.then( async () => {
			RoleUtil.switchRole(guild, id_coursM1, id_coursM2)
		})
	},

	async rolesPromo(guild) {
		let max = 0
		guild.roles.cache.forEach(async role => {
			if (role.name.includes(prefix_eleve+"Promo ")) {
				let s = role.name.split(prefix_eleve+"Promo ")
                let year = parseInt(s[1])
				if (year > max) max = year
			}
        })
		this.promoteM2(guild, max+1)
	},

	async promoteM2(guild, year) {
		const roleM2 = guild.roles.cache.find(role => role.name === prefix_eleve + "M2")
		const roleAlumni = guild.roles.cache.find(role => role.id === id_alumni)

		const channel = guild.channels.cache.find(channel => channel.name == prefix_privateChat + "discussion-m2")
		channel.setName(prefix_privateChat + "promo-" + year)

		roleM2.setName(prefix_eleve + "Promo " + year)

		guild.members.cache.forEach( async member => {
			if (member.roles.cache.has(roleM2.id)) {
				member.roles.add(roleAlumni)
			}	
		})
		this.promoteM1(guild)
	},

	async promoteM1(guild) {
		const roleM1 = guild.roles.cache.find(role => role.name === prefix_eleve + "M1")
		roleM1.setName(prefix_eleve + "M2")

		const channel = guild.channels.cache.find(channel => channel.name === prefix_privateChat + "discussion-m1")
		channel.setName(prefix_privateChat + "discussion-m2")

		this.createNewM1(guild)
	},

	async createNewM1(guild) {
		guild.roles.create({
			name: prefix_eleve + "M1",
			color: "#3498db"
		})
		.then(async role => {
			guild.channels.create({
				name: prefix_privateChat + "discussion-m1",
				type: ChannelType.GuildText,
				permissionOverwrites: []
			})
			.then(async channel => {
				channel.setParent(id_privateCat)
				
				permissionList = await this.getPermissions(guild, [role])
				channel.permissionOverwrites.set(permissionList)
			})
		})

	},

	async getPermissions(guild, roleList) {
		list = []
		roleList.forEach(role => {
			list.push({
				id: role.id,
				allow: [PermissionsBitField.Flags.ViewChannel],
			},)
		})

		list.push(
			{
				id: guild.roles.everyone,
				deny: [PermissionsBitField.Flags.ViewChannel],
			},
		)
		return list
	},
}