export interface Recipe {
  targetPlaylistId: string;
  steps: Array<Step>;
  name: string;
}

interface Step {
  operator: 'appendPlaylistById'|'filterByPlaylistId'|'filterBySavedTracks';
  operands: Array<string>;
}

interface AppendPlaylistStep extends Step {
  operator: 'appendPlaylistById';
  operands: [playlistId: string];
}

interface FilterByPlaylistStep extends Step {
  operator: 'filterByPlaylistId';
  operands: [playlistId: string];
}

interface FilterBySavedTracksStep extends Step {
  operator: 'filterBySavedTracks';
  operands: [];
}

export function parseRecipe(str: string): Recipe|string {
  // TODO use a library for this
  try {
    const json: Recipe = JSON.parse(str);
    if (!json.targetPlaylistId) {
      //return new Error('no targetPlaylistId');
      return 'no targetPlaylistId';
    }
    if (!json.steps) {
      return 'no steps;'
      //return new Error('no steps');
    }
    for (const step of json.steps) {
      // TODO ugh
    }
    if (!json.name) {
      return 'no name';
    }
    return json;
  } catch (error) {
    return 'failed to parse recipe: ' + error;
    //return new Error('failed to parse recipe: ' + error);
  }
}