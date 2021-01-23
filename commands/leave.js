const {prefix} = require("../config.json");
const Discord = require("discord.js")

module.exports = {
    name: "kapat",
    description: "Müzik botunu kapatmanızı sağlar",
    usage: `${prefix}kapat`,
    adminOnly: false,
    channelOnly: false,
    guildOnly: true,
    dmAvailable: false,
    async execute(message,args,client,ops){
        try {
            if(!message.guild.me.voice.channel) throw `Müzik botu herhangi bir kanalda değil !`

            if(!message.member.voice.channel || (message.member.voice.channel.id !== message.guild.me.voice.channel.id)){
                throw `Müzik botunu kapatabilmeniz için bot ile aynı kanalda olmanız gerekir !`
            }

            message.guild.me.voice.channel.leave();
            ops.active.clear();

            message.channel.send(`Görüşürüz **ヾ(⌐■_■)ノ♪**`)

        } catch (error) {
            //console.log(error);
            message.reply(error);
        }
        
    }
}