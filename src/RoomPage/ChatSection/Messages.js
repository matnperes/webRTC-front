import React from 'react';
import { connect } from 'react-redux';

const Message = ({
  author,
  content,
  sameAuthor,
  messageCreatedByMe
}) => {
  const alignClass = messageCreatedByMe
    ? 'message_align_right'
    : 'message_align_left'

  const authorText = messageCreatedByMe ? 'You' : author

  const contentAdditionalStyles = messageCreatedByMe
    ? 'message_right_styles'
    : 'message_left_styles'

  return (
    <div className={`message_container ${alignClass}`}>
      {!sameAuthor && (<p className='message_title'>{authorText}</p>)}
      <p className={`message_content ${contentAdditionalStyles}`}>{content}</p>
    </div>
  )
}

const Messages = ({ messages }) => {
  return (
    <div className='messages_container'>
      {messages.map((message, index) => {
        const sameAuthor = index > 0 && messages[index - 1].identity === message.identity

        return (
          <Message
            key={`${message.content}${index}`}
            author={message.identity}
            content={message.content}
            sameAuthor={sameAuthor}
            messageCreatedByMe={message.messageCreatedByMe}
          />
        )
      })}
    </div>
  );
};

const mapStoreStateProps = state => {
  return {
    ...state
  }
}

export default connect(mapStoreStateProps)(Messages);