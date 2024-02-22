import { SpotifyApi } from '/node_modules/@spotify/web-api-ts-sdk/dist/mjs/index.js';
import 'error-popover.js';

console.log('spotifyapi: ', SpotifyApi);
window.spotifyapi = SpotifyApi;

class SpookifyInit extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // TODO consider putting this in a shadowroot instead with adoptedStyleSheets?
    this.innerHTML = `
      <dialog>
        <label for=clientid>Client ID</label>
        <input id=clientid>
        <br>
        <label for=clientsecret>Client Secret</label>
        <input id=clientsecret>
        <br>
        <button>login to spotify</button>
      </dialog>
    `;
    const clientidElement = this.querySelector('#clientid');
    const clientsecretElement = this.querySelector('#clientsecret');
    const dialog = this.querySelector('dialog');
    const button = this.querySelector('button');

    button.onclick = () => {
      // TODO does this throw an exception or something?
      try {
        window.spotifyApi = SpotifyApi.withClientCredentials(
          clientidElement.value,
          clientsecretElement.value);
      } catch (error) {
        const errorPopover = document.createElement('spookify-error-popover');
        errorPopover.message = error;
        this.appendChild(errorPopover);
      }
      dialog.close();
    };

    dialog.showModal();
  }
};

customElements.define('spookify-init', SpookifyInit);
