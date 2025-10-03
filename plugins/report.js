const config = require("../config");

module.exports = {
  name: "report",
  description: "Melaporkan pengguna ke admin.",
  run: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const mentionedJid =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!mentionedJid) {
      return sock.sendMessage(
        from,
        {
          text: "Contoh: .report @user",
        },
        { quoted: msg }
      );
    }

    const groupMetadata = await sock.groupMetadata(from);
    const groupName = groupMetadata.subject;

    const adminMessage =
      `Laporan Pengguna\n\n` +
      `Pelapor: @${sender.split("@")[0]}\n` +
      `Terlapor: @${mentionedJid.split("@")[0]}\n` +
      `Grup: ${groupName}\n\n`;

    await sock.sendMessage(config.ownerNumber, {
      text: adminMessage,
      mentions: [sender, mentionedJid],
    });
    await sock.sendMessage(
      from,
      { text: "Laporan Anda telah berhasil diteruskan ke admin besar." },
      { quoted: msg }
    );
  },
};
