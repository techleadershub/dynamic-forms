import { test, expect } from '@playwright/test';

const ROLE_QUESTION = "What's your role?";
const TOOLS_QUESTION = 'Which tools do you use regularly?';
const CHALLENGE_QUESTION = 'Tell me about your biggest collaboration challenge.';

test.describe('Discovery chatbot', () => {
  test('completes guided conversation and surfaces session in admin', async ({ page }) => {
    await page.goto('/');

    const firstBotMessage = page.getByTestId('bot-message').first();
    await expect(firstBotMessage).toContainText(ROLE_QUESTION, { timeout: 15000 });
    await page.getByLabel('Product Manager').click();
    await page.getByRole('button', { name: /submit/i }).click();

    await expect(page.getByTestId('bot-message').last()).toContainText(TOOLS_QUESTION, { timeout: 15000 });
    await page.getByLabel('Jira').click();
    await page.getByLabel('Slack').click();
    await page.getByRole('button', { name: /submit/i }).click();

    await expect(page.getByTestId('bot-message').last()).toContainText(CHALLENGE_QUESTION, { timeout: 15000 });
    await page.getByPlaceholder('Type your response...').fill('We need better visibility across squads.');
    await page.getByRole('button', { name: /submit/i }).click();

    await expect(page.getByText(/Thanks/i)).toBeVisible();

    await page.goto('/admin');
    const sessionCard = page.getByTestId('session-card').first();
    await expect(sessionCard).toBeVisible();
    await sessionCard.click();

    await expect(page.getByText(`Q: ${ROLE_QUESTION}`)).toBeVisible();
    await expect(page.getByText(`Q: ${TOOLS_QUESTION}`)).toBeVisible();
    await expect(page.getByText(`Q: ${CHALLENGE_QUESTION}`)).toBeVisible();
  });
});

