module.exports = (bot, message) => {
    let n = Math.floor(Math.random() * 2) + 1
    if (n == 1) message.channel.send(":control_knobs: `Heads!`")
    if (n == 2) message.channel.send(":control_knobs: `Tails!`")
}
