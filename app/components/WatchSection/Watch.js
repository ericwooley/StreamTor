import React, {PropTypes} from 'react'
import connectToStores from 'alt/utils/connectToStores'
import ReactInStyle from 'react-in-style'
import client from '../../singletons/WebTorrent'
import videostream from 'videostream'
import once from 'once'
import SpeedStats from '../SpeedStats/SpeedStats'
import StreamHandler from '../../utils/StreamHandler'


class Watch extends React.Component {
  componentDidMount(){
    const torrentList = JSON.parse(this.props.params.broadcastid)
    console.log('Trigger load', torrentList)
    let torrents = []
    this.fileQueue = []
    this.hasVideo = false
    torrentList.map((torrentId, i) => {
      console.log('Trigger load', torrentId)
      client.add(torrentId, (torrent) => {
        torrents[i] = torrent
        this.setState({
          torrents: torrents
        })
        console.log('got torrent', torrent)
        torrent.swarm.on('done', () => console.log('done'))
        const file = torrent.files[0]
        if(!this.hasVideo) {
          this.hasVideo = true
          this.playVideo(file)
        } else {
          this.fileQueue.push(file)
        }
      })
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
  chunkIndex = 0
  startPlayLoop = (video, retryCount = 0) => {
    console.log('added event listener on', video)
    video.addEventListener('timeupdate', () => {
      const timeDiff = video.duration - video.currentTime
      if(timeDiff > 0.4) {
        return false
      }
      if(!this.fileQueue.length) {
        this.hasVideo = false
        return false
      }
      let file = this.fileQueue[this.chunkIndex]
      if(!file) {
        // if(retryCount > video.duration) {
        //   chunkIndex++

        // }
        return setTimeout(() => this.startPlayLoop(video, retryCount + 100), 100)
      }
      this.chunkIndex++
      window.setTimeout(()=>{
        videostream(file, video)
        video.addEventListener('error', once(() => {
          file.createReadStream().pipe(video)
        }))
        this.startPlayLoop()
        video.play()
      }, Math.max(timeDiff - .1, 0))
    })
  }
  addStream = () => {
    console.log('adding stream')
  }
  playVideo(file) {
    const video = React.findDOMNode(this.refs.video)
    videostream(file, video)
    video.addEventListener('error', once(() => {
      file.createReadStream().pipe(video)
    }))
    console.log(file)
    this.setState({
      fileName: file.name
    })
    this.startPlayLoop(video)
  }
  render() {
    const {torrents =[]} = this.state
    console.log(torrents)
    return (
      <div className="watch" ref='container'>
        <h2>Watch</h2>
        <span className="videoContainer">
          <video ref="video" controls="true" autoPlay="true" />
        </span>
        {torrents.map((torrent) => <SpeedStats torrent={torrent} />)}
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
