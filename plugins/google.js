// File: plugins/google.js (Versi API Resmi)
const axios = require("axios");
const config = require("../config");

module.exports = {
  name: "google",
  description: "Mencari informasi di Google via API resmi.",
  run: async (sock, msg, args) => {
    const query = args.join(" ");
    if (!query) {
      return sock.sendMessage(
        msg.key.remoteJid,
        { text: "Mohon berikan teks untuk dicari." },
        { quoted: msg }
      );
    }

    if (!config.googleApiKey || !config.googleSearchEngineId) {
      return sock.sendMessage(
        msg.key.remoteJid,
        {
          text: "API Key atau Search Engine ID Google belum diatur di config.js",
        },
        { quoted: msg }
      );
    }

    try {
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: `Mencari "${query}" di Google...` },
        { quoted: msg }
      );

      const apiUrl = `https://www.googleapis.com/customsearch/v1`;
      const params = {
        key: config.googleApiKey,
        cx: config.googleSearchEngineId,
        q: query,
      };

      const response = await axios.get(apiUrl, { params });
      const results = response.data.items;

      if (!results || results.length === 0) {
        return sock.sendMessage(
          msg.key.remoteJid,
          { text: `Tidak ada hasil yang ditemukan untuk "${query}".` },
          { quoted: msg }
        );
      }

      let replyText = `Hasil Pencarian Google untuk "${query}":\n\n`;
      results.slice(0, 5).forEach((item, index) => {
        replyText += `*${index + 1}. ${item.title}*\n`;
        replyText += `_${item.snippet}_\n`;
        replyText += `*Link:* ${item.link}\n\n`;
      });

      await sock.sendMessage(
        msg.key.remoteJid,
        { text: replyText },
        { quoted: msg }
      );
    } catch (error) {
      console.error(
        "Error pada perintah google (API):",
        error.response ? error.response.data : error.message
      );
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: "Maaf, terjadi error saat melakukan pencarian Google." },
        { quoted: msg }
      );
    }
  },
};
