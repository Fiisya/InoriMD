import axios from 'axios'
import yts from 'yt-search'

let handler = async (m, { conn, usedPrefix, command, args }) => {
  if (!args[0]) throw `Contoh:\n${usedPrefix + command} https://youtu.be/abc123\n${usedPrefix + command} judul lagu`

  let query = args.join(" ")
  let url = ''
  let format = /yt(a|mp3)/i.test(command) ? 'mp3' : 'mp4'

  // cari video pakai yt-search
  let vidInfo
  if (/^https?:\/\//i.test(query)) {
    // kalau input URL langsung
    let search = await yts({ videoId: query.split("v=")[1] || query.split("/").pop() })
    vidInfo = search
    url = query
  } else {
    // kalau input keyword
    let search = await yts(query)
    vidInfo = search.videos[0]
    if (!vidInfo) throw '❌ Video tidak ditemukan.'
    url = vidInfo.url
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    let apiUrl = `https://api.platform.web.id/notube/download?url=${encodeURIComponent(url)}&format=${format}`
    let { data } = await axios.get(apiUrl)

    if (!data.download_url) throw '❌ Link download tidak ditemukan dari API.'

    // semua metadata pakai yt-search (bukan dari API notube)
    let title = vidInfo.title
    let thumbnail = vidInfo.thumbnail
    let duration = vidInfo.timestamp || '-'

    let caption = `📥 *YouTube Downloader*\n\n` +
                  `📌 Judul: *${title}*\n` +
                  `⏱️ Durasi: ${duration}\n` +
                  `📂 Format: ${format.toUpperCase()}\n` +
                  `🔗 URL: ${url}`

    if (format === 'mp3') {
      await conn.sendMessage(m.chat, {
        audio: { url: data.download_url },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title,
            body: "YouTube Downloader",
            thumbnailUrl: thumbnail,
            sourceUrl: url,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: { url: data.download_url },
        caption,
        fileName: `${title}.mp4`,
        mimetype: 'video/mp4',
        contextInfo: {
          externalAdReply: {
            title,
            body: "YouTube Downloader",
            thumbnailUrl: thumbnail,
            sourceUrl: url,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error(e)
    m.reply(`❌ Terjadi kesalahan: ${e?.response?.data?.message || e?.message || e}`)
  }
}

handler.help = ['ytmp3 <url/query>', 'ytmp4 <url/query>']
handler.tags = ['downloader']
handler.command = /^yt(mp3|mp4|a|v)$/i
handler.limit = true

export default handler