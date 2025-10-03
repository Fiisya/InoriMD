import os from "os"
import v8 from "v8"

const formatSize = (size) => {
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

const runtime = (seconds) => {
  seconds = Math.round(seconds) // Membulatkan detik ke bilangan bulat
  let days = Math.floor(seconds / (3600 * 24))
  seconds %= 3600 * 24
  let hrs = Math.floor(seconds / 3600)
  seconds %= 3600
  let mins = Math.floor(seconds / 60)
  let secs = seconds % 60
  return `${days}d ${hrs}h ${mins}m ${secs}s`
}

const fetchJson = async (url) => {
  let res = await fetch(url)
  return await res.json()
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const used = process.memoryUsage()
  const cpus = os.cpus().map(cpu => {
    cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0)
    return cpu
  })
  const cpu = cpus.reduce((last, cpu, _, { length }) => {
    last.total += cpu.total
    last.speed += cpu.speed / length
    last.times.user += cpu.times.user
    last.times.nice += cpu.times.nice
    last.times.sys += cpu.times.sys
    last.times.idle += cpu.times.idle
    last.times.irq += cpu.times.irq
    return last
  }, {
    speed: 0,
    total: 0,
    times: {
      user: 0,
      nice: 0,
      sys: 0,
      idle: 0,
      irq: 0
    }
  })

  let heapStat = v8.getHeapStatistics()
  const x = "`"
  const myip = await fetchJson("https://ipinfo.io/json")
  
  function hideIp(ip) {
    const ipSegments = ip.split(".")
    if (ipSegments.length === 4) {
      ipSegments[2] = "***"
      ipSegments[3] = "***"
      return ipSegments.join(".")
    } else {
      throw new Error("Invalid IP address")
    }
  }
  
  const ips = hideIp(myip.ip)
  const respTimeInSeconds = (Date.now() - new Date(m.messageTimestamp * 1000)) / 1000
  const resp = `${respTimeInSeconds.toFixed(3)} second${respTimeInSeconds !== 1 ? 's' : ''}`

  let teks = `${x}INFO SERVER${x}
- Speed Respons: _${resp}_
- Hostname: _${os.hostname()}_
- CPU Core: _${cpus.length}_
- Platform : _${os.platform()}_
- OS : _${os.version()} / ${os.release()}_
- Arch: _${os.arch()}_
- Ram: _${formatSize(os.totalmem() - os.freemem())}_ / _${formatSize(os.totalmem())}_

${x}PROVIDER INFO${x}
- IP: ${ips}
- Region : _${myip.region} ${myip.country}_
- ISP : _${myip.org}_

${x}RUNTIME OS${x}
- _${runtime(os.uptime())}_

${x}RUNTIME BOT${x}
- _${runtime(process.uptime())}_

${x}NODE MEMORY USAGE${x}
${Object.keys(used).map(
    (key, _, arr) => `*- ${key.padEnd(Math.max(...arr.map(v => v.length)), " ")} :* ${formatSize(used[key])}`
  ).join("\n")}
*- Heap Executable :* ${formatSize(heapStat?.total_heap_size_executable)}
*- Physical Size :* ${formatSize(heapStat?.total_physical_size)}
*- Available Size :* ${formatSize(heapStat?.total_available_size)}
*- Heap Limit :* ${formatSize(heapStat?.heap_size_limit)}
*- Malloced Memory :* ${formatSize(heapStat?.malloced_memory)}
*- Peak Malloced Memory :* ${formatSize(heapStat?.peak_malloced_memory)}
*- Does Zap Garbage :* ${formatSize(heapStat?.does_zap_garbage)}
*- Native Contexts :* ${formatSize(heapStat?.number_of_native_contexts)}
*- Detached Contexts :* ${formatSize(heapStat?.number_of_detached_contexts)}
*- Total Global Handles :* ${formatSize(heapStat?.total_global_handles_size)}
*- Used Global Handles :* ${formatSize(heapStat?.used_global_handles_size)}

${cpus[0] ? `
*_Total CPU Usage_*
${cpus[0].model.trim()} (${cpu.speed} MHZ)
${Object.keys(cpu.times).map(
    type => `*- ${(type + "*").padEnd(6)}: ${((100 * cpu.times[type]) / cpu.total).toFixed(2)}%`
  ).join("\n")}

*_CPU Core(s) Usage (${cpus.length} Core CPU)_*
${cpus.map(
    (cpu, i) => `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(
        type => `*- ${(type + "*").padEnd(6)}: ${((100 * cpu.times[type]) / cpu.total).toFixed(2)}%`
      ).join("\n")}`
  ).join("\n\n")}
` : ""}
`.trim()

  m.reply(teks)
}

handler.help = ["ping"]
handler.tags = ["info"]
handler.command = ["ping"]

export default handler