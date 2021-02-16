import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as Api from './Api';

function App() {
  return (
    <div>access token: {Api.getAccessToken()}</div>
  );
}

export default App;
