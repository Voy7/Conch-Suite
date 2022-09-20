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
        await bot.queue.get(message.guild.id).player.unpause()
        await bot.queue.get(message.guild.id).player.stop()
        message.channel.send(":track_next: `Skipping to the next song.`")
    }
    catch (error) {
        message.channel.send(":x: `Error:\n`" + error)
    }
}