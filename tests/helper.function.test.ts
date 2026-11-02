import { expect, type Page } from '@playwright/test';

export async function logincus_normal(page: Page): Promise<void> {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('login-username').click();
    await page.getByTestId('login-username').fill('cus_normal');
    await page.getByTestId('login-password').click();
    await page.getByTestId('login-password').fill('123456');
    await page.getByTestId('login-submit').click();
}

export async function logincus_prime(page: Page): Promise<void> {
    await page.getByTestId('login-username').click();
    await page.getByTestId('login-username').fill('cus_prime');
    await page.getByTestId('login-password').click();
    await page.getByTestId('login-password').fill('123456');
    await page.getByTestId('login-submit').click();
}

export async function loginadmin(page: Page): Promise<void> {
    await page.getByTestId('login-username').click();
    await page.getByTestId('login-username').fill('admin01');
    await page.getByTestId('login-password').click();
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();
}

export async function createPaidOrder(page: Page): Promise<string> {
    const product = page.getByTestId('product-row-P1');
    await product.getByTestId('product-qty-increase').click();
    await product.getByTestId('product-add-button').click();

    await page.getByTestId('nav-cart').click();
    await page.getByTestId('checkout-button').click();
    await expect(page.getByTestId('gateway-pay-success')).toBeVisible();

    await page.getByTestId('gateway-pay-success').click();

    const orderId = page.getByTestId('success-order-id');
    await expect(orderId).toBeVisible();
    await page.getByRole('button', { name: 'เลือกซื้อสินค้าต่อ' }).click();
    return (await orderId.textContent())!.trim();
}