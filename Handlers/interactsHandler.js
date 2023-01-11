function loadInteracts(client) {
	const ascii = require("ascii-table")
	const fs = require("fs")
	const table = new ascii().setHeading("Interacts","Status")

	let interactsArray = []

	const interactFolders = fs.readdirSync("./Interactables")
	for (const folder of interactFolders) {
		const interactFiles = fs
			.readdirSync(`./Interactables/${folder}`)
			.filter((file) => file.endsWith(".js"))

		for (const file of interactFiles) {
			const interactFile = require(`../Interactables/${folder}/${file}`)

			client.interacts.set(interactFile.name, interactFile)

			interactsArray.push(interactFile)

			table.addRow(file, "🥳")
			continue
		}
	}

	return console.log(table.toString(),"\nLoaded interactables.")
}

module.exports = { loadInteracts }