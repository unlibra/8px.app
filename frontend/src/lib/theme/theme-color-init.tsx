import Script from 'next/script'

/**
 * Initializes theme-color meta tag based on stored theme preference
 * Runs before page interactive to prevent flash
 */
export function ThemeColorInit () {
  return (
    <Script
      id='theme-color-init'
      strategy='beforeInteractive'
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const theme = localStorage.getItem('theme');
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const resolved = theme === 'dark' || (theme === 'system' && isDark) ? 'dark' : 'light';
            const color = resolved === 'dark' ? '#282c34' : '#ffffff';

            let meta = document.querySelector('meta[name="theme-color"]');
            if (!meta) {
              meta = document.createElement('meta');
              meta.setAttribute('name', 'theme-color');
              document.head.appendChild(meta);
            }
            meta.setAttribute('content', color);
          })();
        `
      }}
    />
  )
}
