const fs = require('fs');

class ConfigUtil {
    static CONFIG_FILE = "config.json"

    static setLastNotionUpdate(time = new Date()) {
        try {
            const configData = fs.readFileSync(ConfigUtil.CONFIG_FILE, 'utf8');
            const config = JSON.parse(configData);

            // Update the last update date
            config.lastNotionUpdate = time.toISOString();

            // Write the updated configuration back to config.json
            fs.writeFileSync(ConfigUtil.CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');

            console.log(`Last Notion update time updated to: ${config.lastNotionUpdate}`);
        } catch (err) {
            console.error('Error reading or updating config.json:', err);
        }
    }

    static getLastNotionUpdate(){
        try {
            const configData = fs.readFileSync(ConfigUtil.CONFIG_FILE, 'utf8');
            const config = JSON.parse(configData);

            return config.lastNotionUpdate
        } catch (err) {
            console.error('Error reading or updating config.json:', err);
        }
    }
}

module.exports = ConfigUtil;