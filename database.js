const Database = require("better-sqlite3");

const db = new Database("ctf.db");

// Players
db.prepare(`
  CREATE TABLE IF NOT EXISTS players (
    user_id TEXT PRIMARY KEY,
    xp INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0
  )
`).run();

// Challenges
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

// Completed challenges
db.prepare(`
  CREATE TABLE IF NOT EXISTS completed (
    user_id TEXT NOT NULL,
    challenge_id INTEGER NOT NULL,
    UNIQUE(user_id, challenge_id)
  )
`).run();

function getPlayer(userId) {
  let player = db
    .prepare("SELECT * FROM players WHERE user_id = ?")
    .get(userId);

  if (!player) {
    db.prepare(`
      INSERT INTO players (user_id)
      VALUES (?)
    `).run(userId);

    player = db
      .prepare("SELECT * FROM players WHERE user_id = ?")
      .get(userId);
  }

  return player;
}

function addProgress(userId, points, xp) {
  db.prepare(`
    UPDATE players
    SET points = points + ?,
        xp = xp + ?,
        challenges_completed = challenges_completed + 1
    WHERE user_id = ?
  `).run(points, xp, userId);
}

module.exports = {
  db,
  getPlayer,
  addProgress,
};