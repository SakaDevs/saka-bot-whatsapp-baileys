const ytDlp = require("yt-dlp-exec");
const { promises: fs } = require("fs");
const path = require("path");
const { randomBytes } = require("crypto");

module.exports = {
  name: "ytmp4",
  description:
    "Mengunduh video dari YouTube sebagai MP4 dengan durasi maksimal 1 menit.",
  run: async (sock, msg, args) => {
    const url = args[0];
    if (!url || !url.match(/youtu/)) {
      return sock.sendMessage(
        msg.key.remoteJid,
        {
          text: "Contoh: .ytmp4 https://www.youtube.com/watch?v=...",
        },
        { quoted: msg }
      );
    }

    const tempDir = path.join(__dirname, "../temp");
    const tempFileName = `${randomBytes(16).toString("hex")}.mp4`;
    const tempFilePath = path.join(tempDir, tempFileName);

    try {
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: "Loading..." },
        { quoted: msg }
      );

      const info = await ytDlp(url, {
        dumpSingleJson: true,
        noWarnings: true,
      });

      const title = info.title;
      const durationInSeconds = info.duration;
      const maxDuration = 60;

      if (durationInSeconds > maxDuration) {
        return sock.sendMessage(
          msg.key.remoteJid,
          {
            text: `Video terlalu panjang (${Math.floor(
              durationInSeconds / 60
            )} menit ${
              durationInSeconds % 60
            } detik). Durasi maksimal adalah 1 menit.`,
          },
          { quoted: msg }
        );
      }

      await ytDlp.exec([
        url,
        "-f",
        "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--no-warnings",
        "-o",
        tempFilePath,
      ]);

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          video: { url: tempFilePath },
          caption: title,
          mimetype: "video/mp4",
        },
        { quoted: msg }
      );
    } catch (error) {
      console.error("Error pada perintah ytmp4 (yt-dlp):", error);
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: `Maaf, terjadi error: ${error.message}` },
        { quoted: msg }
      );
    } finally {
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        console.error("Gagal menghapus file video sementara:", cleanupError);
      }
    }
  },
};
