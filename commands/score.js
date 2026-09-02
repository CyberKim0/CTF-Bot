const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer } = require("../database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("score")
    .setDescription("Show your CTF score"),

  async execute(interaction) {
    const player = getPlayer(interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle("📊 Your CTF Score")
      .setDescription(`**${interaction.user.username}**`)
      .addFields(
        {
          name: "🏆 Points",
          value: `${player.points}`,
          inline: true,
        },
        {
          name: "⭐ XP",
          value: `${player.xp}`,
          inline: true,
        },
        {
          name: "🏁 Completed",
          value: `${player.challenges_completed}`,
          inline: true,
        }
      )
      .setFooter({ text: "Keep solving challenges!" });

    await interaction.reply({ embeds: [embed] });
  },
};