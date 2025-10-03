const { addWarning, clearWarning } = require("../lib/database.js");

module.exports = {
  name: "hitamkan",
  isAdmin: true,
  description: "Memberi warning ke member (khusus admin).",
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
        { text: "Perintah ini hanya bisa digunakan oleh admin grup." },
        { quoted: msg }
      );
    }

    const mentionedJid =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentionedJid) {
      return sock.sendMessage(
        from,
        {
          text: "Contoh: .hitamkan @user alasannya",
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
        { text: "Tidak bisa memberikan peringatan kepada sesama admin." },
        { quoted: msg }
      );
    }
    // --------------------------------------------------------

    const reason = args.slice(1).join(" ") || "Tidak ada alasan spesifik";
    const newCount = addWarning(
      mentionedJid,
      from,
      `Diberikan oleh admin: ${reason}`
    );
    const maxWarnings = 3;

    await sock.sendMessage(from, {
      text: `Warning diberikan kepada @${
        mentionedJid.split("@")[0]
      }.\nTotal Warning: ${newCount}/${maxWarnings}`,
      mentions: [mentionedJid],
    });

    if (newCount >= maxWarnings) {
      await sock.sendMessage(from, {
        text: `@${mentionedJid.split("@")[0]} di-kick karena batas warning.`,
        mentions: [mentionedJid],
      });
      await sock.groupParticipantsUpdate(from, [mentionedJid], "remove");
      clearWarning(mentionedJid, from);
    }
  },
};
