require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  ActivityType,
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// Create bot client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
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