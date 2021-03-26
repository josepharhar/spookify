import React from 'react';
import { Recipe, parseRecipe } from './Recipe';
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
  recipe: Recipe|null;

  renderGui(): JSX.Element {
    return (
      <div>
        <div>
          <span>Target output playlist:</span>
          {this.playlistsAlphabetical
            ? <SelectSearch
                options={this.getSelectOptions(this.playlistsAlphabetical)}
                placeholder={"Choose a playlist"}
                search
                onChange={value => this.handleTargetPlaylistChanged(value)}
                />
            : <span>Loading playlists...</span>}
        </div>
      </div>
    );
  }
  handleTargetPlaylistChanged(value: SelectedOptionValue|SelectedOptionValue[]) {
    if (Array.isArray(value)) {
      console.log('selected option is an array?', value);
      return;
    }
    console.log('selected value:', value);
    console.log('selected value id: ' + value.value);
  }
  getSelectOptions(playlists: api.PlaylistList) {
    const options = [];
    for (const playlist of playlists) {
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
      this.setRecipe(parsedRecipe);
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

  setRecipe(recipe: Recipe) {
    this.recipe = recipe;
    this.setState({
      recipe: recipe,
    })
    this.props.onRecipeChanged(recipe);
    //this.recipeText = JSON.stringify(recipe, null, 2);
  }
}

export default RecipeEditor;