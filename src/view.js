/* eslint-disable no-param-reassign */
import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';

const parseData = (data) => {
  const parser = new DOMParser();
  const parsedRss = parser.parseFromString(data, 'text/xml');
  const parserError = parsedRss.querySelector('parsererror');
  if (parserError) {
    throw new Error('errors.url.noRss');
  }
  return parsedRss;
};

const validateUrl = (url, { data: { activeFeeds } }) => {
  const schema = yup.string().url().notOneOf(activeFeeds, 'errors.url.notUnique');
  return schema.validate(url);
};

const renderStatus = ({ input, statusBar }, status) => {
  input.classList.remove('is-invalid');
  statusBar.classList.remove('text-danger');
  statusBar.classList.add('text-success');

  statusBar.textContent = status;
};

const renderErrors = ({ input, statusBar }, error) => {
  statusBar.classList.remove('text-success');
  input.classList.add('is-invalid');
  statusBar.classList.add('text-danger');

  statusBar.textContent = error;
};

const normalizeRss = (state, rss) => {
  const feedTitleElement = rss.querySelector('title');
  const feedDescriptionElement = rss.querySelector('description');
  const feedTitle = feedTitleElement.textContent;
  const feedDescription = feedDescriptionElement.textContent;

  const feed = {
    id: _.uniqueId(),
    title: feedTitle,
    description: feedDescription,
  };

  if (_.isEmpty(state.data.feeds)) {
    state.data.feeds.unshift(feed);
  } else {
    const currentFeed = state.data.feeds
      .find((item) => item.title === feedTitle);
    if (!currentFeed) {
      state.data.feeds.unshift(feed);
    }
  }

  const currentFeed = state.data.feeds.find((item) => item.title === feedTitle);
  const feedId = currentFeed.id;

  const itemElements = rss.querySelectorAll('item');
  const posts = [...itemElements].map((item) => {
    const titleElement = item.querySelector('title');
    const linkElement = item.querySelector('link');
    const descriptionElement = item.querySelector('description');
    const title = titleElement.textContent;
    const link = linkElement.textContent;
    const description = descriptionElement.textContent;

    return {
      id: _.uniqueId(),
      feedId,
      title,
      link,
      description,
    };
  });

  const currentFeedPosts = state.data.posts.filter((post) => post.feedId === feedId);
  const newPosts = _.differenceBy(posts, currentFeedPosts, 'title');
  const newPostsUiState = newPosts.map(({ id }) => ({ id, status: 'unread' }));
  state.uiState.posts = _.isEmpty(state.uiState.posts)
    ? newPostsUiState
    : [...newPostsUiState, ...state.uiState.posts];
  state.data.posts = _.isEmpty(state.data.posts) ? posts : [...newPosts, ...state.data.posts];
};

const renderFeed = (elements, { data: { feeds } }) => {
  elements.feeds.innerHTML = '';

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group');
  const feedsElements = feeds.map(({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    const header = document.createElement('h3');
    header.textContent = title;

    const descBox = document.createElement('p');
    descBox.textContent = description;

    li.prepend(header, descBox);

    return li;
  });
  feedsList.prepend(...feedsElements);
  elements.feeds.append(feedsList);

  elements.form.reset();
  elements.input.focus();
};

const renderPosts = ({
  posts, modalTitle, modalBody, modalLink,
}, buttonText, state) => {
  posts.innerHTML = '';

  const postsList = document.createElement('ul');
  postsList.classList.add('border-0', 'rounded-0');
  postsList.classList.add('list-group');
  const postsElements = state.data.posts.map(({
    title, link, id, description,
  }) => {
    const li = document.createElement('li');
    const currentPost = state.uiState.posts.find((post) => post.id === id);
    const currentFontWeight = currentPost.status === 'read' ? 'fw-normal' : 'fw-bold';
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const a = document.createElement('a');
    a.classList.add(currentFontWeight);
    a.href = link;
    a.textContent = title;
    a.dataset.id = id;

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = buttonText;
    button.dataset.id = id;
    li.append(a, button);

    button.addEventListener('click', () => {
      modalTitle.textContent = title;
      modalBody.textContent = description;
      modalLink.href = link;
      currentPost.status = 'read';
      state.activePost = currentPost;
    });

    return li;
  });
  postsList.prepend(...postsElements);
  posts.append(postsList);
};

const autoupdate = (url, watchedState, milliseconds = 5000) => {
  setTimeout(() => {
    watchedState.processState = 'updating';
    axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then(({ data }) => parseData(data.contents))
      .then((parsedRss) => {
        normalizeRss(watchedState, parsedRss);
        watchedState.processState = 'updated';
      })
      .catch(({ message }) => {
        if (message === 'Network Error') {
          watchedState.processState = 'network error';
          return;
        }
        watchedState.rssForm.error = message;
        watchedState.processState = 'error';
      });
    autoupdate(url, watchedState, milliseconds);
  }, milliseconds);
};

export default ({ state, elements, i18nextInstance }) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'processState' && value === 'loading') {
      elements.input.disabled = true;
      elements.submitButton.disabled = true;
      renderStatus(elements, i18nextInstance.t('processState.loading'));
    }
    if (path === 'processState' && value === 'loaded') {
      elements.input.disabled = false;
      elements.submitButton.disabled = false;
      renderStatus(elements, i18nextInstance.t('processState.loaded'));
      renderFeed(elements, state);
      renderPosts(elements, i18nextInstance.t('button'), watchedState);
    }
    if (path === 'processState' && value === 'updated') {
      renderPosts(elements, i18nextInstance.t('button'), watchedState);
    }
    if (path === 'activePost' && value.status === 'read') {
      renderPosts(elements, i18nextInstance.t('button'), watchedState);
    }
    if (path === 'processState' && value === 'error') {
      elements.input.disabled = false;
      elements.submitButton.disabled = false;
      renderErrors(elements, i18nextInstance.t(state.rssForm.error));
    }
    if (path === 'processState' && value === 'network error') {
      elements.input.disabled = false;
      elements.submitButton.disabled = false;
      renderErrors(elements, i18nextInstance.t('errors.network'));
    }
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    watchedState.processState = 'loading';

    yup.setLocale({
      string: {
        url: 'errors.url.invalid',
      },
    });

    validateUrl(url, watchedState)
      .then((validUrl) => {
        watchedState.data.currentUrl = validUrl;
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(validUrl)}`);
      })
      .then(({ data }) => parseData(data.contents))
      .then((parsedRss) => {
        state.data.activeFeeds.push(watchedState.data.currentUrl);
        autoupdate(watchedState.data.currentUrl, watchedState);
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
  });
};
