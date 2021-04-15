import { Recipe } from './Recipe';
import * as Api from './Api';

export async function runRecipe(recipe: Recipe): Promise<Array<SpotifyApi.TrackObjectFull>> {
  let tracks: Array<SpotifyApi.TrackObjectFull> = [];
  for (const step of recipe.steps) {
    switch (step.operator) {
      case 'appendPlaylistById':
        if (!step.operands || !step.operands[0]) {
          throw new Error('invalid step: ' + JSON.stringify(step));
        }
        const playlistId = step.operands[0];
        tracks = tracks.concat((await Api.getTracksForPlaylistId(playlistId))
          .map(track => track.track));
        break;
      
      case 'filterByPlaylistId':
        if (!step.operands || !step.operands[0]) {
          throw new Error('invalid step: ' + JSON.stringify(step));
        }
        const includedTrackIds = (await Api.getTracksForPlaylistId(step.operands[0])).map(track => track.track.id);
        tracks = tracks.filter(track => includedTrackIds.includes(track.id));
        break;

      case 'filterBySavedTracks':
        const likedTrackIds = (await Api.getSavedTracks()).map(track => track.track.id);
        tracks = tracks.filter(track => likedTrackIds.includes(track.id));
        break;

      default:
        throw new Error('unrecognized operator: ' + step.operator);
    }
  }
  return tracks;
}