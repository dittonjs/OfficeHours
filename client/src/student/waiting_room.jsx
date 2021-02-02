import React from 'react';
import _ from 'lodash';

export default ({ sendMessage, messages, participants }) => {
  console.log(participants);
  const myPosition = _.findIndex(participants, pId => pId === window.DEFAULT_SETTINGS.userId);

  return <h1>There are {myPosition} people infront of you inline</h1>;

}