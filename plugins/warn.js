const { getWarning } = require("../lib/database.js");

module.exports = {
  name: "warn",
  description: "Mengecek status warning pribadi.",
  run: async (sock, msg, args) => {
    const sender = msg.key.participant || msg.key.remoteJid;
    const from = msg.key.remoteJid;

    const myWarnings = getWarning(sender, from);
    if (myWarnings.count === 0) {
      return sock.sendMessage(
        from,
        { text: "Kamu bersih dari warning. Pertahankan!" },
        { quoted: msg }
      );
    }

    let warnText = `Status Warning Anda:\nTotal: ${myWarnings.count}\n\nAlasan:\n`;
    myWarnings.reasons.forEach((r, i) => {
      warnText += `${i + 1}. ${r}\n`;
    });
    await sock.sendMessage(from, { text: warnText }, { quoted: msg });
  },
};
