// File: lib/database.js (Versi Upgrade Mute)

const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../db.json");

const readDB = () => {
  const defaultData = { warnings: {}, ranking: {}, mutes: {} };

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }

  try {
    const data = fs.readFileSync(dbPath, "utf8");
    if (data.trim() === "") {
      return defaultData;
    }
    const parsedData = JSON.parse(data);
    if (!parsedData.warnings) parsedData.warnings = {};
    if (!parsedData.ranking) parsedData.ranking = {};
    if (!parsedData.mutes) parsedData.mutes = {};

    return parsedData;
  } catch (e) {
    console.error("Gagal membaca atau parse db.json, membuat file baru.", e);
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// --- Fungsi Warning ---
const addWarning = (userId, groupId, reason) => {
  const db = readDB();
  const key = `${userId}_${groupId}`;
  if (!db.warnings[key]) {
    db.warnings[key] = { count: 0, reasons: [] };
  }
  db.warnings[key].count++;
  db.warnings[key].reasons.push(reason);
  writeDB(db);
  return db.warnings[key].count;
};

const getWarning = (userId, groupId) => {
  const db = readDB();
  const key = `${userId}_${groupId}`;
  return db.warnings[key] || { count: 0, reasons: [] };
};

const clearWarning = (userId, groupId) => {
  const db = readDB();
  const key = `${userId}_${groupId}`;
  if (db.warnings[key]) {
    delete db.warnings[key];
    writeDB(db);
    return true;
  }
  return false;
};

// --- Fungsi Ranking ---
const incrementMessageCount = (userId, groupId) => {
  const db = readDB();
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();
  const rankKey = `${month}_${year}`;

  if (!db.ranking) db.ranking = {};
  if (!db.ranking[rankKey]) db.ranking[rankKey] = {};
  if (!db.ranking[rankKey][groupId]) db.ranking[rankKey][groupId] = {};
  if (!db.ranking[rankKey][groupId][userId])
    db.ranking[rankKey][groupId][userId] = 0;

  db.ranking[rankKey][groupId][userId]++;
  writeDB(db);
};

const getRankings = (groupId) => {
  const db = readDB();
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();
  const rankKey = `${month}_${year}`;

  if (!db.ranking || !db.ranking[rankKey] || !db.ranking[rankKey][groupId])
    return [];

  const groupRanks = db.ranking[rankKey][groupId];
  return Object.entries(groupRanks)
    .sort(([, a], [, b]) => b - a)
    .map(([userId, count], index) => ({ userId, count, rank: index + 1 }));
};

const resetRankings = (groupId) => {
  const db = readDB();
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();
  const rankKey = `${month}_${year}`;

  if (db.ranking && db.ranking[rankKey] && db.ranking[rankKey][groupId]) {
    delete db.ranking[rankKey][groupId];
    writeDB(db);
    return true;
  }
  return false;
};

// --- FUNGSI MUTE BARU ---
const setMute = (userId, groupId, expirationTimestamp) => {
  const db = readDB();
  if (!db.mutes[groupId]) {
    db.mutes[groupId] = {};
  }
  db.mutes[groupId][userId] = expirationTimestamp;
  writeDB(db);
};

const getMute = (userId, groupId) => {
  const db = readDB();
  return db.mutes[groupId] ? db.mutes[groupId][userId] : null;
};

const removeMute = (userId, groupId) => {
  const db = readDB();
  if (db.mutes[groupId] && db.mutes[groupId][userId]) {
    delete db.mutes[groupId][userId];
    writeDB(db);
    return true;
  }
  return false;
};

module.exports = {
  addWarning,
  getWarning,
  clearWarning,
  incrementMessageCount,
  getRankings,
  resetRankings,
  setMute,
  getMute,
  removeMute,
};
