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
}

module.exports = Database;