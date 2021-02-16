interface Recipe {
  targetPlaylistId: string;
  steps: Array<Step>;
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

export default Recipe;