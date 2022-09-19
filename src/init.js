import i18next from 'i18next';
import ru from './locales/ru.js';
import watchState from './view.js';
import { formSubmitHandler, previewButtonHandler } from './controller/eventHandlers.js';
import autoupdate from './controller/autoupdate.js';

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
      posts: new Set(),
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('[aria-label="url"]'),
    submitButton: document.querySelector('[type=submit]'),
    statusBar: document.querySelector('p.feedback'),
    feeds: document.querySelector('div.feeds'),
    posts: document.querySelector('div.posts'),
    modal: {
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      link: document.querySelector('.full-article'),
    },
  };
  const watchedState = watchState({ state, elements, i18nextInstance });

  elements.form.addEventListener('submit', formSubmitHandler(watchedState));
  elements.posts.addEventListener('click', previewButtonHandler(elements, watchedState));
  autoupdate(watchedState);
};
