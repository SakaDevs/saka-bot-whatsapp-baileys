const { getRankings } = require("../lib/database.js");

module.exports = {
  name: "myrank",
  description: "Mengecek peringkat pribadi bulan ini.",
  run: async (sock, msg, args) => {
    const sender = msg.key.participant || msg.key.remoteJid;
    const from = msg.key.remoteJid;

    const allRanks = getRankings(from);
    const myRankData = allRanks.find((r) => r.userId === sender);

    if (myRankData) {
      await sock.sendMessage(
        from,
        {
          text: `Peringkat Kamu: #${myRankData.rank} dengan ${myRankData.count} pesan.`,
        },
        { quoted: msg }
      );
    } else {
      await sock.sendMessage(
        from,
        { text: "Kamu belum mengirim pesan bulan ini." },
        { quoted: msg }
      );
    }
  },
};
