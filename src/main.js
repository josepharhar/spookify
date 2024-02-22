class SpookifyMain extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // TODO make a switcher between <select> and <input list><datalist>
    // as a combobox
  }
};

customElements.define('spookify-main', SpookifyMain);
