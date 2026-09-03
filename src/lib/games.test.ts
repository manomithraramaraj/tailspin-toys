import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import {
    getAllCategories,
    getAllGames,
    getAllGameIds,
    getAllPublishers,
    getFilteredGames,
    getGameById,
} from './games';

async function seedGames(db: Database): Promise<void> {
    const [strategy, puzzle] = await db
        .insert(categories)
        .values([
            { name: 'Strategy', description: 'cat' },
            { name: 'Puzzle', description: 'cat' },
        ])
        .returning({ id: categories.id });
    const [pubOne, pubTwo] = await db
        .insert(publishers)
        .values([
            { name: 'Pub One', description: 'pub' },
            { name: 'Pub Two', description: 'pub' },
        ])
        .returning({ id: publishers.id });

    await db.insert(games).values([
        {
            title: 'Strategy Two',
            description: 'Description',
            starRating: 4.2,
            categoryId: strategy.id,
            publisherId: pubTwo.id,
        },
        {
            title: 'Puzzle One',
            description: 'Description',
            starRating: 4.2,
            categoryId: puzzle.id,
            publisherId: pubOne.id,
        },
        {
            title: 'Strategy One',
            description: 'Description',
            starRating: 4.2,
            categoryId: strategy.id,
            publisherId: pubOne.id,
        },
    ]);
}

describe('games data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns all games ordered by title', async () => {
        await seedGames(db);
        const all = await getAllGames(db);
        expect(all.map((g) => g.title)).toEqual(['Puzzle One', 'Strategy One', 'Strategy Two']);
        expect(all[0].category).toEqual({ id: expect.any(Number), name: 'Puzzle' });
        expect(all[0].publisher).toEqual({ id: expect.any(Number), name: 'Pub One' });
    });

    it('returns all game ids ordered by title', async () => {
        await seedGames(db);
        const ids = await getAllGameIds(db);
        const all = await getAllGames(db);
        expect(ids).toEqual(all.map((g) => g.id));
    });

    it('fetches a single game by id', async () => {
        await seedGames(db);
        const ids = await getAllGameIds(db);
        const game = await getGameById(db, ids[0]);
        expect(game?.title).toBe('Puzzle One');
    });

    it('returns null for a non-existent game', async () => {
        await seedGames(db);
        expect(await getGameById(db, 99999)).toBeNull();
    });

    it('filters by multiple categories using OR semantics', async () => {
        await seedGames(db);
        const filtered = await getFilteredGames(db, {
            categoryNames: ['Puzzle', 'Strategy'],
        });
        expect(filtered.map((game) => game.title)).toEqual([
            'Puzzle One',
            'Strategy One',
            'Strategy Two',
        ]);
    });

    it('filters by publisher', async () => {
        await seedGames(db);
        const filtered = await getFilteredGames(db, { publisherName: 'Pub Two' });
        expect(filtered.map((game) => game.title)).toEqual(['Strategy Two']);
    });

    it('combines categories and publisher using AND semantics', async () => {
        await seedGames(db);
        const filtered = await getFilteredGames(db, {
            categoryNames: ['Puzzle', 'Strategy'],
            publisherName: 'Pub One',
        });
        expect(filtered.map((game) => game.title)).toEqual(['Puzzle One', 'Strategy One']);
    });

    it('returns no games for unknown filter names', async () => {
        await seedGames(db);
        expect(await getFilteredGames(db, { categoryNames: ['Unknown'] })).toEqual([]);
        expect(await getFilteredGames(db, { publisherName: 'Unknown' })).toEqual([]);
    });

    it('returns all games when filters are empty', async () => {
        await seedGames(db);
        const filtered = await getFilteredGames(db, {
            categoryNames: [],
            publisherName: '',
        });
        expect(filtered.map((game) => game.title)).toEqual([
            'Puzzle One',
            'Strategy One',
            'Strategy Two',
        ]);
    });

    it('lists filter options alphabetically', async () => {
        await seedGames(db);
        expect((await getAllCategories(db)).map((category) => category.name)).toEqual([
            'Puzzle',
            'Strategy',
        ]);
        expect((await getAllPublishers(db)).map((publisher) => publisher.name)).toEqual([
            'Pub One',
            'Pub Two',
        ]);
    });
});
