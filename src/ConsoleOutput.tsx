import React from 'react';
import { Recipe, parseRecipe } from './Recipe';
import './ConsoleOutput.css';

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
        <div>Console Output</div>
        <div className="console-list">
          {this.props.lines.map((lineContent, lineNumber)=> {
            return (
              <div className="line">
                <span className="line-number">{lineNumber}</span>
                <span className="line-content">{lineContent}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}