require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  ActivityType,
  EmbedBuilder,
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// Create bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// ===============================
// LOAD COMMANDS
// ===============================

const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);

      console.log(`✅ Loaded /${command.data.name}`);
    }
  }
}

// ===============================
// BOT READY
// ===============================

client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ CTF Bot online as ${readyClient.user.tag}`);

  readyClient.user.setPresence({
    activities: [
      {
        name: "CTF Challenges | /challenge",
        type: ActivityType.Playing,
      },
    ],
    status: "online",
  });

  console.log("🟢 Status: CTF Challenges | /challenge");
});

// ===============================
// AUTOMATIC WELCOME SYSTEM
// ===============================

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channel = member.guild.channels.cache.get(
      process.env.WELCOME_CHANNEL_ID
    );

    if (!channel) {
      console.log("❌ Welcome channel not found.");
      return;
    }

    const memberNumber = member.guild.memberCount;

    const welcomeEmbed = new EmbedBuilder()
      .setTitle("🌐 WELCOME TO THE GLOBAL CYBERSECURITY COMMUNITY")
      .setDescription(
        `👋 Welcome ${member}!\n\n` +
        `You are the **${memberNumber}th member** to join our community. 🌍`
      )
      .addFields(
        {
          name: "🚀 OUR MISSION",
          value:
            "💻 **LEARN**\n" +
            "🔐 **PRACTICE**\n" +
            "🧠 **SHARE**\n" +
            "🎯 **COMPETE**\n" +
            "🛡️ **DEFEND**\n" +
            "🚀 **BUILD**",
          inline: true,
        },
        {
          name: "🚀 START YOUR JOURNEY",
          value:
            "📜 Read the rules\n" +
            "🛡️ Complete verification\n" +
            "🎭 Choose your roles\n" +
            "👋 Introduce yourself\n" +
            "📚 Explore the Learning Hub\n" +
            "🏆 Enter the CTF Arena",
          inline: true,
        },
        {
          name: "⚠️ COMMUNITY CODE",
          value:
            "⚠️ **HACK ETHICALLY.**\n" +
            "🔐 **TEST ONLY WITH PERMISSION.**\n" +
            "🧠 **USE YOUR KNOWLEDGE RESPONSIBLY.**",
        }
      )
      .setFooter({
        text: "HACKERS HEAVEN • LEARN • BUILD • DEFEND • COMPETE",
      })
      .setTimestamp();

    await channel.send({
      content: `🔥 Welcome to the community, ${member}!`,
      embeds: [welcomeEmbed],
    });

    console.log(`👋 Welcomed ${member.user.tag}`);
  } catch (error) {
    console.error("❌ Welcome system error:", error);
  }
});

// ===============================
// SLASH COMMANDS
// ===============================

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error("❌ Command error:", error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "❌ Something went wrong.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "❌ Something went wrong.",
        ephemeral: true,
      });
    }
  }
});

// ===============================
// LOGIN
// ===============================

client.login(process.env.DISCORD_TOKEN);