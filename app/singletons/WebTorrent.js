import WebTorrent from 'webtorrent/webtorrent.min'
import prettyBytes from 'pretty-bytes'

const client = new WebTorrent()
export default client
function getStats(torrent) {
  const progress = torrent ? (100 * torrent.downloaded / torrent.parsedTorrent.length).toFixed(1) : 0
  return {
    peers: torrent ? torrent.swarm.wires.length : 0,
    progress,
    downloadSpeed: prettyBytes(client.downloadSpeed()),
    uploadSpeed: prettyBytes(client.uploadSpeed())

  }
}
export {
  getStats,
  prettyBytes
}
