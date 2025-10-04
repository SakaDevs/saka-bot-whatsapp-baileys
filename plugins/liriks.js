const axios = require("axios");
const cheerio = require("cheerio");
const config = require("../config");

async function searchSong(query, apiKey) {
  const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(
    query
  )}`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };

  const response = await axios.get(searchUrl, { headers });
  const song = response.data.response.hits[0]?.result;
  return song;
}

async function scrapeLyrics(url) {
  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });
  const html = response.data;
  const $ = cheerio.load(html);

  // Cari div dengan class yang biasanya berisi lirik, lalu ganti <br> dengan newline
  $(
    'div[class^="Lyrics__Container"], div[class^="SongPage__LyricsWrapper"]'
  ).each((i, elem) => {
    $(elem).find("br").replaceWith("\n");
  });

  const lyrics = $(
    'div[class^="Lyrics__Container"], div[class^="SongPage__LyricsWrapper"]'
  )
    .text()
    .trim();
  return lyrics;
}

module.exports = {
  name: "lirik",
  description: "Mencari lirik lagu via Genius (metode scraping).",
  run: async (sock, msg, args) => {
    const query = args.join(" ");
    if (!query) {
      return sock.sendMessage(
        msg.key.remoteJid,
        { text: "Mohon berikan judul lagu." },
        { quoted: msg }
      );
    }

    if (
      !config.geniusApiKey ||
      config.geniusApiKey.includes("TOKEN_YANG_ANDA_SALIN")
    ) {
      return sock.sendMessage(
        msg.key.remoteJid,
        { text: "API Key untuk Genius belum diatur." },
        { quoted: msg }
      );
    }

    try {
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: `Mencari lirik untuk "${query}"` },
        { quoted: msg }
      );

      const song = await searchSong(query, config.geniusApiKey);

      if (!song) {
        throw new Error(`Lagu "${query}" tidak ditemukan.`);
      }

      const lyrics = await scrapeLyrics(song.url);
      const thumbnailUrl = song.song_art_image_thumbnail_url;

      const replyText =
        `*Judul:* ${song.title}\n` +
        `*Artis:* ${song.artist_names}\n\n` +
        `*Lirik:*\n${lyrics || "Lirik tidak tersedia di halaman ini."}`;

      let messagePayload = {
        text: replyText,
      };

      if (thumbnailUrl) {
        messagePayload = {
          image: { url: thumbnailUrl },
          caption: replyText,
        };
      }

      await sock.sendMessage(msg.key.remoteJid, messagePayload, {
        quoted: msg,
      });
    } catch (error) {
      console.error("Error pada perintah lirik (scraping):", error);
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `Maaf, lirik untuk lagu "${query}" tidak ditemukan.`,
        },
        { quoted: msg }
      );
    }
  },
};
