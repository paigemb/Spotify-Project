/* File for all Spotify-related logic */

import axios from "axios";
import { monthMap } from "./utils";

/***********************************************************************************************************/
/* Web Storage API local storage */
// stores data after browser closes
// store access and refresh token from query params in local storage
// when API request is made, check if token is valid/not expired
// if yes, use. if not use refresh token and store in local storage w/updated timestamp
// note: local storage stores everything as strings --> must also check for undefined
// https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

// Map for local storage keys
const LOCALSTORAGE_KEYS = {
  accessToken: "spotify_access_token",
  refreshToken: "spotify_refresh_token",
  expireTime: "spotify_token_expire_time", //3600 seconds
  timestamp: "spotify_token_timestamp", //timestamp of when the access token currently in use was fetched
};

// Map to retrieve local storage values
const LOCALSTORAGE_VALUES = {
  accessToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.accessToken),
  refreshToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.refreshToken),
  expireTime: window.localStorage.getItem(LOCALSTORAGE_KEYS.expireTime),
  timestamp: window.localStorage.getItem(LOCALSTORAGE_KEYS.timestamp),
};
/***********************************************************************************************************/

/***********************************************************************************************************/
/* Access Token logic */

/**
 * Clear out all local storage items we've set and reload the page
 * @returns {void}
 */
export const logout = () => {
  // loop through local storage and remove all
  for (const property in LOCALSTORAGE_KEYS) {
    window.localStorage.removeItem(LOCALSTORAGE_KEYS[property]);
  }
  // reload to home page w/login button
  window.location = window.location.origin;
};

/**
 * Checks if the amount of time that has elapsed between the timestamp in local storage
 * and now is greater than the expiration time of 3600 seconds (1 hour).
 * @returns {boolean} Whether or not the access token in localStorage has expired
 */
const hasTokenExpired = () => {
  const { accessToken, timestamp, expireTime } = LOCALSTORAGE_VALUES; //destructuring for simplicity
  if (!accessToken || !timestamp) {
    return false;
  }
  const millisecondsElapsed = Date.now() - Number(timestamp);
  return millisecondsElapsed / 1000 > Number(expireTime);
};

/**
 * Use the refresh token in localStorage to hit the /refresh_token endpoint
 * in Node, then update values in localStorage with data from response.
 * async b/c of the API call to /refresh_token endpoint
 * @returns {void}
 */
const refreshToken = async () => {
  try {
    // Logout if there's no refresh token stored or if in a reload infinite loop (?)
    if (
      !LOCALSTORAGE_VALUES.refreshToken ||
      LOCALSTORAGE_VALUES.refreshToken === "undefined" ||
      Date.now() - Number(LOCALSTORAGE_VALUES.timestamp) / 1000 < 1000
    ) {
      console.error("No refresh token available");
      logout();
    }

    // Use `/refresh_token` endpoint from Node
    const { data } = await axios.get(
      `/refresh_token?refresh_token=${LOCALSTORAGE_VALUES.refreshToken}`
    );

    // Update local storage values
    window.localStorage.setItem(
      LOCALSTORAGE_KEYS.accessToken,
      data.access_token
    );
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());

    // Reload the page for local storage updates to be reflected
    window.location.reload();
  } catch (e) {
    console.error(e);
  }
};

/**
 * Handles logic for retrieving the Spotify access token from local storage
 * or URL query params
 * @returns {string} A Spotify access token
 */
const getAccessToken = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  //store tokens in local storage
  const queryParams = {
    [LOCALSTORAGE_KEYS.accessToken]: urlParams.get("access_token"),
    [LOCALSTORAGE_KEYS.refreshToken]: urlParams.get("refresh_token"),
    [LOCALSTORAGE_KEYS.expireTime]: urlParams.get("expires_in"),
  };
  // If there's an error OR the token in localStorage has expired, refresh the token
  const hasError = urlParams.get("error");
  if (
    hasError ||
    hasTokenExpired() ||
    LOCALSTORAGE_VALUES.accessToken === "undefined"
  ) {
    refreshToken();
  }
  // If there is a valid access token in localStorage, use that
  if (
    LOCALSTORAGE_VALUES.accessToken &&
    LOCALSTORAGE_VALUES.accessToken !== "undefined"
  ) {
    return LOCALSTORAGE_VALUES.accessToken;
  }
  // If there is no token in local storage but there is a token in the URL query params, user is logging in for the first time
  if (queryParams[LOCALSTORAGE_KEYS.accessToken]) {
    // Store the query params in localStorage
    for (const property in queryParams) {
      window.localStorage.setItem(property, queryParams[property]);
    }
    // Set timestamp
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());
    // Return access token from query params
    return queryParams[LOCALSTORAGE_KEYS.accessToken];
  }
  // hopefully not
  return false;
};

export const accessToken = getAccessToken();

/***********************************************************************************************************/

/* Axios functions */

/**
 * Axios global request headers
 * Set base url and http request headers for every http request made with axios
 * https://github.com/axios/axios#global-axios-defaults
 */
axios.defaults.baseURL = "https://api.spotify.com/v1";
axios.defaults.headers["Authorization"] = `Bearer ${accessToken}`; //access token is OAuth access token from local storage
axios.defaults.headers["Content-Type"] = "application/json";

/**
 * Get Current User's Profile
 * https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-current-users-profile
 * @returns {Promise}
 */
export const getCurrentUserProfile = () => axios.get("/me"); //only need to include /me since using global base URL

/**
 * Get a List of Current User's Playlists
 * https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-a-list-of-current-users-playlists
 * @returns {Promise}
 */
export const getCurrentUserPlaylists = (limit = 20) => {
  return axios.get(`/me/playlists?limit=${limit}`);
};

/**
 * Get a User's Top Artists and Tracks
 * https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-users-top-artists-and-tracks
 * @param {string} time_range - 'short_term' (last 4 weeks) 'medium_term' (last 6 months) or 'long_term' (calculated from several years of data and including all new data as it becomes available). Defaults to 'short_term'
 * @returns {Promise}
 */
export const getTopArtists = (time_range = "short_term") => {
  return axios.get(`/me/top/artists?time_range=${time_range}`);
};

/**
 * Get a User's Top Tracks
 * https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-users-top-artists-and-tracks
 * @param {string} time_range - 'short_term' (last 4 weeks) 'medium_term' (last 6 months) or 'long_term' (calculated from several years of data and including all new data as it becomes available). Defaults to 'short_term'
 * @returns {Promise}
 */
export const getTopTracks = (time_range = "short_term") => {
  return axios.get(`/me/top/tracks?time_range=${time_range}`);
};

/**
 * Get a Playlist
 * https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-playlist
 * @param {string} playlist_id - The Spotify ID for the playlist.
 * @returns {Promise}
 */
export const getPlaylistById = (playlist_id) => {
  return axios.get(`/playlists/${playlist_id}`);
};

/**
 * Get Audio Features for Several Tracks
 * https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-several-audio-features
 * @param {string} ids - A comma-separated list of the Spotify IDs for the tracks
 * @returns {Promise}
 */
export const getAudioFeaturesForTracks = (ids) => {
  return axios.get(`/audio-features?ids=${ids}`);
};

/**
 * Get New Releases
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/get-new-releases
 * @param {string} limit - how many albums returned
 * @returns {Promise}
 */
export const getNewAlbumReleases = (limit = 20) => {
  return axios.get(`/browse/new-releases?limit=${limit}`);
};

/**
 * Get Artists Albums
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/get-an-artists-albums
 * @param {string} ids - A comma-separated list of the Spotify IDs for the tracks
 * @returns {Promise}
 */
export const getArtistAlbums = (id) => {
  return axios.get(`/artists/${id}/albums`);
};

const addTopTracks = (playlist_id, track) => {
  let trackList = track.join("%2C");
  const newList = trackList.replace(/:/g, "%3A");
  try {
    axios.post(`/playlists/${playlist_id}/tracks?uris=${newList}`);
  } catch {
    console.log("yikes");
  }
};

export const createTopTracksPlaylist = (user_id, tracks) => {
  //get the current month to name the playlist
  const date = new Date();
  const monthNum = date.getMonth();
  const monthWord = monthMap.get(monthNum);

  //create the new playlist and then add in the user's top songs
  axios
    .post(`/users/${user_id}/playlists`, { name: `${monthWord}'s Top Tracks` })
    .then(function (response) {
      var playlist_id = response.data.id;
      let i = 0;
      let tracklist = new Array();
      while (i < 20) {
        tracklist.push(tracks[i].uri);
        i++;
      }
      addTopTracks(playlist_id, tracklist);
    })
    .catch(console.log("oh no"));
};
