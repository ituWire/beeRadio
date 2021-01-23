const {prefix} = require("../config.json");
const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const search = require("yt-search");

module.exports = {
    name: "radyo",
    description: "Müzik botunun kanala katılmasını ve (opsiyonel) verdiğiniz url'deki müziği çalar.",
    usage: `${prefix}radyo (muzik-url)`,
    adminOnly: false,
    channelOnly: false,
    guildOnly: true,
    dmAvailable: false,
    async execute(message,args,client,ops){
        try {
            // Mesaj atan kişi bir seslisohbet kanalında mı ?
            if(!message.member.voice.channel) throw `Müzik botunu çağırabilmeniz için bir sesli sohbet kanalında olmanız gerekir !`;

            // Herhangi bir müzik urlsi input olarak verilmiş mi ?
            if(args[0]){
                // Verildi ise valid bir url mi ?
                let main_url;
                const reg = new RegExp(/https\:\/\/(?:\w{3}\.)?youtu(?:\.)?be(?:.com)?\/(?:watch\?v\=)?.+/);  
                
              
                const is_valid = reg.test(args[0])
                if(!is_valid) {
                    await search(args.join(' '), function(err,res){
                        if (err) throw err;
                        const startPoint = 0;
                        const endPoint = 10;
                        let videos = res.videos.slice(startPoint,endPoint); // Get the first 10 result
                        
                        let outp = ``;
                        for (let i = 0; i < videos.length; i++){
                          outp += `**[${i+1}.]** ${videos[i].title}\n`;
                        }
                      
                        const embed = new Discord.MessageEmbed()
                          .setColor("GREEN")
                          .setTitle(`Lütfen ${startPoint+1} ile ${endPoint} arasında bir sayı giriniz.`)
                          .setDescription(outp);
                      
                        message.channel.send({embed: embed})
                      
                        const filter = m => !isNaN(parseInt(m.content)) && parseInt(m.content) < (videos.length + 1) && parseInt(m.content) > 0;
                        const collector = message.channel.createMessageCollector(filter);
                      
                        collector.videos = videos;
                        collector.once("collect",function(m){
                            main_url = this.videos[parseInt(m.content) - 1].url
                            //console.log(main_url);
                            const comm = require("./play.js");
                            comm.execute(message,[main_url],client,ops);
                        });
                    });
                
                } else {
                    main_url = args[0];
                  
                    const info = await ytdl.getInfo(main_url);

                    let data = ops.active.get(message.guild.id) || {};
                    if(!data.connection) data.connection = await message.member.voice.channel.join();
                    if(!data.queue) data.queue = [];
                    data.guildID = message.guild.id;
                  
                    if((message.member.voice.channel.id !== message.guild.me.voice.channel.id)){
                        throw `Bu komutu kullanabilmeniz için bot ile aynı kanalda olmanız gerekir !`
                    }

                    data.queue.push({
                        songInfo: {
                            title: info.videoDetails.title,
                            thumbs: info.videoDetails.thumbnail.thumbnails,
                            uploader: info.videoDetails.author.name,
                            rawTime: parseInt(info.videoDetails.lengthSeconds),
                            uploadDate: info.videoDetails.uploadDate
                        },
                        requester: message.author.username,
                        url: main_url,
                        targetChannel: message.channel.id
                    })

                    if(!data.dispatcher){
                        playMusic(client,ops,data);
                    } else {

                        message.channel.send(`Sayın ${message.author.username}, istek parçanız **${info.videoDetails.title}** sıraya alındı.`)
                    }

                    ops.active.set(message.guild.id, data)
                }
            }
        } catch (e) {
            console.error(e);
            try{
                message.reply(e);
            } catch (err){
                console.error(err);
            }
        }
    }
}

async function playMusic(client,ops,data){

    let current = data.queue[0]
    let inf = current.songInfo


    // Önce parça bilgisini gönder
    const parsedTime = [`${Math.floor(inf.rawTime / 3600)} saat`, 
                        `${Math.floor(inf.rawTime / 60) - (Math.floor(inf.rawTime / 3600) * 60)} dakika`, 
                        `${inf.rawTime % 60} saniye`];
    let lengthInfo = `${parsedTime[1]} ${parsedTime[2]}**`
    if(!parsedTime[0].startsWith("0")) lengthInfo = `${parsedTime[0]} ` + lengthInfo
    lengthInfo = `Uzunluk: **` + lengthInfo;

    const embed = new Discord.MessageEmbed()
    .setColor('GREEN')
    .setTitle(`Çalıyor: ${inf.title}`)
    .setDescription(`Yükleyen: **${inf.uploader}**\n${lengthInfo}`)
    .setFooter(`Yüklenme Tarihi: ${inf.uploadDate} | ${current.requester} tarafından istek parça.`)
    .setThumbnail(inf.thumbs[inf.thumbs.length - 1].url);

    client.channels.cache.get(current.targetChannel).send({embed: embed})

    // Dispatcher objesini güncelle
    data.dispatcher = await data.connection.play(ytdl(current.url, {filter: "audioonly"}));
    data.dispatcher.guildID = data.guildID;

    data.dispatcher.once("finish", function(){
        finish(client,ops,this);
    })

}

function finish(client,ops,dispatcher){

    let fetched = ops.active.get(dispatcher.guildID);
    fetched.queue.shift();
    if (fetched.queue.length > 0){
        ops.active.set(dispatcher.guildID, fetched)
        playMusic(client,ops,fetched)
    } else {
        ops.active.delete(dispatcher.guildID)
    }
}
