import React from 'react'
import { Link } from 'react-router'
import ReactInStyle from 'react-in-style'

// let reactLogo = require('./images/react-logo.png')

ReactInStyle.add({
  height: '100px',
  textAlign: 'center',
  borderBottom: '2px solid #f4f4f4',
  a: {
    display: 'inline-block',
    marginTop: '40px',
    fontSize: '1.2rem',
    textTransform: 'uppercase',
    textDecoration: 'none',
    color: '#888',
    '&:hover': {
      borderBottom: '1px solid #f4f4f4'
    }
  }
}, '.header')

export default class Header extends React.Component {
  constructor() {
    super()
  }

  render() {
    // <img src={reactLogo} height='60' />
    return (
      <div className='header'>
				<header>
          <Link to='broadcast'>Broadcast</Link>
				</header>
      </div>
    )
  }
}

Header.prototype.displayName = 'Header'

