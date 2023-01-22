const { helperId, graduationOn } = require('../config.json');
class RoleUtil {

    static async giveRole(guild, member, roleName) {
        let role = guild.roles.cache.find(role => role.name === roleName)

        if (!role || role.id == helperId)
            return console.log("Role not Found: " + roleName)
        
        await member.roles.add(role)
    }

    static async giveRoleId(guild, member, roleId) {
        let role = guild.roles.cache.find(role => role.id === roleId)

        if (!role || roleId == helperId) {
            return console.log("Role not Found: " + roleId)
        }
        
        await member.roles.add(role)
    }

    static async removeRole(guild, member, roleName) {
        let role = guild.roles.cache.find(role => role.name === roleName)

        if (!role)
            return console.log("Role not Found: " + roleName)
        
        if (member.roles.cache.has(role.id))
            member.roles.remove(role.id)
    }

    static async hasRole(guild, member, roleName) {
        const role = await guild.roles.cache.find(role => role.name === roleName)

        if (!role)
            return false
        
        return member.roles.cache.has(role.id)
    }

    static async removeRoleFromEveryone(guild, roleID) {
        const members = await guild.members.fetch()
        
        members.forEach( async member => {
            if (member.roles.cache.has(roleID)) {
                member.roles.remove(roleID)
            }
        })
    }

    static async resetRole(guild, roleID) {
        const role = guild.roles.cache.find(role => role.id === roleID)
		if (role) {
			const newRole = await role.delete()
			return guild.roles.create(newRole)
		} else {
            console.log("couldn't find role")
            console.error()
        }
    }

    static async switchRole(guild, roleID, roleID2) {
        const role = guild.roles.cache.find(role => role.id === roleID2)

        if (role) {
            const members = await guild.members.fetch()
            
            members.forEach( async member => {
                if (member.roles.cache.has(roleID)) {
                    member.roles.remove(roleID)
                    member.roles.add(role)
                    
                }
            })
        }
    }
}

module.exports = RoleUtil;