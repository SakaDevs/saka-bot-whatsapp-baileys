module.exports = {
  name: "getid",
  description: "Mengirim ID dari grup atau chat saat ini.",
  run: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const replyText = `ID Grup ini adalah:\n${from}`;

    await sock.sendMessage(from, { text: replyText }, { quoted: msg });
  },
};
