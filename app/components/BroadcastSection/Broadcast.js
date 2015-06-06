import React from 'react'
import connectToStores from 'alt/utils/connectToStores'
import ReactInStyle from 'react-in-style'


class Contact extends React.Component {
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
    return (
      <div className="Contact">
     </div>
    )
  }
}
const style = {}
ReactInStyle.add(style, '.Contact')
export default connectToStores(Contact)
