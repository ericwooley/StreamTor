/*eslint-disable no-unused-vars*/
import React from 'react'
/*eslint-enable no-unused-vars*/
import {Route, DefaultRoute, NotFoundRoute} from 'react-router'

import Application from './components/App/App'
import Broadcast from './components/BroadcastSection/Broadcast'
import watch from './components/WatchSection/Watch'
import NotFoundSection from './components/NotFoundSection/NotFoundSection'

export default (
  <Route name='app' path='/' handler={Application}>
    <Route name='view' path='/view/:broadcastid?' handler={watch}/>
    <Route name='broadcast' path="/broadcast" handler={Broadcast}/>
    <DefaultRoute handler={watch} />
    <NotFoundRoute handler={NotFoundSection} />
  </Route>
)
