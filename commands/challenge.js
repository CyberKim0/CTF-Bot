const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db, getPlayer } = require("../database");

const ranks = [
  { name: "beginner", xp: 0, emoji: "🟢" },
  { name: "intermediate", xp: 500, emoji: "🔵" },
  { name: "advanced", xp: 1500, emoji: "🟠" },
  { name: "expert", xp: 3000, emoji: "🔴" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("challenge")
    .setDescription("Get a random CTF challenge")
    .addStringOption(option =>
      option
        .setName("difficulty")
        .setDescription("Choose a difficulty (optional)")
        .setRequired(false)
        .addChoices(
          { name: "🟢 Beginner", value: "beginner" },
          { name: "🔵 Intermediate", value: "intermediate" },
          { name: "🟠 Advanced", value: "advanced" },
          { name: "🔴 Expert", value: "expert" }
        )
    ),

  async execute(interaction) {
    const player = getPlayer(interaction.user.id);

    const requestedDifficulty =
      interaction.options.getString("difficulty");

    // Find the highest unlocked rank
    let highestUnlocked = ranks[0];

    for (const rank of ranks) {
      if (player.xp >= rank.xp) {
        highestUnlocked = rank;
      }
    }

    // Use selected difficulty, or automatically use highest unlocked
    const difficulty = requestedDifficulty || highestUnlocked.name;

    const selectedRank = ranks.find(
      rank => rank.name === difficulty
    );

    // Check if requested difficulty is locked
    if (player.xp < selectedRank.xp) {
      const needed = selectedRank.xp - player.xp;

      return interaction.reply({
        content:
          `🔒 **${selectedRank.name.toUpperCase()} is locked.**\n\n` +
          `⭐ Your XP: **${player.xp}**\n` +
          `📈 XP needed: **${needed} more**`,
        ephemeral: true,
      });
    }

    // Find a random challenge the player has NOT completed
    const challenge = db
      .prepare(`
        SELECT *
        FROM challenges c
        WHERE c.difficulty = ?
        AND NOT EXISTS (
          SELECT 1
          FROM completed x
          WHERE x.user_id = ?
          AND x.challenge_id = c.id
        )
        ORDER BY RANDOM()
        LIMIT 1
      `)
      .get(difficulty, interaction.user.id);

    // No challenges left at this difficulty
    if (!challenge) {
      return interaction.reply({
        content:
          `🎉 You've completed **all ${difficulty} challenges** currently available!`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🏁 ${challenge.name}`)
      .setDescription(challenge.description)
      .addFields(
        {
          name: "📂 Category",
          value: challenge.category,
          inline: true,
        },
        {
          name: "🎯 Difficulty",
          value:
            `${selectedRank.emoji} ${challenge.difficulty}`,
          inline: true,
        },
        {
          name: "⭐ Points",
          value: `${challenge.points}`,
          inline: true,
        }
      )
      .setFooter({
        text: `Challenge #${challenge.id} • Use /submit to submit your flag`,
      });

    await interaction.reply({
      embeds: [embed],
    });
  },
};