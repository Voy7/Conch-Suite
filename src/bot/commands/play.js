const checkChannel = require("../checkChannel")
const checkVoice = require("../checkVoice")
const unpause = require("./unpause")

const fileThumbnail = "https://cdn.discordapp.com/attachments/692211326503616594/702426388573061150/file_icon.jpg"
var leaveTimer

module.exports = async (bot, message) => {
    if (checkChannel(bot, message) == false) return
    if (checkVoice(bot, message) == false) return
    let query = message.content.substring(message.content.split(" ")[0].length + 1)
    if (!query && !message.attachments.first()) { // Just command, and no files attached.
        unpause(bot, message); return
    }
    // If bot got disconnected, and it's not in the vc, reset it.
    if (notInChannel(bot, message)) {
        await bot.queue.get(message.guild.id).connection.end()
        bot.queue.delete(message.guild.id)
    }
    // Check if a file is attached.
    if (message.attachments.first()) {
        let file = message.attachments.first()
        addQueue(bot, message, file.url, "File", file.name, "-/-", message.author, null, fileThumbnail)
    }
    // Check if it's a file with a proper ending
    else if (query.endsWith(".mp3") || query.endsWith(".mp4") || query.endsWith(".wav") || query.endsWith(".ogg") || query.endsWith(".webm") || query.endsWith(".mov") || query.endsWith(".MP3") || query.endsWith(".MP4")) {
        let name = query.split("/")[query.split("/").length - 1]
        addQueue(bot, message, query, "File", name, "-/-", message.author, null, fileThumbnail)
    }
    // Check if it's a YouTube playlist.
    else if (query.match(/youtube.com\/playlist/)) {
        const playlist = await bot.youtube.getPlaylist(query)
        const videos = await playlist.getVideos()
        videos.forEach(function (item, index) {
            addQueue(bot, message, item.url, "YouTube", item.title, item.channel.title, message.author, 0, item.thumbnails.high.url)
        })
    }
    // Check if it's a normal YouTube video.
    else if (query.match(/youtube.com\/watch/) || query.match(/youtu.be\//)) {
        try {
            const video = await bot.youtube.getVideo(query)
            const videoExtra = await bot.ytdl.getInfo(query)
            addQueue(bot, message, query, "YouTube", video.title, video.channel.title, message.author, videoExtra.videoDetails.lengthSeconds, video.thumbnails.high.url)
        }
        catch (error) {
            let e = error + ""
            if (e.startsWith("Error: Error parsing config")) {
                message.channel.send(":repeat: `Error getting data, retrying...`")
                bot.play(bot, message)
		    }
            else message.channel.send(":x: `" + error + "`")
        }
    }
    // I have no idea what it is, look it up on YouTube.
    else {
        try {
            message.channel.send(':mag_right: `Searching "' + query + '"...`')
            const video = await bot.youtube.searchVideos(query)
            let url = await "https://youtube.com/watch?v=" + video[0].id
            try {
                const videoExtra = await bot.ytdl.getInfo(url)
                addQueue(bot, message, url, "YouTube", video[0].title, video[0].channel.title, message.author, videoExtra.videoDetails.lengthSeconds, video[0].thumbnails.high.url)
            }
            catch (error) {
                let e = error + ""
                if (e.startsWith("Error: Error parsing config")) {
                    message.channel.send(":repeat: `Error getting data, retrying...`")
                    bot.play(bot, message)
				}
                else message.channel.send(":x: `" + error + "`")
            }
        }
        catch (error) {
            message.channel.send(":x: `No search results found for: " + query + "`")
            console.log("E: " + error)
        }
    }
}

// Add stuff from above into the queue.
function addQueue(bot, message, query, type, title, channel, requester, duration, thumbnail) {
    try {
        const song = {
            url: query + "",
            type: type,
            title: title,
            channel: channel,
            requester: requester,
            duration: duration,
            thumbnail: thumbnail
        }
        const serverQueue = bot.queue.get(message.guild.id)
        if (!serverQueue || !serverQueue.songs[0]) { // If nothing is in the queue, Make set textChannel/voiceChannel.
            const queueContruct = {
                textChannel: message.channel,
                voiceChannel: message.member.voice.channel,
                connection: null,
                songs: [],
            }
            queueContruct.songs.push(song)
            bot.queue.set(message.guild.id, queueContruct)
            playQueue(bot, message) // After pushing things into queue, execute play function.
        }
        else { // Something is already playing, send queue message and don't execute play function.
            serverQueue.songs.push(song)
            message.channel.send({embeds: [{
                color: bot.config.color,
                fields: {
                    name: formatPosition(bot.queue.get(message.guild.id).songs.length - 1),
                    value: `**[${song.title}](${song.url})**`
                }
            }]})
        }
    }
    catch (error) { console.log("ERROR: " + error) }
}

// The function that plays the stuff in the queue, should only be executed once at a time.
function playQueue(bot, message) {
    let q = bot.queue.get(message.guild.id)
    if (!q.songs[0]) {
        bot.queue.delete(message.guild.id)
        message.channel.send(":white_check_mark: `Everything in the queue has been played.`")
        clearTimeout(leaveTimer)
        leaveTimer = setTimeout(function () { // Nothing has been playing after x seconds, make bot leave vc.
            if (!q.songs[0]) {
                bot.voiceControl.getVoiceConnection(message.guild.id).disconnect()
            }
        }, bot.config.idleLeaveChannel)
        return
    }
    clearTimeout(leaveTimer)

    // Bot joins voice channel.
    q.connection = bot.voiceControl.joinVoiceChannel({
        channelId: q.voiceChannel.id,
        guildId: q.voiceChannel.guild.id,
        adapterCreator: q.voiceChannel.guild.voiceAdapterCreator
    })
    
    // Create the resource (aka ytdl-core, or normal file)
    if (q.songs[0].type == "YouTube") var resource = bot.voiceControl.createAudioResource(bot.ytdl(q.songs[0].url, { filter: "audioonly", quality: "highestaudio", highWaterMark: 1 << 25 }), { highWaterMark: 1 })
    if (q.songs[0].type == "File") var resource = bot.voiceControl.createAudioResource(q.songs[0].url, { inlineVolume: true, highWaterMark: 1 })

    // Attach resource to audio player and handle the "on" stuff.
    q.player = bot.voiceControl.createAudioPlayer()
    q.connection.subscribe(q.player)
    q.player.play(resource, { seek: 0, volume: 1.0 })
    q.player.on("idle", () => {
        if (bot.loop == false) q.songs.shift()
        playQueue(bot, message)
    })
    q.player.on("error", err => {
        console.log(err)
    })
    if (bot.loop == false) q.textChannel.send(":notes: `Now playing in " + q.voiceChannel.name + ":`\n__**" + q.songs[0].title + "** - *" + q.songs[0].channel + "*__")
}

// Return if bot and author are not in same vc.
function notInChannel(bot, message) {
    if (!bot.queue.get(message.guild.id)) {
        bot.voice.adapters.forEach(channel => {
            if (channel == message.member.voice.channel.id) return true
        })
    }
}

function formatQueue(songs) {
    if (songs.length == 1) return "None"
    else return songs.length - 1 + " Left"
}

function formatPosition(int) {
    return "Position in Queue: " + int
}