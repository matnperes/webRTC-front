import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import './App.css';
import JoinRoomPage from './JoinRoomPage/JoinRoomPage';
import RoomPage from './RoomPage/RoomPage';
import IntroPage from './IntroPage/IntroPage';
import { connectWithSocketIOServer } from './utils/wss'

function App() {
  useEffect(() => {
    connectWithSocketIOServer()
  }, [])

  return (
    <Router>
      <Switch>
        <Route path='/join-room'>
          <JoinRoomPage />
        </Route>
        <Route path='/room'>
          <RoomPage />
        </Route>
        <Route path='/'>
          <IntroPage />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
