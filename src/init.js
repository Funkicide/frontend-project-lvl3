export default () => {
  const state = {
    rssForm: {
      error: '',
    },
    feedList: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('[aria-label="url"]'),
    statusBar: document.querySelector('p.feedback'),
  };

  return { state, elements };
};
