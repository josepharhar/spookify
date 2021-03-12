import React from 'react';
import { Recipe, parseRecipe } from './Recipe';

interface Props {
  recipe: Recipe;
}

class RecipeEditor extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.editorType = 'text';
    this.recipe = null;
    this.recipeText = '';
    this.errorText = '';
  }

  editorType: 'gui'|'text';
  recipeText: string;
  recipe: Recipe|null;

  renderGui(): JSX.Element {
    return <div>TODO implement ggui editor</div>
  }

  errorText: string;
  renderText(): JSX.Element {
    return (
      <div>
        <textarea onChange={(event) => this.handleRenderTextChange(event)}></textarea>
        {this.errorText ? <div className="error">error: {this.errorText}</div> : ''}
      </div>
    );
  }
  handleRenderTextChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    this.recipeText = event.target.value;
    const parsedRecipe = parseRecipe(this.recipeText);
    if (typeof parsedRecipe === 'string') {
      this.setState({errorText: parsedRecipe});
    } else {
      this.setState({recipe: parsedRecipe});
    }
  }

  render() {
    return (
      <div>
        <div>
          <button onClick={() => alert('TODO')}>
            Save
          </button>
          <button
            onClick={() => this.setState({editorType: 'gui'})}
            disabled={this.editorType !== 'gui'}>
            GUI
          </button>
          <button
            onClick={() => this.setState({editorType: 'text'})}
            disabled={this.editorType !== 'text'}>
            Text
          </button>
        </div>
        {this.editorType === 'text' ? this.renderText() : this.renderGui()}
      </div>
    );
  }

  getRecipe(): Recipe|null {
    return this.recipe;
  }
  setRecipe(recipe: Recipe) {
    this.recipe = recipe;
    this.recipeText = JSON.stringify(recipe, null, 2);
  }
}

export default RecipeEditor;