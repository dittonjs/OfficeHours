
const parseIntIfTruthy = (val) => {
  if (val) {
    return parseInt(val, 10);
  }
  return val;
};

const splitIfTruthy = (val) => {
  if (val) {
    return val.split(',');
  }
  return val;
};

// List of Canvas custom param names
const CANVAS_CUSTOM_PARAMS = [
  'custom_canvas_api_domain',
  'custom_canvas_course_id',
  'custom_canvas_enrollment_state',
  'custom_canvas_user_id',
  'custom_canvas_user_login_id',
  'custom_canvas_workflow_state',
  'custom_canvas_assignment_title',
  'custom_canvas_assignment_points_possible',
  'custom_canvas_assignment_id',
];

module.exports = (launchBody) => {

  const parsedBody = {};

  // Save launched variable to session
  parsedBody.launched = true;

  // Parse launch and save it to session
  parsedBody.launchInfo = {
    timestamp: launchBody.oauth_timestamp * 1000,
    contextId: launchBody.context_id,
    contextLabel: launchBody.context_label,
    canvasHost: launchBody.custom_canvas_api_domain,
    courseId: parseIntIfTruthy(launchBody.custom_canvas_course_id),
    enrollmentState: launchBody.custom_canvas_enrollment_state,
    userId: parseIntIfTruthy(launchBody.custom_canvas_user_id),
    userLoginId: launchBody.custom_canvas_user_login_id,
    workflowState: launchBody.custom_canvas_workflow_state,
    extRoles: splitIfTruthy(launchBody.ext_roles),
    launchPresentationTarget:
      launchBody.launch_presentation_document_target,
    iframeWidth: launchBody.launch_presentation_width,
    iframeHeight: launchBody.launch_presentation_height,
    locale: launchBody.launch_presentation_locale,
    returnURL: launchBody.launch_presentation_return_url,
    userEmail: launchBody.lis_person_contact_email_primary,
    userLastName: launchBody.lis_person_name_family,
    userFullName: launchBody.lis_person_name_full,
    userFirstName: launchBody.lis_person_name_given,
    roles: splitIfTruthy(launchBody.roles),
    canvasInstance: launchBody.tool_consumer_instance_name,
    userImage: launchBody.user_image,
    resourceLinkId: launchBody.resource_link_id,
    originalLTILaunchBody: launchBody,
  };

  // Detect launch type
  const wasAssignmentLaunch = (
    launchBody.custom_canvas_assignment_id
    && launchBody.custom_canvas_assignment_title
    && launchBody.custom_canvas_assignment_points_possible
  );
  parsedBody.launchInfo.launchType = (
    wasAssignmentLaunch
      ? 'assignment'
      : 'navigation'
  );

  // Parse assignment launch
  if (wasAssignmentLaunch) {
    // Parse custom params
    parsedBody.launchInfo.assignment = {
      id: parseIntIfTruthy(launchBody.custom_canvas_assignment_id),
      name: launchBody.custom_canvas_assignment_title,
      pointsPossible:
        parseIntIfTruthy(launchBody.custom_canvas_assignment_points_possible),
    };

    // Parse outcomes
    const acceptedDataValues = (
      launchBody.ext_outcome_data_values_accepted.split(',')
    );
    parsedBody.launchInfo.outcome = {
      url: launchBody.lis_outcome_service_url,
      sourcedId: launchBody.lis_result_sourcedid,
      urlSubmissionAccepted: acceptedDataValues.includes('url'),
      textSubmissionAccepted: acceptedDataValues.includes('text'),
      totalScoreAccepted: (
        launchBody.ext_outcome_result_total_score_accepted
        && launchBody.ext_outcome_result_total_score_accepted === 'true'
      ),
      submittedAtAccepted: (
        launchBody.ext_outcome_submission_submitted_at_accepted
        && launchBody.ext_outcome_submission_submitted_at_accepted === 'true'
      ),
    };
  } else {
    // Navigation launch
    parsedBody.launchInfo.launchAppTitle = launchBody.resource_link_title;
  }


  // Add simpler role booleans
  if (parsedBody.launchInfo.extRoles) {
    const isAdmin = parsedBody.launchInfo.extRoles.includes(
      'urn:lti:instrole:ims/lis/Administrator'
    );
    if (isAdmin) {
      parsedBody.launchInfo.isAdmin = true;
    }
    parsedBody.launchInfo.isInstructor = (
      parsedBody.launchInfo.extRoles.includes(
        'urn:lti:role:ims/lis/Instructor'
      )
    );
    parsedBody.launchInfo.isTA = (
      parsedBody.launchInfo.extRoles.includes(
        'urn:lti:role:ims/lis/TeachingAssistant'
      )
    );
    parsedBody.launchInfo.isDesigner = (
      parsedBody.launchInfo.extRoles.includes(
        'urn:lti:role:ims/lis/ContentDeveloper'
      )
    );
    parsedBody.launchInfo.isCreditLearner = (
      parsedBody.launchInfo.extRoles.includes(
        'urn:lti:role:ims/lis/Learner'
      )
    );
    parsedBody.launchInfo.isNonCreditLearner = (
      parsedBody.launchInfo.extRoles.includes(
        'urn:lti:role:ims/lis/Learner/NonCreditLearner'
      )
    );
    parsedBody.launchInfo.isLearner = (
      parsedBody.launchInfo.isCreditLearner
      || parsedBody.launchInfo.isNonCreditLearner
    );
    parsedBody.launchInfo.notInCourse = (
      !parsedBody.launchInfo.isInstructor
      && !parsedBody.launchInfo.isTA
      && !parsedBody.launchInfo.isDesigner
      && !parsedBody.launchInfo.isCreditLearner
      && !parsedBody.launchInfo.isNonCreditLearner
      && !parsedBody.launchInfo.isLearner
    );
  }

  // Don't allow strange combinations of duplicate roles
  if (
    parsedBody.launchInfo.isInstructor
    || parsedBody.launchInfo.isTA
    || parsedBody.launchInfo.isDesigner
  ) {
    parsedBody.launchInfo.isLearner = false;
    parsedBody.launchInfo.isCreditLearner = false;
    parsedBody.launchInfo.isNonCreditLearner = false;
  }

  // Save current user id for caccl-authorizer
  parsedBody.currentUserCanvasId = parsedBody.launchInfo.userId;

  // Save canvas host for caccl
  parsedBody.canvasHost = parsedBody.launchInfo.canvasHost;

  // Add custom parameters
  parsedBody.launchInfo.customParams = {};
  Object.keys(launchBody).forEach((prop) => {
    // Check if this is a custom param that wasn't sent by Canvas itself
    if (
      !prop.startsWith('custom_')
      || CANVAS_CUSTOM_PARAMS.indexOf(prop) >= 0
    ) {
      // Not a custom parameter. Skip!
      return;
    }

    // Rename prop without "custom_" prefix
    const shorterPropName = prop.substring(7);

    // Save custom parameter
    parsedBody.launchInfo.customParams[shorterPropName] = launchBody[prop];
  });

  // Save session
  return parsedBody;
};
