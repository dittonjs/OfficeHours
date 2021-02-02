import { Button } from '@material-ui/core';
import _ from 'lodash';
import React, { useState, useEffect }from 'react';
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
  useEffect(() => {
    socket.on('session info', (currentSession) => {
      console.log('session info recieved', currentSession);
      setSession(currentSession);
      setLoading(false);
    });

    socket.on('messages', (messages) => {
      setMessages(messages);
    });
    
    socket.on('message',  (newMessage) => {
      setMessages([...messages, newMessage])
    });

    socket.emit('attempt join');
  }, []);
  const endSession = () => {
    socket.emit('end session');
  }

  const removeUser = (lmsUserId) => {
    socket.emit('remove user', lmsUserId);
  }

  const admitUser = (lmsUserId) => {
    socket.emit('admit user', lmsUserId);
  }

  if (loading) return <div>Loading...</div>;
  return (
    <div className="row">
      <div className="big-column">
        <List>
          {_.map(session.participants, (participant) => (
            <React.Fragment key={participant.userId}>
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
              <Divider />
            </React.Fragment>
          ))}
        </List>
        <div>
          <Button variant="contained" color="primary" onClick={endSession}>END SESSION</Button>
        </div>
      </div>
      <div className="sm-column">
        <Chat />
      </div>
    </div>
  );
}