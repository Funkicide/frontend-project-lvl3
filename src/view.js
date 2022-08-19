/* eslint-disable no-param-reassign */
import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';

const renderErrors = ({ input, statusBar }, error) => {
  input.classList.add('is-invalid');
  statusBar.textContent = error;
};

export default ({ state, elements, i18nextInstance }) => {
  const watchedState = onChange(state, (path, value) => {
    console.log(path, value);
    if (path === 'rssForm.valid' && value) {
      elements.input.classList.remove('is-invalid');
      elements.statusBar.textContent = '';

      elements.form.reset();
      elements.input.focus();
    }
    if (path === 'rssForm.error') {
      renderErrors(elements, i18nextInstance.t(state.rssForm.error));
    }
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();

    // console.log(watchedState.feedList);

    yup.setLocale({
      string: {
        url: 'errors.url.invalid',
      },
    });

    const schema = yup.string().url().notOneOf(watchedState.feedList, 'errors.url.notUnique');
    schema.validate(url)
      .then((validUrl) => {
        watchedState.feedList.push(validUrl);
        watchedState.rssForm.valid = true;
        // console.log(watchedState.feedList, validUrl);
      })
      .catch((error) => {
        watchedState.rssForm.error = error.message;
        watchedState.rssForm.valid = false;
        // console.log(error.errors);
      });
  });
};
