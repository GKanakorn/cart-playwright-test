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

export async function createPendingOrder(page: Page): Promise<string> {
    await addProduct(page);
    await page.getByTestId('nav-cart').click();
    await page.getByTestId('checkout-button').click();
    await expect(page.getByTestId('gateway-pay-success')).toBeVisible();

    const orderId = page.getByTestId('checkout-order-id');
    await expect(orderId).toBeVisible();
    return (await orderId.textContent())!.trim();
}

export async function addProduct(page: Page, productId = 'P1', quantity = 1): Promise<void> {
    const product = page.getByTestId(`product-row-${productId}`);
    for (let i = 0; i < quantity - 1; i++) {
        await product.getByTestId('product-qty-increase').click();
    }
    await product.getByTestId('product-add-button').click();
}

export async function setProductStatus(
    page: Page,
    productId: string,
    targetStatus: 'เปิดขาย' | 'ปิดขาย',
) {
    const row = page.getByTestId(`admin-product-row-${productId}`);
    const status = row.getByTestId('admin-product-status');

    if (await status.textContent() !== targetStatus) {
        await row.getByTestId('admin-product-toggle-status').click();
    }

    await expect(status).toHaveText(targetStatus);
}

export async function setProductStock(page: Page, productId: string, stock: number) {
    const row = page.getByTestId(`admin-product-row-${productId}`);

    await row.getByTestId('admin-product-stock-input').fill(String(stock));
    await row.getByTestId('admin-product-save').click();

    await expect(row.getByTestId('admin-product-stock'))
        .toHaveText(String(stock));
}

export async function openAdminProducts(page: Page) {
    await page.goto('http://localhost:3000/');
    await loginadmin(page);
    await expect(page.getByTestId('page-admin-products')).toBeVisible();
}

export async function startWithEmptyCart(page: Page): Promise<void> {
    await page.goto('http://localhost:3000/');
    await logincus_normal(page);
    await expect(page.getByTestId('page-products')).toBeVisible();

    await page.getByTestId('nav-cart').click();
    await expect(page.getByTestId('page-cart')).toBeVisible();
    const cartLines = page.locator('[data-testid^="cart-line-"]');

    while (await cartLines.count() > 0) {
        const line = cartLines.first();
        await line.getByTestId('cart-line-remove').click();
        await expect(line).toHaveCount(0);
    }

    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('page-products')).toBeVisible();
}

export async function expectAddQuantityRejected(
    page: Page,
    quantity: string,
    expectedMessage: string,
) {
    const product = page.getByTestId('product-row-P1');

    await product.getByTestId('product-add-qty').fill(quantity);
    await expect(product.getByTestId('app-message'))
        .toContainText(expectedMessage);
    await expect(product.getByTestId('product-add-button')).toBeDisabled();

    await page.getByTestId('nav-cart').click();
    await expect(page.locator('tbody > tr[data-testid^="cart-line-"]')).toHaveCount(0);
}

export async function expectAddQuantityAccepted(page: Page, quantity: number): Promise<void> {
    const product = page.getByTestId('product-row-P1');
    await product.getByTestId('product-add-qty').fill(String(quantity));
    await expect(product.getByTestId('product-add-button')).toBeEnabled();
    await product.getByTestId('product-add-button').click();
    await expect(page.getByTestId('app-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

    await page.getByTestId('nav-cart').click();
    const cartLine = page.getByTestId('cart-line-P1');
    await expect(cartLine).toBeVisible();
    await expect(cartLine.getByTestId('cart-line-qty-input'))
        .toHaveValue(String(quantity));
}

export async function addProductAndOpenCart(page: Page, productId: string, quantity: number) {
    await startWithEmptyCart(page);

    const product = page.getByTestId(`product-row-${productId}`);
    await product.getByTestId('product-add-qty').fill(String(quantity));
    await product.getByTestId('product-add-button').click();
    await expect(page.getByTestId('app-message'))
        .toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

    await page.getByTestId('nav-cart').click();
    await expect(page.getByTestId('page-cart')).toBeVisible();
    return page.getByTestId(`cart-line-${productId}`);
}

export async function prepareAddItemDecisionCase(
    page: Page,
    productId: string,
    stock: number,
    currentQuantity: number,
): Promise<void> {
    await page.goto('http://localhost:3000/');
    await loginadmin(page);
    await setProductStock(page, productId, stock);
    await page.getByTestId('logout-button').click();
    await startWithEmptyCart(page);

    if (currentQuantity > 0) {
        const product = page.getByTestId(`product-row-${productId}`);
        await product.getByTestId('product-add-qty').fill(String(currentQuantity));
        await product.getByTestId('product-add-button').click();
        await expect(page.getByTestId('app-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');
    }
}

export async function expectCartQuantity(
    page: Page,
    productId: string,
    quantity: number,
): Promise<void> {
    await page.getByTestId('nav-cart').click();
    const cartLine = page.getByTestId(`cart-line-${productId}`);

    if (quantity === 0) {
        await expect(cartLine).toHaveCount(0);
        return;
    }

    await expect(cartLine).toBeVisible();
    await expect(cartLine.getByTestId('cart-line-qty-input'))
        .toHaveValue(String(quantity));
}

export async function restoreDecisionTableStock(page: Page): Promise<void> {
    await page.getByTestId('logout-button').click();
    await loginadmin(page);
    await setProductStock(page, 'P1', 20);
    await setProductStock(page, 'P2', 3);
}
