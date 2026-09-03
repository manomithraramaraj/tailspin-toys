import { test, expect } from '@playwright/test';

test.describe('Game Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('filters by multiple categories and a publisher', async ({ page }) => {
    await test.step('Select two categories and one publisher', async () => {
      await page.getByRole('checkbox', { name: 'Puzzle', exact: true }).check();
      await page.getByRole('checkbox', { name: 'Strategy', exact: true }).check();
      await page.getByRole('combobox', { name: 'Publisher' }).selectOption('GitHub Games');
    });

    await test.step('Show only games matching the category OR and publisher AND rules', async () => {
      const visibleCards = page.locator('[data-testid="game-card"]:visible');
      await expect(visibleCards).toHaveCount(2);
      await expect(visibleCards.getByTestId('game-category')).toHaveText(['Puzzle', 'Strategy']);
      await expect(visibleCards.getByTestId('game-publisher')).toHaveText([
        'GitHub Games',
        'GitHub Games',
      ]);
      await expect(page.getByTestId('game-filter-status')).toContainText('Showing 2 of');
    });

    await test.step('Synchronize human-readable selections to the URL', async () => {
      await expect.poll(() => new URL(page.url()).searchParams.getAll('category')).toEqual([
        'Puzzle',
        'Strategy',
      ]);
      await expect.poll(() => new URL(page.url()).searchParams.get('publisher')).toBe('GitHub Games');
    });
  });

  test('restores filters from a shareable URL', async ({ page }) => {
    await page.goto('/?category=Puzzle&publisher=GitHub%20Games');

    await expect(page.getByRole('checkbox', { name: 'Puzzle', exact: true })).toBeChecked();
    await expect(page.getByRole('combobox', { name: 'Publisher' })).toHaveValue('GitHub Games');
    await expect(page.locator('[data-testid="game-card"]:visible')).toHaveCount(1);
    await expect(page.getByTestId('active-game-filters')).toContainText('Category: Puzzle');
    await expect(page.getByTestId('active-game-filters')).toContainText('Publisher: GitHub Games');
  });

  test('shows unknown URL filters as removable active filters with no results', async ({ page }) => {
    await page.goto('/?category=Unknown%20Category&publisher=Unknown%20Publisher');

    await expect(page.getByTestId('filtered-empty-state')).toBeVisible();
    await expect(page.getByTestId('active-game-filters')).toContainText(
      'Category: Unknown Category',
    );
    await expect(page.getByTestId('active-game-filters')).toContainText(
      'Publisher: Unknown Publisher',
    );
    await expect(page.getByTestId('game-filter-status')).toHaveText(/Showing 0 of \d+ games\./);

    await page.getByTestId('clear-game-filters').click();

    await expect(page.getByTestId('games-grid')).toBeVisible();
    await expect(page.getByTestId('active-game-filters')).toBeHidden();
    await expect(page).toHaveURL('/');
  });

  test('supports filtering with the keyboard', async ({ page }) => {
    const puzzleFilter = page.getByRole('checkbox', { name: 'Puzzle', exact: true });
    await puzzleFilter.focus();
    await page.keyboard.press('Space');

    await expect(puzzleFilter).toBeChecked();
    await expect(page.locator('[data-testid="game-card"]:visible')).toHaveCount(4);
    await expect(page.getByTestId('game-filter-status')).toContainText('Showing 4 of');
  });
});
