const uuid = require("uuid");

// TODO: validate models
class User {

  static fromDoc(doc) {
    const user = new User();
    user.id = doc._id;
    user.name = doc.name;
    user.email = doc.email;
    user.lmsUserId = doc.lmsUserId;
    user.imageLink = doc.imageLink;
    user.loginId = doc.loginId;
    user.roles = doc.roles;
    return user;
  }

  static newFromLtiLaunch(launchInfo) {
    const user = new User();
    user.name = launchInfo.userFullName;
    user.email = launchInfo.userEmail;
    user.lmsUserId = launchInfo.userId;
    user.imageLink = launchInfo.userImage;
    user.loginId = launchInfo.userLoginId;
    user.roles = launchInfo.extRoles;
    return user;
  }

  toDoc() {
    return {
      _id: this.id,
      name: this.name,
      email: this.email,
      lmsUserId: this.lmsUserId,
      imageLink: this.imageLink,
      loginId: this.loginId,
      roles: this.roles,
    };
  }
}

module.exports = User;