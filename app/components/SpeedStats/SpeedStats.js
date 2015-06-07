import React, {PropTypes} from 'react'
import connectToStores from 'alt/utils/connectToStores'
import ReactInStyle from 'react-in-style'
import {getStats} from '../../singletons/WebTorrent'

class SpeedStats extends React.Component {
  componentDidMount() {
    console.log(this.props)
    if(this.props.torrent) {
      this.startCollectingStats()
    }
  }
  componentWillDismount(){
    clearInterval(this.interval)
  }
  componentWillReceiveProps(nextProps){
    console.log()
    if(this.interval !== undefined) {
      clearInterval(this.interval)
    }
    if(nextProps.torrent) {
      this.startCollectingStats(nextProps.torrent)
    }
  }
  startCollectingStats(torrent) {
    console.log('collecting info')
    this.interval = setInterval(() => this.refreshStats(torrent), 16)
  }
  refreshStats(torrent) {
    this.setState(getStats(torrent))
  }
  constructor(props) {
    super(props)
    this.state = getStats(props.torrent)
  }
  static getPropsFromStores() {
    return {}
  }
  static getStores() {
    return []
  }
  static propTypes = {
    torrent: PropTypes.object
  }
  render() {
    return (
      <div className="speed-stats">
        <span className="speed">
          <i className="fa fa-cloud-download"></i> {this.state.downloadSpeed}&#47;s
        </span> &nbsp;
        <span className="speed">
          <i className="fa fa-cloud-upload"></i> {this.state.uploadSpeed}&#47;s
        </span> &nbsp;
        <span className="progress">{this.state.progress}%</span> &nbsp;
        <span className="peercount">{this.state.peers} peers</span>
     </div>
    )
  }
}
const style = {
  marginTop: '10px',
  '.speed, .progress, .peercount': {
    '&:not(:last-child)': {
      borderRight: '1px solid grey'
    },
    display: 'inline-block',
    minWidth: '110px',
    textAlign: 'center'
  }
}
ReactInStyle.add(style, '.speed-stats')
export default connectToStores(SpeedStats)
