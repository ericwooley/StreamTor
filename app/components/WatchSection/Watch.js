import React, {PropTypes} from 'react'
import connectToStores from 'alt/utils/connectToStores'
import ReactInStyle from 'react-in-style'
import client, {getStats} from '../../singletons/WebTorrent'
import videostream from 'videostream'
import once from 'once'

class Watch extends React.Component {
  componentDidMount(){
    const video = React.findDOMNode(this.refs.video)
    console.log('Trigger load', this.props.params.broadcastid)
    client.add(this.props.params.broadcastid, (torrent) => {
      console.log('Torrent info hash:', torrent.infoHash)
      // torrent.swarm.on('download', this.updateSpeed(torrent))
      setInterval(this.updateSpeed(torrent), 16)
      torrent.swarm.on('done', () => console.log('done'))
      const file = torrent.files[0]
      file.on('done', ()=> console.log('done'))
      videostream(file, video)
      video.addEventListener('error', once((error) => {
        console.log('got error', error)
        // If videostream generates an error, try using MediaSource without videostream
        file.createReadStream().pipe(video)
      }))
      // Stream the video into the video tag
      // file.createReadStream().pipe(video)
    })
  }
  constructor() {
    super()
    this.state = getStats()
  }
  static getPropsFromStores() {
    return {}
  }
  static getStores() {
    return []
  }
  static propTypes = {
    broadcastid: PropTypes.string
  }
  updateSpeed(torrent) {
    return () => this.setState(getStats(torrent))
  }
  render() {
    // let {broadcastid} = this.props.params
    //
    return (
      <div className="watch" ref='container'>
        <h2>Watch {this.state.downloadSpeed}/s | {this.state.progress}%</h2>
        <video ref="video" controls="true" autoplay="true" />
     </div>
    )
  }
}
const style = {
  video: {
    margin: '0 auto',
    maxWidth: '80%',
    backgroundColor: 'black'
  }
}
ReactInStyle.add(style, '.watch')
export default connectToStores(Watch)
