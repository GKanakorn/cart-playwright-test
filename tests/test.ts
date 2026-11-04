import { expect, test as base } from '@playwright/test';
import { env } from 'node:process';

export const test = base.extend<{ resetDatabase: void }>({
    resetDatabase: [
        async ({ request }, use) => {
            const apiUrl = env.API_URL ?? "http://localhost:4000";
            const response = await request.post(`${apiUrl}/api/test/reset`);

            if (!response.ok()) {
                throw new Error(`Database reset failed: ${await response.text()}`);
            }

            await use();
        },
        { auto: true },
    ],
});

export { expect };
