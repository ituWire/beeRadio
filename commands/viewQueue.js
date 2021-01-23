const {prefix} = require("../config.json");
const Discord = require("discord.js")

module.exports = {
    name: "istekler",
    description: "Müzik botundaki sırayla çalacak olan şarkıları gösterir",
    usage: `${prefix}istekler`,
    adminOnly: false,
    channelOnly: false,
    guildOnly: true,
    dmAvailable: false,
    async execute(message,args,client,ops){
        try {
            let fetched = ops.active.get(message.guild.id);
            if(!fetched) throw `Şu anda aktif herhangi bir istek listesi yoktur.`

            let queue = fetched.queue;
            let title = `Şu anda çalan: ${queue[0].songInfo.title} | ${queue[0].requester} adlı kullanıcının isteği\n`;
            let response = ``;
            for(let i = 1; i<queue.length; i++){
                response += `${i}. Sıra: ${queue[i].songInfo.title} | ${queue[i].requester} adlı kullanıcının isteği \n`
            }

            const embed = new Discord.MessageEmbed()
                .setColor("GREEN")
                .setTitle(title)
                .setDescription(response);

            message.channel.send({embed: embed});

        } catch (error) {
            //console.log(error);
            message.reply(error);
        }
        
    }
}
