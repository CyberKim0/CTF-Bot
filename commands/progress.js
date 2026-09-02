const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer } = require("../database");

const levels = [
  { name: "🟢 Beginner", xp: 0 },
  { name: "🔵 Intermediate", xp: 500 },
  { name: "🟠 Advanced", xp: 1500 },
  { name: "🔴 Expert", xp: 3000 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("progress")
    .setDescription("Check your CTF progression"),

  async execute(interaction) {
    const player = getPlayer(interaction.user.id);

    let current = levels[0];
    let next = levels[1];

    for (let i = 0; i < levels.length; i++) {
      if (player.xp >= levels[i].xp) {
        current = levels[i];
        next = levels[i + 1] || null;
      }
    }

    let progressText;

    if (next) {
      const needed = next.xp - player.xp;

      progressText =
        `${current.name}\n\n` +
        `⭐ XP: **${player.xp}**\n` +
        `➡️ Next: **${next.name}**\n` +
        `📈 XP needed: **${needed}**`;
    } else {
      progressText =
        `${current.name}\n\n` +
        `⭐ XP: **${player.xp}**\n` +
        `👑 **MAX LEVEL — CTF EXPERT**`;
    }

    const embed = new EmbedBuilder()
      .setTitle("📈 CTF Progress")
      .setDescription(progressText)
      .setFooter({ text: "Keep completing challenges!" });

    await interaction.reply({ embeds: [embed] });
  },
};