const { ModeCommentOutlined } = require('@material-ui/icons');
const _ = require('lodash');

module.exports = class Cache {
  constructor() {
    this.sessions = {

    }
  }

  getSession(key) {
    return this.sessions[key];
  }

  getSessionForCourse(courseId) {
    return _.find(
      this.sessions,
      session => _.includes(session.selectedCourses, courseId)
    );
  }

  setSession(key, session) {
    this.sessions[key] = session;
  }



  clearSession(key) {
    delete this.sessions[key];
  }

  
}