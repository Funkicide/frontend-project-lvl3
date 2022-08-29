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

const validateUrl = (url, state) => {
  const schema = yup.string().url().notOneOf(state.addedFeeds, 'errors.url.notUnique');
  return schema.validate(url)
    .then((validUrl) => {
      state.addedFeeds.push(validUrl);

      return validUrl;
    });
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
  const description = feedDescriptionElement.textContent;

  const feed = {
    id: _.uniqueId(),
    title: feedTitle,
    description,
  };

  if (_.isEmpty(state.feeds)) {
    state.feeds.unshift(feed);
  } else {
    const hasCurrentFeed = state.feeds
      .find((item) => item.title === feedTitle);
    if (hasCurrentFeed === undefined) {
      state.feeds.unshift(feed);
    }
  }

  const currentFeed = state.feeds.find((item) => item.title === feedTitle);
  const feedId = currentFeed.id;

  const itemElements = rss.querySelectorAll('item');
  const posts = [...itemElements].map((item) => {
    const titleElement = item.querySelector('title');
    const linkElement = item.querySelector('link');
    const title = titleElement.textContent;
    const link = linkElement.textContent;

    return {
      id: _.uniqueId(),
      feedId,
      title,
      link,
    };
  });

  const currentFeedPosts = state.posts.filter((post) => post.feedId === feedId);
  const newPosts = _.differenceBy(posts, currentFeedPosts, 'title');
  console.log(newPosts);
  state.posts = _.isEmpty(state.posts) ? posts : [...newPosts, ...state.posts];
  state.processState = 'loaded';
};

const renderRss = (elements, processState, { feeds, posts }) => {
  elements.input.classList.remove('is-invalid');
  elements.statusBar.classList.remove('text-danger');
  elements.statusBar.classList.add('text-success');
  elements.statusBar.textContent = processState;

  elements.feeds.innerHTML = '';
  elements.posts.innerHTML = '';

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

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group');
  const postsElements = posts.map(({ title, link }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    const a = document.createElement('a');
    a.href = link;
    a.textContent = title;
    li.appendChild(a);

    return li;
  });
  postsList.prepend(...postsElements);
  elements.posts.append(postsList);

  elements.form.reset();
  elements.input.focus();
};

const autoupdate = (url, state, milliseconds = 5000) => {
  setTimeout(() => {
    state.processState = 'sending';
    axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then(({ data }) => parseData(data.contents))
      .then((parsedRss) => {
        normalizeRss(state, parsedRss);
      })
      .catch(({ message }) => {
        if (message === 'Network Error') {
          state.processState = 'network error';
          return;
        }
        state.rssForm.error = message;
        state.processState = 'error';
      });
    autoupdate(url, state, milliseconds);
  }, milliseconds);
};

export default ({ state, elements, i18nextInstance }) => {
  const watchedState = onChange(state, (path, value) => {
    // console.log(path, value);
    if (path === 'processState' && value === 'loaded') {
      renderRss(elements, i18nextInstance.t('processState.loaded'), state);
    }
    if (path === 'processState' && value === 'error') {
      renderErrors(elements, i18nextInstance.t(state.rssForm.error));
    }
    if (path === 'processState' && value === 'network error') {
      renderErrors(elements, i18nextInstance.t('errors.network'));
    }
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();
    watchedState.processState = 'sending';

    yup.setLocale({
      string: {
        url: 'errors.url.invalid',
      },
    });

    validateUrl(url, watchedState)
      .then((validUrl) => {
        autoupdate(validUrl, watchedState);
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(validUrl)}`);
      })
      .then(({ data }) => parseData(data.contents))
      .then((parsedRss) => {
        normalizeRss(watchedState, parsedRss);
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
