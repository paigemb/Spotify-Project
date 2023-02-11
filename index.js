//index.js app entry point

// allows access to secret env variables
require("dotenv").config();

const path = require("path");

/* Express module */
const express = require("express"); //import
const app = express(); //instatiate

// Priority serve any static files
app.use(express.static(path.resolve(__dirname, "./client/build")));

const axios = require("axios");

//parse and stringify query strings
const querystring = require("querystring");

const { restart } = require("nodemon");

// securely store environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const FRONTEND_URI = process.env.FRONTEND_URI;
const PORT = process.env.PORT || 8888; //heroku dynos expose a dynamic port for app to bind to on PORT variable

/**
 * Generates a random string containing numbers and letters
 * Added protection against things like cross-site request forgery
 * https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#synchronizer-token-pattern
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = (length) => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = "spotify_auth_state";

/* ROUTE HANDLERS */

// request authorization from Spotify Accounts Service
app.get("/login", (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  // list of needed scopes from Spotify API
  const scope = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "playlist-modify-public",
    "playlist-modify-private",
  ].join(" ");

  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: "code", // authorization code to be exchanged for access token
    redirect_uri: REDIRECT_URI, //redirect user after authorization
    state: state, //bookkeeping value passed back unchanged in redirect URI, OAuth security
    scope: scope,
  });

  // hit Spotify Accounts Service endpoint, redirects to Login Page
  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

// exchanges the authorization code for access token !!
// pass tokens to React app via query params

app.get("/callback", (req, res) => {
  //req.query -> from Express, object containing a property for each query string param (i.e code=abc, return abc)
  const code = req.query.code || null; // store authorization code

  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      //format required body params
      grant_type: "authorization_code",
      code: code, // authorization code
      redirect_uri: REDIRECT_URI,
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded", //body of HTTP Post req sent as query string in simple text/ASCII format
      Authorization: `Basic ${new Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString("base64")}`, //Authorization header should be base 64 encoded string
    },
  })
    //handle resolving the promise axios() returns
    .then((response) => {
      if (response.status === 200) {
        //return stringified data
        const { access_token, refresh_token, expires_in } = response.data;

        const queryParams = querystring.stringify({
          access_token,
          refresh_token, //retrieve another access token
          expires_in, //number of seconds that access_token is valid
        });
        //res.redirect() Express method to send user to localhost url
        res.redirect(`${FRONTEND_URI}/?${queryParams}`);
      } else {
        res.redirect(`/?${querystring.stringify({ error: "invalid_token" })}`);
      }
    })
    .catch((error) => {
      //do not return stringified data :(
      res.send(error);
    });
});

// refresh token so user doesn't have to log in again
app.get("/refresh_token", (req, res) => {
  const { refresh_token } = req.query;

  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${new Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString("base64")}`,
    },
  })
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.send(error);
    });
});

// All remaining requests return the React app, so it can handle routing
// catch-all for express routes, if the express doesnt recognize defer to react
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

//listen for connection
app.listen(PORT, () => {
  console.log(`Express app listening at http://localhost:${PORT}`);
});
