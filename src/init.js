import { SpotifyApi } from '/node_modules/@spotify/web-api-ts-sdk/dist/mjs/index.js';
import './error-popover.js';
import './main.js';

class SpookifyInit extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // TODO consider putting this in a shadowroot instead with adoptedStyleSheets?
    // TODO consider using a form element for submission keyboard behavior
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

    clientidElement.value = window.localStorage.clientid;
    clientsecretElement.value = window.localStorage.clientsecret;

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
        return;
      }

      window.localStorage.clientid = clientidElement.value;
      window.localStorage.clientsecret = clientsecretElement.value;

      dialog.close();

      this.remove();
      document.body.appendChild(document.createElement('spookify-main'));
    };

    dialog.showModal();
  }
};

customElements.define('spookify-init', SpookifyInit);
