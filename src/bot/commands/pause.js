const checkChannel = require('../checkChannel')
const checkVoice = require('../checkVoice')

module.exports = async (bot, message) => {
    if (checkChannel(bot, message) == false) return
    if (checkVoice(bot, message) == false) return
    try {
        bot.queue.get(message.guild.id).player.pause()
        message.channel.send(":pause_button: `Stopping the music.`")
    }
    catch {
        message.channel.send(":x: `Nothing is playing?`")
    }
}