import { orders } from './order-api.js';

const canonicalHost = 'xn--80acmogcvipsi.xn--p1ai';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isPublicHost = url.hostname === canonicalHost || url.hostname === `www.${canonicalHost}`;
    if (isPublicHost && (url.hostname !== canonicalHost || url.protocol !== 'https:' || url.pathname === '/index.html')) {
      url.hostname = canonicalHost;
      url.protocol = 'https:';
      if (url.pathname === '/index.html') url.pathname = '/';
      return Response.redirect(url, 308);
    }
    if (url.pathname.startsWith('/api/admin/')) return orders(request, env.ORDERS_DB);
    return env.ASSETS.fetch(request);
  },
};
