import { setMessages, setShowOverlay } from '../store/actions'
import store from '../store/store'
import Peer from 'simple-peer'

import * as wss from './wss'
import { fetchTURNCredentials, getTurnIceServers } from './turn'

const defaultConstraints = {
  audio: true,
  video: {
    width: '480',
    heigth: '360'
  }
}

const onlyAudioConstraints = {
  audio: true,
  video: false
}

let localStream

export const getLocalPreviewAndInitRoomConnection = async (
  isRoomHost,
  identity,
  roomId = null,
  onlyAudio
) => {
  await fetchTURNCredentials()

  const constrains = onlyAudio ? onlyAudioConstraints : defaultConstraints

  navigator.mediaDevices.getUserMedia(constrains).then(stream => {
    console.log('successfuly received local stream');
    localStream = stream
    showLocalVideoPreview(localStream)

    store.dispatch(setShowOverlay(false))

    isRoomHost ? wss.createNewRoom(identity, onlyAudio) : wss.joinRoom(identity, roomId, onlyAudio)

  }).catch(err => {
    console.log('error occurred when trying to get an access to local stream');
    console.log(err);
  })

}

const peers = []
let streams = []

const getConfiguration = () => {
  const turnIceServers = getTurnIceServers()

  if (turnIceServers) {
    return {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302"
        },
        ...turnIceServers
      ]
    }
  } else {
    console.log('only using stun');
    return {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302"
        }
      ]
    }
  }
}

const messengerChannel = 'messenger'

export const prepareNewPeerConnection = (connUserSocketId, isInitiator) => {
  const configuration = getConfiguration()
  // console.log(configuration)

  //aqui o simple peer nos fornece todas informações necessairas para a conexão, ainda assim é necessario gerenciarmos o que queremos passar
  peers[connUserSocketId] = new Peer({
    //essa propriedade seta se a conexao esta sendo inicializada ou n
    initiator: isInitiator,
    config: configuration,
    stream: localStream,
    channelName: messengerChannel
  })

  peers[connUserSocketId].on("signal", data => {
    const signalData = {
      signal: data,
      connUserSocketId
    }

    wss.signalPeerData(signalData)
  })

  peers[connUserSocketId].on("stream", stream => {
    console.log('new stream came')

    addStreams(stream, connUserSocketId)
    streams = [...streams, stream]
  })

  peers[connUserSocketId].on('data', (data) => {
    const messageData = JSON.parse(data)
    appendNewMessage(messageData)
  })
}

export const handleSignalingData = (data) => {
  //existem uma iteração dentro de .signal que veirfica qual o tipo de signal data que estamos enviando 
  peers[data.connUserSocketId].signal(data.signal)
}

export const removePeerConnection = (data) => {
  const { socketId } = data
  const videoContainer = document.getElementById(socketId)
  const videoElement = document.getElementById(`${socketId}-video`)

  if (videoContainer && videoElement) {
    const tracks = videoElement.srcObject.getTracks()
    tracks.forEach(t => {
      t.stop()
    })
    videoElement.srcObject = null
    videoContainer.removeChild(videoElement)

    videoContainer.parentNode.removeChild(videoContainer)

    if (peers[socketId]) {
      peers[socketId].destroy()
    }
    delete peers[socketId]
  }
}

/////////////////// UI VIDEO ////////////////

const showLocalVideoPreview = (stream) => {
  const videosContainer = document.getElementById('videos_portal')

  videosContainer.classList.add('videos_portal_styles')

  const videoContainer = document.createElement('div')

  videoContainer.classList.add('video_track_container')

  const videoElement = document.createElement('video')

  videoElement.autoplay = true
  videoElement.muted = true
  videoElement.srcObject = stream

  videoElement.onloadedmetadata = () => {
    videoElement.play()
  }

  videoContainer.appendChild(videoElement)

  if (store.getState().connectOnlyWithAudio) {
    videoContainer.appendChild(getAudioOnlyLabel())
  }

  videosContainer.appendChild(videoContainer)
}

const addStreams = (stream, connUserSocketId) => {
  const videosContainer = document.getElementById('videos_portal')
  const videoContainer = document.createElement('div')
  videoContainer.id = connUserSocketId

  videoContainer.classList.add('video_track_container')
  const videoElement = document.createElement('video')
  videoElement.autoplay = true
  videoElement.playsInline = true
  videoElement.srcObject = stream
  videoElement.id = `${connUserSocketId}-video`

  videoElement.onloadedmetadata = () => {
    videoElement.play()

    videoElement.addEventListener('click', () => {
      if (videoElement.classList.contains('full_screen')) {
        videoElement.classList.remove('full_screen')
      } else {
        videoElement.classList.add('full_screen')
      }
    })
  }

  videoContainer.appendChild(videoElement)

  const participants = store.getState().participants
  const participant = participants.find(p => p.socketId === connUserSocketId)

  if (participant?.onlyAudio) {
    videoContainer.appendChild(getAudioOnlyLabel(participant.identity))
  } else {
    videoContainer.style.position = 'static'
  }

  videosContainer.appendChild(videoContainer)
}

const getAudioOnlyLabel = (identity = '') => {
  const labelContainer = document.createElement('div')
  labelContainer.classList.add('label_only_audio_container')

  const label = document.createElement('p')
  label.classList.add('label_only_audio_text')
  label.innerHTML = `Only audio ${identity}`

  labelContainer.appendChild(label)
  return labelContainer
}

/////////////////// BUTTONS LOGIC ////////////////

export const toggleMic = (isMuted) => {
  localStream.getAudioTracks()[0].enabled = isMuted
}

export const toggleCamera = (isDisabled) => {
  localStream.getVideoTracks()[0].enabled = isDisabled
}

export const toggleScreenShare = (
  isScreenSharingActive,
  screenSharingStream = null
) => {
  if (isScreenSharingActive) {
    switchVideoTracks(localStream);
  } else {
    switchVideoTracks(screenSharingStream);
  }
};

const switchVideoTracks = (stream) => {
  for (let socket_id in peers) {
    for (let index in peers[socket_id].streams[0].getTracks()) {
      for (let index2 in stream.getTracks()) {
        if (
          peers[socket_id].streams[0].getTracks()[index].kind ===
          stream.getTracks()[index2].kind
        ) {
          peers[socket_id].replaceTrack(
            peers[socket_id].streams[0].getTracks()[index],
            stream.getTracks()[index2],
            peers[socket_id].streams[0]
          );
          break;
        }
      }
    }
  }
};

////////////messages/////////////

const appendNewMessage = (messageData) => {
  const messages = store.getState().messages
  store.dispatch(setMessages([...messages, messageData]))
}

export const sendMessageUsingDataChannel = messageContent => {
  const identity = store.getState().identity

  const localMessageData = {
    content: messageContent,
    identity,
    messageCreatedByMe: true
  }

  appendNewMessage(localMessageData)

  const messageData = {
    content: messageContent,
    identity
  }

  const stringfiedMessageData = JSON.stringify(messageData)
  for (let socketId in peers) {
    peers[socketId].send(stringfiedMessageData)
  }
}