import React from 'react';
import _ from 'lodash';
import Chat from '../chat/chat';

export default ({ sendMessage, messages, participants }) => {
  console.log(participants);
  const myPosition = _.findIndex(participants, pId => pId === window.DEFAULT_SETTINGS.userId);

  return (
    <div>
      <h1>There are {myPosition} people infront of you inline</h1>
      <Chat messages={messages} sendMessage={sendMessage} />
    </div>
  );

}