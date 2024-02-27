import { SpotifyApi } from '/node_modules/@spotify/web-api-ts-sdk/dist/mjs/index.js';
import './error-popover.js';
import './main.js';

class SpookifyLogin extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // TODO consider putting this in a shadowroot instead with adoptedStyleSheets?
    // TODO consider using a form element for submission keyboard behavior
    const scopes = [
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-private',
      'playlist-modify-public',
      'user-library-modify',
      'user-library-read',
      'user-read-email',
      'user-read-private'
    ];
    const scopesString = scopes.join('%20');

    const actionUrl = new URLSearchParams();
    actionUrl.set('response_type', 'code');
    actionUrl.set('redirect_uri', window.location.href);
    actionUrl.set('scope', scopesString);

    this.innerHTML = `
      <dialog>
        <form action="${actionUrl.toString()}">
          <label for=clientid>Client ID</label>
          <input id=clientid name=client_id>
          <br>
          <button>login to spotify</button>
        </form>
      </dialog>
    `;
    const clientidElement = this.querySelector('#clientid');
    const dialog = this.querySelector('dialog');
    const button = this.querySelector('button');

    clientidElement.value = window.localStorage.clientid || '';

    button.onclick = () => {
      // TODO does this throw an exception or something?
      const secret = 
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

customElements.define('spookify-login', SpookifyLogin);
