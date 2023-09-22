const { EmbedBuilder, userMention, channelMention, ChannelType, PermissionsBitField } = require('discord.js');
const { embedColor, id_resp_peda, id_helper, id_ticketCat, id_ticketRole } = require('../../config.json');
const RoleUtil = require('../../Utils/RoleUtil.js');

module.exports = {
	name: "ticket_channel",
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;
		const guild = interaction.guild
		const member = await guild.members.fetch(interaction.member.id)

		const ticketCategory = interaction.fields.getTextInputValue('ticket_category');
		const ticketDescription = interaction.fields.getTextInputValue('ticket_description');

		const roleList = [];
		roleList.push(await guild.roles.cache.find(role => role.id === id_resp_peda))
		roleList.push(await guild.roles.cache.find(role => role.id === id_helper))
		roleList.push(await guild.roles.cache.find(role => role.id === id_ticketRole))
		roleList.push(await guild.members.cache.find(m => m.id === member.id))

		guild.channels.create({
			name: "┃🎫᲼" + ticketCategory,
			type: ChannelType.GuildText,
			permissionOverwrites: [
				{
					id: interaction.guild.id,
					deny: [PermissionsBitField.Flags.ViewChannel],
				}
			]
		})
		.then(async channel => {
			channel.setParent(id_ticketCat)
        	channel.setPosition(1)
			
			permissionList = await this.getPermissions(guild, roleList)
			channel.permissionOverwrites.set(permissionList)

			const pingText = "<@&" + id_resp_peda + ">"
			const ticketEmbed = new EmbedBuilder()
				.setColor(embedColor)
				.setTitle(ticketCategory)
				.setDescription("Créé par " + userMention(member.id) + ".\n" + ticketDescription)
        
        	channel.send({ content: pingText, embeds: [ticketEmbed]})

			const embed = new EmbedBuilder()
				.setColor(embedColor)
				.setTitle("Ticket créé !")
				.setDescription("Channel dédié: " + channelMention(channel.id))
			
			await interaction.update({ embeds: [embed], ephemeral: true, components: [] });
		})
	},

	async getPermissions(guild, roleList) {
		list = []
		roleList.forEach(role => {
			list.push({
				id: role.id,
				allow: [PermissionsBitField.Flags.ViewChannel],
			})
		})

		list.push({
				id: guild.roles.everyone,
				deny: [PermissionsBitField.Flags.ViewChannel]
		})
		
		return list
	}
};