import React from 'react'
import { Link } from 'react-router'

let reactLogo = require('./images/react-logo.png')

if (process.env.BROWSER) {
  require('./_Header.scss')
}

export default class Header extends React.Component {
  constructor() {
    super()
  }

  render() {
    return (
      <div className='header'>
        <img src={reactLogo} height='60' />
				<header>
					<ul>
            <li><Link to='app'>Watch</Link></li>
            <li><Link to='broadcast'>Broadcast</Link></li>
					</ul>
				</header>
      </div>
    )
  }
}

Header.prototype.displayName = 'Header'
