module.exports = async (bot, server) => {
    setInterval(() => {
        bot.fs.readFile(`./src/web/json/discord.json`, 'utf8', function readFileCallback(err, data) {
            if (err) throw err
            else {
                info = {}
                info.users = []
                info.server = {
                    id: server.id,
                    name: server.name
                }
                server.members.cache.forEach(member => {
                    if (member.user.bot != true)
                    info.users.push({
                        id: member.user.id,
                        name: member.user.username,
                        nickname: member.nickname,
                        image: member.user.avatarURL(),
                    })
                })
                bot.fs.writeFile(`./src/web/json/discord.json`, JSON.stringify(info), (err) => {
                    if (err) throw err
                })
            }
        })
    }, bot.config.webUpdateCacheSeconds * 1000)
}