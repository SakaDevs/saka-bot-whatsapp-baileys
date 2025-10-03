const { getRankings } = require("../lib/database.js");

module.exports = {
  name: "memberrank",
  isAdmin: true,
  description: "Menampilkan top 10 member teraktif bulan ini.",
  run: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const rankings = getRankings(from).slice(0, 10);

    if (rankings.length === 0) {
      return sock.sendMessage(
        from,
        { text: "Belum ada aktivitas di grup ini bulan ini." },
        { quoted: msg }
      );
    }

    let rankText = `Top 10 Member Teraktif Bulan Ini:\n\n`;
    let rankMentions = [];
    for (const rank of rankings) {
      rankMentions.push(rank.userId);
      rankText += `${rank.rank}. @${rank.userId.split("@")[0]} - ${
        rank.count
      } pesan\n`;
    }
    await sock.sendMessage(from, { text: rankText, mentions: rankMentions });
  },
};
