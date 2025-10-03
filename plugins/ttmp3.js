const axios = require("axios");

module.exports = {
  name: "ttmp3",
  description: "Mengunduh audio dari video TikTok.",
  run: async (sock, msg, args) => {
    const url = args[0];
    if (!url || !url.includes("tiktok.com")) {
      return sock.sendMessage(
        msg.key.remoteJid,
        {
          text: "Contoh: .ttmp3 https://www.tiktok.com/...",
        },
        { quoted: msg }
      );
    }

    try {
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: "Loading..." },
        { quoted: msg }
      );

      const apiUrl = `https://www.tikwm.com/api/?url=${url}`;

      const response = await axios.get(apiUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      if (response.data.code !== 0) {
        throw new Error(response.data.msg || "Something Error");
      }

      const audioData = response.data.data;
      const audioUrl = audioData.music;

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
        },
        { quoted: msg }
      );
    } catch (error) {
      console.error("Error pada perintah ttmp3:", error);
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `Something Error`,
        },
        { quoted: msg }
      );
    }
  },
};
