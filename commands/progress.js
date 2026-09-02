const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer } = require("../database");

const ranks = [
  { name: "CTF Beginner", xp: 0, emoji: "🟢" },
  { name: "CTF Intermediate", xp: 500, emoji: "🔵" },
  { name: "CTF Advanced", xp: 1500, emoji: "🟠" },
  { name: "CTF Expert", xp: 3000, emoji: "🔴" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("progress")
    .setDescription("View your CTF progression"),

  async execute(interaction) {
    const player = getPlayer(interaction.user.id);

    let currentRank = ranks[0];
    let nextRank = null;

    for (let i = 0; i < ranks.length; i++) {
      if (player.xp >= ranks[i].xp) {
        currentRank = ranks[i];
        nextRank = ranks[i + 1] || null;
      }
    }

    let progressText;

    if (nextRank) {
      const needed = nextRank.xp - player.xp;

      progressText =
        `${currentRank.emoji} **${currentRank.name}**\n` +
        `⭐ XP: **${player.xp}**\n` +
        `🏆 Points: **${player.points}**\n\n` +
        `Next rank: **${nextRank.emoji} ${nextRank.name}**\n` +
        `📈 XP needed: **${needed}**`;
    } else {
      progressText =
        `${currentRank.emoji} **${currentRank.name}**\n` +
        `⭐ XP: **${player.xp}**\n` +
        `🏆 Points: **${player.points}**\n\n` +
        `👑 **Maximum rank reached!**`;
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎯 ${interaction.user.username}'s CTF Progress`)
      .setDescription(progressText)
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
    });
  },
};