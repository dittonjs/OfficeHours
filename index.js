require('dotenv').config();
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const morgan = require('morgan')
const express = require('express');
const path = require("path");
const bodyParser = require("body-parser");
const session = require('express-session');
const { setupLti } = require("./server/lib/lti_support");
const database = new (require('./server/database/database'));

const port = parseInt(process.env.APP_PORT, 10);

const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(session({secret: "secret", resave: false, saveUninitialized: true}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.engine('.html', require('ejs').__express);
app.use(express.static('../dist'));
app.use(morgan('combined'));
app.set('view engine', 'html');

app.use(express.static(path.join('dist')));

setupLti(app);

app.get('/', (req, res) => {
  res.render("index", {
    isLti: false,
  });
});

app.get('/lti_launches', (req, res) => {
  res.render("index", {
    data: {
      launchInfo: req.session.launchInfo,
      user: req.currentUser.toDoc(),
      jwt: req.jwt,
    }
  });
});

require("./server/api/api")(app);

io.on('connection', async (socket) => {
  socket.on('disconnect', () => {
    console.log("A USER WAS DISCONNECTED");
  });

  // Creating session
  try {
    const jwtBody = jwt.verify(socket.handshake.auth.token, process.env.SECRET_KEY);
    socket.join(`personal ${jwtBody.lmsUserId}`);
    console.log("A User Connected");
    if (jwtBody.isInstructor) {
      socket.join(`teacher ${jwtBody.lmsUserId}`);
      const currentSession = await database.getCurrentSession(jwtBody);
      if (currentSession == null) {
        socket.emit("current state", "CREATING_SESSION");
        socket.on('create', async (sessionInfo) => {
          console.log("request recieved")
          try {
            const jwtBody = jwt.verify(socket.handshake.auth.token, process.env.SECRET_KEY);
            if (jwtBody.isInstructor) {
              const currentSession = await database.createSession({
                ...sessionInfo,
                lmsUserId: jwtBody.lmsUserId,
                participants: [],
                messages: [],
              });
              console.log(currentSession);
              socket.emit('current state', 'IN_SESSION');
              currentSession.selectedCourses.forEach((courseId) => {
                socket.to(`waiting ${courseId}`).emit('teacher started session');
              });
            }
          } catch(e) {
            console.log(e);
          }
        });
      } else {
        socket.emit("current state", "IN_SESSION");

        // ROOM DEDICATED TO TEACHER ONLY
        
      }
      console.log(currentSession);

    } else {
      // WAITING ROOM FOR THE COURSE
      socket.join(`waiting ${jwtBody.courseId}`);
    } 
  } catch (e) {
    console.log(e);
    console.log("INVALID JWT");
    socket.emit('invalid JWT');
  }


  // ENDING A SESSION
  socket.on("end session", async () => {
    try {
      const jwtBody = jwt.verify(socket.handshake.auth.token, process.env.SECRET_KEY);
      if (jwtBody.isInstructor) {
        const currentSession = await database.destroySession(jwtBody.lmsUserId);
        socket.emit('current state', 'SESSION_CONCLUDED');
        socket.to(`session ${jwtBody.lmsUserId}`).emit('no session');
      }
    } catch(e) {
      console.log(e);
    }
  });

  socket.on('attempt join', async () => {
    try {
      const jwtBody = jwt.verify(socket.handshake.auth.token, process.env.SECRET_KEY);
      if (jwtBody.isInstructor) {
        const currentSession = await database.getCurrentSession(jwtBody);
        // THE ROOM FOR THE ACTUAL SESSION
        socket.join(`session ${currentSession.lmsUserId}`);
        socket.emit('session info', currentSession);
      } else {
        const currentSession = await database.getCurrentCourseSession(jwtBody);
        if (currentSession) {
          socket.join(`session ${currentSession.lmsUserId}`);
          socket.emit('session joined', currentSession._id);
          if (!_.find(currentSession.participants, p => p.lmsUserId === jwtBody.lmsUserId)) {
            console.log("ADDING TO QUEUE");
            currentSession.participants = [
              ...currentSession.participants,
              {
                name: jwtBody.name,
                courseId: jwtBody.courseId,
                userId: jwtBody.userId,
                lmsUserId: jwtBody.lmsUserId,
                email: jwtBody.email,
                courseTitle: jwtBody.courseTitle,
                status: 'waiting',
                present: true,
              }
            ];
            await database.updateSessionParticipants(currentSession._id, currentSession.participants);
            
          }
          console.log(currentSession);
          // broadcast to all including current socket
          io
            .to(`session ${currentSession.lmsUserId}`)
            .emit('participants updated', _.map(currentSession.participants, (p) => {
              return p.userId;
            }));
          socket.to(`teacher ${currentSession.lmsUserId}`).emit('session info', currentSession);
          socket.emit('messages', currentSession.messages);
          // check if already in queue
        } else {
          socket.emit('no session');
        }
      }
    } catch(e) {
      console.log(e);
    }
  });

  socket.on('remove user', async (lmsUserId) => {
    try {
      const jwtBody = jwt.verify(socket.handshake.auth.token, process.env.SECRET_KEY);
      if (jwtBody.isInstructor) {
        const currentSession = await database.getCurrentCourseSession(jwtBody);
        _.remove(currentSession.participants, p => p.lmsUserId === lmsUserId );
        await database.updateSessionParticipants(currentSession._id, currentSession.participants);
        io
          .to(`session ${currentSession.lmsUserId}`)
          .emit('participants updated', _.map(currentSession.participants, (p) => {
            return p.userId;
          }));
          socket.to(`personal ${lmsUserId}`).emit('removed');
          socket.emit('session info', currentSession);
      }
    } catch(e) {
      console.log(e);
    }
  });

  socket.on('admit user', async (lmsUserId) => {
    try {
      const jwtBody = jwt.verify(socket.handshake.auth.token, process.env.SECRET_KEY);
      if (jwtBody.isInstructor) {
        const currentSession = await database.getCurrentCourseSession(jwtBody);
        _.remove(currentSession.participants, p => p.lmsUserId === lmsUserId );
        await database.updateSessionParticipants(currentSession._id, currentSession.participants);
        io
          .to(`session ${currentSession.lmsUserId}`)
          .emit('participants updated', _.map(currentSession.participants, (p) => {
            return p.userId;
          }));
          socket.to(`personal ${lmsUserId}`).emit('allow entry', {
            meetingLink: currentSession.meetingLink,
            meetingPassword: currentSession.meetingPassword,
          });
          socket.emit('session info', currentSession);
      }
    } catch(e) {
      console.log(e);
    }
  });
  
});

http.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

