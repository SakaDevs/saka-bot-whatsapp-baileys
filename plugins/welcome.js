async function welcomeMessage(sock, event) {
  const { id, participants, action } = event;

  if (action !== "add") {
    return;
  }

  try {
    const groupMetadata = await sock.groupMetadata(id);
    const groupName = groupMetadata.subject;

    for (const participant of participants) {
      const welcomeText = `Halo @${
        participant.split("@")[0]
      }, selamat datang di grup "${groupName}". Semoga betah ya!.`;

      await sock.sendMessage(id, {
        text: welcomeText,
        mentions: [participant],
      });
    }
  } catch (error) {
    console.error("Error pada fitur welcome message:", error);
  }
}

module.exports = welcomeMessage;
