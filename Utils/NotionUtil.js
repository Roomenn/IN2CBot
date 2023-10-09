const { EmbedBuilder } = require('discord.js');
const { Client } = require("@notionhq/client")
const schedule = require('node-schedule');
const ConfigUtil = require('../Utils/ConfigUtil.js');
var { embedColor, maxPagePerMessage, maxPagePerDB, id_wikiUpdateChannel } = require('../config.json');
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
            db.nbPages = response.results.length
            const pages = response.results.slice(0, maxPagePerDB)

            // Create an array to store promises for each PageInfo creation
            const pageInfoPromises = pages.map(async (page) => {
                const name = page.properties.Name != null ? page.properties.Name : page.properties.Nom
                const pageInfo = new PageInfo(
                    page.public_url,
                    page.last_edited_by.id,
                    name?.title[0]?.plain_text
                )
                return pageInfo
            })
            const pagesInfo = await Promise.all(pageInfoPromises)
            db.pagesInfo = pagesInfo
            return db
        })
        await Promise.all(databaseQueryPromises)
        dbList = await dbList.filter(db => db.pagesInfo.length > 0)
        return dbList
    }

    static generateEmbeds(store){
        var pagesLeft = maxPagePerMessage
        store.messages = []
        store.activeMessage = []

        store.dbList.forEach(db => {
            const pagesDB = db.pagesInfo.length
            if (pagesDB > maxPagePerMessage) { // Trop grand pour un message
                if (store.pushMessage()) pagesLeft = maxPagePerMessage
                store.messages.push([db.createUpdateEmbed(store.userList, maxPagePerMessage)])

            } else if (pagesDB > pagesLeft) { // Plus assez de place
                if (store.pushMessage()) pagesLeft = maxPagePerMessage
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
        store.dbList = await this.queryModifiedPages(notion, store.dbList)
        store.sortDBList()
        
        if (store.dbList.length == 0) return false
        
        ConfigUtil.setLastNotionUpdate()
        // store.userList = await this.getUserList(notion)
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
        this.pagesInfo
        this.nbPages
    }

    addPageInfo(pageInfo){
        this.pagesInfo.push(pageInfo)
    }

    createUpdateEmbed(userList, maxPages = 16){
        var text = ""

        const pagesList = this.pagesInfo.slice(0, maxPages)
        if (pagesList.length == 0) return
        pagesList.forEach(page => {
            // const user = userList.find((user) => user.id == page.userID)
            text += page.getLinkString() + "\n"
        })
        if (this.nbPages > maxPagePerDB) {
            text += `+ ${this.nbPages - this.pagesInfo.length} page(s)`
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

    async sortDBList() {
        dbList.sort(function (a, b) {
            if (a.title < b.title) {
                return -1;
            }
            if (a.title > b.title) {
                return 1;
            }
            return 0;
        });
    }

    async publish(channel) {
        const header = `## 📖 Update du Wiki (${NotionUpdate.getDateString()})`

        channel.send({ content: header, embeds: this.messages[0] })
        this.messages.slice(1).forEach(message => {
            const embeds = message.filter(embed => embed != undefined)
            if (embeds.length == 0) return
            channel.send({ embeds: embeds})
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