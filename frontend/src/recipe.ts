export interface Recipe {
  targetPlaylistId: string;
  steps: Array<RecipeStep>;
}

export interface RecipeStep {
  operator: 'add-playlist'|'filter-out-unliked';
}

export interface AddPlaylistStep extends RecipeStep {
  operator: 'add-playlist';
  playlistId: string;
}

  /*let cachedLikedSongs: Array<string> = null;
async function getLikedSongs() {
}*/

export async function runRecipe(recipe: Recipe) {
  const songIds: Array<string> = [];
  for (const step of recipe.steps) {
    switch (step.operator) {
      case 'add-playlist':
        const addPlaylistStep: AddPlaylistStep = <AddPlaylistStep>step;
        const {playlistId} = addPlaylistStep;

        // TODO
        // 1. download all songs in playlistId
        // 2. add them to songIds
        break;

      case 'filter-out-unliked':
        // TODO 
        // 1. get liked songs
        // 2. for each song, check if its in liked songs
        break;
    }
  }
}

export function asdf() {
  document.body.appendChild(document.createTextNode('asdf'));
}
