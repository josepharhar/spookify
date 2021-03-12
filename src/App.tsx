import React from 'react';
import './App.css';
import * as Api from './Api';
import SplitWidget from './SplitWidget';
import RecipeEditor from './RecipeEditor';
import { Recipe } from './Recipe';

class App extends React.Component {
  constructor(props: {}) {
    super(props);
    this.currentEditor = null;
  }

  currentEditor: RecipeEditor|null = null;

  render() {
    return (
      <SplitWidget>
        <RecipesList />
        {this.currentEditor ? this.currentEditor : <div>select a recipe TODO make an EmptyWidget like DevTools</div>}
      </SplitWidget>
    );
  }
}

class RecipesList extends React.Component {
  constructor(props: {}) {
    super(props);
    this.recipes = [];
  }

  recipes: Array<Recipe>;

  newRecipe() {
    const recipeName = prompt('Recipe name:', 'my-new-recipe');
  }

  render() {
    return (
      <div>
        <div>TODO run all recipes button</div>
        <button onClick={() => this.newRecipe()}>New recipe</button>
        <ul>
          {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(index => {
            return <li className="clickable" tabIndex={0}>recipe {index}</li>;
          })}
        </ul>
      </div>
    );
  }
}

export default App;