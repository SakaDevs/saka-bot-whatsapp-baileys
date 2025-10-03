const { setMute } = require("../lib/database.js");

function parseDuration(durationStr) {
  if (!durationStr) return null;
  const value = parseInt(durationStr.slice(0, -1));
  const unit = durationStr.slice(-1).toLowerCase();
  if (isNaN(value)) return null;

  switch (unit) {
    case "s":
      return { ms: value * 1000, text: `${value} detik` };
    case "m":
      return { ms: value * 60 * 1000, text: `${value} menit` };
    case "j":
      return { ms: value * 60 * 60 * 1000, text: `${value} jam` };
    case "h":
      return { ms: value * 24 * 60 * 60 * 1000, text: `${value} hari` };
    default:
      return null;
  }
}

module.exports = {
  name: "mute",
  isAdmin: true,
  description: "Mute anggota grup untuk durasi tertentu (khusus admin).",
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
        { text: "Tag pengguna yang ingin di-mute. Contoh: .mute @user 1j" },
        { quoted: msg }
      );
    }

    const duration = parseDuration(args[1]);
    if (!duration) {
      return sock.sendMessage(
        from,
        {
          text: "Format durasi salah. Gunakan s (detik), m (menit), j (jam), atau h (hari).\nContoh: .mute @user 1j",
        },
        { quoted: msg }
      );
    }

    const expirationTimestamp = Date.now() + duration.ms;
    setMute(mentionedJid, from, expirationTimestamp);

    const replyText = `@${mentionedJid.split("@")[0]} di-mute selama ${
      duration.text
    }.`;
    await sock.sendMessage(
      from,
      { text: replyText, mentions: [mentionedJid] },
      { quoted: msg }
    );
  },
};
