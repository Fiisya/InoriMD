import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender

let name = await conn.getName(m.sender)

let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png')

const fkontak = {
  key: {
    fromMe: false,
    participant: `0@s.whatsapp.net`,
    ...(m.chat ? {
      remoteJid: `status@broadcast`
    } : {})
  },
  message: {
    'contactMessage': {
      'displayName': name,
      'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;${name},;;;\nFN:${name},\nitem1.TEL;waid=${who.split('@')[0]}:${who.split('@')[0]}\nitem1.X-ABLabell:Ponsel\nEND:VCARD`,
      'jpegThumbnail': pp,
      thumbnail: pp,
      sendEphemeral: true
    }
  }
}

    const response = await fetch(`https://api.platform.web.id/github-search?q=InoriMD`);
    const result = await response.json();

    if (!result.status || result.results.length === 0) {
      m.reply('🔍 Tidak ditemukan repositori yang sesuai.');
      return;
    }

    const repo = result.results[0];
    const message = `
📦 Nama: ${repo.name}
👤 Pemilik: ${repo.owner}
🔗 URL Clone: ${repo.clone_url}
⭐ Stars: ${repo.stars}
🍴 Forks: ${repo.forks}
👁️ Watchers: ${repo.watchers}
📝 Is Private: ${repo.is_private ? 'Ya' : 'Tidak'}
📅 Dibuat pada: ${repo.created_at}
📅 Diperbarui pada: ${repo.updated_at}
    `.trim();
  await conn.sendMessage(m.chat, {
  footer: `*Powered By svazerID*`,
  interactiveButtons: [
        {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "⚡ GET SOURCE CODE",
                id: `.gitclone ${repo.clone_url}`
            })
        },
        {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
                display_text: "🌐 Visit Website",
                url: "https://github.com/svazerID/InoriMD",
                merchant_url: "https://github.com/svazerID/InoriMD"
            })
        }
            ],
  headerType: 1,
  viewOnce: true,
  document: fs.readFileSync('./README.md'),
  mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  fileName: 'Inori Yuzuriha',
  fileLength: 271000000000000,
  caption: message,
  contextInfo: {
   isForwarded: true, 
   mentionedJid: [m.sender], 
   forwardedNewsletterMessageInfo: {
   newsletterJid: '120363420643650987@newsletter',
   newsletterName: `Powered By: ${global.author}`
   }, 
    externalAdReply: {
      title: global.namebot,
      body: "I Am An Automated System WhatsApp Bot That Can Help To Do Something, Search And Get Data / Information Only Through WhatsApp.",
      thumbnailUrl: "https://kua.lat/inori",
      sourceUrl: sgc,
      mediaType: 1,
      renderLargerThumbnail: true,
    },
  },
}, { quoted: fkontak })
}

handler.help = ['sourcecode'];
handler.tags = ['info'];
handler.command = ['sourcecode', 'sc'];
handler.limit = true;

export default handler;
