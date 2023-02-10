/* Component for grid of public playlists displayed on profile page */
//not no StyledGrid type specified, no circular framing

import { Link } from "react-router-dom"; //wraps each playlist item into a link to individual playlist page
import { StyledGrid } from "../styles";

const PlaylistsGrid = ({ playlists }) => (
  <>
    {playlists && playlists.length ? (
      <StyledGrid>
        {playlists.map((playlist, i) => (
          <li className="grid__item" key={i}>
            <Link
              className="grid__item__inner"
              to={`/playlists/${playlist.id}`}
            >
              {playlist.images.length && playlist.images[0] && (
                <div className="grid__item__img">
                  <img src={playlist.images[0].url} alt={playlist.name} />
                </div>
              )}
              <h3 className="grid__item__name overflow-ellipsis">
                {playlist.name}
              </h3>
              <p className="grid__item__label">Playlist</p>
            </Link>
          </li>
        ))}
      </StyledGrid>
    ) : (
      <p className="empty-notice">No playlists available</p>
    )}
  </>
);

export default PlaylistsGrid;
