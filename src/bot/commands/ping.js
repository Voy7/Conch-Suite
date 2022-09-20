const checkChannel = require('../checkChannel')

module.exports = async (bot, message) => {
    var msg = await message.channel.send(":ping_pong: `Pinging server...`") // Uses this to compare latency
    message.channel.send({embeds: [{
        color: bot.config.color,
        title: "Status Page",
        fields: [{
            name: "Results",
            value: 
                "Server Ping: **" + (msg.createdAt - message.createdAt) + " ms**" + "\n" +
                "API Latency: **" + Math.round(bot.ping) + " ms**"
        }]
    }]})
}