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
  })
    .then(() => console.log('Initialized!!!'));
  const state = {
    rssForm: {
      processState: 'initial',
      error: '',
    },
    feedList: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('[aria-label="url"]'),
    statusBar: document.querySelector('p.feedback'),
  };

  return { state, elements, i18nextInstance };
};
