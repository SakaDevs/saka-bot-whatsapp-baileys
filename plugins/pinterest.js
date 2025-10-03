const axios = require("axios");
const config = require("../config");

module.exports = {
  name: "pinterest",
  description: "Mencari gambar di Pinterest.",
  run: async (sock, msg, args) => {
    const query = args.join(" ");
    if (!query) {
      return sock.sendMessage(
        msg.key.remoteJid,
        {
          text: "Contoh: .pinterest kucing lucu",
        },
        { quoted: msg }
      );
    }

    if (!config.tiktokApiKey) {
      // Kita gunakan API key yang sama
      return sock.sendMessage(
        msg.key.remoteJid,
        { text: "API Key belum diatur di file config.js" },
        { quoted: msg }
      );
    }

    try {
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: `Mencari "${query}" di Pinterest...` },
        { quoted: msg }
      );

      const apiUrl = `https://api.lolhuman.xyz/api/pinterest?apikey=${config.tiktokApiKey}&query=${query}`;
      const response = await axios.get(apiUrl);

      if (response.data.status !== 200) {
        throw new Error("Gagal mengambil data dari API.");
      }

      const imageUrl = response.data.result;
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          image: { url: imageUrl },
          caption: `Hasil pencarian untuk "${query}"`,
        },
        { quoted: msg }
      );
    } catch (error) {
      console.error("Error pada perintah pinterest:", error);
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: "Maaf, terjadi error atau gambar tidak ditemukan." },
        { quoted: msg }
      );
    }
  },
};
