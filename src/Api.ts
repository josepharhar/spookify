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

type PlaylistMap = Map<string, SpotifyApi.PlaylistObjectSimplified>;
let idToPlaylist: PlaylistMap|null = null;
async function fetchPlaylistMap(): Promise<PlaylistMap> {
  const output = new Map();
  let playlistsResponse;
  let offset = 0;
  do {
    // TODO add floating centered modal loading widget here?
    playlistsResponse = await api.getUserPlaylists(userId, {limit: 50, offset});
    for (const playlist of playlistsResponse.body.items) {
      output.set(playlist.id, playlist);
    }
    offset += playlistsResponse.body.items.length;
  } while (playlistsResponse.body.next);
  return output;
}
export async function getPlaylistById(playlistId: string): Promise<SpotifyApi.PlaylistObjectSimplified> {
  if (!idToPlaylist) {
    idToPlaylist = await fetchPlaylistMap();
  }

  const playlist = idToPlaylist.get(playlistId);
  if (!playlist) {
    // I guess... this shouldn't happen...?
    throw new Error('failed to find playlist with id: ' + playlistId);
  }
  return playlist;
}

const playlistIdToTracks = new Map();
async function fetchTracks(playlistId: string): Promise<Array<SpotifyApi.PlaylistTrackObject>> {
  let tracks: Array<SpotifyApi.PlaylistTrackObject> = [];
  let tracksResponse;
  let offset = 0;
  do {
    tracksResponse = await api.getPlaylistTracks(playlistId, {limit: 50, offset});
    tracks = tracks.concat(tracksResponse.body.items);
  } while (tracksResponse.body.next);
  return tracks;
}
export async function getTracksForPlaylistId(playlistId: string): Promise<Array<SpotifyApi.PlaylistTrackObject>> {
  if (!playlistIdToTracks.has(playlistId)) {
    playlistIdToTracks.set(playlistId, await fetchTracks(playlistId));
  }
  return playlistIdToTracks.get(playlistId);
}

let savedTracks: Array<SpotifyApi.SavedTrackObject>|null = null;
export async function getSavedTracks(): Promise<Array<SpotifyApi.SavedTrackObject>> {
  if (!savedTracks) {
    savedTracks = await fetchSavedTracks();
  }
  return savedTracks;
}
async function fetchSavedTracks(): Promise<Array<SpotifyApi.SavedTrackObject>> {
  let tracks: Array<SpotifyApi.SavedTrackObject> = [];
  let offset = 0;
  let tracksResponse;
  do {
    tracksResponse = await api.getMySavedTracks({limit: 50, offset});
    tracks = tracks.concat(tracksResponse.body.items);
    offset += tracksResponse.body.items.length;
  } while (tracksResponse.body.next);
  return tracks;
}

export function invalidatePlaylistById(playlistId: string) {
  if (idToPlaylist)
    idToPlaylist.delete(playlistId);
  playlistIdToTracks.delete(playlistId);
}