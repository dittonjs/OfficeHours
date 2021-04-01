const { MongoClient, Db } = require("mongodb");
const User = require("../models/user");
class Database {
  async getClient() {
    if (this.client) return this.client;
    this.client = await MongoClient.connect(process.env.DB_URL);
    return this.client;
  }

  async findOrCreateUserFromLTI(launchInfo) {
    const client = await this.getClient();
    const db = client.db(process.env.DB_NAME);
    
    const user = await db.collection("users").findOne({
      lmsUserId: launchInfo.userId,
    });
      
    if (!user) {
      const result = await db.collection("users").insertOne(User.newFromLtiLaunch(launchInfo).toDoc());
      return User.fromDoc(result.ops[0]);
    }

    return User.fromDoc(user);
    
  }

  async createAndAssociateCourse(launchInfo) {
    const client = await this.getClient();
    const db = client.db(process.env.DB_NAME);
    const course = await db.collection("courses").findOne({
      lmsUserId: launchInfo.userId,
      lmsCourseId: launchInfo.courseId,
    });
      
    if (!course) {
      console.log("NO COURSE FOUND, CREATING");
      const result = await db.collection("courses").insertOne({
        lmsUserId: launchInfo.userId,
        lmsCourseId: launchInfo.courseId,
        title: launchInfo.originalLTILaunchBody.custom_canvas_context_title,
      });
      return true;
    }

    console.log("COURSE MAPPING ALREADY COMPLETE");
    return false;
  }

  async getCourses(lmsUserId) {
    const client = await this.getClient();
    const db = client.db(process.env.DB_NAME);
    const courses = await db.collection("courses").find({ lmsUserId }).toArray();
    return courses;
  }

  async getCurrentSession(jwtBody) {
    const client = await this.getClient();
    const db = client.db(process.env.DB_NAME);
    return db.collection("sessions").findOne({
      lmsUserId: jwtBody.lmsUserId
    });
  }

  async getCurrentCourseSession(jwtBody) {
    console.log(jwtBody);
    const client = await this.getClient();
    const db = client.db(process.env.DB_NAME);
    return db.collection("sessions").findOne({
      selectedCourses: jwtBody.courseId,
    });
  }

  async createSession(session) {
    const client = await this.getClient();
    const db = client.db(process.env.DB_NAME);

    const result = await db.collection("sessions").insertOne(session);
    return result.ops[0];
  }

  async destroySession(lmsUserId) {
    const client = await this.getClient();
    const db = client.db(process.env.DB_NAME);

    await db.collection("sessions").deleteOne({ lmsUserId });
  }

  async updateSessionParticipants(sessionId, participants) {
    const db = this.client.db(process.env.DB_NAME);

    await db.collection("sessions").updateOne({ _id: sessionId }, { 
      $set: { participants }
    });
  }

  async updateMessages(sessionId, messages) {
    const db = this.client.db(process.env.DB_NAME);

    await db.collection("sessions").updateOne({ _id: sessionId }, { 
      $set: { messages }
    });
  }
}

module.exports = Database;