import React, { useState } from 'react';
import sendMessageButton from '../../resources/images/sendMessageButton.svg'
import { sendMessageUsingDataChannel } from '../../utils/webRTCHandler'

const NewMessage = () => {
  const [message, setMessage] = useState('')

  const handleTextChange = (event) => {
    setMessage(event.target.value)
  }

  const handleKeyPressed = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      sendMessage()
    }
  }

  const sendMessage = () => {
    if (message.length > 0) {
      sendMessageUsingDataChannel(message)
      setMessage('')
    }
  }

  return (
    <div className='new_message_container'>
      <input
        className='new_message_input'
        type="text"
        value={message}
        onChange={handleTextChange}
        placeholder='Type your message...'
        onKeyDown={handleKeyPressed}
      />
      <img
        className='new_message_button'
        src={sendMessageButton}
        onClick={sendMessage}
        alt="send message button"
      />
    </div>
  );
};

export default NewMessage;