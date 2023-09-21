import React, { useEffect } from 'react';

import "./RoomPage.css"
import ParticipantSection from './ParticipantSection/ParticipantSection';
import VideoSection from './VideoSection/VideoSection';
import ChatSection from './ChatSection/ChatSection';
import RoomLabel from './RoomLabel';
import * as webRTCHandler from '../utils/webRTCHandler'

import { connect } from 'react-redux'
import Overlay from './Overlay';

const RoomPage = ({ roomId, identity, isRoomHost, showOverlay, connectOnlyWithAudio }) => {
  useEffect(() => {
    if (!isRoomHost && !roomId) {
      const siteUrl = window.location.origin
      window.location.href = siteUrl
    } else {
      webRTCHandler.getLocalPreviewAndInitRoomConnection(
        isRoomHost,
        identity,
        roomId,
        connectOnlyWithAudio
      )
    }
  }, [])

  return (
    <div className='room_container'>
      <ParticipantSection />
      <VideoSection />
      <ChatSection />
      <RoomLabel roomId={roomId} />
      {showOverlay && <Overlay />}
    </div>
  )
};

const mapStoreStateToProps = (state) => {
  return {
    ...state
  }
}

// const mapActionsToProps = (dispatch) => {
//   return {
//     setIsRoomHostAction: (isRoomHost) => dispatch(setIsRoomHost(isRoomHost)),
//   };
// };

export default connect(mapStoreStateToProps)(RoomPage);