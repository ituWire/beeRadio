const Discord = require("discord.js");
const { prefix, token, guildId } = require("./config.json");
const fs = require("fs");
const cron = require("cron");
const ytdl = require("ytdl-core");

const client = new Discord.Client();
const active = new Map();

client.commands = new Discord.Collection();
const command_files = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of command_files){
  console.log(file);
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on("ready", () => {
  console.log("Ready to go sir !");
});

client.on("message", message => {
  try {
    // Check if message is a command
    if (!message.content.startsWith(prefix)){
      return;
    }

    const args = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    // Check if there is such a command
    if (!client.commands.has(commandName)){
      return;
    }

    const command = client.commands.get(commandName);

    // Check the requirements of the command

    let adminRole;
    if (message.guild !== null) {
      adminRole = message.guild.roles.cache.get("763319365625970689"); //758939878288261132
    }

    if (command.guildOnly && message.channel.type === "dm") {
      throw `This command cannot run via direct message.`;
    }

    if (command.channelOnly) {
      if (message.channel.type === "dm") {
        if (!command.dmAvailable) {
          throw `Bu komut özel mesaj yoluyla çalışmamaktadır !`;
        }
      } else {
        if (message.channel.name !== command.channel) {
          throw `Bu komut sunucuda sadece **${command.channel}** kanalında çalışmaktadır !`;
        }
      }
    }

    if (
      command.adminOnly &&
      !message.member.roles.cache.array().includes(adminRole)
    ) {
      throw `This command is only for admin's usage !`;
    }

    // Execute the command

    let ops = {
      active: active
    };

    command.execute(message, args,client, ops)

    if(!message.guild.me.voice.channel) return;

    if(ops.active.size) return;

    let timeoutID;
    timeoutID = setTimeout(function(){
      message.guild.me.voice.channel.leave();
    }, 10);
   

  } catch (err) {
    console.log(err);
  }
});

client.login(token);
