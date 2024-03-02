class SpookifyMain extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({mode: 'open'});
    root.innerHTML = 'main';
  }

  connectedCallback() {
    // TODO make a switcher between <select> and <input list><datalist>
    // as a combobox
    // TODO instead of having user state, what if i used the names of the
    // playlists as a recipe syntax?
  }
};

customElements.define('spookify-main', SpookifyMain);
