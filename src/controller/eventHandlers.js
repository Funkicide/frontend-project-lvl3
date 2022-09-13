import axios from 'axios';
import makeProxyUrl from './makeProxyUrl.js';
import parseData from './parseData.js';
import validateUrl from './validateUrl.js';
import normalizeRss from './normalizeRss.js';

const formSubmitHandler = (watchedState) => (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const url = formData.get('url');
  watchedState.processState = 'loading';

  validateUrl(url, watchedState)
    .then((validUrl) => {
      watchedState.data.currentUrl = validUrl;
      return axios.get(makeProxyUrl(validUrl), { timeout: 30000, timeoutErrorMessage: 'Network Error' });
    })
    .then(({ data }) => parseData(data.contents))
    .then((parsedRss) => {
      watchedState.data.activeFeeds.push(watchedState.data.currentUrl);
      normalizeRss(watchedState, parsedRss);
      watchedState.processState = 'loaded';
    })
    .catch(({ message }) => {
      if (message === 'Network Error') {
        watchedState.processState = 'network error';
        return;
      }
      watchedState.rssForm.error = message;
      watchedState.processState = 'error';
    });
};

const previewButtonHandler = ({ modal }, state) => ({ target }) => {
  const { id } = target.dataset;
  const { tagName } = target;

  if (tagName === 'LI') {
    return;
  }

  const { title, description, link } = state.data.posts.find((post) => post.id === id);
  const currentPostUiState = state.uiState.posts.find((post) => post.id === id);

  if (tagName === 'A') {
    currentPostUiState.status = 'read';
    state.activePost = currentPostUiState;
  } else if (tagName === 'BUTTON') {
    modal.title.textContent = title;
    modal.body.textContent = description;
    modal.link.href = link;
    currentPostUiState.status = 'read';
    state.activePost = currentPostUiState;
  }
};

export { formSubmitHandler, previewButtonHandler };
