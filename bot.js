const { webcrypto } = require("node:crypto");
global.crypto = webcrypto;

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode-terminal");
const config = require("./config");
const welcomeMessage = require("./plugins/welcome.js");
const cron = require("node-cron");
const sendMorningMessage = require("./plugins/morningMessages.js");

const {
  addWarning,
  clearWarning,
  incrementMessageCount,
  getMute,
  removeMute,
} = require("./lib/database.js");

async function badWordsFilter(sock, msg) {
  const from = msg.key.remoteJid;
  if (!from.endsWith("@g.us")) return;
  const sender = msg.key.participant || msg.key.remoteJid;
  const messageText =
    msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
  if (!messageText || messageText.startsWith(".")) return;
  const badWords = [
    "kontol",
    "memek",
    "anjing",
    "bangsat",
    "asu",
    "taik",
    "babi",
    "bajingan",
    "lonte",
    "ngentot",
  ];
  const lowerCaseText = messageText.toLowerCase();
  const foundBadWord = badWords.find((word) =>
    new RegExp(`\\b${word}\\b`, "i").test(lowerCaseText)
  );
  if (foundBadWord) {
    try {
      const groupMetadata = await sock.groupMetadata(from);
      const admins = groupMetadata.participants
        .filter((p) => p.admin)
        .map((p) => p.id);
      if (admins.includes(sender)) return;
      await sock.sendMessage(from, { delete: msg.key });
      const newCount = addWarning(
        sender,
        from,
        `Menggunakan kata: ${foundBadWord}`
      );
      const maxWarnings = 3;
      await sock.sendMessage(from, {
        text: `Peringatan ${newCount}/${maxWarnings} untuk @${
          sender.split("@")[0]
        }. Jangan gunakan kata kasar.`,
        mentions: [sender],
      });
      if (newCount >= maxWarnings) {
        await sock.sendMessage(from, {
          text: `@${
            sender.split("@")[0]
          } dikeluarkan karena telah mencapai batas peringatan.`,
          mentions: [sender],
        });
        await sock.groupParticipantsUpdate(from, [sender], "remove");
        clearWarning(sender, from);
      }
    } catch (error) {
      console.error("Error pada fitur badwords terpusat:", error);
    }
  }
}

async function messageCounter(sock, msg) {
  const from = msg.key.remoteJid;
  if (!from.endsWith("@g.us")) return;
  const sender = msg.key.participant || msg.key.remoteJid;
  incrementMessageCount(sender, from);
}

async function muteHandler(sock, msg) {
  const from = msg.key.remoteJid;
  if (!from.endsWith("@g.us")) return;
  const sender = msg.key.participant || msg.key.remoteJid;
  const expirationTimestamp = getMute(sender, from);
  if (expirationTimestamp) {
    if (Date.now() < expirationTimestamp) {
      await sock.sendMessage(from, { delete: msg.key });
    } else {
      removeMute(sender, from);
      await sock.sendMessage(from, {
        text: `Masa mute @${sender.split("@")[0]} telah berakhir.`,
        mentions: [sender],
      });
    }
  }
}

async function antiSpamHandler(sock, msg) {
  const from = msg.key.remoteJid;
  if (!from.endsWith("@g.us")) return false;
  const sender = msg.key.participant || msg.key.remoteJid;
  const now = Date.now();
  if (!spamTracker[sender]) {
    spamTracker[sender] = [];
  }
  spamTracker[sender].push(now);
  spamTracker[sender] = spamTracker[sender].filter((ts) => now - ts < 10000);
  if (spamTracker[sender].length > 5) {
    try {
      const groupMetadata = await sock.groupMetadata(from);
      const admins = groupMetadata.participants
        .filter((p) => p.admin)
        .map((p) => p.id);
      if (admins.includes(sender)) {
        return false;
      }
      console.log(`[SPAM] Terdeteksi dari ${sender} di grup ${from}`);
      await sock.sendMessage(from, {
        text: `Peringatan untuk @${
          sender.split("@")[0]
        }, mohon jangan melakukan spam.`,
        mentions: [sender],
      });
      spamTracker[sender] = [];
      return true;
    } catch (error) {
      console.error("Error pada fitur anti-spam:", error);
    }
  }
  return false;
}

const commands = new Map();
const spamTracker = {};
const commandFiles = fs
  .readdirSync(path.join(__dirname, "plugins"))
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  if (
    [
      "badwords.js",
      "welcome.js",
      "messageCounter.js",
      "morningMessage.js",
    ].includes(file)
  )
    continue;
  try {
    const command = require(path.join(__dirname, "plugins", file));
    if (command.name) {
      commands.set(command.name, command);
      console.log(`Memuat perintah: ${command.name}`);
    }
  } catch (error) {
    console.error(`Gagal memuat perintah dari file ${file}:`, error);
  }
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const sock = makeWASocket({ auth: state, logger: pino({ level: "silent" }) });
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log("Silakan scan QR code di bawah ini untuk login:");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect.error instanceof Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        "Koneksi terputus karena ",
        lastDisconnect.error,
        ", mencoba menghubungkan kembali...",
        shouldReconnect
      );
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("Koneksi WhatsApp terbuka! Bot siap digunakan.");
      if (config.morningMessage.enabled) {
        console.log(
          `Pesan pagi terjadwal untuk grup ${config.morningMessage.groupId} pada ${config.morningMessage.cronTime}`
        );
        cron.schedule(
          config.morningMessage.cronTime,
          () => {
            sendMorningMessage(sock, config.morningMessage.groupId);
          },
          { scheduled: true, timezone: "Asia/Jakarta" }
        );
      }
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    await muteHandler(sock, msg);
    const isSpam = await antiSpamHandler(sock, msg);
    if (isSpam) return;
    await badWordsFilter(sock, msg);
    await messageCounter(sock, msg);

    const messageText =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption;
    if (!messageText || !messageText.startsWith(config.prefix)) {
      const stickerCommand = commands.get("s");
      if (stickerCommand) {
        const text = msg.message.extendedTextMessage?.text;
        if (text === `${config.prefix}s`) {
          await stickerCommand.run(sock, msg, []);
        }
      }
      return;
    }
    const args = messageText.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = commands.get(commandName);
    if (!command) return;
    try {
      console.log(`Menjalankan perintah: ${commandName}`);
      await command.run(sock, msg, args, commands);
    } catch (error) {
      console.error(`Error saat menjalankan perintah ${commandName}:`, error);
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: "Terjadi error saat menjalankan perintah ini." },
        { quoted: msg }
      );
    }
  });

  sock.ev.on("group-participants.update", async (event) => {
    await welcomeMessage(sock, event);
  });
}

// Tambah di atas (install dulu express: npm install express)
const express = require("express");
const app = express();

// Route utama (buat dicek uptime robot)
app.get("/", (req, res) => {
  res.send("Bot WhatsApp Hitori sedang berjalan 🚀");
});

// Jalankan server di port Replit
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Web server berjalan di port ${PORT}`);
});

connectToWhatsApp();
