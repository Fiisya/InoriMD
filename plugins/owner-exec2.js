import cp, { exec as _exec } from 'child_process'
import { promisify } from 'util'

let exec = promisify(_exec).bind(cp)

let handler = async (m, { conn, isOwner, command, text }) => {
  if (global.conn.user.jid != conn.user.jid) return
  
  m.reply('Executing...')
  let o
  try {
    // Gunakan text saja, bukan command + text
    // karena command berisi prefix '$' yang menyebabkan error
    const cmdToRun = text.trim()
    if (!cmdToRun) {
      return m.reply('❌ No command provided!\nUsage: $ <command>')
    }
    
    o = await exec(cmdToRun)
  } catch (e) {
    o = e
  } finally {
    let { stdout, stderr } = o
    if (stdout && stdout.trim()) {
      m.reply('📤 *Output:*\n```\n' + stdout.trim() + '\n```')
    }
    if (stderr && stderr.trim()) {
      m.reply('⚠️ *Error:*\n```\n' + stderr.trim() + '\n```')
    }
    if (!stdout?.trim() && !stderr?.trim()) {
      m.reply('✅ Command executed successfully (no output)')
    }
  }
}

handler.customPrefix = /^[$] /
handler.command = new RegExp
handler.owner = true
export default handler