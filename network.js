const axios = require("axios");

async function testConnection() {
  console.log(
    "Mencoba menghubungi https://www.google.com menggunakan axios dari Node.js..."
  );
  try {
    // Kita set timeout 15 detik untuk memastikan tidak menunggu selamanya
    const response = await axios.get("https://www.google.com", {
      timeout: 15000,
    });

    console.log("\n=============================================");
    console.log("✅ BERHASIL! Koneksi dari Node.js berhasil.");
    console.log("Status Kode:", response.status);
    console.log("Panjang Konten:", response.data.length, "bytes");
    console.log("=============================================");
  } catch (error) {
    console.error("\n=============================================");
    console.error("❌ GAGAL! Node.js tidak bisa terhubung ke internet.");
    console.error("Detail Error:", error.message);
    if (error.code) {
      console.error("Kode Error:", error.code);
    }
    if (error.request && !error.response) {
      console.error(
        "Pesan Tambahan: Request dibuat, tapi tidak ada respons yang diterima. Ini seringkali karena Firewall atau masalah koneksi."
      );
    }
    console.error("=============================================");
  }
}

testConnection();
