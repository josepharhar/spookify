import React from 'react';
import './App.css';
import SplitWidget from './SplitWidget';
import RecipeEditor from './RecipeEditor';
import { Recipe } from './Recipe';
import EmptyWidget from './EmptyWidget';
import ConsoleOutput from './ConsoleOutput';

class App extends React.Component {
  constructor(props: {}) {
    super(props);
    this.currentEditor = null;
    this.recipes = [];
    this.currentRecipeIndex = -1;
    this.consoleLines = [];
  }

  currentEditor: JSX.Element|null = null;
  currentRecipeIndex: number;
  recipes: Array<Recipe>;
  consoleLines: Array<string>;

  newRecipe() {
    this.setState({
      recipes: this.recipes.push({
        name: 'my-new-recipe',
        targetPlaylistId: 'playlistId',
        steps: []
      })
    });
  }

  handleRecipeChanged(newRecipe: Recipe) {
    this.recipes[this.currentRecipeIndex] = newRecipe;
    this.setState({
      recipes: this.recipes
    });
  }

  handleEditRecipe(recipe: Recipe, index: number) {
    const newEditor = <RecipeEditor
        initialRecipe={recipe}
        onRecipeChanged={this.handleRecipeChanged.bind(this)} />
    console.log('newEditor:', newEditor);
    this.currentEditor = newEditor;
    this.currentRecipeIndex = index;
    // TODO why doesn't setState here actually change this.currentEditor??
    this.setState({
      currentEditor: newEditor,
      currentRecipeIndex: index
    });
  }

  handleRunRecipe(recipe: Recipe) {
    alert('TODO implement handleRunRecipe');
  }

  handleDeleteRecipe(index: number) {
    if (window.confirm('Are you sure you want to delete "' + this.recipes[index].name + '"?')) {
      this.setState({
        recipes: this.recipes.splice(index, 1)
      });
    }
  }

  render() {
    console.log('render this.currentEditor', this.currentEditor);
    return (
      <div>
        <SplitWidget>
          {this.renderRecipesList()}
          {this.currentEditor
            ? this.currentEditor
            : /*<EmptyWidget message="Select a recipe from the sidebar" />*/''}
        </SplitWidget>
      </div>
    );
    // TODO use this <ConsoleOutput lines={this.consoleLines} />
  }

  renderRecipesList() {
    return (
      <div>
        <div>TODO run all recipes button</div>
        <button onClick={() => this.newRecipe()}>New recipe</button>
        <ul>
          {this.recipes.map((recipe, index) => {
            return (
              <li>
                {recipe.name}
                <div>
                  <button onClick={this.handleEditRecipe.bind(this, recipe, index)}>Edit</button>
                  <button onClick={this.handleRunRecipe.bind(this, recipe)}>Run</button>
                  <button onClick={this.handleDeleteRecipe.bind(this, index)}>Delete</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default App;