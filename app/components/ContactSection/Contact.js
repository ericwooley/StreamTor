import React from 'react';
import connectToStores from 'alt/utils/connectToStores';

class Contact extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  static getPropsFromStores() {
    return {};
  }
  static getStores() {
    return [];
  }
  static propTypes = {

  }
  render() {
    return (
      <div>
        <h1>CONTACT PAGE</h1>
      </div>
    );
  }
}
export default connectToStores(Contact);
