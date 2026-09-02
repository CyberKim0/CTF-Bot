const { db } = require("./database");

const challenges = [
  // 🟢 BEGINNER
  {
    name: "Base64 Basics",
    category: "crypto",
    difficulty: "beginner",
    description: "Decode this Base64 string: SGVsbG8gQ1RGIQ==",
    flag: "Hello CTF!",
    points: 100,
    xp: 100
  },
  {
    name: "Linux Explorer",
    category: "linux",
    difficulty: "beginner",
    description: "Find the hidden file in a directory using basic Linux commands.",
    flag: "CTF{hidden_file}",
    points: 100,
    xp: 100
  },
  {
    name: "Caesar Starter",
    category: "crypto",
    difficulty: "beginner",
    description: "Decode this Caesar cipher: FGH",
    flag: "DEF",
    points: 100,
    xp: 100
  },
  {
    name: "Hex Beginner",
    category: "crypto",
    difficulty: "beginner",
    description: "Decode this hexadecimal string: 435446",
    flag: "CTF",
    points: 100,
    xp: 100
  },
  {
    name: "File Finder",
    category: "linux",
    difficulty: "beginner",
    description: "Which Linux command is commonly used to search for files?",
    flag: "find",
    points: 100,
    xp: 100
  },

  // 🔵 INTERMEDIATE
  {
    name: "Simple Cipher",
    category: "crypto",
    difficulty: "intermediate",
    description: "Identify the cipher and decode the provided message.",
    flag: "CTF{cipher_solved}",
    points: 250,
    xp: 250
  },
  {
    name: "Web Inspector",
    category: "web",
    difficulty: "intermediate",
    description: "Inspect the webpage source and find the hidden flag.",
    flag: "CTF{source_found}",
    points: 250,
    xp: 250
  },
  {
    name: "Hash Hunt",
    category: "crypto",
    difficulty: "intermediate",
    description: "Identify the hashing algorithm used in the challenge.",
    flag: "CTF{hash_found}",
    points: 250,
    xp: 250
  },

  // 🟠 ADVANCED
  {
    name: "SQL Mystery",
    category: "web",
    difficulty: "advanced",
    description: "Analyze the vulnerable training application and identify the database flaw.",
    flag: "CTF{sql_mystery}",
    points: 500,
    xp: 500
  },
  {
    name: "Packet Hunter",
    category: "networking",
    difficulty: "advanced",
    description: "Analyze the provided network capture and identify the hidden information.",
    flag: "CTF{packet_hunter}",
    points: 500,
    xp: 500
  },
  {
    name: "Binary Investigation",
    category: "reverse",
    difficulty: "advanced",
    description: "Analyze the provided training binary and determine the correct input.",
    flag: "CTF{binary_solved}",
    points: 500,
    xp: 500
  },

  // 🔴 EXPERT
  {
    name: "Reverse Challenge",
    category: "reverse",
    difficulty: "expert",
    description: "Analyze the provided program and determine the correct input.",
    flag: "CTF{reverse_master}",
    points: 1000,
    xp: 1000
  },
  {
    name: "Final Fortress",
    category: "forensics",
    difficulty: "expert",
    description: "Solve the multi-stage forensic investigation and recover the final flag.",
    flag: "CTF{final_fortress}",
    points: 1000,
    xp: 1000
  },
  {
    name: "Network Phantom",
    category: "networking",
    difficulty: "expert",
    description: "Investigate the advanced network evidence and recover the hidden flag.",
    flag: "CTF{network_phantom}",
    points: 1000,
    xp: 1000
  }
];

const insert = db.prepare(`
  INSERT INTO challenges
  (name, category, difficulty, description, flag, points, xp)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const seed = db.transaction(() => {
  for (const challenge of challenges) {
    insert.run(
      challenge.name,
      challenge.category,
      challenge.difficulty,
      challenge.description,
      challenge.flag,
      challenge.points,
      challenge.xp
    );
  }
});

// Only seed if the table is empty.
// IMPORTANT: Do NOT delete existing challenges/completions.
const existing = db
  .prepare("SELECT COUNT(*) AS count FROM challenges")
  .get();

if (existing.count === 0) {
  seed();
  console.log("✅ CTF challenges added!");
} else {
  console.log(`ℹ️ ${existing.count} challenges already exist.`);
}