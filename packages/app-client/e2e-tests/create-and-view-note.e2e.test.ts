import { expect, test } from '@playwright/test';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

test('Can create and view a note', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Enclosed - Send private and secure notes');

  await page.getByTestId('note-content').fill('Hello, World!');
  await page.getByTestId('delete-after-reading').click();

  await page.getByTestId('create-note').click();
  await sleep(1000);

  const noteUrl = await page.getByTestId('note-url').inputValue();

  expect(noteUrl).toBeDefined();
  expect(noteUrl.includes('#')).toBe(false);

  await page.goto(noteUrl);
  await expect(page.getByText('This note will be deleted')).toBeVisible();

  const noteContent = await page.getByTestId('note-content-display').textContent();

  expect(noteContent).toBe('Hello, World!');

  await page.reload();

  await expect(page.getByText('Note not found')).toBeVisible();
});
