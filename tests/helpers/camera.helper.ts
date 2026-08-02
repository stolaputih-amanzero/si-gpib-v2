import { Page } from '@playwright/test';

export async function mockCameraCapture(
  page: Page,
  options: { lat?: number; lng?: number; noExif?: boolean } = {}
) {
  await page.evaluate(
    ({ lat, lng, noExif }) => {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (!input) return;

      const dummyCanvas = document.createElement('canvas');
      dummyCanvas.width = 400;
      dummyCanvas.height = 300;
      const ctx = dummyCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1E40AF';
        ctx.fillRect(0, 0, 400, 300);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Test Asset Photo', 50, 150);
      }

      dummyCanvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], 'test-asset.jpg', { type: 'image/jpeg' });

        if (!noExif && lat && lng) {
          Object.defineProperty(file, 'exifData', {
            value: { GPSLatitude: lat, GPSLongitude: lng },
            writable: false,
          });
        }

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, 'image/jpeg');
    },
    { lat: options.lat, lng: options.lng, noExif: options.noExif }
  );
}
