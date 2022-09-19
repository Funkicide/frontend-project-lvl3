const makeProxyUrl = (url) => {
  const proxyUrl = new URL('https://allorigins.hexlet.app/');
  proxyUrl.pathname = 'get';
  proxyUrl.searchParams.append('url', url);
  proxyUrl.searchParams.append('disableCache', 'true');

  return proxyUrl;
};

export default makeProxyUrl;
