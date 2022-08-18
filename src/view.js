import onChange from 'on-change';
import * as yup from 'yup';

export default ({ state, elements }) => {
  const watchedState = onChange(state, (path, value) => {
    console.log(path, value);
    if (path === 'rssForm.valid' && value) {
      elements.input.classList.remove('is-invalid');
      elements.statusBar.textContent = '';

      elements.form.reset();
      elements.input.focus();
    }
    if (path === 'rssForm.valid' && !value) {
      elements.input.classList.add('is-invalid');
      // console.log(state.rssForm.error)
      elements.statusBar.textContent = state.rssForm.error;
    }
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();

    // console.log(watchedState.feedList);
    const schema = yup.string().url().required().notOneOf(watchedState.feedList, 'RSS уже существует');
    schema.validate(url)
      .then((validUrl) => {
        watchedState.feedList.push(validUrl);
        watchedState.rssForm.valid = true;
        // console.log(watchedState.feedList, validUrl);
      })
      .catch(({ message }) => {
        watchedState.rssForm.error = message;
        watchedState.rssForm.valid = false;
        // console.log(watchedState.rssForm.error);
      });
  });
};
