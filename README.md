# Spotify-Project

Project Description:

- Application to allow Spotify users to log in with their account and view data such as Top Tracks/ Top Artists/ Playlists, etc
- Tools and fun things utilized
  - nvm: node version manager
  - Express:
    - provides HTTP utility methods & middleware / route handling --> SAVES TIME
    - app.METHOD(PATH, HANDLER) <-- basic structure
  - nodemon:
    - restarts Node server automatically w/changes in index.js file
  - OAuth: (https://developer.spotify.com/documentation/general/guides/authorization/)
    - one app can interact w/another w/out needing your password<3
    - pass authorization tokens over HTTPS via access tokens
      - tokens expire and need to be refreshed for security
    - in this project the roles are Spotify API, Spotify user, this app, and Spotify Accounts Service
    - need to specify scopes, see https://developer.spotify.com/documentation/general/guides/authorization/scopes/ for list
  - dotenv: loads environment variables from env file into an object w/user environment
  - Axios library: provides easy API and works both client-side/browser and server-side/Express app
  - Create React App (CRA): handles configuration with setting up app, run npx create-react-app directory_name
  - Concurrently: runs multiple npm commands at the same time, used to simplify project setup
  - Styled Components & Styled Components Babel plugin: CSS-in-JS library for easier UI styling. They are React components so can be passed as props!
  - Node.js buildpack for heroku development
    - caches npm modules for client and server, tell heroku to install and build frontend
- https://www.newline.co/courses/build-a-spotify-connected-app

How to run:

- npm start
- When prompted, login with your Spotify credentials

Dependency installation: (postinstall script in package.json)

- npm install

Prettier:

- npx prettier --write .
