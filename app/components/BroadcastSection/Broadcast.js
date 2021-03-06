import React from 'react'
import connectToStores from 'alt/utils/connectToStores'
import ReactInStyle from 'react-in-style'
import FileDrop from '../FileDrop/FileDrop'
import client from '../../singletons/WebTorrent'
import SpeedStats from '../SpeedStats/SpeedStats'
import VideoQueue from '../../videoQueue'
class Broadcast extends React.Component {
  constructor() {
    super()
    this.state = {
      torrents: [],
      useClassVersion: false
    }
  }
  static getPropsFromStores() {
    return {}
  }
  static getStores() {
    return []
  }
  static propTypes = {

  }
  seedFile = (files) => {
    if(!Array.isArray(files)) {
      files = [files]
    }
    // let video = React.findDOMNode(this.refs.video)
    // Seed the files
    files.map((file, i)=>{
      // Web torrent throws some memeory error if you add a bunch at once
      setTimeout(() => {
        client.seed(file, (torrent) => {
          // if(!this.activeTorrent) {
            // this.activeTorrent = torrent
            // const torrentFile = torrent.files[0]
            // if (torrentFile.done) {
                // console.log('this happens twice')
                this.playfile(torrent.files[0])
            // } else {
                // torrentFile.on('done', () => this.playfile(torrentFile))
            // }
          // }
          this.state.torrents.push(torrent)
          this.setState({
            torrents: this.state.torrents
          })
        })
      }, 100 * i)
    })

  }
  playfile(file) {
    if(!this.videoQueue) {
        this.videoQueue = new VideoQueue(file)
    } else {
        this.videoQueue.addFile(file)
    }
  }
  switchVideoProcessor = (e) => {
    console.log(e.target.checked)
    this.setState({useClassVersion: e.target.checked})
  }
  render() {
    const {seedHash, torrents} = this.state
    const torrentsAsArray = torrents.reduce((last, next) => {
      last.push(next.infoHash)
      return last
    }, [])
    return (
      <div className="broadcast">
        {seedHash ? <h1>Seeding </h1> : null}
        <div className="dropzone">
          <FileDrop className="file-drop" onDrop={this.seedFile} >
            <h3 className="drop-title">Drop file here</h3>
          </FileDrop>
        </div>
        <a href={'/view/' + encodeURI(JSON.stringify(torrentsAsArray))} target="_blank" >Open Stream</a>
        <br />
        {torrents.map((torrent) => <SpeedStats key={torrent.infoHash} torrent={torrent} />)}
     </div>
    )
  }
}
const style = {
  '.dropzone': {
    margin: '20px auto',
    width: '100%',
    minHeight: '200px',
    height: '50%',
    border: '1px dashed red',
    position: 'relative',
    '.file-drop': {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0
    },
    '.drop-title': {
        margin: '0 auto',
        display: 'inline-block',
        textAlign: 'center',
        color: '#900',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%)'
    }
  },
  'video': {
      maxWidth: '100%',
      maxHeight: '500px'
  }
}
ReactInStyle.add(style, 'body')
export default connectToStores(Broadcast)
