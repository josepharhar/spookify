import { SpotifyApi } from '/node_modules/@spotify/web-api-ts-sdk/dist/mjs/index.js';

console.log('spotifyapi: ', SpotifyApi);
window.spotifyapi = SpotifyApi;

class InitElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = 
  }
};

customElements.define('spookify-init
