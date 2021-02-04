import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import React from 'react';

export default () => {
  return (
    <Paper className="padded-container">
      <Typography variant="h1">Office Hours</Typography>
      <Typography variant="body1">
        There currently is not an office hours session running for your class. If you are expecting one to start soon,
        then hang tight and you will automatically enter the queue when your instructor starts the session.
      </Typography> 
    </Paper>
  );
}