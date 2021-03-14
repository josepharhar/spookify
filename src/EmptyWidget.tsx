import React from 'react';
import './EmptyWidget.css';

interface Props {
  message: string;
}

class EmptyWidget extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return <div className="empty-widget">{this.props.message}</div>;
  }
}

export default EmptyWidget;