/* Page to display all of a user's playlists */

import { useState, useEffect } from "react";
import axios from "axios";
import { getCurrentUserPlaylists, createTopTracksPlaylist } from "../spotify";
import { catchErrors } from "../utils";
import { SectionWrapper, PlaylistsGrid, Loader } from "../components";

/*
 * Spotify API can return a maximum of 20 playlists at one time
 * Wrap JSON response in a paging object containing a next property containing the URL of the next page of items
 * ex API call returns = next: "https://api.spotify.com/v1/users/username/playlists?offest=10....etc"
 * need to do a second GET call to next's url
 */
const Playlists = () => {
  const [playlistsData, setPlaylistsData] = useState(null);
  const [playlists, setPlaylists] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getCurrentUserPlaylists();
      setPlaylistsData(data);
      await createTopTracksPlaylist();
    };

    catchErrors(fetchData());
  }, []);

  // when playlistsData updates, check if there are more playlists to fetch
  // then update the state variable
  useEffect(() => {
    if (!playlistsData) {
      return;
    }

    // playlist endpoint only returns 20 playlists at a time, so we need to
    // make sure we get ALL playlists by fetching the next set of playlists
    const fetchMoreData = async () => {
      // wrap fetch and set state logic in conditional to loop until last paging object
      if (playlistsData.next) {
        const { data } = await axios.get(playlistsData.next);
        setPlaylistsData(data);
      }
    };

    //update playlists state variable w/functional update (reactjs.org/docs/hooks-reference.html#functional-updates)
    //merges previous playlist state variable array with the items array on the current playlistsData object
    //pass new playlists array into <PlaylistsGrid>
    setPlaylists((playlists) => [
      ...(playlists ? playlists : []),
      ...playlistsData.items,
    ]);

    // Fetch next set of playlists as needed
    catchErrors(fetchMoreData());
  }, [playlistsData]);

  return (
    <main>
      <SectionWrapper title="Public Playlists" breadcrumb={true}>
        {playlists ? <PlaylistsGrid playlists={playlists} /> : <Loader />}
      </SectionWrapper>
    </main>
  );
};

export default Playlists;
