const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db, getPlayer } = require("../database");

const ranks = [
  {
    name: "CTF Beginner",
    difficulty: "beginner",
    xp: 0,
    emoji: "🟢",
  },
  {
    name: "CTF Intermediate",
    difficulty: "intermediate",
    xp: 500,
    emoji: "🔵",
  },
  {
    name: "CTF Advanced",
    difficulty: "advanced",
    xp: 1500,
    emoji: "🟠",
  },
  {
    name: "CTF Expert",
    difficulty: "expert",
    xp: 3000,
    emoji: "🔴",
  },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("challenge")
    .setDescription("Get a random CTF challenge"),

  async execute(interaction) {
    const player = getPlayer(interaction.user.id);

    // Find player's current rank
    let currentRank = ranks[0];

    for (const rank of ranks) {
      if (player.xp >= rank.xp) {
        currentRank = rank;
      }
    }

    // Get a random challenge from the current rank
    // that the player has NOT completed yet
    const challenge = db
      .prepare(`
        SELECT c.*
        FROM challenges c
        WHERE c.difficulty = ?
        AND NOT EXISTS (
          SELECT 1
          FROM completed cp
          WHERE cp.user_id = ?
          AND cp.challenge_id = c.id
        )
        ORDER BY RANDOM()
        LIMIT 1
      `)
      .get(currentRank.difficulty, interaction.user.id);

    // All challenges at this rank completed
    if (!challenge) {
      const nextRank =
        ranks[ranks.indexOf(currentRank) + 1];

      if (!nextRank) {
        return interaction.reply({
          content:
            `👑 **You've completed every CTF challenge!**\n\n` +
            `⭐ XP: **${player.xp}**\n` +
            `🏆 Points: **${player.points}**`,
          ephemeral: true,
        });
      }

      const xpNeeded = nextRank.xp - player.xp;

      if (xpNeeded > 0) {
        return interaction.reply({
          content:
            `🎉 You've completed all **${currentRank.difficulty}** challenges currently available!\n\n` +
            `${nextRank.emoji} **${nextRank.name}** is locked.\n\n` +
            `⭐ Your XP: **${player.xp}**\n` +
            `📈 XP needed: **${xpNeeded} more**`,
          ephemeral: true,
        });
      }

      return interaction.reply({
        content:
          `🔓 **${nextRank.name} unlocked!**\n\n` +
          `Use \`/challenge\` to begin.`,
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
            `${currentRank.emoji} ${currentRank.name}`,
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