import axios from 'axios';
import * as cheerio from 'cheerio';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  const { url } = req.query;

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Validate URL
    let targetUrl;
    try {
      targetUrl = new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Prepare request configuration
    const requestConfig = {
      method: req.method || 'GET',
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      responseType: 'arraybuffer',
      maxRedirects: 5,
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500; // Accept any status code less than 500
      }
    };

    // Add request body for POST/PUT requests
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      requestConfig.data = req.body;
      if (req.headers['content-type']) {
        requestConfig.headers['Content-Type'] = req.headers['content-type'];
      }
    }

    // Fetch the content
    const response = await axios(requestConfig);

    const contentType = response.headers['content-type'] || '';

    // Handle HTML content - rewrite URLs
    if (contentType.includes('text/html')) {
      const html = response.data.toString('utf-8');
      const $ = cheerio.load(html);
      const baseUrl = targetUrl.origin;
      const proxyBase = `/api/proxy?url=`;

      // Rewrite all links
      $('a').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href) {
          const absoluteUrl = new URL(href, url).href;
          $(elem).attr('href', proxyBase + encodeURIComponent(absoluteUrl));
        }
      });

      // Rewrite all images
      $('img').each((i, elem) => {
        const src = $(elem).attr('src');
        if (src) {
          const absoluteUrl = new URL(src, url).href;
          $(elem).attr('src', proxyBase + encodeURIComponent(absoluteUrl));
        }
      });

      // Rewrite all scripts
      $('script').each((i, elem) => {
        const src = $(elem).attr('src');
        if (src) {
          const absoluteUrl = new URL(src, url).href;
          $(elem).attr('src', proxyBase + encodeURIComponent(absoluteUrl));
        }
      });

      // Rewrite all stylesheets
      $('link[rel="stylesheet"]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href) {
          const absoluteUrl = new URL(href, url).href;
          $(elem).attr('href', proxyBase + encodeURIComponent(absoluteUrl));
        }
      });

      // Rewrite all iframes
      $('iframe').each((i, elem) => {
        const src = $(elem).attr('src');
        if (src) {
          const absoluteUrl = new URL(src, url).href;
          $(elem).attr('src', proxyBase + encodeURIComponent(absoluteUrl));
        }
      });

      // Rewrite form actions
      $('form').each((i, elem) => {
        const action = $(elem).attr('action');
        if (action) {
          const absoluteUrl = new URL(action, url).href;
          $(elem).attr('action', proxyBase + encodeURIComponent(absoluteUrl));
        }
      });

      // Rewrite manifest links
      $('link[rel="manifest"]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href) {
          const absoluteUrl = new URL(href, url).href;
          $(elem).attr('href', proxyBase + encodeURIComponent(absoluteUrl));
        }
      });

      // Rewrite all other link tags with href
      $('link[href]').each((i, elem) => {
        const href = $(elem).attr('href');
        const rel = $(elem).attr('rel');
        if (href && rel !== 'stylesheet' && rel !== 'manifest') {
          try {
            const absoluteUrl = new URL(href, url).href;
            $(elem).attr('href', proxyBase + encodeURIComponent(absoluteUrl));
          } catch (e) {
            // Skip invalid URLs
          }
        }
      });

      // Inject JavaScript to handle dynamic URL changes and fix fetch
      $('head').prepend(`
        <script>
          // Store the actual target origin
          window.__PROXY_TARGET__ = '${targetUrl.origin}';
          window.__PROXY_BASE_URL__ = '${url}';

          (function() {
            const proxyBase = '/api/proxy?url=';
            const targetOrigin = window.__PROXY_TARGET__;

            // Helper to resolve URLs
            function resolveUrl(url) {
              // Handle non-string inputs
              if (!url) return url;

              // Convert URL objects to strings
              if (typeof url === 'object' && url.href) {
                url = url.href;
              }

              // Ensure it's a string
              url = String(url);

              // Skip empty strings, data URLs, blob URLs, and javascript URLs
              if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('javascript:')) {
                return url;
              }

              if (url.includes(proxyBase)) {
                return url; // Already proxied
              }

              // Handle absolute URLs
              if (url.startsWith('http://') || url.startsWith('https://')) {
                // Check if it's pointing to the proxy domain - convert to target
                if (url.includes(window.location.host)) {
                  return url;
                }
                return proxyBase + encodeURIComponent(url);
              }

              // Handle protocol-relative URLs
              if (url.startsWith('//')) {
                return proxyBase + encodeURIComponent('https:' + url);
              }

              // Handle root-relative URLs
              if (url.startsWith('/')) {
                return proxyBase + encodeURIComponent(targetOrigin + url);
              }

              // Handle relative URLs
              try {
                return proxyBase + encodeURIComponent(new URL(url, targetOrigin).href);
              } catch (e) {
                // If URL parsing fails, return as-is
                return url;
              }
            }

            // Override fetch to route through proxy
            const originalFetch = window.fetch;
            window.fetch = function(input, options) {
              try {
                let url = typeof input === 'string' ? input : input.url;
                const proxiedUrl = resolveUrl(url);

                if (typeof input === 'string') {
                  return originalFetch(proxiedUrl, options);
                } else {
                  return originalFetch(proxiedUrl, {
                    ...options,
                    method: input.method || options?.method,
                  });
                }
              } catch (e) {
                console.error('Fetch proxy error:', e);
                return originalFetch(input, options);
              }
            };

            // Override XMLHttpRequest
            const originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url, ...rest) {
              try {
                if (typeof url === 'string') {
                  url = resolveUrl(url);
                }
              } catch (e) {
                console.error('XHR proxy error:', e);
              }
              return originalOpen.call(this, method, url, ...rest);
            };

            // Override document.createElement to intercept dynamic script/link creation
            const originalCreateElement = document.createElement;
            document.createElement = function(tagName) {
              const element = originalCreateElement.call(document, tagName);

              if (tagName.toLowerCase() === 'script') {
                const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
                Object.defineProperty(element, 'src', {
                  get: originalSrcDescriptor.get,
                  set: function(value) {
                    originalSrcDescriptor.set.call(this, resolveUrl(value));
                  }
                });
              }

              return element;
            };
          })();
        </script>
      `);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(response.status).send($.html());
    }

    // Handle CSS - rewrite URLs in CSS
    if (contentType.includes('text/css')) {
      let css = response.data.toString('utf-8');
      const proxyBase = `/api/proxy?url=`;

      // Rewrite url() in CSS
      css = css.replace(/url\(['"]?([^'")\s]+)['"]?\)/g, (match, url) => {
        try {
          const absoluteUrl = new URL(url, targetUrl.href).href;
          return `url("${proxyBase}${encodeURIComponent(absoluteUrl)}")`;
        } catch (e) {
          return match;
        }
      });

      res.setHeader('Content-Type', 'text/css');
      return res.status(response.status).send(css);
    }

    // Handle JavaScript
    if (contentType.includes('javascript') || contentType.includes('application/json')) {
      res.setHeader('Content-Type', contentType);
      return res.status(response.status).send(response.data);
    }

    // Handle WebAssembly
    if (contentType.includes('application/wasm') || url.endsWith('.wasm')) {
      res.setHeader('Content-Type', 'application/wasm');
      return res.status(response.status).send(response.data);
    }

    // Handle images and other binary content
    if (contentType.includes('image/') || contentType.includes('application/octet-stream')) {
      res.setHeader('Content-Type', contentType);
      return res.status(response.status).send(response.data);
    }

    // Handle fonts
    if (contentType.includes('font/') || url.match(/\.(woff|woff2|ttf|otf|eot)$/i)) {
      res.setHeader('Content-Type', contentType || 'font/woff2');
      return res.status(response.status).send(response.data);
    }

    // Handle video/audio
    if (contentType.includes('video/') || contentType.includes('audio/')) {
      res.setHeader('Content-Type', contentType);
      return res.status(response.status).send(response.data);
    }

    // Default: pass through content
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    return res.status(response.status).send(response.data);

  } catch (error) {
    console.error('Proxy error:', error.message);

    if (error.code === 'ENOTFOUND') {
      return res.status(404).json({ error: 'Website not found' });
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request timeout' });
    }

    return res.status(500).json({
      error: 'Failed to fetch the website',
      details: error.message
    });
  }
}
