import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

test('a reviewer can browse as a guest, sign in, and save a rank that survives refresh', async ({ page }) => {
  const account = `reviewer-${randomUUID().slice(0, 8)}`;
  const email = `${account}@example.test`;
  const password = 'LocalTestPassword123!';

  // Keep the local smoke test independent of analytics and remote image/font hosts.
  await page.route('https://**', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Fantasy Football Research Hub' })).toBeVisible();
  await expect(page.getByText('I built this full-stack portfolio project with React, Flask, and PostgreSQL.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Log in', exact: true })).toHaveAttribute('href', '/login');
  const communityRankings = page.getByRole('region', { name: 'Community Top 5' });
  await expect(communityRankings.getByText('Includes sample rankings.')).toBeVisible();
  const rankedPlayers = communityRankings.getByRole('link');
  await expect(rankedPlayers).toHaveCount(5);
  const playerPaths = await rankedPlayers.evaluateAll(links => links.map(link => link.getAttribute('href')));
  expect(new Set(playerPaths).size).toBe(5);
  for (const path of playerPaths) expect(path).toMatch(/^\/players\/\d+$/);

  const browsePlayers = page.getByRole('link', { name: 'Browse Players', exact: true });
  await expect(browsePlayers).toBeInViewport();
  await browsePlayers.click();
  await expect(page).toHaveURL(/\/players$/);
  await expect(page.getByRole('heading', { name: 'Fantasy Football Player List' })).toBeVisible();
  await expect(page.getByText('Portfolio demo. Player profiles and stats use sample data.')).toBeVisible();
  const otherPosition = page.getByRole('link', { name: 'Christian McCaffrey', exact: true });
  await expect(otherPosition).toBeVisible();
  await page.getByRole('button', { name: 'QB', exact: true }).click();
  await expect(otherPosition).toBeHidden();
  await page.getByRole('link', { name: 'Patrick Mahomes', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Patrick Mahomes' })).toBeVisible();
  await expect(page.getByText('to save a ranking or post a review.')).toBeVisible();

  await page.getByRole('link', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('link', { name: 'Register here' }).click();
  await expect(page).toHaveURL(/\/register$/);
  await page.getByPlaceholder('Name').fill(account);
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Register', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  const logout = page.getByRole('button', { name: 'Logout', exact: true });
  await expect(logout).toBeVisible();

  await expect(page).toHaveURL(/\/players\/1$/);
  await expect(page.getByRole('heading', { name: 'Patrick Mahomes' })).toBeVisible();
  const rankField = page.getByLabel('Rank', { exact: true });
  const saveRanking = page.getByRole('button', { name: 'Save ranking' });
  await expect(rankField).toBeEnabled();
  await rankField.fill('3');
  await saveRanking.click();
  await expect(page.getByText('Your saved rank is 3.', { exact: true })).toBeVisible();

  const reload = await page.reload();
  expect(reload.status()).toBe(200);
  await expect(logout).toBeVisible();
  await expect(rankField).toHaveValue('3');
  await expect(page.getByText('Your saved rank is 3.', { exact: true })).toBeVisible();

  await rankField.fill('6');
  await saveRanking.click();
  await expect(page.getByText('Your saved rank is 6.', { exact: true })).toBeVisible();

  await page.route('**/api/reviews', route => route.fulfill({ status: 500 }));
  const review = page.getByLabel('Review (optional)');
  await review.fill('A review can be submitted independently.');
  await page.getByRole('button', { name: 'Post review' }).click();
  await expect(page.getByText('Could not post your review. Please try again.')).toBeVisible();
  await expect(page.getByText('Your saved rank is 6.', { exact: true })).toBeVisible();

  await page.unroute('**/api/reviews');
  await page.getByRole('button', { name: 'Post review' }).click();
  await expect(page.getByText('Review posted.', { exact: true })).toBeVisible();

  await page.goto('/');
  await page.getByRole('button', { name: 'Show Your Top 5', exact: true }).click();
  const personalRankings = page.getByRole('region', { name: 'Your Top 5' });
  await expect(personalRankings.getByRole('link', { name: 'Patrick Mahomes' })).toBeVisible();

  await logout.click();
  await expect(logout).toBeHidden();
  await page.goto('/players/1');
  await expect(page.getByText('Sample data', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Log in', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save ranking' })).toHaveCount(0);
});
