const Discord = require("discord.js")
const {prefix} = require("../config.json");

module.exports = {
    name: "geç",
    description: "Müzik botunda çalan şarkıyı geçmek için oylama yapmanızı sağlar.",
    usage: `${prefix}geç`,
    adminOnly: false,
    channelOnly: false,
    guildOnly: true,
    dmAvailable: false,
    async execute(message,args,client,ops){
        try {
            let fetched = ops.active.get(message.guild.id);
          
            if(!message.guild.me.voice) throw `Müzik botu herhangi bir kanalda değil.`;
          
            if(!fetched) throw `Müzik botunda şu anda müzik çalmıyor.`;
            
            if(!message.member.voice) throw `Bu komutu kullanabilmeniz için müzik botu ile aynı kanalda olmanız gerekir.`;
            
            if(message.guild.me.voice.channel.id !== message.member.voice.channel.id){
                throw `Bu komutu kullanabilmeniz için müzik botu ile aynı kanalda olmanız gerekir.`;
            } 
          
            let userCount = message.member.voice.channel.members.size;
            let required = Math.ceil(userCount / 2);
          
            if(!fetched.queue[0].voteSkippers) fetched.queue[0].voteSkippers = [];
            if(fetched.queue[0].voteSkippers.includes(message.member.id)){
               throw `Birden fazla oy kullanamazsınız. Oy durumu: ${fetched.queue[0].voteSkippers.length}/${required}`;
            }
            
            fetched.queue[0].voteSkippers.push(message.member.id);
          
            const voter = message.guild.members.cache.get(message.author.id);
            const embed = new Discord.MessageEmbed()
              .setColor("GREEN") 
              .setTitle(`${voter.user.username}, ${fetched.queue[0].songInfo.title} adlı şarkıyı geçmek için oyladı`)
              .setDescription(`Oy durumu: ${fetched.queue[0].voteSkippers.length}/${required}`)
            
            message.channel.send({embed: embed});
            
            ops.active.set(message.guild.id, fetched);
          
            if(fetched.queue[0].voteSkippers.length >= required){
                message.channel.send(`${fetched.queue[0].songInfo.title} adlı şarkı oylama sonucu geçiliyor...`);
              
                return fetched.dispatcher.emit("finish");
            }
            
          
        } catch (error) {
            //console.log(error);
            message.reply(error);
        }
        
    }
}