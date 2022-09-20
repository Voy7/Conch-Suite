const checkChannel = require('../checkChannel')
const checkVoice = require('../checkVoice')

module.exports = async (bot, message) => {
    if (checkChannel(bot, message) == false) return
    if (checkVoice(bot, message) == false) return
    if (!bot.queue.get(message.guild.id) || bot.queue.get(message.guild.id).songs.length <= 0) {
        message.channel.send(":x: `Nothing is playing stink ass.`")
        return
    }
    try {
        if (bot.loop == true) {
            bot.loop = false
            message.channel.send(":loop: `Loop mode: Disabled`")
        }
        else {
            bot.loop = true
            message.channel.send(":loop: `Loop mode: Enabled`")
        }
    }
    catch (error) {
        message.channel.send(":x: `Error:\n`" + error)
    }
}