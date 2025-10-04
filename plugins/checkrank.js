const { getRankings } = require("../lib/database.js");

module.exports = {
  name: "checkrank",
  description: "Mengecek peringkat spesifik seorang anggota (khusus admin).",
  isAdmin: true,
  run: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const groupMetadata = await sock.groupMetadata(from);
    const senderAdmin = groupMetadata.participants.find(
      (p) => p.id === sender
    )?.admin;

    if (!senderAdmin) {
      return sock.sendMessage(
        from,
        { text: "Perintah ini hanya bisa digunakan oleh admin grup." },
        { quoted: msg }
      );
    }

    const mentionedJid =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentionedJid) {
      return sock.sendMessage(
        from,
        {
          text: "Mohon tandai pengguna yang ingin diperiksa. Contoh: .checkrank @user",
        },
        { quoted: msg }
      );
    }

    const allRanks = getRankings(from);
    const userRankData = allRanks.find((r) => r.userId === mentionedJid);

    if (userRankData) {
      const replyText =
        `Peringkat untuk @${mentionedJid.split("@")[0]} bulan ini:\n\n` +
        `Peringkat: #${userRankData.rank}\n` +
        `Jumlah Pesan: ${userRankData.count}`;

      await sock.sendMessage(
        from,
        { text: replyText, mentions: [mentionedJid] },
        { quoted: msg }
      );
    } else {
      await sock.sendMessage(
        from,
        {
          text: `Anggota @${
            mentionedJid.split("@")[0]
          } belum memiliki peringkat bulan ini (belum mengirim pesan).`,
          mentions: [mentionedJid],
        },
        { quoted: msg }
      );
    }
  },
};
