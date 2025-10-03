const { getWarning } = require("../lib/database.js");

module.exports = {
  name: "checkwarn",
  isAdmin: true,
  description: "Mengecek warning member lain (khusus admin).",
  run: async (sock, msg, args) => {
    const mentionedJid =
      msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentionedJid)
      return sock.sendMessage(
        msg.key.remoteJid,
        { text: "Tag member yang ingin dicek." },
        { quoted: msg }
      );

    const userWarnings = getWarning(mentionedJid, msg.key.remoteJid);
    if (userWarnings.count === 0) {
      return sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `Member @${mentionedJid.split("@")[0]} bersih dari warning.`,
          mentions: [mentionedJid],
        },
        { quoted: msg }
      );
    }

    let checkWarnText = `Status Warning untuk @${
      mentionedJid.split("@")[0]
    }:\nTotal: ${userWarnings.count}\n\nAlasan:\n`;
    userWarnings.reasons.forEach((r, i) => {
      checkWarnText += `${i + 1}. ${r}\n`;
    });
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: checkWarnText, mentions: [mentionedJid] },
      { quoted: msg }
    );
  },
};
