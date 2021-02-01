import React, {useEffect, useState} from "react";
import _ from 'lodash';
import { Paper, Box, Button, Container, TextField, Typography, FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';

export default () => {
  const [meetingLink, updateMeetingLink] = useState("");
  const [meetingPassword, updateMeetingPassword] = useState("");
  const [socket, setSocket] = useState(null)
  const [courses, updateCourses] = useState([]);
  const [selectedCourses, updateSelectedCourses] = useState([]);

  useEffect(() => {
    const socket = io();
    socket.on('ping', () => {
      console.log("I GOT PINGED BACK")
    });
    setSocket(socket);
  }, [])

  useEffect(() => {
    fetch(`/api/courses?jwt=${window.DEFAULT_JWT}`)
    .then(result => result.json())
    .then((result) => {
      updateCourses(result);
      updateSelectedCourses(_.map(result, c => c.lmsCourseId))
    });
  }, []);

  
  
  return (
    <Container maxWidth="sm">
      <Paper elevation={1} className="main-form">
        <Typography variant="h4">Office Hours Configuration</Typography>
        <Box>
          <TextField
            value={meetingLink}
            fullWidth
            label="Meeting Link"
            variant="outlined"
            onChange={e => updateMeetingLink(e.target.value)}
          />
        </Box>
        <Box className="spacer-sm">
          <TextField
            value={meetingPassword}
            label="Meeting Password"
            variant="outlined"
            helperText="This will be visible to students"
            onChange={e => updateMeetingPassword(e.target.value)}
          />
        </Box>
        <Typography variant="subtitle1" className="spacer">Include Courses</Typography>
        <FormGroup>
          {_.map(courses, (course) => (
            <FormControlLabel
              key={course._id}
              control={
                <Checkbox
                  checked={_.includes(selectedCourses, course.lmsCourseId)}
                  name={course.title}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateSelectedCourses([...selectedCourses, course.lmsCourseId])
                    } else {
                      updateSelectedCourses(_.without(selectedCourses, course.lmsCourseId));
                    }
                  }}
                />
              }
              label={course.title}
            />
          ))}
        </FormGroup>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => socket.emit("ping")}
          >START SESSION</Button>
        </Box>
      </Paper>
    </Container>
  );
}
