import { Page } from '@playwright/test';

export async function mockGeolocation(
  page: Page,
  coords: { lat: number; lng: number; accuracy?: number }
) {
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({
    latitude: coords.lat,
    longitude: coords.lng,
    accuracy: coords.accuracy || 10,
  });
}
