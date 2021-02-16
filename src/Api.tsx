import SpotifyWebApi from 'spotify-web-api-node';

let accessToken = '';
let userId = '';
const api = new SpotifyWebApi();
export async function setAccessToken(newAccessToken: string): Promise<boolean> {
  accessToken = newAccessToken;
  api.setAccessToken(accessToken);
  try {
    const meResponse = await api.getMe();
    userId = meResponse.body.id;
  } catch (error) {
    // TODO snoop error message for expiry, not sure what else this case could cover
    alert('access_token expired, log in again to get a new one.');
    return false;
  }
  return true;
}
export function getAccessToken(): string {
  return accessToken;
}

let playlists: Array<SpotifyApi.PlaylistObjectSimplified>|null = null;
const idToPlaylist: Map<string, SpotifyApi.PlaylistObjectSimplified> = new Map();
async function getPlaylists(): Promise<Array<SpotifyApi.PlaylistObjectSimplified>> {
  if (playlists)
    return playlists;
  
  playlists = [];
  let playlistsResponse;
  let offset = 0;
  do {
    // TODO add floating centered modal loading widget here?
    playlistsResponse = await api.getUserPlaylists(userId, {limit: 50, offset});
    playlists = playlists.concat(playlistsResponse.body.items);
    offset += playlistsResponse.body.items.length;
  } while (playlistsResponse.body.next);

  return playlists;
}
function invalidatePlaylists() {
  playlists = null;
}
async function getPlaylistById(playlistId: string) {
  return idToPlaylist.get(playlistId);
}
