import { useState, useEffect } from "react";
import { catchErrors } from "../utils";
import {
  getCurrentUserProfile,
  getCurrentUserPlaylists,
  getTopArtists,
  getTopTracks,
  getNewAlbumReleases,
  createTopTracksPlaylist,
} from "../spotify";
import { StyledHeader } from "../styles";
import {
  SectionWrapper,
  ArtistsGrid,
  TrackList,
  PlaylistsGrid,
  Loader,
} from "../components";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [profileID, setProfileID] = useState(null);
  const [playlists, setPlaylists] = useState(null);
  const [topArtists, setTopArtists] = useState(null);
  const [topTracks, setTopTracks] = useState(null);
  const [newAlbums, setNewAlbums] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const userProfile = await getCurrentUserProfile();
      setProfile(userProfile.data);
      setProfileID(userProfile.data.id);

      const userPlaylists = await getCurrentUserPlaylists();
      setPlaylists(userPlaylists.data);

      const userTopArtist = await getTopArtists();
      setTopArtists(userTopArtist.data);

      const userTopTracks = await getTopTracks();
      setTopTracks(userTopTracks.data);

      const userNewAlbums = await getNewAlbumReleases();
      setNewAlbums(userNewAlbums.data);
    };

    catchErrors(fetchData());
  }, []);

  return (
    <>
      {profile && (
        <>
          <StyledHeader type="user">
            <div className="header__inner">
              {profile.images.length && profile.images[0].url && (
                <img
                  className="header__img"
                  src={profile.images[0].url}
                  alt="Avatar"
                />
              )}
              <div>
                <div className="header__overline">Profile</div>
                <h1 className="header__name">{profile.id}</h1>
                <br></br>
                <p className="header__meta">
                  {playlists && (
                    <span>
                      {playlists.total} Playlist
                      {playlists.total !== 1 ? "s" : ""}
                    </span>
                  )}
                  <span>
                    {profile.followers.total} Follower
                    {profile.followers.total !== 1 ? "s" : ""}
                  </span>
                </p>
              </div>
            </div>
          </StyledHeader>
          <main>
            {topArtists && topTracks && playlists ? (
              <>
                <SectionWrapper
                  title="Top artists this month"
                  seeAllLink="/top-artists"
                >
                  <ArtistsGrid artists={topArtists.items.slice(0, 10)} />
                </SectionWrapper>

                <SectionWrapper
                  title="Top tracks this month"
                  seeAllLink="/top-tracks"
                >
                  <TrackList tracks={topTracks.items.slice(0, 10)} />
                </SectionWrapper>
                <button
                  onClick={() =>
                    createTopTracksPlaylist(profile.id, topTracks.items)
                  }
                >
                  {" "}
                  Create Playlist
                </button>
                <SectionWrapper
                  title="Public Playlists"
                  seeAllLink="/playlists"
                >
                  <PlaylistsGrid playlists={playlists.items.slice(0, 10)} />
                </SectionWrapper>
              </>
            ) : (
              <Loader />
            )}
          </main>
        </>
      )}
    </>
  );
};

export default Profile;
