const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db } = require("../database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("challenge")
    .setDescription("Get a CTF challenge")
    .addStringOption(option =>
      option
        .setName("difficulty")
        .setDescription("Choose the difficulty")
        .setRequired(true)
        .addChoices(
          { name: "🟢 Beginner", value: "beginner" },
          { name: "🔵 Intermediate", value: "intermediate" },
          { name: "🟠 Advanced", value: "advanced" },
          { name: "🔴 Expert", value: "expert" }
        )
    ),

  async execute(interaction) {
    const difficulty = interaction.options.getString("difficulty");

    const challenge = db
      .prepare(`
        SELECT * FROM challenges
        WHERE difficulty = ?
        ORDER BY RANDOM()
        LIMIT 1
      `)
      .get(difficulty);

    if (!challenge) {
      return interaction.reply({
        content: `❌ No **${difficulty}** challenges are available yet.`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🏁 ${challenge.name}`)
      .setDescription(challenge.description)
      .addFields(
        { name: "📂 Category", value: challenge.category, inline: true },
        { name: "🎯 Difficulty", value: challenge.difficulty, inline: true },
        { name: "⭐ Points", value: `${challenge.points}`, inline: true }
      )
      .setFooter({ text: `Challenge #${challenge.id}` });

    await interaction.reply({ embeds: [embed] });
  },
};