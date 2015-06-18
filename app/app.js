import React from 'react'
import Router from 'react-router'
// import 'font-awesome-webpack'
let routes = require('./routes')

import './scss/main.scss'

if(typeof document !== 'undefined' && window) {
  window.onload = function() {
    Router.run(routes, Router.HistoryLocation, function(App /*, state*/) {
      React.render(<App/>, document.getElementById('app'))
    })
  }
}
