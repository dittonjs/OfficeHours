import { Button, Paper, Typography } from '@material-ui/core';
import _ from 'lodash';
import React, { useState, useEffect, useLayoutEffect }from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import FolderIcon from '@material-ui/icons/Folder';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Chat from '../chat/chat';

export default ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const getMessages = () => messages
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
  }, []);

  useEffect(() => {
    socket.off('message');
    socket.on('message',  (newMessage) => {
      console.log(messages);
      setMessages([...messages, newMessage]);
    });
  }, [messages]);

  const endSession = () => {
    socket.emit('end session');
  }

  const removeUser = (lmsUserId) => {
    socket.emit('remove user', lmsUserId);
  }

  const admitUser = (lmsUserId) => {
    socket.emit('admit user', lmsUserId);
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
                        secondary={`${participant.courseTitle}`}
                      />
                      <ListItemSecondaryAction>
                      <Button variant="contained" color="secondary" onClick={() => admitUser(participant.lmsUserId)}>ADMIT</Button>
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
        </div>
        <div className="sm-column">
          <Chat messages={messages} sendMessage={sendMessage}/>
        </div>
      </div>
    </>
  );
}