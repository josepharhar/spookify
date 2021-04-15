import React from 'react';
import { Recipe, parseRecipe, getStepOperators, StepOperator, Step } from './Recipe';
import SelectSearch, { SelectedOptionValue } from 'react-select-search';
import * as api from './Api';
import { formatWithOptions } from 'node:util';
import ConsoleOutput from './ConsoleOutput';

interface Props {
  initialRecipe: Recipe;
  onRecipeChanged: (recipe: Recipe) => void;
}

class RecipeEditor extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.editorType = 'gui';
    this.recipe = props.initialRecipe;

    //this.recipeText = '';
    this.errorText = null;

    this.playlistsAlphabetical = null;
    (async () => {
      this.playlistsAlphabetical = await api.getPlaylists();
      this.setState({
        playlistsAlphabetical: this.playlistsAlphabetical
      });
    })();
  }

  playlistsAlphabetical: Array<SpotifyApi.PlaylistObjectSimplified>|null;
  editorType: 'gui'|'text';
  recipe: Recipe/*|null*/;

  renderGui(): JSX.Element {
    return (
      <div>
        <div>
          {this.playlistsAlphabetical
            ? <div>
                <div className="border">
                  <span>Target output playlist:</span>
                  <SelectSearch
                    options={this.getPlaylistsAsSelectOptions()}
                    placeholder={"Choose a playlist"}
                    search
                    onChange={value => this.handleTargetPlaylistChanged(value)}
                    />
                  <span>Target output playlist ID: </span>
                  <input disabled value={this.recipe ? this.recipe.targetPlaylistId : ''}></input>
                </div>
                {this.recipe.steps.map((step, index) => {
                  return <div className="border">
                    <span>Step type:</span>
                    <SelectSearch
                      options={getStepOperators().map(operator => {
                        return {name: operator, value: operator};
                      })}
                      onChange={value => this.handleStepTypeModified(index, value)}
                      />
                    {this.renderGuiStepOperators(step, index)}
                  </div>
                })}
                <div className="border">
                  <button onClick={() => this.handleAddNewStep()}>Add a new step</button>
                </div>
              </div>
            : <span>Loading playlists...</span>}
        </div>
      </div>
    );
  }
  renderGuiStepOperators(step: Step, index: number): JSX.Element|null {
    switch (step.operator) {
      case 'appendPlaylistById':
      case 'filterByPlaylistId':
        return <div>
            <span>Playlist to append:</span>
            <SelectSearch
              options={this.getPlaylistsAsSelectOptions()}
              placeholder={"Choose a playlist"}
              search
              onChange={value => this.handleAppendStepModified(index, value)}
              />
          </div>;


      case 'filterBySavedTracks':
        return null;

      default:
        return <span>{'unknown: ' + step.operator}</span>;
    }
  }
  handleTargetPlaylistChanged(value: any) {
    if (Array.isArray(value)) {
      console.error('selected option is an array?', value);
      return;
    }
    if (typeof value !== 'string') {
      console.error('selected option is not a string:', value);
      return;
    }

    this.recipe.targetPlaylistId = value;
    this.recipeChanged();
  }
  handleStepTypeModified(stepIndex: number, value: any) {
    if (typeof value !== 'string') {
      console.error('selected option is not a sring:', value);
      return;
    }
    this.recipe.steps[stepIndex].operator = (value as StepOperator);
    this.recipeChanged();
  }
  handleAddNewStep() {
    this.recipe.steps.push({operator: 'appendPlaylistById', operands: ['playlistId']});
    this.recipeChanged();
    console.log('added step', this);
  }
  handleAppendStepModified(stepIndex: number, value: any) {
    if (typeof value !== 'string') {
      console.error('handleAppendStepModified value isnt a string:', value);
      return;
    }
    this.recipe.steps[stepIndex].operands[0] = value;
    this.recipeChanged();
  }
  getPlaylistsAsSelectOptions() {
    if (!this.playlistsAlphabetical) {
      console.error('getSelectOptions this.playlistsAlphabetical hasnt loaded yet!', this);
      return [];
    }
    const options = [];
    for (const playlist of this.playlistsAlphabetical) {
      options.push({
        name: playlist.name,
        value: playlist.id
      });
    }
    return options;
  }



  // TODO figure out how to put this in a separate component
  //recipeText: string;
  errorText: string|null;
  renderText(): JSX.Element {
    console.log('this.errortext: ',this.errorText);
    return (
      <div>
        <textarea
          defaultValue={JSON.stringify(this.recipe, null, 2)}
          onChange={(event) => this.handleRenderTextChange(event)}
          cols={60}
          rows={30} />
        {this.errorText ? <div className="error">error: {this.errorText}</div> : ''}
      </div>
    );
  }
  handleRenderTextChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    //this.recipeText = event.target.value;
    const parsedRecipe = parseRecipe(event.target.value);
    console.log('parsedRecipe:', parsedRecipe);
    if (typeof parsedRecipe === 'string') {
      // TODO why tf isn't setState working anymore
      this.errorText = parsedRecipe;
      this.setState({errorText: parsedRecipe});
    } else {
      this.errorText = null;
      this.setState({errorText: null});
      this.recipe = parsedRecipe;
      this.recipeChanged();
    }
  }

  setEditorType(type: 'gui'|'text') {
    this.editorType = type;
    this.setState({
      editorType: this.editorType
    });
  }

  render() {
    return (
      <div>
        <div>
          <button
            onClick={this.setEditorType.bind(this, 'gui')}
            disabled={this.editorType === 'gui'}>
            GUI
          </button>
          <button
            onClick={this.setEditorType.bind(this, 'text')}
            disabled={this.editorType === 'text'}>
            Text
          </button>
        </div>
        {this.editorType === 'text' ? this.renderText() : this.renderGui()}
      </div>
    );
  }

  recipeChanged() {
    this.setState({
      recipe: this.recipe,
    })
    this.props.onRecipeChanged(this.recipe);
    //this.recipeText = JSON.stringify(recipe, null, 2);
  }
}

export default RecipeEditor;