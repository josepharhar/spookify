class SpookifyErrorPopover extends HTMLElement {
  constructor() {
    super();
    this.autoopen = true;
    this.autoremove = true;

    this.shadow = this.attachShadow({mode: 'open'});
    this.shadow.innerHTML = `
      <div id=popover popover=auto>
        <p id=message></p>
        <button id=button popovertarget=popover>close</button>
      </div>
    `;
    // TODO use adoptedStyleSheets to copy all document stylesheets into this.shadow:
    // https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets
    
    this.addEventListener('toggle', event => {
      if (event.newState == 'closed' && this.autoremove && this.isConnected) {
        this.remove();
      }
    });

    this.message = 'default message';
  }

  get message() {
    return this.shadow.getElementById('message').textContent;
  }
  set message(value) {
    this.shadow.getElementById('message').textContent = value;
  }

  get autoopen() {
    return this.getAttribute('data-autoopen');
  }
  set autoremove(value) {
    this.setAttribute('data-autoremove', value);
  }

  get autoremove() {
    return this.getAttribute('data-autoremove');
  }
  set autoremove(value) {
    this.setAttribute('data-autoremove', value);
  }

  connectedCallback() {
    if (this.autoopen) {
      this.showPopover();
    }
  }
};

customElements.define('spookify-error-popover', SpookifyErrorPopover);
