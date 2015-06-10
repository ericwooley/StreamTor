/* global MediaSource */
import React from 'react'
import connectToStores from 'alt/utils/connectToStores'
import ReactInStyle from 'react-in-style'
import FileDrop from '../FileDrop/FileDrop'
import client from '../../singletons/WebTorrent'
import SpeedStats from '../SpeedStats/SpeedStats'

class Broadcast extends React.Component {
  constructor() {
    super()
    this.state = {
      torrents: []
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
    let ms = new MediaSource()

    let video = React.findDOMNode(this.refs.video)
    video.src = window.URL.createObjectURL(ms)


    files.map((file, i)=>{

      ms.addEventListener('sourceopen', function(e) {
        file.getBuffer((buffer)=>{
          console.log('appending', file.name)
          var sourceBuffer = ms.addSourceBuffer('video/mp4;')
          sourceBuffer.appendBuffer(buffer)
        })

      }, false)

      // Web torrent throws some memeory error if you add a bunch at once
      setTimeout(() => {
        client.seed(file, (torrent) => {
          this.state.torrents.push(torrent)
          this.setState({
            torrents: this.state.torrents
          })
        })
      }, 100 * i)
    })
  }
  render() {
    const {seedHash, torrents} = this.state
    const torrentsAsArray = torrents.reduce((last, next) => {
      last.push(next.infoHash)
      return last
    }, [])
    console.log(torrentsAsArray)
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
        <video ref="video" controls />
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
  }
}
ReactInStyle.add(style, '.broadcast')
export default connectToStores(Broadcast)
