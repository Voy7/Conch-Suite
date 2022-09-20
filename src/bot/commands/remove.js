const checkChannel = require('../checkChannel')
const checkVoice = require('../checkVoice')

module.exports = async (bot, message) => {
    if (checkChannel(bot, message) == false) return
    if (checkVoice(bot, message) == false) return
    if (!bot.queue.get(message.guild.id) || bot.queue.get(message.guild.id).songs.length <= 0) {
        message.channel.send(":x: `There is nothing in the queue.`")
        return
    }
    let args = message.content.split(" ")
    if (!args[1]) {
        message.channel.send(":x: `Usage: " + bot.config.prefix + "remove (Number)`")
        return
    }
    try {
        if (bot.queue.get(message.guild.id).songs[args[1]]) {
            bot.queue.get(message.guild.id).songs.splice(args[1], 1)
            message.channel.send(":fire:  `Removed song " + args[1] + " from the queue.`")
        }
        else message.channel.send(":x: `That number is not associated with any song in the queue.`")
    }
    catch (error) {
        console.log(error)
        message.channel.send(":x: `ERROR:" + error + "`")
    }
}