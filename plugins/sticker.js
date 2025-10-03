const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

module.exports = {
  name: "s",
  description: "Membuat stiker dari gambar atau video/GIF dengan metadata.",
  run: async (sock, msg, args) => {
    const packName = "KazeoOfficial Stickers";
    const authorName = "Kazeo Ganteng";

    let mediaMessage = null;
    const messageText =
      msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    if (
      (msg.message.imageMessage || msg.message.videoMessage) &&
      (msg.message.imageMessage?.caption === ".s" ||
        msg.message.videoMessage?.caption === ".s")
    ) {
      mediaMessage = msg.message;
    } else if (
      msg.message.extendedTextMessage?.contextInfo?.quotedMessage &&
      messageText === ".s"
    ) {
      mediaMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage;
    } else {
      return sock.sendMessage(
        msg.key.remoteJid,
        {
          text: "Kirim gambar/video dengan caption `.s` atau reply media yang ada dengan `.s`.",
        },
        { quoted: msg }
      );
    }

    const isImage = !!mediaMessage.imageMessage;
    const isVideo = !!mediaMessage.videoMessage;

    if (!isImage && !isVideo) {
      return sock.sendMessage(
        msg.key.remoteJid,
        { text: "Media yang di-caption atau di-reply tidak valid." },
        { quoted: msg }
      );
    }

    try {
      if (isVideo) {
        const videoDuration = mediaMessage.videoMessage.seconds;
        if (videoDuration > 5) {
          return sock.sendMessage(
            msg.key.remoteJid,
            {
              text: "Maksimal durasi untuk stiker adalah 5 detik.",
            },
            { quoted: msg }
          );
        }
      }

      await sock.sendMessage(
        msg.key.remoteJid,
        { text: "Loading..." },
        { quoted: msg }
      );

      const buffer = await downloadMediaMessage(
        { message: mediaMessage, key: msg.key },
        "buffer",
        {},
        { reuploadRequest: sock.updateMediaMessage }
      );

      const sticker = new Sticker(buffer, {
        pack: packName,
        author: authorName,
        type: isVideo ? StickerTypes.FULL : StickerTypes.CROPPED,
        quality: 50,
      });

      const stickerBuffer = await sticker.toBuffer();

      await sock.sendMessage(msg.key.remoteJid, { sticker: stickerBuffer });
    } catch (error) {
      console.error("Error pada perintah sticker:", error);
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: `Maaf, gagal membuat stiker. Coba lagi nanti.` },
        { quoted: msg }
      );
    }
  },
};
