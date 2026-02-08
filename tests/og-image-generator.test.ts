import { generateOgImage } from '../src/services/og-image-generator';
import sharp from 'sharp';

describe('OG Image Generator', () => {
  it('generates a PNG image with default dimensions', async () => {
    const buffer = await generateOgImage({ title: 'Test Title' });

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);

    const metadata = await sharp(buffer).metadata();
    expect(metadata.format).toBe('png');
    expect(metadata.width).toBe(1200);
    expect(metadata.height).toBe(630);
  });

  it('generates image with custom dimensions', async () => {
    const buffer = await generateOgImage({
      title: 'Custom Size',
      width: 800,
      height: 400,
    });

    const metadata = await sharp(buffer).metadata();
    expect(metadata.width).toBe(800);
    expect(metadata.height).toBe(400);
  });

  it('handles long titles by wrapping text', async () => {
    const buffer = await generateOgImage({
      title: 'This is a very long title that should be wrapped across multiple lines to fit properly',
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
    const metadata = await sharp(buffer).metadata();
    expect(metadata.format).toBe('png');
  });

  it('includes subtitle and domain', async () => {
    const buffer = await generateOgImage({
      title: 'My App',
      subtitle: 'The best app for doing things',
      domain: 'myapp.com',
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('handles special XML characters in text', async () => {
    const buffer = await generateOgImage({
      title: 'Test <script> & "quotes" \'apostrophes\'',
      subtitle: 'A < B > C & D',
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
  });
});
