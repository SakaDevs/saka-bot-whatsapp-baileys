const axios = require("axios");
const config = require("../config");

module.exports = {
  name: "cuaca",
  description: "Mendapatkan informasi cuaca terkini dari sebuah kota.",
  run: async (sock, msg, args) => {
    const kota = args.join(" ");

    if (!kota) {
      return sock.sendMessage(
        msg.key.remoteJid,
        { text: "Contoh: .cuaca Jakarta" },
        { quoted: msg }
      );
    }

    if (
      !config.weatherApiKey ||
      config.weatherApiKey === "GANTI_DENGAN_API_KEY_OPENWEATHERMAP_ANDA"
    ) {
      return sock.sendMessage(
        msg.key.remoteJid,
        { text: "API Key untuk fitur cuaca belum diatur di file config.js" },
        { quoted: msg }
      );
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      kota
    )}&units=metric&appid=${config.weatherApiKey}&lang=id`;

    try {
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: `Mencari cuaca untuk "${kota}"...` },
        { quoted: msg }
      );
      const response = await axios.get(url);
      const data = response.data;

      if (data.cod !== 200) {
        throw new Error(data.message || "Kota tidak ditemukan");
      }

      const namaKota = data.name;
      const negara = data.sys.country;
      const cuaca = data.weather[0].description;
      const suhu = data.main.temp;
      const terasaSeperti = data.main.feels_like;
      const kelembapan = data.main.humidity;
      const kecepatanAngin = data.wind.speed;

      const ikonCuaca = {
        cerah: "☀️",
        "langit cerah": "☀️",
        "sedikit berawan": "🌤️",
        "berawan sebagian": "🌥️",
        berawan: "☁️",
        "awan mendung": "☁️",
        kabut: "🌫️",
        "hujan ringan": "🌦️",
        "hujan sedang": "🌧️",
        "hujan lebat": "🌧️",
        "hujan deras": "🌧️",
        "hujan badai": "⛈️",
        "badai petir": "⛈️",
        salju: "❄️",
      };

      const ikon = ikonCuaca[cuaca.toLowerCase()] || "🌐";
      const deskripsiCuaca = cuaca.charAt(0).toUpperCase() + cuaca.slice(1);

      const hasil =
        `*Cuaca Terkini di ${namaKota}, ${negara}*\n\n` +
        `${ikon} *Cuaca:* ${deskripsiCuaca}\n` +
        `*Suhu:* ${suhu}°C\n` +
        `*Terasa seperti:* ${terasaSeperti}°C\n` +
        `*Kelembapan:* ${kelembapan}%\n` +
        `*Kecepatan Angin:* ${kecepatanAngin} m/s`;

      await sock.sendMessage(
        msg.key.remoteJid,
        { text: hasil },
        { quoted: msg }
      );
    } catch (error) {
      console.error("Error pada perintah cuaca:", error);
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: `Maaf, terjadi error atau kota "${kota}" tidak ditemukan.` },
        { quoted: msg }
      );
    }
  },
};
