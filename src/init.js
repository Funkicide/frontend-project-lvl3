import i18next from 'i18next';
import ru from './locales/ru.js';

export default () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  });
  const state = {
    rssForm: {
      processState: 'initial',
      error: '',
    },
    data: {
      currentUrl: null,
      activeFeeds: [],
      feeds: [],
      posts: [],
    },
    uiState: {
      posts: [],
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('[aria-label="url"]'),
    submitButton: document.querySelector('[type=submit]'),
    statusBar: document.querySelector('p.feedback'),
    feeds: document.querySelector('div.feeds'),
    posts: document.querySelector('div.posts'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.full-article'),
  };

  return { state, elements, i18nextInstance };
};
