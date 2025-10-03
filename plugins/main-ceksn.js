import { createHash } from 'crypto'

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i
let handler = async function (m, { conn, text, usedPrefix }) {
  let sn = createHash('md5').update(m.sender).digest('hex')

await conn.sendMessage(
    m.chat,
    {
        text: `Your Serial Number ${sn}`,
        title: 'Serial Number Info',
        subtitle: 'There is a subtitle', 
        footer: 'Inori Yuzuriha',
        interactiveButtons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: 'Unregister',
                    id: `.unreg ${sn}`
                })
            },
            {
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                    display_text: 'Copy Serial Number',
                    copy_code: `${sn}`
                })
            }
                    ]
     }
)
}

handler.help = ['ceksn']
handler.tags = ['xp']
handler.command = /^(ceksn)$/i
handler.register = true
export default handler