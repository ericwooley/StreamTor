import React from 'react'
import connectToStores from 'alt/utils/connectToStores'
import ReactInStyle from 'react-in-style'
import FileDrop from '../FileDrop/FileDrop'
import client from '../../singletons/WebTorrent'
import SpeedStats from '../SpeedStats/SpeedStats'
import Recorder from '../../utils/getUserMedia'

class Broadcast extends React.Component {
  componentWillMount(){
    this.recorder = new Recorder()
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

  }
  seedFile = (files) => {
    client.seed(files, (torrent) => {
      this.setState({
        seedHash: torrent.infoHash,
        torrent
      })
    })
  }
  toggleRecording = () => {
    const {recording} = this.state
    this.setState({
      recording: !recording
    })
    const videoEl = React.findDOMNode(this.refs.video)
    const videoEl2 = React.findDOMNode(this.refs.video2)
    if(recording) {
      this.recorder.stopRecording((video) => {
        console.log('got playable video', video)
        videoEl2.src = video
        videoEl2.play()
      })

    } else {
      this.recorder.startRecording({
        onSuccess: (stream)=>console.log('broadcast stream start', stream),
        onFail: ()=>console.log('broadcast stream start'),
        // timeout: 1000,
        // doneRecording: () => console.log('done recording'),
        videoEl
      })
    }

  }
  render() {
    const {seedHash, torrent} = this.state
    return (
      <div className="broadcast">
        {seedHash ? <h1>Seeding </h1> : null}
        <button onClick={this.toggleRecording}>{this.state.recording ? 'Stop' : 'Start'} Recording</button>
        <div className="dropzone">
          <FileDrop className="file-drop" onDrop={this.seedFile} >
            <h3 className="drop-title">Drop file here</h3>
          </FileDrop>
        </div>
        <a href={`/watch/${seedHash}`} target="_blank" >{seedHash}</a> <br />
        <SpeedStats torrent={torrent} />
        <video controls="true" ref="video" />
        <video controls="true" ref="video2" />
     </div>
    )
  }
}
const style = {
  'video': {
    height: '300px',
    backgroundColor: 'black'
  },
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
