const { removeMute } = require("../lib/database.js");

module.exports = {
  name: "unmute",
  isAdmin: true,
  description: "Unmute anggota grup (khusus admin).",
  run: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const groupMetadata = await sock.groupMetadata(from);
    const senderAdmin = groupMetadata.participants.find(
      (p) => p.id === sender
    )?.admin;
    if (!senderAdmin) {
      return sock.sendMessage(
        from,
        { text: "Perintah ini hanya untuk admin grup." },
        { quoted: msg }
      );
    }

    const mentionedJid =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentionedJid) {
      return sock.sendMessage(
        from,
        { text: "Tag pengguna yang ingin di-unmute. Contoh: .unmute @user" },
        { quoted: msg }
      );
    }

    const isUnmuted = removeMute(mentionedJid, from);

    if (isUnmuted) {
      const replyText = `@${mentionedJid.split("@")[0]} telah di-unmute.`;
      await sock.sendMessage(
        from,
        { text: replyText, mentions: [mentionedJid] },
        { quoted: msg }
      );
    } else {
      await sock.sendMessage(
        from,
        { text: `Pengguna tersebut tidak sedang di-mute.` },
        { quoted: msg }
      );
    }
  },
};
