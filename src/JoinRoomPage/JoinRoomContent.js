import React, { useState } from "react";
import JoinRoomInputs from "./JoinRoomInputs";
import { connect } from "react-redux";
import OnlyWithAudioCheckbox from "./OnlyWithAudioCheckbox";

import { setConnectOnlyWithAudio, setIdentity, setRoomId } from "../store/actions";
import ErrorMessage from "./ErrorMessage";
import JoinRoomButtons from "./JoinRoomButtons";
import { getRoomExists } from "../utils/api";
import { useHistory } from "react-router-dom";

const JoinRoomContent = ({ isRoomHost, connectOnlyWithAudio, setConnectOnlyWithAudio, setIdentityAction, setRoomIdAction }) => {

  const [roomIdValue, setRoomIdValue] = useState('')
  const [nameValue, setNameValue] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const history = useHistory()

  const handleJoinRoom = async () => {
    setIdentityAction(nameValue)
    if (isRoomHost) {
      await createRoom()
    } else {
      await joinRoom()
    }
  }

  const joinRoom = async () => {
    const { roomExists, full } = await getRoomExists(roomIdValue)

    if (roomExists) {
      if (full) {
        setErrorMessage('Room is full. Please try again later')
      } else {
        setRoomIdAction(roomIdValue)
        history.push('/room')
      }
    } else {
      setErrorMessage('Room not found. Check your meeting id')
    }
  }

  const createRoom = async () => {
    history.push('/room')
  }

  return (
    <>
      <JoinRoomInputs
        roomIdValue={roomIdValue}
        setRoomIdValue={setRoomIdValue}
        nameValue={nameValue}
        setNameValue={setNameValue}
        isRoomHost={isRoomHost}
      />
      <OnlyWithAudioCheckbox
        setConnectOnlyWithAudio={setConnectOnlyWithAudio}
        connectOnlyWithAudio={connectOnlyWithAudio}
      />
      <ErrorMessage errorMessage={errorMessage} />
      <JoinRoomButtons
        handleJoinRoom={handleJoinRoom}
        isRoomHost={isRoomHost}
      />
    </>
  )
};

const mapStoreStateToProps = (state) => {
  return {
    ...state
  }
}

const mapActionsToProps = (dispatch) => {
  return {
    setConnectOnlyWithAudio: (onlyWithAudio) => dispatch(setConnectOnlyWithAudio(onlyWithAudio)),
    setIdentityAction: (identity) => dispatch(setIdentity(identity)),
    setRoomIdAction: (roomId) => dispatch(setRoomId(roomId))
  };
};

export default connect(mapStoreStateToProps, mapActionsToProps)(JoinRoomContent)