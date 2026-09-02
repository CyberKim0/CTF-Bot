const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "ctf.db");
const db = new Database(dbPath);

console.log("📁 Database:", dbPath);

// ===============================
// PLAYERS
// ===============================

db.prepare(`
  CREATE TABLE IF NOT EXISTS players (
    user_id TEXT PRIMARY KEY,
    xp INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0
  )
`).run();

// ===============================
// CHALLENGES
// ===============================

db.prepare(`
  CREATE TABLE IF NOT EXISTS challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    description TEXT NOT NULL,
    flag TEXT NOT NULL,
    points INTEGER DEFAULT 100,
    xp INTEGER DEFAULT 100
  )
`).run();

// ===============================
// COMPLETED
// ===============================

db.prepare(`
  CREATE TABLE IF NOT EXISTS completed (
    user_id TEXT NOT NULL,
    challenge_id INTEGER NOT NULL,
    UNIQUE(user_id, challenge_id)
  )
`).run();

// ===============================
// GET PLAYER
// ===============================

function getPlayer(userId) {
  let player = db
    .prepare(`
      SELECT *
      FROM players
      WHERE user_id = ?
    `)
    .get(userId);

  if (!player) {
    db.prepare(`
      INSERT INTO players
      (user_id, xp, points, challenges_completed)
      VALUES (?, 0, 0, 0)
    `).run(userId);

    player = db
      .prepare(`
        SELECT *
        FROM players
        WHERE user_id = ?
      `)
      .get(userId);
  }

  return player;
}

// ===============================
// SYNC PLAYER PROGRESS
// ===============================

function syncProgress(userId) {
  getPlayer(userId);

  const progress = db
    .prepare(`
      SELECT
        COALESCE(SUM(c.xp), 0) AS xp,
        COALESCE(SUM(c.points), 0) AS points,
        COUNT(c.id) AS completed
      FROM completed x
      JOIN challenges c
        ON c.id = x.challenge_id
      WHERE x.user_id = ?
    `)
    .get(userId);

  db.prepare(`
    UPDATE players
    SET
      xp = ?,
      points = ?,
      challenges_completed = ?
    WHERE user_id = ?
  `).run(
    progress.xp,
    progress.points,
    progress.completed,
    userId
  );

  return getPlayer(userId);
}

// ===============================
// ADD PROGRESS
// ===============================

function addProgress(userId) {
  return syncProgress(userId);
}

module.exports = {
  db,
  getPlayer,
  addProgress,
  syncProgress,
};