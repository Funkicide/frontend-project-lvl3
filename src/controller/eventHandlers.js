import axios from 'axios';
import * as yup from 'yup';
import makeProxyUrl from './makeProxyUrl.js';
import parseData from './parseData.js';
import addIds from './addIds.js';

const validateUrl = (url, { data: { activeFeeds } }) => {
  yup.setLocale({
    string: {
      url: 'errors.url.invalid',
    },
  });
  const schema = yup.string().url().notOneOf(activeFeeds, 'errors.url.notUnique');
  return schema.validate(url);
};

const formSubmitHandler = (watchedState) => (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const url = formData.get('url');
  watchedState.processState = 'loading';

  validateUrl(url, watchedState)
    .then((validUrl) => {
      watchedState.data.currentUrl = validUrl;
      return axios.get(makeProxyUrl(validUrl), { timeout: 30000 });
    })
    .then(({ data }) => parseData(data.contents))
    .then((parsedRss) => {
      watchedState.data.activeFeeds.push(watchedState.data.currentUrl);
      addIds(watchedState, parsedRss);
      watchedState.processState = 'loaded';
    })
    .catch((error) => {
      watchedState.rssForm.error = error.isAxiosError ? 'errors.network' : error.message;
      watchedState.processState = 'failed';
    });
};

const previewButtonHandler = ({ modal }, state) => ({ target }) => {
  const { id } = target.dataset;
  const { tagName } = target;

  if (!id) {
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
