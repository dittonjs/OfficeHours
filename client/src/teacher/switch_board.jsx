import React, {useEffect, useState} from 'react';
import Teacher from './teacher';
import OfficeHourseManagement from './office_hours_management';

const CREATING_SESSION = "CREATING_SESSION";
const IN_SESSION = "IN_SESSION";
const SESSION_CONCLUDED = "SESSION_CONCLUDED";

export default () => {
  const [socket, setSocket] = useState(null);
  const [sessionState, setSessionState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io({
      auth: {
        token: window.DEFAULT_JWT,
      }
    });
    socket.on('current state', (currentState) => {
      console.log("am I called!");
      console.log(currentState)
      setLoading(false);
      setSessionState(currentState);
    });
    setSocket(socket);
  }, []);
  if (loading) return null;

  const createSession = (sessionInfo) => {
    console.log("dis I get called?")
    socket.emit(
      "create",
      sessionInfo
    );
  }


  console.log("MY SESSION IS ", sessionState);
  if (sessionState === CREATING_SESSION) {
    return <Teacher createSession={createSession} />
  } else if (sessionState === IN_SESSION) {
    return <OfficeHourseManagement socket={socket}/>
  } else {
    return null;
  }
}