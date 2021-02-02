const jwt = require('jsonwebtoken');
const database = new (require('../database/database'));

module.exports = (app) => {
  app.get("/api/courses", async (req, res) => {
    const jwtBody = jwt.verify(req.query.jwt, process.env.SECRET_KEY);
    if (!jwtBody.isInstructor) {
      res.sendStatus(401);
      return;
    }
    const courses = await database.getCourses(jwtBody.lmsUserId);
    res.json(courses);
  });

  app.post("/api/sessions",  async (req, res) => {
    console.log(req.query.jwt);
    console.log(req.body);
  });
}