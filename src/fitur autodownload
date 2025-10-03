import axios from 'axios'

// Regex untuk deteksi URL dari berbagai platform
const URL_PATTERNS = {
  instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[\w-]+/gi,
  tiktok: /(?:https?:\/\/)?(?:www\.|vt\.|vm\.)?tiktok\.com\/[\w@.-]+/gi,
  youtube: /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[\w-]+/gi,
  facebook: /(?:https?:\/\/)?(?:www\.|m\.|web\.)?facebook\.com\/(?:watch\/?\?v=|share\/v\/|reel\/|[\w.-]+\/videos\/)\d+/gi,
  twitter: /(?:https?:\/\/)?(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\/[\w]+\/status\/\d+/gi,
  threads: /(?:https?:\/\/)?(?:www\.)?threads\.net\/@[\w.]+\/post\/[\w-]+/gi,
  spotify: /(?:https?:\/\/)?(?:open\.)?spotify\.com\/(?:track|album|playlist)\/[\w-]+/gi,
  soundcloud: /(?:https?:\/\/)?(?:www\.)?soundcloud\.com\/[\w-]+\/[\w-]+/gi,
  pinterest: /(?:https?:\/\/)?(?:www\.)?pinterest\.com\/pin\/\d+/gi,
  reddit: /(?:https?:\/\/)?(?:www\.)?reddit\.com\/r\/[\w]+\/comments\/[\w]+/gi,
  twitch: /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/videos\/\d+/gi,
  vimeo: /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/\d+/gi
}

// Konfigurasi API
const API_CONFIG = {
  url: "https://api.platform.web.id/aio",
  timeout: 60000,
  userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
}

// Helper untuk deteksi URL
function detectURL(text) {
  for (const [platform, regex] of Object.entries(URL_PATTERNS)) {
    const match = text.match(regex)
    if (match) {
      return { platform, url: match[0] }
    }
  }
  return null
}

// Helper untuk nama platform yang lebih readable
function getPlatformName(platform) {
  const names = {
    instagram: '📸 Instagram',
    tiktok: '🎵 TikTok',
    youtube: '▶️ YouTube',
    facebook: '👥 Facebook',
    twitter: '🐦 Twitter/X',
    threads: '🧵 Threads',
    spotify: '🎧 Spotify',
    soundcloud: '🎶 SoundCloud',
    pinterest: '📌 Pinterest',
    reddit: '🤖 Reddit',
    twitch: '🎮 Twitch',
    vimeo: '🎬 Vimeo'
  }
  return names[platform] || '🌐 ' + platform
}

// Fungsi untuk download video menggunakan API yang benar
async function aioDownloader(url) {
  try {
    if (!url) throw new Error('URL is required')
    
    const { data } = await axios.get(`${API_CONFIG.url}?url=${encodeURIComponent(url)}`, {
      headers: {
        'user-agent': API_CONFIG.userAgent
      },
      timeout: API_CONFIG.timeout
    })
    
    if (!data.success) {
      throw new Error(data.error_message || 'Failed to download')
    }
    
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

const plugin = {
  name: 'auto-download',
  
  async before(m, { conn }) {
    try {
      // Validasi pesan dasar
      const text = m.text || ''
      if (!text || m.key.fromMe) return
      
      // Deteksi URL di pesan
      const detected = detectURL(text)
      if (!detected) return
      
      const { platform, url } = detected
      
      // Validasi URL format
      if (!url.match(/^https?:\/\/.+/)) {
        return
      }
      
      // Kirim pesan loading
      await conn.sendMessage(m.chat, { react: { text: '🔮', key: m.key } })
      
      // Request ke API dengan function yang sudah teruji
      const result = await aioDownloader(url)
      
      // Ambil link pertama
      const firstLink = result.downloadLinks[0]
      
      // Buat caption
      let caption = `✅ *Download Berhasil!*\n\n`
      caption += `📱 Platform: ${getPlatformName(platform)}\n`
      caption += `🔗 URL: ${url}\n`
      caption += `📎 Total Links: ${result.downloadLinks.length}\n`
      caption += `⏰ ${new Date().toLocaleString('id-ID')}`
      
      // Coba kirim sebagai video
      try {
        await conn.sendMessage(m.chat, {
          video: { url: firstLink },
          caption: caption,
          mimetype: 'video/mp4'
        }, { quoted: m })

      } catch (videoError) {
        console.log('Failed to send as video, trying as document...')
        
        // Jika gagal kirim sebagai video, coba sebagai dokumen
        try {
          await conn.sendMessage(m.chat, {
            document: { url: firstLink },
            fileName: `download_${Date.now()}.mp4`,
            caption: caption,
            mimetype: 'video/mp4'
          }, { quoted: m })
          
        } catch (docError) {
          console.log('Failed to send as document, sending links...')
          
          // Jika kedua cara gagal, kirim link saja
          let response = caption + '\n\n🔗 *Download Links:*\n\n'
          result.downloadLinks.forEach((link, index) => {
            response += `${index + 1}. ${link}\n\n`
          })
          
          await conn.sendMessage(m.chat, { 
            text: response 
          }, { quoted: m })
        }
      }
      
      // Jika ada link tambahan, kirim sebagai pesan terpisah
      if (result.downloadLinks.length > 1) {
        let additionalLinks = `📎 *Link Download Tambahan:*\n\n`
        result.downloadLinks.slice(1).forEach((link, index) => {
          additionalLinks += `${index + 2}. ${link}\n\n`
        })
        
        await conn.sendMessage(m.chat, { 
          text: additionalLinks 
        }, { quoted: m })
      }
      
    } catch (err) {
      console.error('Auto Download Error:', err)
      
      // Pesan error yang informatif
      let errorMsg = '❌ *Download Gagal*\n\n'
      
      if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        errorMsg += '⏱️ Request timeout. Server terlalu lama merespons.\n\n_Coba lagi nanti_'
      } else if (err.response) {
        const status = err.response.status
        if (status === 400) {
          errorMsg += '🔗 URL tidak valid atau tidak didukung'
        } else if (status === 404) {
          errorMsg += '📭 Video tidak ditemukan atau sudah dihapus'
        } else if (status === 429) {
          errorMsg += '⚠️ Terlalu banyak request. Tunggu beberapa saat'
        } else if (status === 500) {
          errorMsg += '🔧 Server sedang bermasalah. Coba lagi nanti'
        } else {
          errorMsg += `⚠️ Error ${status}: ${err.response.data?.message || 'Unknown error'}`
        }
      } else if (err.message) {
        errorMsg += `ℹ️ ${err.message}`
      } else {
        errorMsg += '❓ Terjadi kesalahan tidak diketahui'
      }
      
      // Kirim pesan error
      await conn.sendMessage(m.chat, { react: { text: '🧢', key: m.key } }).catch(e => console.error('Gagal mengirim pesan error:', e))
    }
  }
}

export default plugin