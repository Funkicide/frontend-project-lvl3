import * as yup from 'yup';

yup.setLocale({
  string: {
    url: 'errors.url.invalid',
  },
});

export default (url, { data: { activeFeeds } }) => {
  const schema = yup.string().url().notOneOf(activeFeeds, 'errors.url.notUnique');
  return schema.validate(url);
};
