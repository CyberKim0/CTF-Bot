const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hint")
    .setDescription("Get a hint for a CTF challenge")
    .addIntegerOption(option =>
      option
        .setName("challenge")
        .setDescription("Challenge ID")
        .setRequired(true)
    ),

  async execute(interaction) {
    const challengeId = interaction.options.getInteger("challenge");

    const challenge = db
      .prepare("SELECT * FROM challenges WHERE id = ?")
      .get(challengeId);

    if (!challenge) {
      return interaction.reply({
        content: "❌ Challenge not found.",
        ephemeral: true,
      });
    }

    // Basic hint based on the challenge category
    const hints = {
      web: "🌐 Inspect the page, requests, parameters, and source code.",
      crypto: "🔐 Identify what type of encoding or cipher is being used.",
      forensics: "🔎 Examine the file metadata and contents carefully.",
      osint: "🕵️ Look for publicly available information connected to the clues.",
      linux: "🐧 Check the files, permissions, processes, and useful commands.",
      networking: "🌐 Examine the network traffic and look for unusual data.",
      reverse: "⚙️ Analyze how the program behaves and what inputs it expects.",
    };

    const category = challenge.category.toLowerCase();
    const hint =
      hints[category] ||
      "💡 Break the problem into smaller pieces and inspect the clues carefully.";

    await interaction.reply({
      content: `💡 **Hint for #${challenge.id} — ${challenge.name}**\n\n${hint}`,
      ephemeral: true,
    });
  },
};