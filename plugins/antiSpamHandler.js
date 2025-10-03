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
        text: `Peringatan untuk @${sender.split("@")[0]}, jangan spam.`,
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
