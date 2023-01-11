const { helperId } = require('../config.json');
class InputUtil {

    static async verifyInput(interaction, input) {
        const b = input.length < 24;
        const b1 = input.includes("\"")
                || input.includes("\\")
        
        return b && !b1
    }

    static async procInteraction(interaction, name) {
        const command = interaction.client.interacts.get(name)
        if (command) command.execute(interaction, interaction.client)
    }
}

module.exports = InputUtil;