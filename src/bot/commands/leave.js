const checkChannel = require('../checkChannel')
const checkVoice = require('../checkVoice')

module.exports = async (bot, message) => {
    if (checkChannel(bot, message) == false) return
    if (checkVoice(bot, message) == false) return
    try {
        bot.voiceControl.getVoiceConnection(message.guild.id).disconnect()
        message.channel.send(":stop_button: `Stopping the music and disconnecting.`")
    }
    catch { }
}