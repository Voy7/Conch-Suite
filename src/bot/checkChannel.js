module.exports = (bot, message) => {
    if (bot.config.onlyBotChannels == true) {
        let c = ("" + message.channel.name).replace("-", " ").split(" ");
        if (c.includes("bot") || c.includes("music")) return true;
        else {
            message.channel.send(":x: `You can only use commands in bot channels.`");
            return false;
        }
    }
}