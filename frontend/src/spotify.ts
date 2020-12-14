export class SpotifyApi {
  constructor(api: SpotifyWebApi) {
  }
}

let likedSongs: Array<string> = null;
export async function getLikedSongs() {
  if (likedSongs)
    return likedSongs;
  // TODO
}

let playlists = null;
export async function getPlaylists() {
  if (playlists)
    return playlists;

  //const playlistsResponse = await api.
}
