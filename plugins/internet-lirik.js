import axios from 'axios';

async function lyrics(title) {
  try {
    if (!title) throw new Error('Title is required')
    
    const { data } = await axios.get(`https://api.popcat.xyz/v2/lyrics?song=${encodeURIComponent(title)}`, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
    })

    if (data.error) throw new Error('No lyrics found')
    
    const { title: songTitle, artist, lyrics: songLyrics, image, url } = data.message
    
    return {
      title: songTitle || 'Unknown Track',
      artist: artist || 'Unknown Artist', 
      lyrics: songLyrics || 'No lyrics available',
      image: image || null,
      url: url || null
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

let handler = async (m, { conn, args }) => {
  try {
    m.reply('🎵 Searching for lyrics...')
    
    if (!args.length) throw new Error('Please provide a song title! Example: .lirik secukupnya')
    
    const title = args.join(' ')
    const result = await lyrics(title)
    
    let response = `🎵 *${result.title}*\n`
    response += `👤 *Artist:* ${result.artist}\n\n`
    response += `📝 *Lyrics:*\n${result.lyrics}`
    
    if (result.url) {
      response += `\n\n🔗 *Source:* ${result.url}`
    }
    
    // Send image if available
    if (result.image) {
      await conn.sendMessage(m.chat, {
        image: { url: result.image },
        caption: response
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, { text: response }, { quoted: m })
    }
    
  } catch (err) {
    m.reply(`❌ Error: ${err.message}`)
  }
}

handler.help = ['lirik']
handler.tags = ['internet']
handler.command = ['lirik']

export default handler;