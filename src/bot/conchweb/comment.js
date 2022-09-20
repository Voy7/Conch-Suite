const reactionNumbers = ["\u0031\u20E3", "\u0032\u20E3", "\u0033\u20E3", "\u0034\u20E3", "\u0035\u20E3", "\u0036\u20E3", "\u0037\u20E3", "\u0038\u20E3", "\u0039\u20E3"]

module.exports = async (bot, message) => {
    let args = message.content.split(" ")
    let obj = ""

    bot.fs.readFile("src/conchweb/enableComments.json", 'utf8', async function readFileCallback(err, data) {
        if (err) throw err
        else obj = JSON.parse(data)
        if (obj.enableComments == "off") {
            message.channel.send(":x: `Comments are currentlly turned off.`")
            return
        }
        var hasCommented = false
        bot.fs.readFile(`${bot.config.webPath}comments.json`, 'utf8', function readFileCallback(err, data) {
            if (err) throw err
            else {
                obj2 = JSON.parse(data)
                obj2.comments.forEach(item => {
                    if (item.movie == obj.enableComments && item.name == message.author.username) {
                        message.channel.send(":x: `You have already commented on the movie.`")
                        hasCommented = true
                        return false
                    }
                })
            }
            if (hasCommented == true) return
            else {
                message.react(bot.emojis.resolveID("\u2705"))
                let status = obj
                let results = []
                message.author.send({ embed: { color: "8B0000", fields: [{ name: `How Would You Rate "${obj.enableComments}"?`, value: "Click the number you would rate the movie." }] } }).then(async function (sentMessage) {
                    let valid = false
                    for (let step = 0; step < 5; step++) {
                        await sentMessage.react(bot.emojis.resolveID(reactionNumbers[step]))
                    }
                    await sentMessage.awaitReactions(async function (reaction) {
                        await reaction.users.cache.forEach(async function (item, index) {
                            if (item.id != bot.user.id) {
                                if (valid == false) {
                                    valid = true
                                    for (let step = 0; step < 5; step++) {
                                        if (reaction.emoji.name == bot.emojis.resolveID(reactionNumbers[step])) {
                                            sentMessage.delete()
                                            results[0] = (step + 1)
                                            message.author.send({ embed: { color: "8B0000", fields: [{ name: "What is Your Comment?", value: "Type a comment you want to go along with your rating." }] } }).then(async function (sentMessage) {
                                                await sentMessage.channel.awaitMessages(function (message) { return message.author != bot.user }, { time: 3600000, max: 1 }).then(function (response) {
                                                    try {
                                                        if (response.first().content == "cancel") response[1] = null; else if (response.first().content) results[1] = response.first().content; sentMessage.delete();
                                                    } catch { }
                                                })
                                                if (results[1] == null) { message.author.send(":octagonal_sign: `Action canceled.`"); return }
                                                bot.fs.readFile(`${bot.config.webPath}comments.json`, 'utf8', function readFileCallback(err, data) {
                                                    if (err) throw err
                                                    else {
                                                        obj = JSON.parse(data)
                                                        obj.comments.push({ movie: status.enableComments, name: message.author.username, image: message.author.avatarURL(), rating: results[0], comment: results[1] })
                                                        json = JSON.stringify(obj)
                                                        bot.fs.writeFile(`${bot.config.webPath}comments.json`, json, (err) => {
                                                            if (err) throw err
                                                        })
                                                    }
                                                })
                                                message.author.send({ embed: { color: "8B0000", fields: [{ name: `Rating: ${results[0]}.0  :star:`, value: `"${results[1]}"` }], footer: { text: "Sucessfully Added to Website!" } } })
                                            })
                                        }
                                    }
                                }
                            }
                        })
                    },
                        {
                            time: 360000, // 6 minutes
                            max: 3 // bot's reaction is detected, so I have to do a stupid work-around.
                        }).then(async function (response) {
                            try { }
                            catch {
                                if (valid == false) return
                            }
                        })
                })
            }
        })
    })
}