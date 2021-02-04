import { Button, Container, Typography } from "@material-ui/core";
import React, {useState, useEffect} from "react";
import WaitingRoom from "./waiting_room";

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

    socket.on('participants updated', (participants) => {
      console.log("I GOT UPDATED");
      setParticipants(participants);
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
    // https://usu-edu.zoom.us/my/josephditton?pwd=MmcyMXp1UnZCZFZYNjdvV1BOZXJ2UT09
    socket.on('teacher started session', () => {
      // things to test
      // make sure no one in other classes is notified
      console.log("I was waiting but now am found!");
      socket.emit('attempt join');
    })
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.off('message');
    socket.on('message',  (newMessage) => {
      console.log(messages);
      setMessages([...messages, newMessage]);
    });
  }, [messages, socket]);

  const sendMessage = (message) => {
    socket.emit('message', message);
  }

  if (loading) return null;
  if (sessionState === IN_SESSION) {
    return <WaitingRoom participants={participants} messages={messages} sendMessage={sendMessage} />
  } else if (sessionState === REMOVED) {
    return <div>You have been removed from the queue by your instructor</div>;
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
      </Container>
    );
  }
  return <div>This is the student app</div>;
}
