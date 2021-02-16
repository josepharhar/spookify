import React from 'react';

class Login extends React.Component {
  constructor(props: {}) {
    super(props);
    this.state = {
      clientId: localStorage.getItem('clientId') || ''
    }
  }

  state: {
    clientId: string;
  }

  handleClientIdChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newClientId = event.target.value;
    this.setState({clientId: newClientId});
    localStorage.setItem('clientId', newClientId);
  }

  handleLogin() {
    if (!this.state.clientId) {
      alert('Client ID is required');
      return;
    }

    const scope = [
      'ugc-image-upload',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'streaming',
      'app-remote-control',
      'user-read-email',
      'user-read-private',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-read-private',
      'playlist-modify-private',
      'user-library-modify',
      'user-library-read',
      'user-top-read',
      'user-read-playback-position',
      'user-read-recently-played',
      'user-follow-read',
      'user-follow-modify'
    ].join(' ');

    window.location.href = `https://accounts.spotify.com/authorize`
      + `?response_type=token`
      + `&client_id=${encodeURIComponent(this.state.clientId)}`
      + `&scope=${scope}`
      + `&redirect_uri=${encodeURIComponent(window.location.origin + '/')}`;
  }

  render() {
    return (
      <div>
        <label htmlFor="clientId">Client ID</label>
        <input name="clientId" value={this.state.clientId} onChange={this.handleClientIdChange.bind(this)}></input>
        <div>
          <button onClick={this.handleLogin.bind(this)}>Login</button>
        </div>
      </div>
    );
  }
}

export default Login;