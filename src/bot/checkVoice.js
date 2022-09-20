module.exports = (bot, message) => {
    const q = bot.queue.get(message.guild.id)
    if (q) {
        if (q.voiceChannel == message.member.voice.channel) {
            return true
        }
        else {
            message.channel.send(":x: `You are not in the same voice channel as the bot.`")
            return false
        }
    }
    if (!message.member.voice.channel) {
        message.channel.send(":x: `You are not in a voice channel.`")
        return false
    }
    else {
        return true
    }
}