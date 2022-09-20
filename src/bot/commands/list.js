const checkChannel = require('../checkChannel')
const Discord = require('discord.js')

module.exports = async (bot, message) => {
    if (checkChannel(bot, message) == false) return
    if (!bot.queue.get(message.guild.id) || bot.queue.get(message.guild.id).songs.length <= 0) {
        message.channel.send({embeds: [{
            color: bot.config.color,
            title: "Music Player",
            fields: {
                name: "Error",
                value: ":x: There is nothing in the queue."
            }
        }]})
    }
    else {
        let embed = ""
        bot.queue.get(message.guild.id).songs.forEach(function (item, index) {
            if (index == 0) embed += `Current Song:\n**[${item.title}](${item.url})**\n \n`
            else embed += `${index}. **[${item.title}](${item.url})**\n`
        })
        message.channel.send({embeds: [{
            color: bot.config.color,
            title: "Music Player",
            fields: {
                name: "Server Queue",
                value: embed
            }
        }]})
    }
}