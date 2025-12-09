import axios from 'axios';
import * as cheerio from 'cheerio';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  const { url } = req.query;

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

    // Fetch the content
    const response = await axios.get(url, {
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
    });

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

      // Add base tag to help with relative URLs
      $('head').prepend(`<base href="${baseUrl}/">`);

      // Inject JavaScript to handle dynamic URL changes
      $('head').append(`
        <script>
          (function() {
            const proxyBase = '/api/proxy?url=';
            const originalFetch = window.fetch;
            window.fetch = function(url, options) {
              if (typeof url === 'string' && !url.startsWith(proxyBase)) {
                const absoluteUrl = new URL(url, window.location.href).href;
                return originalFetch(proxyBase + encodeURIComponent(absoluteUrl), options);
              }
              return originalFetch(url, options);
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

    // Handle images and other binary content
    if (contentType.includes('image/') || contentType.includes('application/octet-stream')) {
      res.setHeader('Content-Type', contentType);
      return res.status(response.status).send(response.data);
    }

    // Default: pass through content
    res.setHeader('Content-Type', contentType);
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
