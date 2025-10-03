const ytDlp = require("yt-dlp-exec");
const { promises: fs } = require("fs");
const path = require("path");
const { randomBytes } = require("crypto");

module.exports = {
  name: "ytmp3",
  description: "Mengunduh audio dari YouTube sebagai MP3 menggunakan yt-dlp.",
  run: async (sock, msg, args) => {
    const url = args[0];
    if (!url || !url.match(/youtu/)) {
      return sock.sendMessage(
        msg.key.remoteJid,
        {
          text: "Contoh: .ytmp3 https://www.youtube.com/watch?v=...",
        },
        { quoted: msg }
      );
    }

    const tempDir = path.join(__dirname, "../temp");
    const tempFileName = `${randomBytes(16).toString("hex")}.mp3`;
    const tempFilePath = path.join(tempDir, tempFileName);

    try {
      await fs.mkdir(tempDir, { recursive: true });
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

      await ytDlp.exec([
        url,
        "-f",
        "bestaudio[ext=m4a]/bestaudio",
        "--no-warnings",
        "-x",
        "--audio-format",
        "mp3",
        "-o",
        tempFilePath,
      ]);

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          document: { url: tempFilePath },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`,
        },
        { quoted: msg }
      );
    } catch (error) {
      console.error("Error pada perintah ytmp3 (yt-dlp):", error);
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: `Maaf, terjadi error: ${error.message}` },
        { quoted: msg }
      );
    } finally {
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        console.error("Gagal menghapus file audio sementara:", cleanupError);
      }
    }
  },
};
