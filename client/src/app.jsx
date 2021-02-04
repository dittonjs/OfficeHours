import React from 'react';
import ReactDOM from 'react-dom';
import SwitchBoard from './teacher/switch_board';
import Student from './student/student';

import { ThemeProvider } from '@material-ui/core/styles'

import { createMuiTheme } from '@material-ui/core/styles';

import blue from '@material-ui/core/colors/blue';

const theme = createMuiTheme({
  palette: {
    primary: {

      main: '#00263A',
    },
    secondary: {
      main: '#0277BD',
    },
  },
});

const App = () => {
  if (window.DEFAULT_SETTINGS.isInstructor) {
    return (
      <ThemeProvider theme={theme}>
        <SwitchBoard />
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider theme={theme}>
      <Student />
    </ThemeProvider>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));