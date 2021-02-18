import React, {useEffect, useState} from 'react';
import Teacher from './teacher';
import OfficeHourseManagement from './office_hours_management';
import Paper from '@material-ui/core/Paper';

const CREATING_SESSION = "CREATING_SESSION";
const IN_SESSION = "IN_SESSION";
const SESSION_CONCLUDED = "SESSION_CONCLUDED";


export default () => {
  const [socket, setSocket] = useState(null);
  const [sessionState, setSessionState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

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

    socket.on('disconnect', () => {
      setConnectionError(true);
    });

    socket.on('connect_failed', () => {
      setConnectionError(true);
    });

    socket.on('error', () => {
      setConnectionError(true);
    });

    socket.on('reconnect_error', () => {
      setConnectionError(true);
    });

    socket.on('reconnect_failed', () => {
      setConnectionError(true);
    });

    socket.on('connect_error', () => {
      setConnectionError(true);
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
  if (connectionError) {
    return <Paper className="connection-error">A connection error has occurred. Please refresh the page to reconnect.</Paper>
  }
  if (sessionState === CREATING_SESSION) {
    return <Teacher createSession={createSession} />
  } else if (sessionState === IN_SESSION) {
    return <OfficeHourseManagement socket={socket}/>
  } else {
    return null;
  }
}