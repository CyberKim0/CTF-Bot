const { SlashCommandBuilder } = require("discord.js");
const { db, getPlayer, addProgress } = require("../database");

const levels = [
  { name: "CTF Beginner", xp: 0 },
  { name: "CTF Intermediate", xp: 500 },
  { name: "CTF Advanced", xp: 1500 },
  { name: "CTF Expert", xp: 3000 },
];

async function updateRole(member, xp) {
  let currentLevel = levels[0];

  for (const level of levels) {
    if (xp >= level.xp) {
      currentLevel = level;
    }
  }

  // Create the role if it doesn't exist
  let newRole = member.guild.roles.cache.find(
    role => role.name === currentLevel.name
  );

  if (!newRole) {
    newRole = await member.guild.roles.create({
      name: currentLevel.name,
      reason: "CTF progression role",
    });
  }

  // Remove old CTF progression roles
  for (const level of levels) {
    const oldRole = member.guild.roles.cache.find(
      role => role.name === level.name
    );

    if (oldRole && oldRole.id !== newRole.id && member.roles.cache.has(oldRole.id)) {
      await member.roles.remove(oldRole);
    }
  }

  // Give the new role
  if (!member.roles.cache.has(newRole.id)) {
    await member.roles.add(newRole);
  }

  return currentLevel.name;
}

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

    const player = getPlayer(interaction.user.id);

    const level = await updateRole(
      interaction.member,
      player.xp
    );

    await interaction.reply(
      `🎉 **Correct flag!**\n\n` +
      `🏆 **+${challenge.points} points**\n` +
      `⭐ **+${challenge.xp} XP**\n` +
      `🎖️ **Rank: ${level}**`
    );
  },
};