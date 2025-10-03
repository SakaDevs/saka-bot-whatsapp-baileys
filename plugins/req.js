const config = require("../config");

module.exports = {
  name: "req",
  description: "Mengirim permintaan skrip/fitur ke admin.",
  run: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const requestText = args.join(" ");

    if (!requestText) {
      return sock.sendMessage(
        from,
        {
          text: "Contoh: .req script hayabusa luckybox",
        },
        { quoted: msg }
      );
    }

    const groupMetadata = await sock.groupMetadata(from);
    const groupName = groupMetadata.subject;

    const adminMessage =
      `Pesan Permintaan Baru\n\n` +
      `Dari: @${sender.split("@")[0]}\n` +
      `Grup: ${groupName}\n` +
      `Permintaan: ${requestText}`;

    await sock.sendMessage(config.ownerNumber, {
      text: adminMessage,
      mentions: [sender],
    });
    await sock.sendMessage(
      from,
      { text: "Permintaan Anda telah berhasil dikirim ke admin besar." },
      { quoted: msg }
    );
  },
};
