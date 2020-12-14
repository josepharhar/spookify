import * as recipe from './recipe.js';

const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('access_token');
const refreshToken = urlParams.get('refresh_token');
const expiresIn = urlParams.get('expires_in');
// TODO use refresh stuff

document.body.appendChild(document.createTextNode('hello world'));

recipe.asdf();
