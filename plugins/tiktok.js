const axios = require("axios");

module.exports = {
  name: "tiktok",
  description: "Mengunduh video dari TikTok tanpa watermark.",
  run: async (sock, msg, args) => {
    const url = args[0];
    if (!url || !url.includes("tiktok.com")) {
      return sock.sendMessage(
        msg.key.remoteJid,
        {
          text: "Contoh: .tiktok https://www.tiktok.com/...",
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
        throw new Error(
          response.data.msg || "Gagal mendapatkan data video dari API."
        );
      }

      const videoData = response.data.data;

      const videoUrl = videoData.play;
      const title = videoData.title || "Video TikTok";
      const author = videoData.author.unique_id || "Tidak diketahui";
      const duration = videoData.duration || 0;

      const minutes = Math.floor(duration / 60);
      const seconds = (duration % 60).toString().padStart(2, "0");
      const formattedDuration = `${minutes}:${seconds}`;

      const newCaption = `*Judul:* ${title}\n*Author:* @${author}\n*Durasi:* ${formattedDuration}`;

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          video: { url: videoUrl },
          caption: newCaption,
        },
        { quoted: msg }
      );
    } catch (error) {
      console.error("Error pada perintah tiktok:", error);
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `Maaf, terjadi error: Server mungkin sedang down atau link tidak valid.`,
        },
        { quoted: msg }
      );
    }
  },
};
