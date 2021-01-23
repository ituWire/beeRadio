const fs = require("fs");
const Discord = require("discord.js");
const {prefix} = require("../config.json");

module.exports = {
  name: "komutlar",
  description: `Kullanılabilir tüm komutları açıklamaları ile birlikte döndürür.
isteğe bağlı olarak özel bir komut veya komutlar için aratılabilir.`,
  usage: `${prefix}komutlar [komut-isimleri] || ${prefix}komutlar`,
  guildOnly: false,
  channelOnly: false,
  adminOnly: false,
  channel: "",
  execute(message,args,client,ops) {
    let mainEmbed = new Discord.MessageEmbed()
      .setColor("DARK_GREEN")
      .setTitle(`${message.guild.me.user.username} komutları`)
      
      
    let blocks = read(args);
    blocks.forEach(block => {
        mainEmbed.addField(`${prefix}${block.name}`,`${block.description}`);
    });
    
    message.channel.send({embed: mainEmbed});
  }
};

function read(args) {
  let result = [];
  const commandFiles = fs
    .readdirSync("./commands")
    .filter(file => file.endsWith(".js"));

  for (const commandFile of commandFiles) {
    let {name, description, usage, adminOnly} = require(`./${commandFile}`);
    if ((args.length !== 0 && !args.includes(name)) || adminOnly) continue;

    result.push({ name, description, usage });
  }

  return result;
}