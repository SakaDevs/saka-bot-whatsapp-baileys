// File: plugins/menu.js
const config = require("../config");

module.exports = {
  name: "menu",
  description: "Menampilkan semua menu perintah yang tersedia.",
  run: async (sock, msg, args, commands) => {
    const userCommands = [];
    const adminCommands = [];

    commands.forEach((command) => {
      // Hindari menampilkan menu itu sendiri di dalam daftar menu
      if (command.name === "menu") return;

      if (command.isAdmin) {
        adminCommands.push(command);
      } else {
        userCommands.push(command);
      }
    });

    userCommands.sort((a, b) => a.name.localeCompare(b.name));
    adminCommands.sort((a, b) => a.name.localeCompare(b.name));

    let menuText = `*╭───[ MENU ${config.botName.toUpperCase()}]───╮*\n`;
    menuText += `*│* List Menu Command Bot        `;
    menuText += `*│*\n`;

    if (userCommands.length > 0) {
      menuText += `*│* *Menu Pengguna*\n`;
      userCommands.forEach((cmd) => {
        menuText += `*│* ┠> *${config.prefix}${cmd.name}*\n`;
      });
      menuText += `*│*\n`;
    }

    if (adminCommands.length > 0) {
      menuText += `*│* *Menu Admin*\n`;
      adminCommands.forEach((cmd) => {
        menuText += `*│* ┠> *${config.prefix}${cmd.name}*\n`;
      });
      menuText += `*│*\n`;
    }

    menuText += `*╰───[ Dibuat oleh ${config.ownerNumber.split("@")[0]} ]───╯*`;

    await sock.sendMessage(
      msg.key.remoteJid,
      { text: menuText },
      { quoted: msg }
    );
  },
};
