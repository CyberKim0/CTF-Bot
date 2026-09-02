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
    difficulty