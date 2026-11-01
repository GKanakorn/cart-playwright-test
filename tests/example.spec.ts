import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('Roast & Roll');
});

test('invalid login credentials', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByTestId('login-username').click();
  await page.getByTestId('login-username').fill('cus_normal');
  await page.getByTestId('login-password').click();
  await page.getByTestId('login-password').fill('12345');
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('app-message')).toContainText('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
});
