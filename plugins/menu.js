const config = require("../config");

module.exports = {
  name: "menu",
  description: "Menampilkan semua menu perintah.",
  run: async (sock, msg, args) => {
    const botName = config.botName || "BOT";
    const prefix = config.prefix;

    const menuText = `*╭───[ 🤖 MENU ${botName.toUpperCase()} 🤖 ]───╮*
*│*
*│* 📥 *Menu Downloader*
*│* ┠> *${prefix}ytmp3 <url>*
*│* ┠> *${prefix}ytmp4 <url>* (Max 1 Menit)
*│* ┠> *${prefix}tiktok <url>*
*│* ┠> *${prefix}ttmp3 <url>*
*│*
*│* 🔎 *Menu Pencarian*
*│* ┠> *${prefix}google <nama>*
*│* ┠> *${prefix}ytsearch <nama>*
*│* ┠> *${prefix}lirik <judul lagu>*
*│*
*│* 👥 *Menu Grup & Info*
*│* ┠> *${prefix}myrank*
*│* ┠> *${prefix}warn*
*│* ┠> *${prefix}req <pesan>*
*│* ┠> *${prefix}report @user <alasan>*
*│*
*│* ⚙️ *Utilitas Lainnya*
*│* ┠> *${prefix}s* (Reply/caption gambar/video)
*│* ┠> *${prefix}cuaca <kota>*
*│* ┠> *${prefix}getid*
*│* ┠> *${prefix}ping*
*│*
*│* 🛡️ *Menu Admin*
*│* ┠> *${prefix}memberrank*
*│* ┠> *${prefix}checkrank @user*
*│* ┠> *${prefix}resetrank*
*│* ┠> *${prefix}checkwarn @user*
*│* ┠> *${prefix}hitamkan @user <alasan>*
*│* ┠> *${prefix}putihkan @user*
*│* ┠> *${prefix}mute @user <durasi>*
*│* ┠> *${prefix}unmute @user*
*│* ┠> *${prefix}kick @user*
*│*
*╰───[ Dibuat oleh ${config.ownerNumber.split("@")[0]} ]───╯*`;

    await sock.sendMessage(
      msg.key.remoteJid,
      { text: menuText },
      { quoted: msg }
    );
  },
};
