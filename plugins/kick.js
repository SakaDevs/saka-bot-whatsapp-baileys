module.exports = {
  name: "kick",
  isAdmin: true,
  description: "Mengeluarkan anggota dari grup (khusus admin).",
  run: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const groupMetadata = await sock.groupMetadata(from);
    const senderAdmin = groupMetadata.participants.find(
      (p) => p.id === sender
    )?.admin;
    const bot = groupMetadata.participants.find((p) =>
      p.id.startsWith(sock.user.id.split(":")[0])
    )?.admin;

    if (!senderAdmin) {
      return sock.sendMessage(
        from,
        { text: "Perintah ini hanya bisa digunakan oleh admin grup." },
        { quoted: msg }
      );
    }

    if (!bot) {
      return sock.sendMessage(
        from,
        { text: "Bot harus menjadi admin untuk menggunakan perintah ini." },
        { quoted: msg }
      );
    }

    const mentionedJid =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentionedJid) {
      return sock.sendMessage(
        from,
        {
          text: "Contoh: .kick @user",
        },
        { quoted: msg }
      );
    }

    // --- LOGIKA PERLINDUNGAN ADMIN DITAMBAHKAN DI SINI ---
    const targetAdmin = groupMetadata.participants.find(
      (p) => p.id === mentionedJid
    )?.admin;
    if (targetAdmin) {
      return sock.sendMessage(
        from,
        { text: "Tidak bisa mengeluarkan sesama admin." },
        { quoted: msg }
      );
    }
    // --------------------------------------------------------

    await sock.sendMessage(from, {
      text: `Mengeluarkan @${mentionedJid.split("@")[0]} dari grup.`,
      mentions: [mentionedJid],
    });
    await sock.groupParticipantsUpdate(from, [mentionedJid], "remove");
  },
};
