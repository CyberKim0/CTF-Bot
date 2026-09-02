const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const {
  db,
  syncProgress
} = require("../database");

const ranks = [
  {
    name: "beginner",
    display: "CTF Beginner",
    xp: 0,
    emoji: "🟢"
  },
  {
    name: "intermediate",
    display: "CTF Intermediate",
    xp: 500,
    emoji: "🔵"
  },
  {
    name: "advanced",
    display: "CTF Advanced",
    xp: 1500,
    emoji: "🟠"
  },
  {
    name: "expert",
    display: "CTF Expert",
    xp: 3000,
    emoji: "🔴"
  }
];

module.exports = {

  data: new SlashCommandBuilder()
    .setName("challenge")
    .setDescription("Get a random CTF challenge"),

  async execute(interaction) {

    // Always repair/sync XP first
    const player = syncProgress(interaction.user.id);

    // Find current rank
    let currentRank = ranks[0];

    for (const rank of ranks) {
      if (player.xp >= rank.xp) {
        currentRank = rank;
      }
    }

    // Random uncompleted challenge
    const challenge = db.prepare(`
      SELECT c.*
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
    `).get(
      currentRank.name,
      interaction.user.id
    );

    // ===============================
    // NO MORE CHALLENGES
    // ===============================

    if (!challenge) {

      const index = ranks.findIndex(
        rank => rank.name === currentRank.name
      );

      const nextRank = ranks[index + 1];

      // Maximum rank
      if (!nextRank) {

        return interaction.reply({
          content:
            `👑 **You've completed ALL CTF challenges!**\n\n` +
            `⭐ XP: **${player.xp}**\n` +
            `🏆 Points: **${player.points}**`,
          ephemeral: true
        });
      }

      const needed = Math.max(
        0,
        nextRank.xp - player.xp
      );

      return interaction.reply({
        content:
          `🎉 **You've completed all ${currentRank.name} challenges currently available!**\n\n` +
          `${nextRank.emoji} **${nextRank.display} is locked.**\n\n` +
          `⭐ Your XP: **${player.xp}**\n` +
          `📈 XP needed: **${needed} more**`,
        ephemeral: true
      });
    }

    // ===============================
    // SEND CHALLENGE
    // ===============================

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
          value: currentRank.display,
          inline: true
        },
        {
          name: "⭐ Points",
          value: `${challenge.points}`,
          inline: true
        }
      )

      .setFooter({
        text:
          `Challenge #${challenge.id} • Use /submit to submit your flag`
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
};