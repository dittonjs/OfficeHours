import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import _ from 'lodash';
import React, { useState, useEffect, useLayoutEffect }from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Chat from '../chat/chat';

export default ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [admitted, setAdmitted] = useState([]);
  const [audio, setAudio] = useState([]);
  const [playAudio, setPlayAudio] = useState(true);
  useEffect(() => {
    socket.on('session info', (currentSession) => {
      console.log('session info recieved', currentSession);
      setSession(currentSession);
      setLoading(false);
    });

    socket.on('messages', (messages) => {
      setMessages(messages);
    });

    socket.emit('attempt join');

    setAudio(new Audio('/notification.mp3'));
  }, []);

  useEffect(() => {
    socket.off('message');
    socket.on('message',  (newMessage) => {
      console.log(messages);
      playAudio && newMessage.lmsUserId !== window.DEFAULT_SETTINGS.lmsUserId && audio.play();
      setMessages([...messages, newMessage]);
    });
  }, [messages, audio, playAudio]);

  const endSession = () => {
    socket.emit('end session');
  }

  const removeUser = (lmsUserId) => {
    socket.emit('remove user', lmsUserId);
  }

  const removeFromAdmitted = (participant) => {
    setAdmitted(_.without(admitted, participant));
  }
  
  const admitUser = (participant) => {
    setAdmitted([...admitted, participant]);
    socket.emit('admit user', participant.lmsUserId);
  }

  const sendMessage = (message) => {
    socket.emit('message', message);
  }

  if (loading) return <div>Loading...</div>;
  return (
    <>
      <div className="row">
        <div className="big-column">
          <Paper>
            <div className="padded-container">
              <Typography variant="body1" className="light-text">Queue</Typography>
            </div>
            <Divider />
            
            <List>
              {_.map(session.participants, (participant) => (
                <React.Fragment key={participant.userId}>
                  <div className="padded-container ">
                    <ListItem key={participant.userId}>
                      <ListItemAvatar>
                        <Avatar>
                          {participant.name.substring(0,1)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={participant.name}
                        secondary={participant.courseTitle}
                      />
                      <ListItemSecondaryAction>
                      <Button disabled={!participant.present} variant="contained" color="secondary" onClick={() => admitUser(participant)}>ADMIT</Button>
                      <Button color="secondary" onClick={() => removeUser(participant.lmsUserId)}>REMOVE</Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </div>
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            <div className="padded-container">
              <Button variant="contained" color="primary" onClick={endSession}>END SESSION</Button>
            </div>
          </Paper>

          <Paper style={{marginTop: '12px'}}>
            <div className="padded-container">
              <Typography variant="body1" className="light-text">Admitted</Typography>
            </div>
            <Divider />
            
            <List>
              {_.map(admitted, (participant) => (
                <React.Fragment key={participant.userId}>
                  <div className="padded-container ">
                    <ListItem key={participant.userId}>
                      <ListItemAvatar>
                        <Avatar>
                          {participant.name.substring(0,1)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={participant.name}
                        secondary={participant.courseTitle}
                      />
                      <ListItemSecondaryAction>
                      <Button onClick={() => removeFromAdmitted(participant)}>REMOVE FROM LIST</Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </div>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </div>
        <div className="sm-column">
          <Chat
            messages={messages}
            sendMessage={sendMessage}
            playAudio={playAudio}
            setPlayAudio={setPlayAudio}
          />
        </div>
      </div>
    </>
  );
}