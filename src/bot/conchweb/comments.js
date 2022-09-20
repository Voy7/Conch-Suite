module.exports = async (bot, message) => {
    let args = message.content.split(" ")
    if (!args[1]) args[1] = "help"

    // Section for set movie comments
    if (args[1].toLowerCase() == "set") {
        let results = []
        message.channel.send({ embed: { color: "8B0000", fields: [{ name: "Type The Movie Title You Want to Set Comments For", value: "Example: Blade Runner" }] } }).then(async function (sentMessage) {
            await message.channel.awaitMessages(function (message) { return message.author != bot.user }, { time: 3600000, max: 1 }).then(function (response) {
                try {
                    if (response.first().content == "cancel") response[0] = null; else if (response.first().content) results[0] = response.first().content; sentMessage.delete(); response.first().delete()
                } catch { }
            })
            if (results[0] == null) { message.channel.send(":octagonal_sign: `Action canceled.`"); return }
            bot.fs.readFile(`${bot.config.webPath}movies.json`, 'utf8', function readFileCallback(err, data) {
                if (err) throw err
                else {
                    obj = JSON.parse(data)
                    let newObj = { movies: [] }
                    let valid = false
                    obj.movies.forEach(function (item, index) {
                        if (item.title.toLowerCase() == results[0].toLowerCase()) {
                            json = JSON.stringify({ enableComments: item.title })
                            bot.fs.writeFile("src/conchweb/enableComments.json", json, (err) => {
                                if (err) throw err
                            })
                            message.channel.send({ embed: { color: "8B0000", thumbnail: { url: item.poster }, fields: [{ name: "Title", value: item.title }, { name: "Date", value: item.date }], footer: { text: "Comments Now Set For This Movie!" } } })
                            valid = true
                        }
                    })
                    if (valid != true) message.channel.send(":x: `There is no movie with the title " + `"${results[0]}"` + "`")
                }
            })
        })
    }

    // Section for turning comments off
    else if (args[1].toLowerCase() == "off") {
        json = JSON.stringify({ enableComments: "off" })
        bot.fs.writeFile("src/conchweb/enableComments.json", json, (err) => {
            if (err) throw err
        })
        message.channel.send({ embed: { color: "8B0000", fields: [{ name: "Comments Now Disabled", value: `Comments are now off until reset using: ${bot.config.webPrefix}comments set` }] } })
    }

    // Section for removing comments
    else if (args[1].toLowerCase() == "remove") {
        message.channel.send("`In development`")
    }

    // Help page
    else {
        message.channel.send({ embed: { color: "8B0000", fields: [{ name: "List of Movie Commands:", value: "`" + `${bot.config.webPrefix}comments set\n${bot.config.webPrefix}comments off\n${bot.config.webPrefix}comments remove` + "`" }] } })
    }
}