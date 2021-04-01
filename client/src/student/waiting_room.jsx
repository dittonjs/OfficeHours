import React from 'react';
import _ from 'lodash';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import PersonIcon from '@material-ui/icons/Person';
import Chat from '../chat/chat';

export default ({ sendMessage, messages, participants, leaveMeeting, playAudio, setPlayAudio }) => {
  console.log(participants);
  const myPosition = _.findIndex(participants, pId => pId === window.DEFAULT_SETTINGS.userId);
  let message = "";
  if(myPosition === 0) {
    message = "You are next in line! Your instructor is currently meeting with the person infront of you. You will be let into the meeting as soon as they are done.";
  } else if (myPosition === 1) {
    message = "There is 1 person ahead of you."
  } else {
    message = `There are ${myPosition} people ahead of you.`
  }
  return (
    <div>
      <Button variant="contained" style={{ marginBottom: '6px'}} onClick={leaveMeeting}>Leave Queue</Button>
      <Paper className="fixed-90">
        <div className="padded-container">
          <Typography variant="subtitle2">{message}</Typography>
        </div>
        <PersonIcon className="teacher" />
        {
          _.map(participants, (pId) => {
            if (pId === window.DEFAULT_SETTINGS.userId) {
              return <PersonIcon className="current-person" key={pId} id={pId}/>
            } else {
              return <PersonIcon className="person" key={pId} id={pId}/>
            }
          })
        }
      </Paper>
      <h1></h1>
      <Chat messages={messages} sendMessage={sendMessage} playAudio={playAudio} setPlayAudio={setPlayAudio} />
    </div>
  );

}