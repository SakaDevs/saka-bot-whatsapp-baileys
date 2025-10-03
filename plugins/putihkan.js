const { clearWarning } = require("../lib/database.js");

module.exports = {
  name: "putihkan",
  isAdmin: true,
  description: "Menghapus semua warning member (khusus admin).",
  run: async (sock, msg, args) => {
    const mentionedJid =
      msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentionedJid)
      return sock.sendMessage(
        msg.key.remoteJid,
        { text: "Tag member yang ingin diputihkan." },
        { quoted: msg }
      );

    const isCleared = clearWarning(mentionedJid, msg.key.remoteJid);
    if (isCleared) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `Semua warning untuk @${
          mentionedJid.split("@")[0]
        } telah dihapus.`,
        mentions: [mentionedJid],
      });
    } else {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `Member @${mentionedJid.split("@")[0]} tidak punya warning.`,
        mentions: [mentionedJid],
      });
    }
  },
};
