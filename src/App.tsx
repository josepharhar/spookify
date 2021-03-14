import React from 'react';
import './App.css';
import SplitWidget from './SplitWidget';
import RecipeEditor from './RecipeEditor';
import { Recipe } from './Recipe';
import EmptyWidget from './EmptyWidget';

class App extends React.Component {
  constructor(props: {}) {
    super(props);
    this.currentEditor = null;
    this.recipes = [];
  }

  currentEditor: JSX.Element|null = null;
  recipes: Array<Recipe>;

  newRecipe() {
    this.setState({
      recipes: this.recipes.push({
        name: 'my-new-recipe',
        targetPlaylistId: 'playlistId',
        steps: []
      })
    });
  }

  handleRecipeChanged(recipe: Recipe) {
    alert('TODO handlerecipechanged');
  }

  handleEditRecipe(recipe: Recipe) {
    /*this.setState({
      currentEditor: <RecipeEditor
        initialRecipe={recipe}
        onRecipeChanged={this.handleRecipeChanged.bind(this)} />
    })*/
    const newEditor = <RecipeEditor
        initialRecipe={recipe}
        onRecipeChanged={this.handleRecipeChanged.bind(this)} />
    console.log('newEditor:', newEditor);
    this.setState({
      currentEditor: newEditor
    });
    this.currentEditor = newEditor;
  }

  handleRunRecipe(recipe: Recipe) {
    alert('TODO implement handleRunRecipe');
  }

  render() {
    console.log('render this.currentEditor', this.currentEditor);
    return (
      <SplitWidget>
        {this.renderRecipesList()}
        {this.currentEditor
          ? this.currentEditor
          : <EmptyWidget message="Select a recipe from the sidebar" />}
      </SplitWidget>
    );
  }

  renderRecipesList() {
    return (
      <div>
        <div>TODO run all recipes button</div>
        <button onClick={() => this.newRecipe()}>New recipe</button>
        <ul>
          {this.recipes.map(recipe => {
            return (
              <li>
                {recipe.name}
                <button onClick={this.handleEditRecipe.bind(this, recipe)}>Edit</button>
                <button onClick={this.handleRunRecipe.bind(this, recipe)}>Run</button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default App;