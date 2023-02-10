/* Page to display an individual playlist  */

import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { catchErrors } from "../utils";
import { getPlaylistById, getAudioFeaturesForTracks } from "../spotify";
import { TrackList, SectionWrapper, Loader } from "../components";
import { StyledHeader, StyledDropdown } from "../styles";

/*
 * create an array of audio feature objects to correspond to each track in the tracks array
 * merge the two arrays together using id property
 * sort the resulting array by audio feature
 */

const Playlist = () => {
  const { id } = useParams(); //returns key/value pairs of URL parameters; get ID from url
  const [playlist, setPlaylist] = useState(null);
  const [tracksData, setTracksData] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [sortValue, setSortValue] = useState("");
  const sortOptions = ["danceability", "tempo", "energy"]; //potentially change/add

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getPlaylistById(id); //pass ID to get specific playlist
      setPlaylist(data);
      setTracksData(data.tracks);
    };

    catchErrors(fetchData());
  }, [id]); //id is a dependency, don't need to run it until we know what the id is

  // when tracksData updates, compile arrays of tracks and audioFeatures
  useEffect(() => {
    if (!tracksData) {
      return;
    }

    // when tracksData updates, check if there are more tracks to fetch
    // then update the state variable
    // similar logic as on Playlists.js
    const fetchMoreData = async () => {
      if (tracksData.next) {
        const { data } = await axios.get(tracksData.next);
        setTracksData(data);
      }
    };
    setTracks((tracks) => [...(tracks ? tracks : []), ...tracksData.items]);
    catchErrors(fetchMoreData());

    // also update the audioFeatures state variable using the track IDs
    // compile array of audio features for each track
    const fetchAudioFeatures = async () => {
      const ids = tracksData.items.map(({ track }) => track.id).join(",");
      const { data } = await getAudioFeaturesForTracks(ids);
      setAudioFeatures((audioFeatures) => [
        ...(audioFeatures ? audioFeatures : []),
        ...data["audio_features"],
      ]);
    };
    catchErrors(fetchAudioFeatures());
  }, [tracksData]);

  //useMemo() for performance, only need tracksWithAdioFeatures to be computed when we have
  //both tracks and audioFeatures arrays
  //reactjs.org/docs/hook-reference.html#usememo
  const tracksWithAudioFeatures = useMemo(() => {
    if (!tracks || !audioFeatures) {
      return null;
    }
    //map over tracks array
    return tracks.map(({ track }) => {
      const trackToAdd = track;
      //find corresponding audio features object from the audioFeatures array using track's id
      if (!track.audio_features) {
        const audioFeaturesObj = audioFeatures.find((item) => {
          if (!item || !track) {
            return null;
          }
          return item.id === track.id;
        });
        //assign audio features object to the track's audio_features property
        trackToAdd["audio_features"] = audioFeaturesObj;
      }

      return trackToAdd;
    });
  }, [tracks, audioFeatures]);

  // memoized array that sorts tracksWithAudioFeatures array according to currently selected sortValue
  // everytime sortValue changes, <TrackList> rerenders with sorted array
  const sortedTracks = useMemo(() => {
    if (!tracksWithAudioFeatures) {
      return null;
    }

    return [...tracksWithAudioFeatures].sort((a, b) => {
      const aFeatures = a["audio_features"];
      const bFeatures = b["audio_features"];

      if (!aFeatures || !bFeatures) {
        return false;
      }

      return bFeatures[sortValue] - aFeatures[sortValue];
    });
  }, [sortValue, tracksWithAudioFeatures]);

  return (
    <>
      {playlist && (
        <>
          <StyledHeader>
            <div className="header__inner">
              {playlist.images.length && playlist.images[0].url && (
                <img
                  className="header__img"
                  src={playlist.images[0].url}
                  alt="Playlist Artwork"
                />
              )}
              <div>
                <div className="header__overline">Playlist</div>
                <h1 className="header__name">{playlist.name}</h1>
                <p className="header__meta">
                  {playlist.followers.total ? (
                    <span>
                      {playlist.followers.total}{" "}
                      {`follower${playlist.followers.total !== 1 ? "s" : ""}`}
                    </span>
                  ) : null}
                  <span>
                    {playlist.tracks.total}{" "}
                    {`song${playlist.tracks.total !== 1 ? "s" : ""}`}
                  </span>
                </p>
              </div>
            </div>
          </StyledHeader>

          <main>
            <SectionWrapper title="Playlist" breadcrumb={true}>
              <div>
                <StyledDropdown active={!!sortValue}>
                  <label className="sr-only" htmlFor="order-select">
                    Sort tracks
                  </label>
                  <select
                    name="track-order"
                    id="order-select"
                    onChange={(e) => setSortValue(e.target.value)}
                  >
                    <option value="">Sort tracks</option>
                    {sortOptions.map((option, i) => (
                      <option value={option} key={i}>
                        {`${option.charAt(0).toUpperCase()}${option.slice(1)}`}
                      </option>
                    ))}
                  </select>
                </StyledDropdown>
              </div>

              {sortedTracks ? <TrackList tracks={sortedTracks} /> : <Loader />}
            </SectionWrapper>
          </main>
        </>
      )}
    </>
  );
};

export default Playlist;
