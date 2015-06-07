import React from 'react/addons'
import connectToStores from 'alt/utils/connectToStores'
import ReactInStyle from 'react-in-style'
import dragDrop from 'drag-drop/buffer'
import cx from 'classnames'

class FileDrop extends React.Component {
  componentDidMount() {
    const area = React.findDOMNode(this.refs.container)
    this.dragCancel = dragDrop(area, this.props.onDrop)
  }
  componentWillDismount() {
    this.dragCancel()
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
  render() {
    const classes = cx({
      filedrop: true,
      [this.props.className]: !!this.props.className
    })
    return (
      <div {...this.props} className={classes} ref="container">
        {this.props.children}
     </div>
    )
  }
}
const style = {}
ReactInStyle.add(style, '.filedrop')
export default connectToStores(FileDrop)
