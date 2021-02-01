import React from 'react';
import ReactDOM from 'react-dom';
import Teacher from './teacher/teacher';
import Student from './student/student';

const App = () => {
  if (window.DEFAULT_SETTINGS.isInstructor) {
    return <Teacher />;
  }
  return <Student />;
}

ReactDOM.render(<App />, document.getElementById("app"));