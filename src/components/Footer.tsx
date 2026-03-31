import { get } from '../data/content';

export function Footer() {
  return (
    <footer className="footer section">
      <p className="footer-text">
        {get('footer', 'line1')}
        <br />
        {get('footer', 'line2')}
        <br />
        <br />
        {get('footer', 'line3')}
      </p>
    </footer>
  );
}
