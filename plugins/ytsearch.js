const YouTube = require("youtube-sr").default;

module.exports = {
  name: "ytsearch",
  description: "Mencari video di YouTube.",
  run: async (sock, msg, args) => {
    const query = args.join(" ");
    if (!query) {
      return sock.sendMessage(
        msg.key.remoteJid,
        {
          text: "Mohon berikan judul video untuk dicari. Contoh: .ytsearch lagu galau",
        },
        { quoted: msg }
      );
    }

    try {
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: `Mencari "${query}" di YouTube...` },
        { quoted: msg }
      );

      const results = await YouTube.search(query, { limit: 5, type: "video" });
      if (!results.length) {
        return sock.sendMessage(
          msg.key.remoteJid,
          { text: `Tidak ada video yang ditemukan untuk "${query}".` },
          { quoted: msg }
        );
      }

      let replyText = `Hasil Pencarian YouTube untuk "${query}":\n\n`;
      results.forEach((vid, index) => {
        replyText += `*${index + 1}. ${vid.title}*\n`;
        replyText += `*Channel:* ${vid.channel.name}\n`;
        replyText += `*Durasi:* ${vid.durationFormatted}\n`;
        replyText += `*Link:* https://www.youtube.com/watch?v=${vid.id}\n\n`;
      });

      await sock.sendMessage(
        msg.key.remoteJid,
        { text: replyText },
        { quoted: msg }
      );
    } catch (error) {
      console.error("Error pada perintah ytsearch:", error);
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: "Maaf, terjadi error saat melakukan pencarian YouTube." },
        { quoted: msg }
      );
    }
  },
};
