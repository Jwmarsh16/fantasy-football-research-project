import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

async function openPrimaryNavigation(page) {
  const nav = page.getByRole('navigation', { name: 'Primary' });
  const toggle = nav.getByRole('button', { name: 'Toggle navigation' });
  if (await toggle.isVisible() && await toggle.getAttribute('aria-expanded') === 'false') {
    await toggle.click();
  }
  return nav;
}

test('guests can combine catalog filters and compare two players after refresh', async ({ page }) => {
  await page.route('https://**', route => route.abort());
  await page.goto('/players');

  const search = page.getByRole('searchbox', { name: 'Search by player name' });
  const team = page.getByRole('combobox', { name: 'Filter by Team:' });
  await team.selectOption({ label: 'Buffalo Bills' });
  await page.getByRole('button', { name: 'QB', exact: true }).click();
  await search.fill('  dIgGs  ');
  await expect(page).toHaveURL(url => (
    url.searchParams.get('team') === 'Buffalo Bills'
    && url.searchParams.get('position') === 'QB'
    && url.searchParams.get('q')?.trim() === 'dIgGs'
  ));
  await expect(page.getByText('No players match your filters.')).toBeVisible();

  await page.getByRole('button', { name: 'WR', exact: true }).click();
  await expect(team).toHaveValue('Buffalo Bills');
  const stefonDiggs = page.getByRole('link', { name: 'Stefon Diggs', exact: true });
  await expect(stefonDiggs).toBeVisible();
  await expect(page.getByRole('link', { name: 'Josh Allen', exact: true })).toHaveCount(0);
  await stefonDiggs.click();
  await page.getByRole('link', { name: 'Back to players', exact: true }).click();
  await expect(search).toHaveValue(/diggs/i);
  await expect(team).toHaveValue('Buffalo Bills');
  await expect(page.getByRole('button', { name: 'WR', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(stefonDiggs).toBeVisible();
  await page.getByRole('button', { name: 'Clear Filters' }).click();
  await expect(search).toHaveValue('');
  await expect(page.getByRole('link', { name: 'Josh Allen', exact: true })).toBeVisible();
  const rosterAction = page.getByRole('row', { name: /Josh Allen/ }).getByRole('button', { name: 'Add to Team' });
  await expect(rosterAction).toBeVisible();
  const actionBounds = await rosterAction.boundingBox();
  expect(actionBounds.x).toBeGreaterThanOrEqual(0);
  expect(actionBounds.x + actionBounds.width).toBeLessThanOrEqual(page.viewportSize().width);

  await page.getByRole('link', { name: 'Compare Players', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Compare Players' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Position', exact: true }).selectOption('QB');
  await page.getByRole('combobox', { name: 'First player', exact: true }).selectOption({ label: 'Patrick Mahomes' });
  const secondPlayer = page.getByRole('combobox', { name: 'Second player', exact: true });
  await expect(secondPlayer.getByRole('option', { name: 'Patrick Mahomes', exact: true })).toHaveCount(0);
  await expect(secondPlayer.getByRole('option', { name: 'Stefon Diggs', exact: true })).toHaveCount(0);
  await secondPlayer.selectOption({ label: 'Josh Allen' });

  const comparison = page.getByRole('table', { name: 'Player comparison' });
  await expect(comparison.getByText('Patrick Mahomes', { exact: true })).toBeVisible();
  await expect(comparison.getByText('Josh Allen', { exact: true })).toBeVisible();
  for (const metric of ['Community average rank', 'Votes', 'Passing yards']) {
    await expect(comparison.getByRole('rowheader', { name: metric, exact: true })).toBeVisible();
  }
  expect((await page.reload()).status()).toBe(200);
  await expect(comparison.getByText('Josh Allen', { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Position', exact: true }).selectOption('WR');
  await expect(comparison).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Logout', exact: true })).toHaveCount(0);
});

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
  const rankPlayer = page.getByRole('link', { name: 'Rank Player', exact: true });
  await expect(rankPlayer).toBeInViewport();

  await page.getByRole('link', { name: 'Compare this player', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Position', exact: true })).toHaveValue('QB');
  await expect(page.getByRole('combobox', { name: 'First player', exact: true })).toHaveValue('1');
  await page.goBack();
  await expect(rankPlayer).toBeInViewport();
  await rankPlayer.click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('link', { name: 'Register here' }).click();
  await expect(page).toHaveURL(/\/register$/);
  await page.getByLabel('Name', { exact: true }).fill(account);
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Register', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  const logout = page.getByRole('button', { name: 'Logout', exact: true });

  await expect(page).toHaveURL(/\/players\/1$/);
  await expect(page.getByRole('heading', { name: 'Patrick Mahomes' })).toBeVisible();
  await expect(rankPlayer).toBeInViewport();
  await rankPlayer.click();
  const rankField = page.getByLabel('Rank', { exact: true });
  const saveRanking = page.getByRole('button', { name: 'Save ranking' });
  await expect(rankField).toBeEnabled();
  await expect(rankField).toBeInViewport();
  await rankField.fill('3');
  await saveRanking.click();
  await expect(page.getByText('Your saved rank is 3.', { exact: true })).toBeVisible();

  const reload = await page.reload();
  expect(reload.status()).toBe(200);
  await expect(rankField).toHaveValue('3');
  await expect(page.getByText('Your saved rank is 3.', { exact: true })).toBeVisible();

  await rankField.fill('6');
  await saveRanking.click();
  await expect(page.getByText('Your saved rank is 6.', { exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'View My Rankings', exact: true }).click();
  const rankingsBoard = page.getByRole('region', { name: 'My Rankings' });
  const rankedPlayer = rankingsBoard.getByRole('link', { name: 'Patrick Mahomes', exact: true });
  await expect(rankedPlayer).toBeVisible();
  const boardUrl = page.url();
  expect((await page.reload()).status()).toBe(200);
  await expect(rankedPlayer).toBeVisible();
  await expect(rankingsBoard.getByRole('row', { name: /Patrick Mahomes/ })
    .getByRole('cell', { name: '6', exact: true })).toBeVisible();
  await expect(rankingsBoard.getByRole('columnheader', { name: 'Community average' })).toBeVisible();
  await rankedPlayer.click();
  await expect(rankField).toHaveValue('6');

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

  const nav = await openPrimaryNavigation(page);
  await nav.getByRole('link', { name: 'My Rankings', exact: true }).click();
  await expect(rankedPlayer).toBeVisible();
  await openPrimaryNavigation(page);
  await logout.click();
  await expect(logout).toBeHidden();
  await page.goto(boardUrl);
  await expect(rankingsBoard).toHaveCount(0);
  await page.goto('/players/1');
  await expect(page.getByText('Sample data', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Log in', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save ranking' })).toHaveCount(0);
});
