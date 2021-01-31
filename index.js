require('dotenv').config();
require('./server/models/user');

const morgan = require('morgan')
const express = require('express');
const path = require("path");
const bodyParser = require("body-parser");
const session = require('express-session');
const { setupLti } = require("./server/lib/lti_support");

const port = parseInt(process.env.APP_PORT, 10);

const app = express();

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
  console.log(req.jwt);
  console.log(req.session.launchInfo);
  console.log(req.currentUser.toDoc());
  res.render("index", {
    data: {
      launchInfo: req.session.launchInfo,
      user: req.currentUser.toDoc(),
      jwt: req.jwt,
    }
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

