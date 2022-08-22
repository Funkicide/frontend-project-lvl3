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
    addedFeeds: [],
    feeds: [],
    posts: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('[aria-label="url"]'),
    statusBar: document.querySelector('p.feedback'),
    feeds: document.querySelector('div.feeds'),
    posts: document.querySelector('div.posts'),
  };

  return { state, elements, i18nextInstance };
};
