const { SlashCommandBuilder } = require("discord.js");
const { db, getPlayer, addProgress } = require("../database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("submit")
    .setDescription("Submit a flag for a CTF challenge")
    .addIntegerOption(option =>
      option
        .setName("challenge")
        .setDescription("Challenge ID")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("flag")
        .setDescription("Your flag")
        .setRequired(true)
    ),

  async execute(interaction) {
    const challengeId = interaction.options.getInteger("challenge");
    const flag = interaction.options.getString("flag").trim();

    const challenge = db
      .prepare("SELECT * FROM challenges WHERE id = ?")
      .get(challengeId);

    if (!challenge) {
      return interaction.reply({
        content: "❌ Challenge not found.",
        ephemeral: true,
      });
    }

    getPlayer(interaction.user.id);

    const alreadyCompleted = db
      .prepare(`
        SELECT * FROM completed
        WHERE user_id = ? AND challenge_id = ?
      `)
      .get(interaction.user.id, challengeId);

    if (alreadyCompleted) {
      return interaction.reply({
        content: "✅ You already completed this challenge.",
        ephemeral: true,
      });
    }

    if (flag !== challenge.flag) {
      return interaction.reply({
        content: "❌ Incorrect flag. Try again!",
        ephemeral: true,
      });
    }

    db.prepare(`
      INSERT INTO completed (user_id, challenge_id)
      VALUES (?, ?)
    `).run(interaction.user.id, challengeId);

    addProgress(
      interaction.user.id,
      challenge.points,
      challenge.xp
    );

    await interaction.reply(
      `🎉 **Correct!**\n\n` +
      `🏆 +${challenge.points} points\n` +
      `⭐ +${challenge.xp} XP\n\n` +
      `Keep going!`
    );
  },
};