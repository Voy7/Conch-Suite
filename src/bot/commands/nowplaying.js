const checkChannel = require('../checkChannel')

module.exports = async (bot, message) => {
    if (checkChannel(bot, message) == false) return
    if (!bot.queue.get(message.guild.id) || bot.queue.get(message.guild.id).songs.length <= 0) {
        message.channel.send({embeds: [{
            color: bot.config.color,
            title: "Music Player",
            fields: {
                name: "Error",
                value: ":x: There is nothing in the queue."
            }
        }]})
    }
    else {
        let q = bot.queue.get(message.guild.id)
        q.textChannel.send({embeds: [{
            color: bot.config.color,
            title: "Music Player",
            thumbnail: {
                url: q.songs[0].thumbnail
            },
            fields: [{
                name: "Now Playing",
                value: `**[${q.songs[0].title}](${q.songs[0].url})**`
            },
            {
                name: "Duration",
                value: formatDuration(q.songs[0].duration),
                inline: true
            },
            {
                name: "Channel",
                value: q.songs[0].channel,
                inline: true
            },
            {
                name: "Queue",
                value: formatQueue(q.songs),
                inline: true
            }],
            footer: {
                text: "Requested by " + q.songs[0].requester.username,
                icon_url: q.songs[0].requester.avatarURL()
            }
        }]})
    }
}

function formatQueue(songs) {
    if (songs.length == 1) {
        return "None"
    }
    else {
        return songs.length - 1 + " Left"
    }
}

function formatDuration(secs) {
    if (secs) {
        let sec_num = parseInt(secs, 10)
        let hours = Math.floor(sec_num / 3600)
        let minutes = Math.floor(sec_num / 60) % 60
        let seconds = sec_num % 60
        return [hours,minutes,seconds]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v,i) => v !== "00" || i > 0)
            .join(":")
	}
    else {
        return "-/-"
	}
}