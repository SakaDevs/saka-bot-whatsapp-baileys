const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

function getMonthYear() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}

module.exports = {
  name: "resetrank",
  isAdmin: true,
  description: "Mereset data peringkat anggota bulan ini (khusus admin).",
  run: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const groupMetadata = await sock.groupMetadata(from);
    const senderAdmin = groupMetadata.participants.find((p) => p.id === sender);

    if (!senderAdmin.admin) {
      return sock.sendMessage(
        from,
        { text: "Perintah ini hanya bisa digunakan oleh admin grup." },
        { quoted: msg }
      );
    }

    const monthYear = getMonthYear();
    const rankPath = `ranks.${from}.${monthYear}`;

    const currentRanks = db.get(rankPath).value();

    if (!currentRanks || Object.keys(currentRanks).length === 0) {
      return sock.sendMessage(
        from,
        { text: "Data peringkat untuk bulan ini sudah kosong." },
        { quoted: msg }
      );
    }

    db.set(rankPath, {}).write();

    await sock.sendMessage(
      from,
      {
        text: "Data peringkat anggota untuk bulan ini telah berhasil direset.",
      },
      { quoted: msg }
    );
  },
};
