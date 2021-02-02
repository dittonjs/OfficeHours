import React, {useState, useEffect} from "react";

const IN_SESSION = "IN_SESSION";
const NO_SESSION = "NO_SESSION";

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
    socket.emit('attempt join');
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
    setSocket(socket);
  }, []);

  if (loading) return null;
  return <div>This is the student app</div>;
}
