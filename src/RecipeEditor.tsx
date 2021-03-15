import React from 'react';
import { Recipe, parseRecipe } from './Recipe';

interface Props {
  initialRecipe: Recipe;
  onRecipeChanged: (recipe: Recipe) => void;
}

class RecipeEditor extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.editorType = 'text';
    this.recipe = props.initialRecipe;

    //this.recipeText = '';
    this.errorText = null;
  }

  editorType: 'gui'|'text';
  recipe: Recipe|null;

  renderGui(): JSX.Element {
    return <div>TODO implement gui editor</div>
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

  render() {
    return (
      <div>
        <div>
          <button
            onClick={() => this.setState({editorType: 'gui'})}
            disabled={this.editorType === 'gui'}>
            GUI
          </button>
          <button
            onClick={() => this.setState({editorType: 'text'})}
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