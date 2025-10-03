const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

db.defaults({ warnings: {} }).write();

const badWordsList = [
  "anjing",
  "bangsat",
  "memek",
  "kontol",
  "tolol",
  "goblok",
  "babi",
  "bad"
];

async function badWordsFilter(sock, msg) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith("@g.us");
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!isGroup) return;

  const messageText =
    msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
  if (!messageText) return;

  const lowerCaseText = messageText.toLowerCase();
  const hasBadWord = badWordsList.some((word) => lowerCaseText.includes(word));

  if (hasBadWord) {
    try {
      await sock.sendMessage(from, { delete: msg.key });

      const warningsPath = `warnings.${from}.${sender}`;
      const currentWarnings = db.get(warningsPath).value() || 0;
      const newWarnings = currentWarnings + 1;

      db.set(warningsPath, newWarnings).write();

      if (newWarnings >= 3) {
        await sock.sendMessage(from, {
          text: `Peringatan ke-3 untuk @${
            sender.split("@")[0]
          }. Pelanggaran berulang, Anda akan dikeluarkan.`,
          mentions: [sender],
        });
        await sock.groupParticipantsUpdate(from, [sender], "remove");
        db.set(warningsPath, 0).write();
      } else {
        const warningMessage = `Peringatan ke-${newWarnings} untuk @${
          sender.split("@")[0]
        }. Dilarang menggunakan kata-kata kasar.`;
        await sock.sendMessage(from, {
          text: warningMessage,
          mentions: [sender],
        });
      }
    } catch (error) {
      if (
        error.output?.statusCode === 403 ||
        error.message.includes("forbidden")
      ) {
        console.log("Gagal menghapus pesan: Bot bukan admin.");
      } else {
        console.error("Error pada fitur badwords:", error);
      }
    }
  }
}

module.exports = badWordsFilter;
