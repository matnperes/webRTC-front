import io from 'socket.io-client'
import { setRoomId, setParticipants } from '../store/actions'
import store from '../store/store'
import * as webRTCHandler from './webRTCHandler'
const server = 'https://webrtc-wemeet-db08d42d4306.herokuapp.com/'

let socket = null

export const connectWithSocketIOServer = () => {
  socket = io(server)

  socket.on('connect', () => {
    console.log('successfully connected with socket io server');
    console.log(socket.id);
  })

  socket.on('room-id', data => {
    const { roomId } = data
    store.dispatch(setRoomId(roomId))
  })

  socket.on('room-update', data => {
    const { connectedUsers } = data
    store.dispatch(setParticipants(connectedUsers))
  })

  socket.on('conn-prepare', data => {
    const { connUserSocketId } = data

    //esse evento chegara do server para prepação da conexão com todos os peers da sala
    webRTCHandler.prepareNewPeerConnection(connUserSocketId, false)

    //após a preparação da conexão , vamos avisar o usuario que estamos preparados para receber a conexão
    socket.emit('conn-init', { connUserSocketId })
  })

  socket.on('conn-signal', data => {
    webRTCHandler.handleSignalingData(data)
  })

  //receberemos esse evento quando o ususario que quer entrar na sala tb estiver preparado para conexão
  socket.on('conn-init', data => {
    const { connUserSocketId } = data
    //esse true faz com que seja a resposta do user 1 e inicialiação da conexão
    webRTCHandler.prepareNewPeerConnection(connUserSocketId, true)
  })

  socket.on('user-disconnected', data => {
    webRTCHandler.removePeerConnection(data)
  })
}

export const createNewRoom = (identity, onlyAudio) => {
  const data = {
    identity
  }

  socket.emit('create-new-room', data)
}

export const joinRoom = (identity, roomId, onlyAudio) => {
  const data = {
    roomId,
    identity,
    onlyAudio
  }

  socket.emit('join-room', data)
}

export const signalPeerData = (data) => {
  socket.emit('conn-signal', data)
}