import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import React, {useState, useEffect} from "react";
import WaitingRoom from "./waiting_room";
import WelcomeScreen from './welcome_screen';
import _ from 'lodash';

const IN_SESSION = "IN_SESSION";
const NO_SESSION = "NO_SESSION";
const REMOVED = "REMOVED";
const ADMITTED = "ADMITTED";

export default () => {
  const [socket, setSocket] = useState(null);
  const [sessionState, setSessionState] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [audio, setAudio] = useState([]);
  const [playAudio, setPlayAudio] = useState(true);
  

  useEffect(() => {
    const socket = io({
      auth: {
        token: window.DEFAULT_JWT,
      }
    });
    
    socket.on('no session', () => {
      console.log("am I called!");
      setLoading(false);
      setSessionState(NO_SESSION);
    });

    socket.on('session joined', (session) => {
      console.log("am I called too!");
      setLoading(false);
      setSessionState(IN_SESSION);
      console.log(session);
    });


    socket.on('messages', (messages) => {
      setMessages(messages);
    });

    socket.on('allow entry', (meetingInfo) => {
      setSessionState(ADMITTED);
      console.log(meetingInfo)
      setMeetingInfo(meetingInfo);
    });

    socket.on('removed', () => {
      setSessionState(REMOVED);
    });

    socket.emit('attempt join');

    setSocket(socket);
    socket.on('teacher started session', () => {
      // things to test
      // make sure no one in other classes is notified
      console.log("I was waiting but now am found!");
      socket.emit('attempt join');
    });

    setAudio(new Audio('/notification.mp3'));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.off('participants updated');
    socket.on('participants updated', (newParticipants) => {
      console.log("I GOT UPDATED");
      const shouldWait = _.map(participants, (pId) => {
        if (!_.includes(newParticipants, pId)) {
          const el = document.getElementById(pId);
          if(el) {
            el.style.top = '-200px';
            el.style.fontSize = '0px';
          }
          return true;
        }
      });
      console.log(shouldWait);
      if (_.some(shouldWait)) {
        setTimeout(() => {
          setParticipants(newParticipants);
        }, 1000);
      } else {
        setParticipants(newParticipants);
      }
    });
  }, [participants, socket])

  useEffect(() => {
    if (!socket) return;
    socket.off('message');
    socket.on('message',  (newMessage) => {
      console.log(messages);
      playAudio && newMessage.lmsUserId !== window.DEFAULT_SETTINGS.lmsUserId && audio.play();
      setMessages([...messages, newMessage]);
    });
  }, [messages, socket, audio]);

  const sendMessage = (message) => {
    socket.emit('message', message);
  }

  const leaveMeeting = () => {
    socket.emit('remove user', window.DEFAULT_SETTINGS.lmsUserId);
  }

  if (loading) return null;
  if (sessionState === IN_SESSION) {
    return (
      <WaitingRoom 
        participants={participants} 
        messages={messages} 
        sendMessage={sendMessage}
        leaveMeeting={leaveMeeting}
        playAudio={playAudio}
        setPlayAudio={setPlayAudio}
      />
    );
  } else if (sessionState === REMOVED) {
    return <div>You have been removed from the queue.</div>;
  } else if (sessionState === ADMITTED && meetingInfo) {
    return (
      <Container>
        <Typography variant="h2">
          Thanks for waiting! You can now enter the meeting room.
        </Typography>
        <div>
          <a target="_blank" href={meetingInfo.meetingLink}>
            <Button variant="contained">JOIN MEETING</Button>
          </a>
        </div>
        {
          meetingInfo.meetingPassword !== "" && meetingInfo.meetingPassword && <div style={{ marginTop: '6px'}}>
            The password is: {meetingInfo.meetingPassword}
          </div>
        }
      </Container>
    );
  }
  return <WelcomeScreen />;
}
