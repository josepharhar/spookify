import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Login from './Login';
import * as Api from './Api';

(async () => {
  // for some reason, the spotify api redirecting uses hash instead of query string...
  let queryString = window.location.search;
  if (!queryString.includes('access_token') && window.location.hash.includes('access_token')) {
    queryString = window.location.hash.replace('#', '?');
  }
  const urlParams = new URLSearchParams(queryString);
  const accessToken = urlParams.get('access_token');
  const tokenType = urlParams.get('token_type');
  const expires_in = urlParams.get('expires_in'); // TODO use this

  // TODO look in localStorage for an accessToken?
  console.log('accessToken: ' + accessToken);

  if (!accessToken || !await Api.setAccessToken(accessToken)) {
    ReactDOM.render(
      <React.StrictMode>
        <Login />
      </React.StrictMode>,
      document.getElementById('root')
    );
    return;
  }

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );
})();


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();