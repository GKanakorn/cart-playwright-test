import { test, expect } from '@playwright/test';
import {
    addProduct, createPendingOrder, loginadmin, logincus_normal, logincus_prime,
    openAdminProducts, setProductStatus, setProductStock,
    startWithEmptyCart
 } from './helper.function';

// ##################### FR-1.1 New Customer ต้องยังไม่มีรายการสินค้าในตะกร้า และ ออเดอร์ ######################## 
test.describe('FR-1.1 New Customer ต้องยังไม่มีรายการสินค้าในตะกร้า และ ออเดอร์', () => {
    test('FR-1.1 Customer_normal ที่ยังไม่เคยใช้งานเริ่มต้นด้วยตะกร้าว่าง', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await logincus_normal(page);

        // เมื่อลูกค้าเข้าสู่หน้าตะกร้า ต้องอยู่ใน stage ตะกร้าและยังไม่มีรายการ
        await page.getByTestId('nav-cart').click();
        await expect(page).toHaveURL(/\/cart$/);
        await expect(page.getByTestId('nav-cart').locator('span')).toContainText('0');
        await expect(page.getByTestId('app-message')).toContainText('ตะกร้าว่าง');

        // ตะกร้าว่างยังไม่มีคูปองและไม่สามารถเริ่มชำระเงินได้
        await expect(page.getByTestId('cart-coupon-code')).toHaveCount(0);
        await expect(page.getByTestId('checkout-button')).toBeDisabled();

        // บัญชีที่ยังไม่เคยใช้งานต้องไม่มีออเดอร์
        await page.getByTestId('nav-orders').click();
        await expect(page).toHaveURL(/\/orders\/?$/);
        await expect(page.locator('[data-testid^="order-row-"]')).toHaveCount(0);
        await expect(page.getByRole('paragraph')).toContainText('ยังไม่มีออเดอร์');
    });

    test('FR-1.1 Customer_prime ที่ยังไม่เคยใช้งานเริ่มต้นด้วยตะกร้าว่าง', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await logincus_prime(page);

        // เมื่อลูกค้าเข้าสู่หน้าตะกร้า ต้องอยู่ใน stage ตะกร้าและยังไม่มีรายการ
        await page.getByTestId('nav-cart').click();
        await expect(page).toHaveURL(/\/cart$/);
        await expect(page.getByTestId('nav-cart').locator('span')).toContainText('0');
        await expect(page.getByTestId('app-message')).toContainText('ตะกร้าว่าง');

        // ตะกร้าว่างยังไม่มีคูปองและไม่สามารถเริ่มชำระเงินได้
        await expect(page.getByTestId('cart-coupon-code')).toHaveCount(0);
        await expect(page.getByTestId('checkout-button')).toBeDisabled();

        // บัญชีที่ยังไม่เคยใช้งานต้องไม่มีออเดอร์
        await page.getByTestId('nav-orders').click();
        await expect(page).toHaveURL(/\/orders\/?$/);
        await expect(page.locator('[data-testid^="order-row-"]')).toHaveCount(0);
        await expect(page.getByRole('paragraph')).toContainText('ยังไม่มีออเดอร์');
    });
});

// ##################### FR-1.2 การคงอยู่ของข้อมูลข้ามการ login ########################
test.describe('FR-1.2 การคงอยู่ของข้อมูลข้ามการ login', () => {
    test('FR-1.2.1 รายการสินค้าในตะกร้าคงอยู่ข้ามการ login ในครั้งถัดไป', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await logincus_normal(page);
        await addProduct(page);
        await addProduct(page, 'P2', 2);
        await page.getByTestId('nav-cart').click();
        await expect(page).toHaveURL(/\/cart$/);
        const cartRows = page.locator('tr[data-testid^="cart-line-"]');
        await expect(cartRows).toHaveCount(2);
        await expect(page.getByTestId('cart-line-P1').getByTestId('cart-line-qty-input')).toHaveValue('1');
        await expect(page.getByTestId('cart-line-P2').getByTestId('cart-line-qty-input')).toHaveValue('2');
        await page.getByTestId('logout-button').click();

        // เข้าสู่ระบบอีกครั้ง
        await logincus_normal(page);

        // รายการสินค้าในตะกร้าคงอยู่
        await page.getByTestId('nav-cart').click();
        await expect(page).toHaveURL(/\/cart$/);
        const cartRowsAfterLogin = page.locator('tr[data-testid^="cart-line-"]');
        await expect(cartRowsAfterLogin).toHaveCount(2);
        await expect(page.getByTestId('cart-line-P1').getByTestId('cart-line-qty-input')).toHaveValue('1');
        await expect(page.getByTestId('cart-line-P2').getByTestId('cart-line-qty-input')).toHaveValue('2');
    });

    test('FR-1.2.2 คูปองที่ผูกกับตะกร้าคงอยู่ข้ามการ login ในครั้งถัดไป', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await logincus_normal(page);
        await addProduct(page);
        await page.getByTestId('nav-cart').click();
        await expect(page).toHaveURL(/\/cart$/);
        await page.getByTestId('coupon-input').fill('SAVE10');
        await page.getByTestId('coupon-apply').click();
        const couponCodeBeforeLogout = await page.getByTestId('cart-coupon-code').textContent();
        await expect(page.getByTestId('cart-coupon-code')).toHaveCount(1);
        await page.getByTestId('logout-button').click();

        // เข้าสู่ระบบอีกครั้ง
        await logincus_normal(page);

        // คูปองในตะกร้าคงอยู่
        await page.getByTestId('nav-cart').click();
        await expect(page).toHaveURL(/\/cart$/);
        const couponCodeAfterLogin = await page.getByTestId('cart-coupon-code').textContent();
        await expect(page.getByTestId('cart-coupon-code')).toHaveCount(1);
        expect(couponCodeBeforeLogout).toEqual(couponCodeAfterLogin);
    });

    test('FR-1.2.3 stage ชำระเงินคงอยู่ข้ามการ login ในครั้งถัดไป', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await logincus_normal(page);
        await addProduct(page);
        await page.getByTestId('nav-cart').click();
        await expect(page).toHaveURL(/\/cart$/);

        await page.getByTestId('checkout-button').click();
        await expect(page).toHaveURL(/\/checkout$/);
        const orderIdBeforeLogout = (await page.getByTestId('checkout-order-id').textContent())!.trim();
        await page.getByTestId('logout-button').click();

        // เมื่อ login บัญชีเดิมอีกครั้ง ต้องกลับมาที่ stage ชำระเงิน
        await logincus_normal(page);
        await expect(page).toHaveURL(/\/checkout$/);
        await expect(page.getByTestId('checkout-order-id')).toHaveText(orderIdBeforeLogout);
        await expect(page.getByTestId('checkout-order-status')).toHaveText('รอชำระเงิน');
    });

    test('FR-1.2.4 ออเดอร์รอชำระเงินและสต็อกที่จอง ต้องคงเดิมหลัง login ใหม่', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await logincus_normal(page);
        await expect(page.getByTestId('page-products')).toBeVisible();

        const orderId = await createPendingOrder(page);

        // บันทึกสต็อกหลังออเดอร์จองสินค้าแล้ว
        await page.getByTestId('logout-button').click();
        await loginadmin(page);
        await expect(page.getByTestId('page-admin-products')).toBeVisible();
        const stockAfterOrder = await page
            .getByTestId('admin-product-row-P1')
            .getByTestId('admin-product-stock')
            .getAttribute('data-value');

        // กลับเข้า Customer บัญชีเดิม
        await page.getByTestId('logout-button').click();
        await logincus_normal(page);
        // ออเดอร์เดิมยังอยู่ในสถานะรอชำระเงิน
        await page.getByTestId('nav-orders').click();
        const orderRow = page.getByTestId(`order-row-${orderId}`);
        await expect(orderRow).toBeVisible();
        await expect(orderRow.getByTestId('order-status')).toHaveText('รอชำระเงิน');

        // ตรวจว่าสต็อกที่จองไว้ไม่เปลี่ยนเพราะ Customer login ใหม่
        await page.getByTestId('logout-button').click();
        await loginadmin(page);
        await expect(page.getByTestId('page-admin-products')).toBeVisible();

        const stockAfterRelogin = await page
            .getByTestId('admin-product-row-P1')
            .getByTestId('admin-product-stock')
            .getAttribute('data-value');
        expect(stockAfterRelogin).toBe(stockAfterOrder);
    });
});

// ##################### FR-1.3 การดูรายการสินค้า ########################
test.describe('FR-1.3 การดูรายการสินค้า', () => {
    test('FR-1.3.1 Customer เห็นข้อมูลสินค้าพร้อมขายครบถ้วน', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await logincus_normal(page);
        await expect(page.getByTestId('page-products')).toBeVisible();

        const product = page.getByTestId('product-row-P1');
        await expect(product).toBeVisible();
        await expect(product.getByTestId('product-id')).toContainText('P1');
        await expect(product.getByTestId('product-name')).toHaveText('Coffee Beans 250g');
        await expect(product.getByTestId('product-price')).toHaveAttribute('data-value', '450');
        await expect(product.getByTestId('product-stock')).toHaveAttribute('data-value', '20');
        await expect(product.getByTestId('product-stock')).toContainText('300 g/ชิ้น');

        const product2 = page.getByTestId('product-row-P2');
        await expect(product2).toBeVisible();
        await expect(product2.getByTestId('product-id')).toContainText('P2');
        await expect(product2.getByTestId('product-name')).toHaveText('Drip Kettle');
        await expect(product2.getByTestId('product-price')).toHaveAttribute('data-value', '1200');
        await expect(product2.getByTestId('product-stock')).toHaveAttribute('data-value', '3');
        await expect(product2.getByTestId('product-stock')).toContainText('900 g/ชิ้น');

        const product3 = page.getByTestId('product-row-P3');
        await expect(product3).toBeVisible();
        await expect(product3.getByTestId('product-id')).toContainText('P3');
        await expect(product3.getByTestId('product-name')).toHaveText('Espresso Machine	');
        await expect(product3.getByTestId('product-price')).toHaveAttribute('data-value', '15000');
        await expect(product3.getByTestId('product-stock')).toHaveAttribute('data-value', '5');
        await expect(product3.getByTestId('product-stock')).toContainText('8,000 g/ชิ้น');
    });

    test('FR-1.3.1 Customer ไม่เห็นสินค้าที่ Admin ปิดขาย', async ({ page }) => {
        await openAdminProducts(page);

        const productId = 'P1';
        const row = page.getByTestId(`admin-product-row-${productId}`);
        const originalStatus = (await row.getByTestId('admin-product-status').textContent())?.trim();

        try {
            await setProductStatus(page, productId, 'ปิดขาย');

            await page.getByTestId('logout-button').click();
            await logincus_normal(page);

            await expect(page.getByTestId('page-products')).toBeVisible();
            await expect(page.getByTestId(`product-row-${productId}`)).toHaveCount(0);
        } finally {
            // คืนสถานะสินค้า เพื่อไม่ให้กระทบเคสทดสอบถัดไป
            await openAdminProducts(page);
            await setProductStatus(page, productId, originalStatus === 'ปิดขาย' ? 'ปิดขาย' : 'เปิดขาย');
        }
    });

    test('FR-1.3.1 Customer ไม่เห็นสินค้าที่มีสต็อกเป็นศูนย์', async ({ page }) => {
        await openAdminProducts(page);

        const productId = 'P1';
        const row = page.getByTestId(`admin-product-row-${productId}`);
        const originalStock = Number(await row.getByTestId('admin-product-stock').getAttribute('data-value'));

        try {
            // ให้สินค้ายังเปิดขาย เพื่อทดสอบเงื่อนไขสต็อกเป็นศูนย์โดยเฉพาะ
            await setProductStatus(page, productId, 'เปิดขาย');
            await setProductStock(page, productId, 0);

            await page.getByTestId('logout-button').click();
            await logincus_normal(page);

            await expect(page.getByTestId('page-products')).toBeVisible();
            await expect(page.getByTestId(`product-row-${productId}`)).toHaveCount(0);
        } finally {
            // คืนข้อมูลตั้งต้น
            await openAdminProducts(page);
            await setProductStock(page, productId, originalStock);
            await setProductStatus(page, productId, 'เปิดขาย');
        }
    });

    test('FR-1.3.2 Admin เห็นสินค้าทั้งหมดพร้อมข้อมูลสินค้าและสถานะการขาย', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await loginadmin(page);
        await expect(page.getByTestId('page-admin-products')).toBeVisible();

        const productToClose = page.getByTestId('admin-product-row-P1');
        const p1Status = productToClose.getByTestId('admin-product-status');
        const originalStatus = (await p1Status.textContent())?.trim();

        try {
            // ปิด P1 เพื่อยืนยันว่า Admin เห็นสถานะ "ปิดขาย"
            if (originalStatus !== 'ปิดขาย') {
                await productToClose.getByTestId('admin-product-toggle-status').click();
            }
            await expect(p1Status).toHaveText('ปิดขาย');

            const products = page.locator('[data-testid^="admin-product-row-"]');
            await expect(products).toHaveCount(3);

            const expectedProducts = [
                { id: 'P1', name: 'Coffee Beans 250g', price: '450', weight: '300 g' },
                { id: 'P2', name: 'Drip Kettle', price: '1200', weight: '900 g' },
                { id: 'P3', name: 'Espresso Machine', price: '15000', weight: '8,000 g' },
            ];

            for (const expected of expectedProducts) {
                const product = page.getByTestId(`admin-product-row-${expected.id}`);

                await expect(product).toBeVisible();
                await expect(product.getByTestId('admin-product-id')).toContainText(expected.id);
                await expect(product.getByTestId('admin-product-name')).toHaveText(expected.name);
                await expect(product.getByTestId('admin-product-price'))
                    .toHaveAttribute('data-value', expected.price);
                await expect(product.getByTestId('admin-product-weight'))
                    .toContainText(expected.weight);

                const stock = product.getByTestId('admin-product-stock');
                await expect(stock).toHaveAttribute('data-value', /^\d+$/);
                expect(Number(await stock.getAttribute('data-value'))).toBeGreaterThanOrEqual(0);

                const sellingStatus = product.getByTestId('admin-product-status');
                await expect(sellingStatus).toBeVisible();
                await expect(sellingStatus).toHaveText(/^(เปิดขาย|ปิดขาย)$/);
            }

            // ยืนยันว่า P1 ซึ่งปิดขายอยู่ ยังแสดงในรายการของ Admin
            await expect(productToClose).toBeVisible();
            await expect(p1Status).toHaveText('ปิดขาย');
        } finally {
            // คืนสถานะเดิม เพื่อไม่ให้กระทบ test อื่น
            if (originalStatus !== 'ปิดขาย') {
                await productToClose.getByTestId('admin-product-toggle-status').click();
                await expect(p1Status).toHaveText('เปิดขาย');
            }
        }
    });
});

// ##################### FR-1.4 Admin เห็นข้อมูลสินค้าและคูปองตั้งต้นตาม SRS ########################
test('FR-1.4 Admin เห็นข้อมูลสินค้าและคูปองตั้งต้นตาม SRS', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await loginadmin(page);
    await expect(page.getByTestId('page-admin-products')).toBeVisible();

    const expectedProducts = [
        { id: 'P1', name: 'Coffee Beans 250g', price: '450', weight: '300', stock: '20' },
        { id: 'P2', name: 'Drip Kettle', price: '1200', weight: '900', stock: '3' },
        { id: 'P3', name: 'Espresso Machine', price: '15000', weight: '8000', stock: '5' },
    ];

    await expect(page.locator('[data-testid^="admin-product-row-"]'))
        .toHaveCount(expectedProducts.length);

    for (const expected of expectedProducts) {
        const product = page.getByTestId(`admin-product-row-${expected.id}`);

        await expect(product.getByTestId('admin-product-name')).toHaveText(expected.name);
        await expect(product.getByTestId('admin-product-price'))
            .toHaveAttribute('data-value', expected.price);
        await expect(product.getByTestId('admin-product-weight'))
            .toHaveAttribute('data-value', expected.weight);
        await expect(product.getByTestId('admin-product-stock'))
            .toHaveAttribute('data-value', expected.stock);
        await expect(product.getByTestId('admin-product-status'))
            .toHaveText('เปิดขาย');
    }

    await page.getByTestId('nav-admin-coupons').click();
    await expect(page.getByTestId('page-admin-coupons')).toBeVisible();

    const coupon = page.getByTestId('admin-coupon-row-SAVE10');
    await expect(coupon).toBeVisible();
    await expect(coupon.getByTestId('admin-coupon-percent'))
        .toHaveAttribute('data-value', '10');
    await expect(coupon.getByTestId('admin-coupon-min-spend'))
        .toHaveAttribute('data-value', '1000');
    await expect(coupon.getByTestId('admin-coupon-status'))
        .toHaveText('เปิดใช้');
});
