import { SpotifyApi } from '/node_modules/@spotify/web-api-ts-sdk/dist/mjs/index.js';
import './error-popover.js';
import './main.js';

class SpookifyLogin extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // TODO consider putting this in a shadowroot instead with adoptedStyleSheets?

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
    const scopesString = scopes.join(' ');

    // TODO apparently i should do some more secuoority here:
    // https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
    this.innerHTML = `
      <dialog>
        <form action="https://accounts.spotify.com/authorize">
          <label for=clientid>Client ID</label>
          <input id=clientid name=client_id>
          <input type=hidden name=response_type value=code>
          <input type=hidden name=scope value="${scopesString}">
          <!--<input type=hidden name=redirect_uri value="${window.location.href}">-->
          <input type=hidden name=redirect_uri value="http://localhost:8080">
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
      try {
        const secret = new URLSearchParams(location.search).get('code');
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

      dialog.close();

      this.remove();
      document.body.appendChild(document.createElement('spookify-main'));
    };

    dialog.showModal();
  }
};

customElements.define('spookify-login', SpookifyLogin);
