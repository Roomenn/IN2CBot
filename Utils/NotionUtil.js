const { EmbedBuilder } = require('discord.js');
const { Client } = require("@notionhq/client")
const schedule = require('node-schedule');
const ConfigUtil = require('../Utils/ConfigUtil.js');
var { embedColor, maxPagePerMessage, id_wikiUpdateChannel } = require('../config.json');
require('dotenv').config()

class NotionUtil {

    static getClient() {
        return new Client({ auth: process.env.NOTION_TOKEN })
    }

    static async getUserList(notion) {
        const listUsersResponse = await notion.users.list({})
        const userList = listUsersResponse.results.filter(user => user.type == "person")
        return userList
    }

    static async getDatabaseList(notion) {
        const response = await notion.search({
            query: '',
            filter: {
                value: 'database',
                property: 'object'
            },
            sort: {
                direction: 'descending',
                timestamp: 'last_edited_time'
            }
        })
        var dbList = []
        response.results.forEach(db => {
            dbList.push(new DataBase(db.id, db.title[0]?.plain_text))
        })
        return dbList
    }

    static async queryModifiedPages(notion, dbList) {
        if (dbList.length == 0) return
        const lastNotionUpdate = ConfigUtil.getLastNotionUpdate()

        // Create an array to store promises for each database query
        const databaseQueryPromises = dbList.map(async (db) => {
            const databaseId = db.id;
            const response = await notion.databases.query({
                database_id: databaseId,
                filter: {
                    timestamp: "last_edited_time",
                    last_edited_time: {
                        after: lastNotionUpdate
                    }
                }
            })
            
            // Create an array to store promises for each PageInfo creation
            const pageInfoPromises = response.results.map(async (page) => {
                const pageInfo = new PageInfo(
                    page.url,
                    page.last_edited_by.id,
                    page.properties.Nom.title[0]?.plain_text
                )
                return pageInfo;
            })
            const pagesInfo = await Promise.all(pageInfoPromises)
            db.pagesInfo = pagesInfo;
            return db;
        })
        await Promise.all(databaseQueryPromises)
        dbList = await dbList.filter(db => db.pagesInfo.length > 0)
    }

    static generateEmbeds(store){
        var pagesLeft = maxPagePerMessage
        store.messages = []
        store.activeMessage = []

        store.dbList.forEach(db => {
            pagesLeft -= 1
            const pagesDB = db.pagesInfo.length
            if (pagesDB > maxPagePerMessage) { // Trop grand pour un message
                if (store.pushMessage()) pagesLeft = maxPagePerMessage
                store.messages.push([db.createUpdateEmbed(store.userList, maxPagePerMessage)])

            } else if (pagesDB > pagesLeft) { // Plus assez de place
                if (store.pushMessage()) pagesLeft = maxPagePerMessage-1
                store.activeMessage.push(db.createUpdateEmbed(store.userList, pagesLeft))
                pagesLeft -= pagesDB
            } else {
                store.activeMessage.push(db.createUpdateEmbed(store.userList))
                pagesLeft -= pagesDB
            }
        })
        store.messages.push(store.activeMessage)
    }

    static async queryUpdates(channel) {
        const notion = this.getClient()
        const store = new NotionUpdate()

        store.dbList = await this.getDatabaseList(notion)
        await this.queryModifiedPages(notion, store.dbList)
        
        if (store.dbList.length == 0) return false
        
        ConfigUtil.setLastNotionUpdate()
        store.userList = await this.getUserList(notion)
        this.generateEmbeds(store)

        store.publish(channel)
        return true
    }

    static scheduleNotionUpdate(client){
        const rule = new schedule.RecurrenceRule()
        rule.hour = 19
        rule.minute = 0
        rule.tz = 'CET';

        const task = schedule.scheduleJob(rule, async () => {
            this.queryUpdates(client.channels.cache.get(id_wikiUpdateChannel))
        });
        console.log("Notion Update has been scheduled")

        task.on('error', (error) => {
            console.error('An error occurred:', error)
        });
    }

}

class PageInfo {
    constructor(url, userID, title = 'Sans Titre'){
        this.url = url
        this.userID = userID
        this.title = title
    }

    getUserID(){
        return this.userID
    }

    getLinkString(){
        return `[${this.title}](${this.url})`
    }
}

class DataBase {
    constructor(id, title = 'Sans Titre'){
        this.id = id
        this.title = title
        this.pagesInfo = []
    }

    addPageInfo(pageInfo){
        this.pagesInfo.push(pageInfo)
    }

    createUpdateEmbed(userList, maxPages = 20){
        var text = ""

        const pagesList = this.pagesInfo.slice(0, maxPages)        
        pagesList.forEach(page => {
            text += page.getLinkString() + " - " + userList.find((user) => user.id = page.userID).name + "\n"
        })
        if (this.pagesInfo.length > maxPages) {
            text += `+ ${this.pagesInfo.length - maxPages} page(s)`
        }

        return new EmbedBuilder()
			.setColor(embedColor)
			.setTitle(this.title)
            .setDescription(text)
    }
}

class NotionUpdate {
    constructor() {
        this.userList;
        this.messages;
        this.activeMessage;
        this.dbList;
    }

    pushMessage() {
        if (this.activeMessage?.length > 0) {
            this.messages?.push(this.activeMessage)
            this.activeMessage = []
            return true
        }
        return false
    }

    async publish(channel) {
        const header = `## 📖 Update du Wiki (${NotionUpdate.getDateString()})`

        channel.send({ content: header, embeds: this.messages[0] })
        this.messages.slice(1).forEach(message => {
            channel.send({ embeds: message})
        })
    }

    static getDateString(date = new Date()){
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear().toString().slice(-2)

        return `${day}/${month}/${year}`
    }
}

module.exports = NotionUtil;