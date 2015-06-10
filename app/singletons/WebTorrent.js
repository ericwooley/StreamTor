import WebTorrent from 'webtorrent/webtorrent.min'
import prettyBytes from 'pretty-bytes'

const client = new WebTorrent()
window.client = client
export default client
function getStats(torrent) {
  if(!torrent) {
    return {}
  }
  const progress = torrent ? (100 * torrent.downloaded / torrent.parsedTorrent.length).toFixed(1) : 0
  return {
    peers: torrent ? torrent.swarm.wires.length : 0,
    progress,
    downloadSpeed: prettyBytes(torrent.swarm.downloadSpeed()),
    uploadSpeed: prettyBytes(torrent.swarm.uploadSpeed())
  }
}
export {
  getStats,
  prettyBytes
}
