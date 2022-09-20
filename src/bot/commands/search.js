const checkChannel = require("../checkChannel")
const checkVoice = require("../checkVoice")
const play = require("./play")

module.exports = async (bot, message) => {
    if (checkChannel(bot, message) == false) return
    if (checkVoice(bot, message) == false) return
    let query = message.content.substring(message.content.split(" ")[0].length + 1)
    if (!query) {
        message.channel.send(":x: `Usage: " + bot.config.prefix + "search (Video Title)`"); return
    }
    try {
        const video = await bot.youtube.searchVideos(query)
        message.channel.send({embeds: [{
            color: bot.config.color,
            title: "Music Player",
            fields: [{
                name: "Search Results",
                value: `
                    1. **[${video[0].title}](${video[0].url})**
                    2. **[${video[1].title}](${video[1].url})**
                    3. **[${video[2].title}](${video[2].url})**
                    4. **[${video[3].title}](${video[3].url})**
                    5. **[${video[4].title}](${video[4].url})**`
            }],
            footer: {text: 'Type the number you would like to play or type "cancel".'}
        }]})
            .then(function (searchMessage) {
                const filter = response => response.author.id == message.author.id
                const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 })

                collector.on("collect", msg => {
                    searchMessage.delete(); msg.delete()
                    if (msg.content >= 1 && msg.content <= 5) {
                        newMsg = msg
                        newMsg.content = bot.config.prefix + "play " + video[parseInt(msg.content) - 1].url
                        play(bot, newMsg)
                    }
                    else {
                        message.channel.send(":octagonal_sign: `Canceled search listener.`")
                    }
                })
        }) 
	}
    catch (error) {
        message.channel.send(":x: `No search results found for: " + query + "`")
	}
}