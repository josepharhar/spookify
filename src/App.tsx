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
    this.recipesServer = '';
    /*this.recipesServerFetch = null;
    this.pendingServerFetch = false;*/
    this.recipesDirty = false;
  }

  currentEditor: JSX.Element|null = null;
  currentRecipeIndex: number;
  recipes: Array<Recipe>;
  consoleLines: Array<string>;
  recipesServer: string;
  /*recipesServerFetch: Promise<Response>|null;
  pendingServerFetch: boolean;*/
  recipesDirty: boolean;

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
    //this.pushToRecipesServer();
    this.recipesDirty = true;
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
      if (this.currentRecipeIndex === index) {
        this.currentRecipeIndex = -1;
        this.currentEditor = null;
      }
      this.recipes.splice(index, 1);
      console.log('deleting recipe', this);
      this.setState({
        recipes: this.recipes,
        currentRecipeIndex: this.currentRecipeIndex,
        currentEditor: this.currentRecipeIndex
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
        <div className="border">
          <h3>Settings</h3>
          <div>
            <span>Recipes server (optional):</span>
            <input
              value={this.recipesServer}
              onChange={event => this.recipesServerChanged(event.target.value)}
              />
            <button onClick={() => this.pushToRecipesServer()}>Save{this.recipesDirty ? '*' : ''}</button>
            <button onClick={() => this.loadFromRecipesServer()}>Load</button>
          </div>
        </div>
      </div>
    );
    // TODO use this <ConsoleOutput lines={this.consoleLines} />
  }

  recipesServerChanged(newServer: string) {
    this.recipesServer = newServer;
    this.setState({recipesServer: this.recipesServer});
    // this would be run every time the user types a character...
    // maybe run it on blur from the input element?
    //this.pushToRecipesServer();
  }

  async loadFromRecipesServer() {
    if (!this.recipesServer)
      return;

    const response = await fetch(this.recipesServer);
    if (!response.ok) {
      console.error('loadFromRecipesServer fetch failed:', response);
      return;
    }

    const json = await response.json();
    this.recipes = json;
    console.log('loaded new recipes:', json, response);
  }

  async pushToRecipesServer() {
    if (!this.recipesServer)
      return;

    /*if (this.recipesServerFetch) {
      this.pendingServerFetch = true;
      return;
    }*/

    this.recipesDirty = false;

    const response = await fetch(this.recipesServer, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(this.recipes, null, 2)
    });

    //const response = await this.recipesServerFetch;
    //this.recipesServerFetch = null;
    if (!response.ok)
      console.error('recipe server fetch failed:', response);

    /*if (this.pendingServerFetch) {
      this.pendingServerFetch = false;
      this.pushToRecipesServer();
    }*/
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