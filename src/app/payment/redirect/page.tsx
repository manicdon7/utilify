export default function PaymentRedirectPage() {
  return (
    <html>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <meta httpEquiv="refresh" content="0;url=/payment/callback" />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Clear any cached scripts
              if ('caches' in window) {
                caches.keys().then(function(names) {
                  for (let name of names) caches.delete(name);
                });
              }
              // Force redirect with cache bypass
              window.location.replace('/payment/callback' + window.location.search);
            `,
          }}
        />
        <p>Redirecting...</p>
      </body>
    </html>
  );
}
