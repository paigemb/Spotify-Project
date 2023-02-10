import { useState, useEffect } from "react";
import { accessToken, logout } from "./spotify";
import { GlobalStyle } from "./styles";
import { ScrollToTop } from "./utils";
import styled from "styled-components/macro";

// Styling & Logic for individual pages
import {
  Login,
  Profile,
  TopArtists,
  TopTracks,
  Playlists,
  Playlist,
} from "./pages";

// imports to handling page routing
import {
  BrowserRouter as Router,
  Switch, //switch will find the first element with matching path and ignore the rest -> list more specific routes first
  Route,
  useLocation,
} from "react-router-dom";

import "./App.css"; //delete ? 

const StyledLogoutButton = styled.button`
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: rgba(0, 0, 0, 0.7);
  color: var(--white);
  font-size: var(--fz-sm);
  font-weight: 700;
  border-radius: var(--border-radius-pill);
  z-index: 10;
  @media (min-width: 768px) {
    right: var(--spacing-lg);
  }
`;

function App() {
  //token variable for conditionally rendering the logged-in state
  const [token, setToken] = useState(null); //useState keeps track of token

  // store access token
  useEffect(() => {
    setToken(accessToken);
  }, []);

  return (
    <div className="app">
      <GlobalStyle />

      {!token ? (
        <Login />
      ) : (
        <>
          <StyledLogoutButton onClick={logout}>Log Out</StyledLogoutButton>

          <Router>
            <ScrollToTop />

            <Switch>
              <Route path="/top-artists">
                <TopArtists />
              </Route>
              <Route path="/top-tracks">
                <TopTracks />
              </Route>
              <Route path="/playlists/:id">
                <Playlist />
              </Route>
              <Route path="/playlists">
                <Playlists />
              </Route>
              <Route path="/">
                <Profile />
              </Route>
            </Switch>
          </Router>
        </>
      )}
    </div>
  );
}

export default App;
