const checkChannel = require('../checkChannel')
const checkVoice = require('../checkVoice')

module.exports = async (bot, message) => {
    if (checkChannel(bot, message) == false) return
    if (checkVoice(bot, message) == false) return
    if (!bot.queue.get(message.guild.id) || bot.queue.get(message.guild.id).songs.length <= 0) {
        message.channel.send(":x: `There is nothing in the queue.`")
        return
    }
    try {
        message.channel.send(":x: `This feature will come if people want it. - Voy`")
    }
    catch (error) {
        message.channel.send(":x: `Error:\n`" + error)
    }
}