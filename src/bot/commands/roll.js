module.exports = (bot, message) => {
    if (message.content.split(" ")[1] > 0) {
        let n = Math.floor(Math.random() * message.content.split(" ")[1]) + 1
        message.channel.send(":control_knobs: `Rolled: " + n + "`")
	}
    else {
        let n = Math.floor(Math.random() * 6) + 1
        message.channel.send(":control_knobs: `Rolled: " + n + "`")
	}
}
