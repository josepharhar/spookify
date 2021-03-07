import React from 'react';
import { Recipe } from './Recipe';

interface Props {
  recipe: Recipe;
}

class TextRecipeEditor extends React.Component<Props> {
}

class GuiRecipeEditor extends React.Component<Props> {
}

class RecipeEditor extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.editorType = 'text';
    this.guiEditor = <GuiRecipeEditor {...props} />;
    this.textEditor = <TextRecipeEditor {...props} />;
  }

  editorType: 'gui'|'text';
  guiEditor;
  textEditor;

  handleSwitchClick(type: 'gui'|'text') {
  }

  render() {
    return (
      <div>
        <div>
          <button onClick={() => alert('TODO')}>
            Save
          </button>
          <button
            onClick={() => this.handleSwitchClick('gui')}
            disabled={this.editorType !== 'gui'}>
            GUI
          </button>
          <button
            onClick={() => this.handleSwitchClick('text')}
            disabled={this.editorType !== 'text'}>
            Text
          </button>
        </div>
        {this.editor}
      </div>
    );
  }

  getRecipe(): Recipe|null {
    return null;
  }
}

export default RecipeEditor;