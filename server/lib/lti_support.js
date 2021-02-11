const initLTI = require('caccl-lti');
const jwt = require('jsonwebtoken');
const database = new (require('../database/database'));
const Validator = require('./validatator');
const parseLaunch = require('./parselaunch');

const setupLti = (app) => {
      
  // initLTI({ 
  //   app,
  //   installationCredentials: {
  //     consumer_key: process.env.LTI_KEY,
  //     consumer_secret: process.env.LTI_SECRET,
  //   },
  //   launchPath: '/lti_launches'
  // });

  app.use('/lti_launches', async (req, res, next) => {
    const valid = new Validator({
      consumer_key: process.env.LTI_KEY,
      consumer_secret: process.env.LTI_SECRET,
    }).isValid(req);
    if (!valid) {
      res.send("LTI Launch Verification Failed");
      return;
    }

    const { launchInfo } = parseLaunch(req.body);
    req.launchInfo = launchInfo;
    const user = await database.findOrCreateUserFromLTI(launchInfo);
    req.currentUser = user;

    req.jwt = jwt.sign({
      userId: user.id,
      lmsUserId: user.lmsUserId,
      roles: user.roles,
      courseId: launchInfo.courseId,
      name: user.name,
      isInstructor: launchInfo.isInstructor,
      isTA: launchInfo.isTA,
      email: launchInfo.userEmail,
      courseTitle: launchInfo.originalLTILaunchBody.custom_canvas_context_title
    }, 
    process.env.SECRET_KEY,
    {
      expiresIn: "2 days",
    });
    if (launchInfo.isInstructor) {
      await database.createAndAssociateCourse(launchInfo);
    }
    next();
  });

  app.post("/lti_launches", (req, res) => {
    res.render("index", {
      data: {
        launchInfo: req.launchInfo,
        user: req.currentUser.toDoc(),
        jwt: req.jwt,
      }
    });
  });
}


module.exports = {
  setupLti
};