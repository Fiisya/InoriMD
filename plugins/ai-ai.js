import uploadImage from '../lib/uploadImage.js'
import fetch from 'node-fetch'

let chatHistory = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (text?.toLowerCase().includes('resetchat')) {
        delete chatHistory[m.chat]
        return m.reply('✅ Chat history telah direset!')
    }

    const quoted = m && (m.quoted || m)
    let imageUrl = ''
    let mime = (quoted?.msg || quoted)?.mimetype || quoted?.mediaType || ''

    if (quoted && /image/.test(mime) && !/webp/.test(mime)) {
        await conn.reply(m.chat, '⏳ Tunggu, sedang upload gambar...', m)
        try {
            const img = await quoted.download?.()
            if (!img) throw new Error('Gagal mendownload gambar.')
            imageUrl = await uploadImage(img)
        } catch (err) {
            console.error('❌ Error upload image:', err)
            return m.reply('🚩 Gagal mengunggah gambar. Coba lagi.')
        }
    }

    if (!text) throw `Contoh:\n${usedPrefix + command} siapa elon musk?\nAtau ketik: ${usedPrefix + command} kirim/reply gambar + prompt`

    try {
        if (/^(buatkan|generate|gambar)\b/i.test(text)) {
            const resultimage = await (await fetch(`https://api.nekolabs.my.id/ai/imagen/4-fast?prompt=${encodeURIComponent(text)}&ratio=1%3A1`)).json()
            if (!resultimage.result) throw new Error('Gagal generate gambar.')
            await conn.sendMessage(
                m.chat,
                { image: { url: resultimage.result }, caption: `✨ *AI Image Generated*\nPrompt: ${text}` },
                { quoted: m }
            )
            return
        }

        if (imageUrl) {
            const apiUrl = `https://api.nekolabs.my.id/ai/gemini/nano-banana?prompt=${encodeURIComponent(text)}&imageUrl=${encodeURIComponent(imageUrl)}`
            const res = await fetch(apiUrl)
            const json = await res.json()
            if (!json || !json.result) {
                throw new Error(json?.message || "API tidak mengembalikan hasil gambar.")
            }
            const imgRes = await fetch(json.result)
            const resultBuffer = await imgRes.buffer()
            await conn.sendMessage(
                m.chat,
                { image: resultBuffer, caption: `✨ *AI Image Result*\nPrompt: ${text}` },
                { quoted: m }
            )
            return
        }

        let chatId = m.chat
        if (!chatHistory[chatId]) chatHistory[chatId] = []
        chatHistory[chatId].push(`User: ${text}`)

        let conversation = chatHistory[chatId].join("\n")
        let apiURL = `https://api.nekolabs.my.id/ai/claude/sonnet-4?text=${encodeURIComponent(conversation)}`
        if (imageUrl) apiURL += `&imageUrl=${encodeURIComponent(imageUrl)}`

        let res = await fetch(apiURL)
        if (!res.ok) throw new Error('API tidak merespons.')
        let json = await res.json()

        const replyMessage = json.result || "⚠️ Tidak ada jawaban dari API"
        chatHistory[chatId].push(`Bot: ${replyMessage}`)

        if (chatHistory[chatId].length > 200) {
            chatHistory[chatId] = chatHistory[chatId].slice(-200)
        }

        await conn.sendMessage(m.chat, { text: replyMessage }, { quoted: m })

    } catch (err) {
        console.error('❌ AI Error:', err)
        m.reply(`sudah melampaui batas silahkan ketik .ai resetchat `)
    }
}

handler.help = ['ai <teks>', 'ai resetchat']
handler.tags = ['ai']
handler.command = /^ai$/i
handler.limit = true

export default handler
