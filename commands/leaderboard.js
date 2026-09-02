const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db } = require("../database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Show the CTF leaderboard"),

  async execute(interaction) {
    const players = db
      .prepare(`
        SELECT * FROM players
        ORDER BY points DESC, xp DESC
        LIMIT 10
      `)
      .all();

    if (players.length === 0) {
      return interaction.reply("🏁 No players have scored yet.");
    }

    const medals = ["🥇", "🥈", "🥉"];

    const leaderboard = players
      .map((player, index) => {
        const medal = medals[index] || `**${index + 1}.**`;

        return `${medal} <@${player.user_id}> — **${player.points} pts** • ${player.xp} XP`;
      })
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("🏆 CTF Leaderboard")
      .setDescription(leaderboard)
      .setFooter({ text: "Top 10 CTF Players" });

    await interaction.reply({ embeds: [embed] });
  },
};