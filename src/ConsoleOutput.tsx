import React from 'react';
import { Recipe, parseRecipe } from './Recipe';

interface Props {
  /*initialRecipe: Recipe;
  onRecipeChanged: (recipe: Recipe) => void;*/
  lines: Array<string>;
}

export default class ConsoleOutput extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <div className="console-output">
        {this.props.lines.map(line => {
          return <div className="line">{line}</div>
        })}
      </div>
    );
  }
}