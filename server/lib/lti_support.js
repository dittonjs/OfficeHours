const initLTI = require('caccl-lti');
const jwt = require('jsonwebtoken');
const database = new (require('../database/database'));

const setupLti = (app) => {
      
  initLTI({ 
    app,
    installationCredentials: {
      consumer_key: process.env.LTI_KEY,
      consumer_secret: process.env.LTI_SECRET,
    },
    launchPath: '/lti_launches'
  });

  app.use('/lti_launches', async (req, res, next) => {
    console.log(req);
    console.log(req.session);
    console.log(req.session.launchInfo);
    const user = await database.findOrCreateUserFromLTI(req.session.launchInfo);
    req.currentUser = user;

    req.jwt = jwt.sign({
      userId: user.id,
      lmsUserId: user.lmsUserId,
      roles: user.roles,
      courseId: req.session.launchInfo.courseId,
      name: user.name,
      isInstructor: req.session.launchInfo.isInstructor,
      isTA: req.session.launchInfo.isTA,
      email: req.session.launchInfo.userEmail,
      courseTitle: req.session.launchInfo.originalLTILaunchBody.custom_canvas_context_title
    }, 
    process.env.SECRET_KEY,
    {
      expiresIn: "2 days",
    });
    if (req.session.launchInfo.isInstructor) {
      await database.createAndAssociateCourse(req.session.launchInfo);
    }
    next();
  });
}


module.exports = {
  setupLti
};