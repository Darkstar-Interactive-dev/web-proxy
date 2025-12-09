import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [url, setUrl] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url) {
      const encodedUrl = encodeURIComponent(url);
      setProxyUrl(`/api/proxy?url=${encodedUrl}`);
    }
  };

  const handleBack = () => {
    setProxyUrl('');
    setUrl('');
  };

  return (
    <div className="container">
      <Head>
        <title>Web Proxy</title>
        <meta name="description" content="Secure web proxy service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        {!proxyUrl ? (
          <div className="form-container">
            <h1 className="title">Web Proxy</h1>
            <p className="description">Enter a URL to browse through the proxy</p>

            <form onSubmit={handleSubmit} className="form">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="input"
                required
              />
              <button type="submit" className="button">
                Go
              </button>
            </form>

            <div className="info">
              <h2>Features:</h2>
              <ul>
                <li>Browse websites through proxy</li>
                <li>Automatic URL rewriting</li>
                <li>Support for images, CSS, and JavaScript</li>
                <li>Works with most gaming websites</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="iframe-container">
            <div className="toolbar">
              <button onClick={handleBack} className="back-button">
                ← Back
              </button>
              <div className="url-display">{url}</div>
            </div>
            <iframe
              src={proxyUrl}
              className="proxy-frame"
              title="Proxied content"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .form-container {
          background: white;
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 600px;
          width: 90%;
          margin: 2rem;
        }

        .title {
          margin: 0 0 0.5rem 0;
          font-size: 3rem;
          font-weight: 700;
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .description {
          text-align: center;
          color: #666;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input {
          padding: 1rem;
          font-size: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          outline: none;
          transition: border 0.3s;
        }

        .input:focus {
          border-color: #667eea;
        }

        .button {
          padding: 1rem;
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }

        .button:active {
          transform: translateY(0);
        }

        .info {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #f5f5f5;
          border-radius: 10px;
        }

        .info h2 {
          margin: 0 0 1rem 0;
          font-size: 1.3rem;
          color: #333;
        }

        .info ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #666;
        }

        .info li {
          margin: 0.5rem 0;
        }

        .iframe-container {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .toolbar {
          background: white;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .back-button {
          padding: 0.5rem 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .back-button:hover {
          transform: translateY(-1px);
        }

        .url-display {
          flex: 1;
          padding: 0.5rem 1rem;
          background: #f5f5f5;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.9rem;
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .proxy-frame {
          flex: 1;
          width: 100%;
          border: none;
        }

        @media (max-width: 600px) {
          .form-container {
            padding: 2rem 1.5rem;
          }

          .title {
            font-size: 2rem;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
