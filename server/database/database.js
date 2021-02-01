const { MongoClient, Db } = require("mongodb");
const User = require("../models/user");
class Database {
  async findOrCreateUserFromLTI(launchInfo) {
    const client = await MongoClient.connect(`mongodb://localhost:27017`);
    
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
    const client = await MongoClient.connect(`mongodb://localhost:27017`);
    
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
    const client = await MongoClient.connect(`mongodb://localhost:27017`);
    const db = client.db(process.env.DB_NAME);
    const courses = await db.collection("courses").find({ lmsUserId }).toArray();
    return courses;
  }
}

module.exports = Database;