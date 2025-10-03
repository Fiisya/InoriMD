import axios from 'axios';
import *as cheerio from 'cheerio';

const base = "https://otakudesu.best";

async function ongoing() {
  const { data } = await axios.get(base)
  const $ = cheerio.load(data)
  let hasil = []
  $(".venz ul li").each((i, el) => {
    hasil.push({
      title: $(el).find("h2.jdlflm").text().trim(),
      eps: $(el).find(".epz").text().trim(),
      day: $(el).find(".epztipe").text().trim(),
      date: $(el).find(".newnime").text().trim(),
      thumb: $(el).find(".thumbz img").attr("src"),
      link: $(el).find("a").attr("href")
    })
  })
  return hasil
}

async function animeList() {
  const { data } = await axios.get(base + "/anime-list/")
  const $ = cheerio.load(data)
  let hasil = []
  $(".venser ul li").each((i, el) => {
    hasil.push({
      title: $(el).find("a").text().trim(),
      link: $(el).find("a").attr("href")
    })
  })
  return hasil
}

async function genres() {
  const { data } = await axios.get(base + "/genre-list/")
  const $ = cheerio.load(data)
  let hasil = []
  $(".genres li a").each((i, el) => {
    hasil.push({
      genre: $(el).text().trim(),
      link: $(el).attr("href")
    })
  })
  return hasil
}

async function schedule() {
  const { data } = await axios.get(base + "/jadwal-rilis/")
  const $ = cheerio.load(data)
  let hasil = []
  $(".kglist321").each((i, el) => {
    const day = $(el).find("h2").text().trim()
    let list = []
    $(el).find("ul li a").each((j, a) => {
      list.push({
        title: $(a).text().trim(),
        link: $(a).attr("href")
      })
    })
    hasil.push({ day, list })
  })
  return hasil
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const helpMessage = `
*Penggunaan:*
 ${usedPrefix + command} <opsi>

*Opsi yang tersedia:*
- ongoing : Menampilkan anime yang sedang tayang.
- list : Menampilkan daftar semua anime.
- genres : Menampilkan daftar genre anime.
- schedule : Menampilkan jadwal rilis anime.

*Contoh:*
 ${usedPrefix + command} ongoing
`;

  if (!text) return m.reply(helpMessage);

  const commandLower = text.toLowerCase();

  try {
    if (commandLower === 'ongoing') {
      m.reply('⏳ Mengambil data anime ongoing...');
      let res = await ongoing();
      if (!res || res.length === 0) return m.reply('🚨 Tidak ada data ongoing ditemukan.');

      let caption = `📺 *Ongoing Anime (Terbaru)*\n\n`;
      res.forEach((item, index) => {
        caption += `${index + 1}. *${item.title}*\n`;
        caption += `   📬 ${item.eps}\n`;
        caption += `   📅 ${item.day} - ${item.date}\n`;
        caption += `   🔗 ${item.link}\n\n`;
      });
      await m.reply(caption);

    } else if (commandLower === 'list') {
      m.reply('⏳ Mengambil daftar anime... (Mungkin memakan waktu beberapa detik)');
      let res = await animeList();
      if (!res || res.length === 0) return m.reply('🚨 Tidak ada daftar anime ditemukan.');

      let caption = `📚 *Daftar Semua Anime*\n\n`;
      res.forEach((item, index) => {
        caption += `${index + 1}. ${item.title}\n`;
        caption += `   🔗 ${item.link}\n\n`;
      });
      await m.reply(caption);

    } else if (commandLower === 'genres') {
      m.reply('⏳ Mengambil daftar genre...');
      let res = await genres();
      if (!res || res.length === 0) return m.reply('🚨 Tidak ada daftar genre ditemukan.');

      let caption = `🏷️ *Daftar Genre Anime*\n\n`;
      res.forEach((item, index) => {
        caption += `${index + 1}. ${item.genre}\n`;
        caption += `   🔗 ${item.link}\n\n`;
      });
      await m.reply(caption);

    } else if (commandLower === 'schedule') {
      m.reply('⏳ Mengambil jadwal rilis...');
      let res = await schedule();
      if (!res || res.length === 0) return m.reply('🚨 Tidak ada jadwal rilis ditemukan.');

      let caption = `🗓️ *Jadwal Rilis Anime*\n\n`;
      res.forEach((daySchedule) => {
        caption += `📍 *${daySchedule.day}*\n`;
        daySchedule.list.forEach((anime) => {
          caption += `   - ${anime.title}\n`;
          caption += `     🔗 ${anime.link}\n`;
        });
        caption += `\n`;
      });
      await m.reply(caption);

    } else {
      return m.reply(`🚨 Opsi "${text}" tidak valid.\n\n${helpMessage}`);
    }
  } catch (e) {
    console.error('Error:', e);
    m.reply('🚨 Terjadi kesalahan saat mengambil data. Mungkin website sedang down atau coba lagi nanti.');
  }
}

handler.help = ['otakudesu']
handler.tags = ['anime']
handler.command = /^(otakudesu|otaku)$/i // Saya tambahkan alias 'otaku' agar lebih singkat
handler.limit = true

export default handler