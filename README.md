# Web Proxy

A modern web proxy built with Next.js that allows you to browse websites through a proxy server. Features automatic URL rewriting, support for images, CSS, JavaScript, and works well with gaming websites.

## Features

- **URL Rewriting**: Automatically rewrites all links, images, scripts, and stylesheets
- **Modern UI**: Clean, responsive interface with gradient design
- **Gaming Website Support**: Optimized to handle dynamic content and resources
- **Multiple Content Types**: Supports HTML, CSS, JavaScript, images, and more
- **CORS Handling**: Built-in CORS support for cross-origin requests
- **Easy Deployment**: One-click deployment to Vercel

## Tech Stack

- Next.js 16
- React 19
- Axios (for HTTP requests)
- Cheerio (for HTML parsing and URL rewriting)

## Local Development

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd web-proxy
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. **User Interface**: Enter any URL in the input field
2. **Proxy Processing**: The server fetches the content and rewrites all URLs
3. **Display**: Content is displayed in an iframe with navigation controls

### URL Rewriting

The proxy rewrites:
- Links (`<a>` tags)
- Images (`<img>` tags)
- Scripts (`<script>` tags)
- Stylesheets (`<link>` tags)
- Iframes (`<iframe>` tags)
- Form actions (`<form>` tags)
- CSS `url()` references

## Deploying to Vercel

### Method 1: Deploy from Git (Recommended)

1. **Create a GitHub repository**:
   - Go to [GitHub](https://github.com) and create a new repository
   - Don't initialize with README (we already have one)

2. **Push your code to GitHub**:
```bash
cd web-proxy
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

3. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign up/login
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"
   - Your proxy will be live in ~2 minutes!

### Method 2: Deploy with Vercel CLI

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
cd web-proxy
vercel
```

4. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? **web-proxy** (or your choice)
   - In which directory is your code located? **./**
   - Want to override settings? **N**

5. **Deploy to production**:
```bash
vercel --prod
```

## Configuration

### Timeout Settings

The proxy has a 60-second timeout for Pro accounts (configured in `vercel.json`). For the free tier, it's limited to 10 seconds.

To adjust the timeout:
```json
{
  "functions": {
    "pages/api/proxy.js": {
      "maxDuration": 60
    }
  }
}
```

### Environment Variables

No environment variables are required for basic operation.

## Usage

1. Open your deployed proxy URL
2. Enter a website URL (e.g., `https://example.com`)
3. Click "Go"
4. Browse the proxied website
5. Click "Back" to return to the home page

## Limitations

- **Complex JavaScript**: Some sites with heavy client-side routing may not work perfectly
- **WebSockets**: Real-time features using WebSockets are not supported
- **Authentication**: Sites requiring login may have issues with cookies/sessions
- **Timeout Limits**: Vercel free tier has 10s timeout, Pro has 60s
- **Rate Limiting**: Both Vercel and target sites may have rate limits

## Troubleshooting

### Site Not Loading

- **Check URL format**: Must include `http://` or `https://`
- **Check timeout**: Large sites may exceed timeout limits
- **Check console**: Open browser DevTools to see errors

### Resources Not Loading

- Some sites block proxy access
- Mixed content (HTTP/HTTPS) issues
- CORS restrictions on certain resources

### Vercel Deployment Issues

- Make sure `package.json` has correct scripts
- Verify Node.js version compatibility
- Check Vercel dashboard for error logs

## Project Structure

```
web-proxy/
├── pages/
│   ├── api/
│   │   └── proxy.js       # Proxy API endpoint
│   └── index.js           # Home page UI
├── public/                # Static assets
├── package.json           # Dependencies
├── next.config.js         # Next.js configuration
├── vercel.json           # Vercel deployment config
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Security Considerations

- This proxy allows access to any URL
- No authentication/authorization is implemented
- Consider adding rate limiting for production use
- Be aware of legal implications of proxying content
- May violate terms of service of some websites

## Contributing

Feel free to fork and modify this project for your needs.

## License

ISC

## Support

For issues with:
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Deployment**: Check Vercel dashboard logs

---

Built with Next.js and deployed on Vercel
