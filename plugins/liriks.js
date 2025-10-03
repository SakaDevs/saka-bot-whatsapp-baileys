const { Client } = require("genius-lyrics");
const config = require("../config");

module.exports = {
  name: "lirik",
  description: "Mencari lirik lagu via Genius.",
  run: async (sock, msg, args) => {
    const query = args.join(" ");
    if (!query) {
      return sock.sendMessage(
        msg.key.remoteJid,
        { text: "Contoh: .lirik to the bone" },
        { quoted: msg }
      );
    }

    if (
      !config.geniusApiKey ||
      config.geniusApiKey.includes("TOKEN_YANG_ANDA_SALIN")
    ) {
      return sock.sendMessage(
        msg.key.remoteJid,
        { text: "API Key untuk Genius belum diatur di file config.js" },
        { quoted: msg }
      );
    }

    try {
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: `Mencari lirik untuk "${query}"` },
        { quoted: msg }
      );

      const client = new Client(config.geniusApiKey);

      const searches = await client.songs.search(query);
      const firstSong = searches[0];

      if (!firstSong) {
        throw new Error(`Lirik untuk lagu "${query}" tidak ditemukan.`);
      }

      const lyrics = await firstSong.lyrics();
      const thumbnailUrl = firstSong.image;

      const replyText =
        `*Judul:* ${firstSong.title}\n` +
        `*Artis:* ${firstSong.artist.name}\n\n` +
        `*Lirik:*\n${lyrics}`;

      let messagePayload = {
        text: replyText,
      };

      if (thumbnailUrl) {
        messagePayload = {
          image: { url: thumbnailUrl },
          caption: replyText,
        };
      }

      await sock.sendMessage(msg.key.remoteJid, messagePayload, {
        quoted: msg,
      });
    } catch (error) {
      console.error("Error pada perintah lirik (Genius):", error);
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `Maaf, terjadi error atau lirik untuk lagu "${query}" tidak ditemukan.`,
        },
        { quoted: msg }
      );
    }
  },
};
