module.exports = async (bot, message) => {
    let args = message.content.split(" ")
    if (!args[1]) args[1] = "help"

    // Section for adding movies
    if (args[1].toLowerCase() == "add") {
        let results = []
        message.channel.send({ embed: { color: "8B0000", fields: [{ name: "Type The Movie Title", value: "Example: Blade Runner" }] } }).then(async function (sentMessage) {
            await message.channel.awaitMessages(function (message) { return message.author != bot.user }, { time: 3600000, max: 1 }).then(function (response) {
                try {
                    if (response.first().content == "cancel") response[0] = null; else if (response.first().content) results[0] = response.first().content; sentMessage.delete(); response.first().delete()
                } catch { }
            })
            if (results[0] == null) { message.channel.send(":octagonal_sign: `Action canceled.`"); return }
            message.channel.send({ embed: { color: "8B0000", fields: [{ name: "Provide a Movie Poster", value: "Give a link to an image (NEEDS TO BE A LINK)" }] } }).then(async function (sentMessage) {
                await message.channel.awaitMessages(function (message) { return message.author != bot.user }, { time: 3600000, max: 1 }).then(function (response) {
                    try {
                        if (response.first().content == "cancel") response[1] = null; else if (response.first().content) results[1] = response.first().content; sentMessage.delete(); response.first().delete()
                    } catch { }
                })
                if (results[1] == null) { message.channel.send(":octagonal_sign: `Action canceled.`"); return }
                message.channel.send({ embed: { color: "8B0000", fields: [{ name: "Type Date of Movie", value: "Example: November 20, 2020" }] } }).then(async function (sentMessage) {
                    await message.channel.awaitMessages(function (message) { return message.author != bot.user }, { time: 3600000, max: 1 }).then(function (response) {
                        try {
                            if (response.first().content == "cancel") response[2] = null; else if (response.first().content) results[2] = response.first().content; sentMessage.delete(); response.first().delete()
                        } catch { }
                    })
                    if (results[2] == null) { message.channel.send(":octagonal_sign: `Action canceled.`"); return }
                    if (!results[1].startsWith("http")) results[1] = "https://cdn.discordapp.com/attachments/692211326503616594/781628675195404298/102683616-movie-clapperboard-or-film-clapboard-line-art-vector-icon-for-video-apps-and-websites.png"
                    message.channel.send({ embed: { color: "8B0000", thumbnail: { url: results[1] }, fields: [{ name: "Title", value: results[0] }, { name: "Date", value: results[2] }], footer: { text: "Continue With This? (Y/N)" } } }).then(async function (sentMessage) {
                        await message.channel.awaitMessages(function (message) { return message.author != bot.user }, { time: 3600000, max: 1 }).then(function (response) {
                            try {
                                if (response.first().content) results[3] = response.first().content; sentMessage.delete(); response.first().delete()
                            } catch { }
                        })
                        if (results[3].toLowerCase() != "y") { message.channel.send(":octagonal_sign: `Action canceled.`"); return }
                        bot.fs.readFile(`${bot.config.webPath}movies.json`, 'utf8', function readFileCallback(err, data) {
                            if (err) throw err
                            else {
                                obj = JSON.parse(data)
                                obj.movies.unshift({ title: results[0], poster: results[1], date: results[2], upcoming: true })
                                json = JSON.stringify(obj)
                                bot.fs.writeFile(`${bot.config.webPath}movies.json`, json, (err) => {
                                    if (err) throw err
                                })
                            }
                        })
                        message.channel.send({ embed: { color: "8B0000", thumbnail: { url: results[1] }, fields: [{ name: "Title", value: results[0] }, { name: "Date", value: results[2] }], footer: { text: "Sucessfully Added to Website!" } } })
                    })
                })
            })
        })
    }

    // Section for removing movies
    else if (args[1].toLowerCase() == "remove") {
        let results = []
        message.channel.send({ embed: { color: "8B0000", fields: [{ name: "Type The Movie Title You Want to Remove", value: "Example: Blade Runner" }] } }).then(async function (sentMessage) {
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
                        console.log(item.title)
                        if (item.title.toLowerCase() != results[0].toLowerCase()) newObj.movies.push({ title: item.title, poster: item.poster, date: item.date, upcoming: item.upcoming })
                        else { message.channel.send({ embed: { color: "8B0000", thumbnail: { url: item.poster }, fields: [{ name: "Title", value: item.title }, { name: "Date", value: item.date }], footer: { text: "Sucessfully Removed From Website!" } } }); valid = true }
                    })
                    if (valid == true) {
                        json = JSON.stringify(newObj)
                        bot.fs.writeFile(`${bot.config.webPath}movies.json`, json, (err) => {
                            if (err) throw err
                        })
                    }
                    else message.channel.send(":x: `There is no movie with the title " + `"${results[0]}"` + "`")
                }
            })
        })
    }

    // Section for swapping "upcoming" status
    else if (args[1].toLowerCase() == "upcoming") {
        let results = []
        message.channel.send({ embed: { color: "8B0000", fields: [{ name: "Type The Movie Title You Want to Swap Upcoming Status", value: "Example: Blade Runner" }] } }).then(async function (sentMessage) {
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
                        console.log(item.title)
                        if (item.title.toLowerCase() == results[0].toLowerCase()) {
                            if (item.upcoming == true) { newObj.movies.push({ title: item.title, poster: item.poster, date: item.date, upcoming: false }); message.channel.send({ embed: { color: "8B0000", thumbnail: { url: item.poster }, fields: [{ name: "Title", value: item.title }, { name: "Date", value: item.date }], footer: { text: "Upcoming Status is Now: FALSE" } } }) }
                            else { newObj.movies.push({ title: item.title, poster: item.poster, date: item.date, upcoming: true }); message.channel.send({ embed: { color: "8B0000", thumbnail: { url: item.poster }, fields: [{ name: "Title", value: item.title }, { name: "Date", value: item.date }], footer: { text: "Upcoming Status is Now: TRUE" } } }) }
                            valid = true
                        }
                        else newObj.movies.push({ title: item.title, poster: item.poster, date: item.date, upcoming: item.upcoming })
                    })
                    if (valid == true) {
                        json = JSON.stringify(newObj)
                        bot.fs.writeFile(`${bot.config.webPath}movies.json`, json, (err) => {
                            if (err) throw err
                        })
                    }
                    else message.channel.send(":x: `There is no movie with the title " + `"${results[0]}"` + "`")
                }
            })
        })
    }

    // Section for viewing list of movies
    else if (args[1].toLowerCase() == "list") {
        bot.fs.readFile(`${bot.config.webPath}movies.json`, 'utf8', function readFileCallback(err, data) {
            if (err) throw err
            else {
                obj = JSON.parse(data)
                let list = ""
                obj.movies.forEach(function (item, index) {
                    if (item.upcoming == true) list += ":full_moon: `" + item.title + "`\n"
                    else list += ":new_moon: `" + item.title + "`\n"
                })
                message.channel.send({ embed: { color: "8B0000", fields: [{ name: "List of Movies:", value: list }] } })
            }
        })
    }

    // Help page
    else {
        message.channel.send({ embed: { color: "8B0000", fields: [{ name: "List of Movie Commands:", value: "`" + `${bot.config.webPrefix}movie add\n${bot.config.webPrefix}movie remove\n${bot.config.webPrefix}movie upcoming\n${bot.config.webPrefix}movie list` + "`" }] }})
    }
}