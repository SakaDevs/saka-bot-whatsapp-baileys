const axios = require("axios");

async function sendMorningMessage(sock, groupId) {
  if (!groupId || !groupId.endsWith("@g.us")) {
    console.log(
      "Peringatan: ID Grup untuk pesan pagi tidak valid atau belum diatur di config.js."
    );
    return;
  }

  try {
    console.log("Mengambil kutipan random untuk pesan pagi...");

    // Kita akan menggunakan API dari quotable.io yang gratis
    const response = await axios.get("https://api.quotable.io/random");
    const quote = response.data;

    if (!quote || !quote.content || !quote.author) {
      throw new Error("Format respons dari API kutipan tidak sesuai.");
    }

    const message =
      `Selamat Pagi Semuanya! ☀️\n\n` +
      `Berikut kutipan untuk memulai harimu:\n\n` +
      `_"${quote.content}"_\n` +
      `~ ${quote.author}\n\n` +
      `Semoga harimu menyenangkan!`;

    await sock.sendMessage(groupId, { text: message });
    console.log("Pesan pagi berhasil dikirim ke grup:", groupId);
  } catch (error) {
    console.error("Gagal mengirim pesan pagi:", error.message);
    // Kirim pesan fallback jika API gagal
    await sock.sendMessage(groupId, {
      text: "Selamat Pagi Semuanya! ☀️ Semoga harimu menyenangkan!",
    });
  }
}

module.exports = sendMorningMessage;
