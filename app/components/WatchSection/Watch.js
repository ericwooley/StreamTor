import React, {PropTypes} from 'react'
import connectToStores from 'alt/utils/connectToStores'
import ReactInStyle from 'react-in-style'
import client from '../../singletons/WebTorrent'
import videostream from 'videostream'
import once from 'once'
import SpeedStats from '../SpeedStats/SpeedStats'
class Watch extends React.Component {
  componentDidMount(){
    const video = React.findDOMNode(this.refs.video)
    console.log('Trigger load', this.props.params.broadcastid)
    client.add(this.props.params.broadcastid, (torrent) => {
      this.setState({torrent})
      console.log('Torrent info hash:', torrent.infoHash, torrent)
      // torrent.swarm.on('download', this.updateSpeed(torrent))

      torrent.swarm.on('done', () => console.log('done'))
      const file = torrent.files[0]
      videostream(file, video)
      video.addEventListener('error', once(() => {
        // If videostream generates an error, try using MediaSource without videostream
        file.createReadStream().pipe(video)
      }))
      // Stream the video into the video tag
      // file.createReadStream().pipe(video)
    })
  }
  constructor() {
    super()
    this.state = {}
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
  render() {
    const {torrent} = this.state
    return (
      <div className="watch" ref='container'>
        <h2>Watch</h2>
        <span className="videoContainer"><video ref="video" controls="true" autoPlay="true" /></span>
        <SpeedStats torrent={torrent} />
     </div>
    )
  }
}
const style = {
  '.videoContainer': {
    display: 'inline-block',
    margin: '0 auto',
    maxWidth: '800px',
    maxHeight: '500px',
    width: '100%',
    height: '100%',
    backgroundColor: 'black'
  },
  video: {
    width: '100%',
    height: '100%'
  }
}
ReactInStyle.add(style, '.watch')
export default connectToStores(Watch)
