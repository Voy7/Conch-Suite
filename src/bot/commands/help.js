const checkChannel = require('../checkChannel')

module.exports = async (bot, message) => {
    message.channel.send({embeds: [{
        color: bot.config.color,
        title: "Help Page",
        fields: [{
            name: ":arrow_right: Music Commands",
            value: 
                "`" + bot.config.prefix + "play` " +
                "`" + bot.config.prefix + "skip` " +
                "`" + bot.config.prefix + "leave` " +
                "`" + bot.config.prefix + "pause` " +
                "`" + bot.config.prefix + "unpause` " +
                "`" + bot.config.prefix + "queue` " +
                "`" + bot.config.prefix + "search` " +
                "`" + bot.config.prefix + "nowplaying` " +
                "`" + bot.config.prefix + "remove` ",
        },
        {
            name: ":arrow_right: Miscellaneous Commands",
            value: 
                "`" + bot.config.prefix + "ping` " +
                "`" + bot.config.prefix + "flip` " +
                "`" + bot.config.prefix + "roll` ",
        },
        {
            name: ":link: Invite Link",
            value: "[Click here for an invite link](https://discordapp.com/oauth2/authorize?client_id=601565181553803275&scope=bot&permissions=8)"
        }],
        footer: {text: "Made by Voy - Version " + bot.package.version}
    }]})
}