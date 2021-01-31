# Node LTI Starter App
This is an LTI Starter Application using NodeJS, Parcel, and MongoDB.

This app handles a basic LTI 1.1 launch from any LMS that supports the standard. In the future I will support LTI 1.3 but not yet.

## Getting started
These instructions assume you have MongoDB community edition installed on your machine.

1. Copy the contents of `.env.example` into a new file called `.env`

2. Change the values in `.env` to be appropriate for your app

3. Run `yarn` to install dependancies

4. Run `yarn server` to start the server

5. Run `yarn dev` to build and watch the assets

6. Change the values in `lti_config.xml` to match your app

7. Install the app into your lms using the XML and key and secret from your .env file

