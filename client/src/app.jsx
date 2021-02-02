import React from 'react';
import ReactDOM from 'react-dom';
import SwitchBoard from './teacher/switch_board';
import Student from './student/student';

const App = () => {
  if (window.DEFAULT_SETTINGS.isInstructor) {
    return <SwitchBoard />;
  }
  return <Student />;
}

ReactDOM.render(<App />, document.getElementById("app"));