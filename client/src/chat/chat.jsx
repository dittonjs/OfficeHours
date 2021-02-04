import React, { useEffect, useState, useLayoutEffect } from 'react';
import _ from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import DirectionsIcon from '@material-ui/icons/Directions';
import { Typography } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    // alignItems: 'center',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));

export default ({ messages, sendMessage }) => {
  const classes = useStyles();
  const [message, setMessage] = useState("");
  const [shouldScroll, setShouldScroll] = useState(true);
  
  // useEffect(() => {
  //   const el = document.getElementById('messages');
  //   console.log(messages)
  //   debugger
  // }, [messages])

  // useLayoutEffect(() => {
  //   // debugger
  //   // if (shouldScroll) {
  //     const el = document.getElementById('messages');
  //     el.scrollTop = el.scrollHeight;
  //     // setShouldScroll(false);
  //   // }
  // }, [messages])

  const sendMessageAndScroll = (message) => {
    sendMessage(message);
    setMessage("");
    const el = document.getElementById('chat-messages');
    el.scrollTop = el.scrollHeight;
  }
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      sendMessageAndScroll(message)
      e.preventDefault();
    }
  }
  return (
    <Paper>
      <div className="padded-container">
        <Typography variant="body1" className="light-text">Chat</Typography>
      </div>
      <Divider />
      <div className="padded-container messages" id="messages">
        <div className="chat-messages" id="chat-messages">
          {
            _.map(_.reverse([...messages]), (message, i) => (
                <div key={message.id} >
                  <span className="speech-bubble-right">
                    {message.body}
                  </span>
                </div>
              )
            )
          }       
        </div>
      </div>
      <Divider />
      <div className={classes.root}>
        <InputBase
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className={classes.input}
          placeholder="Your message"
          inputProps={{ 'aria-label': 'your message' }}
          multiline
        />
        <div>
          <IconButton
            onClick={() => sendMessageAndScroll(message)}       
            type="submit" className={classes.iconButton} aria-label="search">
            <SendIcon />
          </IconButton>
        </div>
      </div>
    </Paper>
  );
}
