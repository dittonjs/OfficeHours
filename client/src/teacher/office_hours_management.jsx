import { Button } from '@material-ui/core';
import React from 'react';

export default ({ endSession }) => {
  return (
    <div>
      <Button variant="contained" color="primary" onClick={endSession}>END SESSION</Button>
    </div>
  );
}