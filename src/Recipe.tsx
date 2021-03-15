//import { JsonDecoder } from 'ts.data.json';

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

/*const stepDecoder = JsonDecoder.object<Step>(
  {
    operands: 
  },
  'Step'
);

const recipeDecoder = JsonDecoder.object<Recipe>(
  {
    name: JsonDecoder.string,
    targetPlaylistId: JsonDecoder.string,
    steps: JsonDecoder.array<Step>(
      {
        operator: JsonDecoder.string
      },
      'Step'
    )
  },
  'Recipe'
);*/

export function parseRecipe(str: string): Recipe|string {
  // TODO use a library for this...?
  try {
    const json: Recipe = JSON.parse(str);
    if (!json.targetPlaylistId) {
      return 'no targetPlaylistId';
    }
    if (!json.steps) {
      return 'no steps;'
    }
    for (const step of json.steps) {
      if (!(step.operands instanceof Array)) {
        return 'no operands array';
      }
      let error;
      switch (step.operator) {
        case 'appendPlaylistById':
          error = checkLength(step, 1);
          if (error) return error;
          break;

        case 'filterByPlaylistId':
          error = checkLength(step, 1);
          if (error) return error;
          break;

        case 'filterBySavedTracks':
          error = checkLength(step, 0);
          if (error) return error;
          break;

        default:
          return 'unrecognized operator: ' + step.operator;
      }
    }
    if (!json.name) {
      return 'no name';
    }
    return json;
  } catch (error) {
    return 'failed to parse recipe: ' + error;
  }
}
function checkLength(step: Step, length: number): string|null {
  if (step.operands.length !== length) {
    return `${step.operator} should have operands of length ${length}, but instead got ${step.operands.length}`;
  }
  return null;
}