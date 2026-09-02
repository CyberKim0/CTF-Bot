const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db, getPlayer } = require("../database");

const ranks = {
  beginner: 0,
  intermediate: 500,
  advanced: 1500,
  expert: 3000
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("challenge")
    .setDescription("Get a random CTF challenge")
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

    const player = getPlayer(interaction.user.id);

    // Check XP requirement
    if (player.xp < ranks[difficulty]) {
      const needed = ranks[difficulty] - player.xp;

      return interaction.reply({
        content:
          `🔒 **${difficulty.toUpperCase()}** is locked.\n\n` +
          `⭐ Your XP: **${player.xp}**\n` +
          `📈 XP needed: **${needed}** more`,
        ephemeral: true
      });
    }

    // Find a random challenge the player has NOT completed
    const challenge = db
      .prepare(`
        SELECT *
        FROM challenges
        WHERE difficulty = ?
        AND id NOT IN (
          SELECT challenge_id
          FROM completed
          WHERE user_id = ?
        )
        ORDER BY RANDOM()
        LIMIT 1
      `)
      .get(difficulty, interaction.user.id);

    if (!challenge) {
      return interaction.reply({
        content:
          `🎉 You've completed **all ${difficulty} challenges** currently available!`,
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🏁 ${challenge.name}`)
      .setDescription(challenge.description)
      .addFields(
        {
          name: "📂 Category",
          value: challenge.category,
          inline: true
        },
        {
          name: "🎯 Difficulty",
          value: challenge.difficulty,
          inline: true
        },
        {
          name: "⭐ Points",
          value: `${challenge.points}`,
          inline: true
        }
      )
      .setFooter({
        text: `Challenge #${challenge.id} • Use /submit to submit your flag`
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
};