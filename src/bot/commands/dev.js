module.exports = (bot, message) => {
    let q = bot.queue.get(message.guild.id)
    console.log(q)
}
