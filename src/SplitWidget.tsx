import React from 'react';
import './SplitWidget.css';

class SplitWidget extends React.Component {
  constructor(props: {}) {
    super(props);
  }

  render() {
    return (
      <div className="split-widget">
        {this.props.children}
      </div>
    );
  }
}

export default SplitWidget;
