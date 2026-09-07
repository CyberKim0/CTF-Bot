require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  ActivityType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
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
// AUTOMATIC WELCOME SYSTEM V2
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

    // ===============================
    // WELCOME EMBED
    // ===============================

    const welcomeEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${member.user.username} joined the community`,
        iconURL: member.user.displayAvatarURL({ extension: "png" }),
      })
      .setTitle("🌐 WELCOME TO HACKERS HEAVEN")
      .setDescription(
        `👋 Welcome ${member}!\n\n` +
        `You are our **${memberNumber}th member**. 🌍\n\n` +
        `**Learn • Build • Defend • Compete**`
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
      .setThumbnail(
        member.user.displayAvatarURL({ extension: "png", size: 256 })
      )
      .setFooter({
        text: "HACKERS HEAVEN • LEARN • BUILD • DEFEND • COMPETE",
      })
      .setTimestamp();

    // ===============================
    // BUTTONS
    // ===============================

    const buttons = [];

    if (process.env.VERIFICATION_CHANNEL_ID) {
      buttons.push(
        new ButtonBuilder()
          .setLabel("🛡️ Verify")
          .setStyle(ButtonStyle.Link)
          .setURL(
            `https://discord.com/channels/${member.guild.id}/${process.env.VERIFICATION_CHANNEL_ID}`
          )
      );
    }

    if (process.env.ROLES_CHANNEL_ID) {
      buttons.push(
        new ButtonBuilder()
          .setLabel("🎭 Roles")
          .setStyle(ButtonStyle.Link)
          .setURL(
            `https://discord.com/channels/${member.guild.id}/${process.env.ROLES_CHANNEL_ID}`
          )
      );
    }

    if (process.env.LEARNING_CHANNEL_ID) {
      buttons.push(
        new ButtonBuilder()
          .setLabel("📚 Learning Hub")
          .setStyle(ButtonStyle.Link)
          .setURL(
            `https://discord.com/channels/${member.guild.id}/${process.env.LEARNING_CHANNEL_ID}`
          )
      );
    }

    if (process.env.CTF_CHANNEL_ID) {
      buttons.push(
        new ButtonBuilder()
          .setLabel("🏆 CTF Arena")
          .setStyle(ButtonStyle.Link)
          .setURL(
            `https://discord.com/channels/${member.guild.id}/${process.env.CTF_CHANNEL_ID}`
          )
      );
    }

    const components = [];

    if (buttons.length > 0) {
      components.push(
        new ActionRowBuilder().addComponents(buttons)
      );
    }

    await channel.send({
      content: `🔥 **Welcome to the community, ${member}!**`,
      embeds: [welcomeEmbed],
      components,
    });

    console.log(`✅ Welcomed ${member.user.tag} — Member #${memberNumber}`);
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