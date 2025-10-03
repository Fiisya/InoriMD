import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) return m.reply(
    `Kirim perintah *${usedPrefix + command} teks*\n\nContoh: *${usedPrefix + command} halo hilman*`
  )

  // kasih reaksi loading
  await conn.sendMessage(m.chat, {
    react: { text: '🕐', key: m.key }
  })

  try {
    // API baru Hugging Face
    const api = `https://alfixd-brat.hf.space/maker/brat?text=${encodeURIComponent(text)}&background=%23FFFFFF&color=%23000000`
    const res = await fetch(api)
    if (!res.ok) throw await res.text()

    const json = await res.json()
    if (json.status !== 'success') throw 'API gagal mengembalikan gambar'

    // ambil gambar hasilnya
    const imgRes = await fetch(json.image_url)
    if (!imgRes.ok) throw await imgRes.text()

    const buffer = await imgRes.buffer()

    // convert ke sticker
    const stiker = await sticker(buffer, false, `${global.stickpack}`, `${global.stickauth}`)
    await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })

    // kasih reaksi sukses
    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })
  } catch (e) {
    console.error(e)
    m.reply('🚫 Gagal membuat stiker!')

    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    })
  }
}

handler.help = ['brat']
handler.tags = ['sticker']
handler.command = /^(brat)$/i
handler.limit = true
handler.premium = false
handler.group = false

export default handler