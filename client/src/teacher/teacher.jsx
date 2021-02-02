import React, {useEffect, useState} from "react";
import _ from 'lodash';
import { Paper, Box, Button, Container, TextField, Typography, FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';

export default ({ createSession }) => {
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [linkError, setLinkError] = useState(false);
  const [meetingLink, updateMeetingLink] = useState("");
  const [meetingPassword, updateMeetingPassword] = useState("");

  const [courses, updateCourses] = useState([]);
  const [selectedCourses, updateSelectedCourses] = useState([]);
  const hasCoursesSelected = selectedCourses.length != 0;
  
  useEffect(() => {
    fetch(`/api/courses?jwt=${window.DEFAULT_JWT}`)
    .then(result => result.json())
    .then((result) => {
      updateCourses(result);
      updateSelectedCourses(_.map(result, c => c.lmsCourseId))
      setCoursesLoading(false);
    });
  }, []);

  if (coursesLoading) return null;  
  
  const startSession = () => {
    if (meetingLink == '') {
      setLinkError(true);
      return;
    }
    if (linkError || !hasCoursesSelected) return;
    createSession({
      meetingLink,
      meetingPassword,
      selectedCourses,
    });
    // start the session
  }

  return (
    <Container maxWidth="sm" disableGutters>
      <Paper elevation={1} className="main-form">
        <Typography variant="h4">Office Hours Configuration</Typography>
        <Box>
          <TextField
            error={linkError}
            value={meetingLink}
            fullWidth
            label="Meeting Link"
            variant="outlined"
            onBlur={() => {
              if (meetingLink == '') {
                setLinkError(true);
              }
            }}
            onChange={e => {
              updateMeetingLink(e.target.value);
              if (e.target.value == '' && !linkError) {
                setLinkError(true);
              } else if(e.target.value != '' && linkError) {
                setLinkError(false);
              }
            }}
            helperText={linkError ? 'Meeting Link cannot be empty' : null}
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
          { !hasCoursesSelected && <Typography variant="body1" color="error">You must selected at least one course</Typography> }
        </FormGroup>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={startSession}
          >START SESSION</Button>
        </Box>
      </Paper>
    </Container>
  );
}
