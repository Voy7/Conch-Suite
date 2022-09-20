// Import node modules and config/package files.
const { Client, Intents } = require("discord.js")
const voiceControl = require("@discordjs/voice")
const config = require("../config.json")
const package = require("../package.json")
const YoutubeAPI = require("simple-youtube-api")
const youtube = new YoutubeAPI(config.youtubeAPI)
const ytdl = require("ytdl-core")
const http = require("http")
const socketIO = require("socket.io")
const fs = require("fs")
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path
const ffmpeg = require("fluent-ffmpeg")
ffmpeg.setFfmpegPath(ffmpegPath)
require("colors")

const queue = new Map()

console.log(`Launching ConchSuite v${package.version}...`.yellow)

// Create new Discord bot.
var bot
if (config.statusMobile == true) { bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES], ws: { properties: { $browser: "Discord iOS" } }}) }
else { bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] }) }
bot.login(config.token)

// Get commands from folder and put it into command array.
bot.commands = new Map()
fs.readdir("./src/bot/commands/", (err, files) => {
    if (err) return console.error(err)
    files.forEach(file => {
        if (!file.endsWith(".js")) return
        let command = require(`./bot/commands/${file}`)
        let commandName = file.split(".")[0]
        bot.commands.set(commandName, command)
    })
})

// Make these packages usable anywhere under bot element.
bot.config = config
bot.package = package
bot.ytdl = ytdl
bot.youtube = youtube
bot.queue = queue
bot.fs = fs
bot.voiceControl = voiceControl
bot.loop = false

// Startup logic
bot.on("ready", async () => {
    bot.user.setActivity(`${bot.config.statusMessage}`, { type: bot.config.statusType })
    console.log(`${bot.user.username} is now online.`.green)
})

// Message event listener for commands
bot.on("messageCreate", message => {
    if (message.author == bot.user) return
    if (!message.content.toLowerCase().startsWith(bot.config.prefix)) return

    // If a command in /bot/commands exists with the provided text, execute automatically
    let cmd = message.content.toLowerCase().replace(bot.config.prefix, "")
    let cmdParsed = message.content.toLowerCase().replace(bot.config.prefix, "") + " "
    let executed = false
    bot.commands.forEach(function (item, index) {
        if (cmdParsed.startsWith(index + " ")) {
            item(bot, message)
            executed = true
        }
    })
    if (executed == true) return

    // Section for command aliases
    else if (cmdParsed.startsWith("p ")) bot.commands.forEach(function (c, i) { if (i == "play") { c(bot, message) } })
    else if (cmdParsed.startsWith("resume ")) bot.commands.forEach(function (c, i) { if (i == "unpause") { c(bot, message) } })
    else if (cmdParsed.startsWith("stop ")) bot.commands.forEach(function (c, i) { if (i == "pause") { c(bot, message) } })
    else if (cmdParsed.startsWith("q ")) bot.commands.forEach(function (c, i) { if (i == "list") { c(bot, message) } })
    else if (cmdParsed.startsWith("s ")) bot.commands.forEach(function (c, i) { if (i == "search") { c(bot, message) } })
    else if (cmdParsed.startsWith("np ")) bot.commands.forEach(function (c, i) { if (i == "nowplaying") { c(bot, message) } })

    // Normal prefix for Conch Web commands
    //else if (cmdParsed.startsWith("comment ")) webComment(bot, message)
})

// When bot leaves voice channel (not including moving), delete song queue.
bot.on("voiceStateUpdate", (oldMember, newMember) => {
    if (!newMember.channelId && newMember.id == bot.user.id) {
        bot.queue.delete(newMember.guild.id)
    }
})

// Everything below will only execute if webEnabled = true.
if (config.webEnabled != true) return
const webUpdateCache = require("./bot/conchweb/updateCache")

// Web Discord users cache updater
bot.on("ready", async () => {
    let check = false
    bot.guilds.cache.forEach(server => {
        if (server.id == bot.config.webDiscordServer) {
            webUpdateCache(bot, server)
            check = true
        }
    })
    if (check == false) console.log(`No Discord Server linked to Conch Website.`.red)
})

// ConchWeb message listener for commands
//bot.on("messageCreate", message => {
//    if (message.author == bot.user) return
//    if (!message.content.toLowerCase().startsWith(bot.config.webPrefix)) return
//    let cmd = message.content.toLowerCase() + " "
//    if (cmd.startsWith(bot.config.webPrefix + "help ")) webHelp(bot, message)
//    else if (cmd.startsWith(bot.config.webPrefix + "movie ")) webMovie(bot, message)
//    else if (cmd.startsWith(bot.config.webPrefix + "comments ")) webComments(bot, message)
//})

// Create website.
const server = http.createServer(function (req, res) {
    // Custom URLs
    if (req.url == "/") getFile("nav/home.html", "html", req, res)
    else if (req.url == "/movienight") getFile("nav/home.html", "html", req, res)

    // All file types, not for custom URLs
    else fs.readFile("./src/web/" + req.url, function (err, data) {
        if (!err) {
            var dotoffset = req.url.lastIndexOf(".")
            var mimetype = dotoffset == -1
                ? "text/plain"
                : {
                    ".html": "text/html",
                    ".ico": "image/x-icon",
                    ".jpg": "image/jpeg",
                    ".png": "image/png",
                    ".gif": "image/gif",
                    ".css": "text/css",
                    ".js": "text/javascript",
                    ".json": "application/json"
                }[req.url.substr(dotoffset)];
            res.setHeader("Content-type", mimetype)
            res.end(data)
            //console.log(req.url, mimetype)
        } else {
            //console.log("file not found: " + req.url)
            res.writeHead(404, "Page Not Found")
            res.end()
        }
    })
})

server.listen(config.webPort, function (error) {
    if (error) console.log("ERROR", error)
    else console.log(`Web server listening on port ${config.webPort}.`.green)
})

function getFile(file, type, req, res) {
    res.writeHead(200, { "Content-Type": `text/${type}` })
    fs.readFile(`src/web/${file}`, function (error, data) {
        if (error) res.writeHead(404, "Page Not Found")
        else res.end(data)
    })
}

io = socketIO(server);

io.sockets.on("connection", function (socket) {
    socket.on("do-something", function (data) {
        console.log(data.account)
    })
})