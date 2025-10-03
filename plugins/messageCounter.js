const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);

db.defaults({ warnings: {}, ranks: {} }).write();

function getMonthYear() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}

async function messageCounter(sock, msg) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith("@g.us");
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!isGroup) return;

  const monthYear = getMonthYear();
  const rankPath = `ranks.${from}.${monthYear}.${sender}`;
  const currentMessages = db.get(rankPath).value() || 0;

  db.set(rankPath, currentMessages + 1).write();
}

module.exports = messageCounter;
