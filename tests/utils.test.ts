import { resolveUrl, getDomain } from '../src/utils/fetch';

describe('URL utilities', () => {
  describe('resolveUrl', () => {
    it('resolves relative URLs against a base', () => {
      expect(resolveUrl('https://example.com/page', '/favicon.ico')).toBe(
        'https://example.com/favicon.ico'
      );
    });

    it('handles already-absolute URLs', () => {
      expect(resolveUrl('https://example.com', 'https://cdn.example.com/img.png')).toBe(
        'https://cdn.example.com/img.png'
      );
    });

    it('handles protocol-relative URLs', () => {
      expect(resolveUrl('https://example.com', '//cdn.example.com/img.png')).toBe(
        'https://cdn.example.com/img.png'
      );
    });

    it('handles relative paths', () => {
      expect(resolveUrl('https://example.com/dir/page', 'img.png')).toBe(
        'https://example.com/dir/img.png'
      );
    });

    it('returns original string if resolution fails', () => {
      expect(resolveUrl('not-a-url', 'also-not-a-url')).toBe('also-not-a-url');
    });
  });

  describe('getDomain', () => {
    it('extracts hostname from URL', () => {
      expect(getDomain('https://www.example.com/path')).toBe('www.example.com');
    });

    it('returns input if not a valid URL', () => {
      expect(getDomain('not-a-url')).toBe('not-a-url');
    });
  });
});
