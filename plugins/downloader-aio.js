import axios from 'axios';

async function aioDownloader(url) {
  try {
    if (!url) throw new Error('URL is required')
    
    const { data } = await axios.get(`https://api.platform.web.id/aio?url=${encodeURIComponent(url)}`, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
    })

    if (!data.success) throw new Error(data.error_message || 'Failed to download')
    
    const { download_links, headers } = data.data
    
    if (!download_links || download_links.length === 0) {
      throw new Error('No download links found')
    }
    
    return {
      success: true,
      downloadLinks: download_links,
      headers: headers || {},
      referer: headers?.Referer || url
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

let handler = async (m, { conn, args, command }) => {
  try {
    if (!args.length) {
      return m.reply(`📥 *AIO Downloader*

Gunakan: .${command} <url>

*Supported platforms:*
• TikTok • Instagram • YouTube
• Twitter/X • Facebook • Spotify
• SoundCloud • Pinterest • Reddit
• Twitch • Vimeo • And many more!

*Example:*
.${command} https://vt.tiktok.com/ZSD7tYqMd/
.${command} https://instagram.com/p/xyz
.${command} https://youtube.com/watch?v=xyz`)
    }
    
    const url = args[0]
    
    // Validate URL
    if (!url.match(/^https?:\/\/.+/)) {
      throw new Error('Please provide a valid URL (must start with http:// or https://)')
    }
    
    m.reply('📥 Processing download...')
    
    const result = await aioDownloader(url)
    
    let response = `✅ *Download Success!*\n\n`
    response += `📎 *Total Links:* ${result.downloadLinks.length}\n\n`
    
    // Send first download link as video/document
    const firstLink = result.downloadLinks[0]
    
    try {
      // Try to send as video first
      await conn.sendMessage(m.chat, {
        video: { url: firstLink },
        caption: response,
        headers: result.headers
      }, { quoted: m })
    } catch (videoError) {
      try {
        // If video fails, try as document
        await conn.sendMessage(m.chat, {
          document: { url: firstLink },
          fileName: `download_${Date.now()}.mp4`,
          caption: response,
          headers: result.headers
        }, { quoted: m })
      } catch (docError) {
        // If both fail, send just the links
        response += `🔗 *Download Links:*\n`
        result.downloadLinks.forEach((link, index) => {
          response += `${index + 1}. ${link}\n\n`
        })
        
        await conn.sendMessage(m.chat, { text: response }, { quoted: m })
      }
    }
    
    // If multiple links, send others as text
    if (result.downloadLinks.length > 1) {
      let additionalLinks = `📎 *Additional Download Links:*\n\n`
      result.downloadLinks.slice(1).forEach((link, index) => {
        additionalLinks += `${index + 2}. ${link}\n\n`
      })
      
      await conn.sendMessage(m.chat, { text: additionalLinks }, { quoted: m })
    }
    
  } catch (err) {
    m.reply(`❌ Error: ${err.message}`)
  }
}

handler.help = ['aio', 'download', 'dl']
handler.tags = ['downloader']
handler.command = ['aio', 'download', 'dl', 'allinone']

export default handler;