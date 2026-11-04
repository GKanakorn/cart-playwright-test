// tests/cart-quantity.spec.ts
import { Page } from '@playwright/test'
import { expect, test } from './test';

const baseURL = 'http://localhost:3000'

async function loginAsNormalCustomer(page: Page) {
    await page.goto(`${baseURL}/login`)
    await page.getByTestId('login-username').fill('cus_normal')
    await page.getByTestId('login-password').fill('normal123')
    await page.getByTestId('login-submit').click()
    //await expect(page).toHaveURL(/\/products$/)
    //await expect(page.getByTestId('page-products')).toBeVisible({ timeout: 60000 })
    //await expect(page.getByTestId('product-row-P1')).toBeVisible({ timeout: 60000 })
}

async function loginAsPrimeCustomer(page: Page) {
    await page.goto(`${baseURL}/login`)
    await page.getByTestId('login-username').fill('cus_prime')
    await page.getByTestId('login-password').fill('prime123')
    await page.getByTestId('login-submit').click()
    //await expect(page).toHaveURL(/\/products$/)
    //await expect(page.getByTestId('page-products')).toBeVisible({ timeout: 60000 })
    //await expect(page.getByTestId('product-row-P1')).toBeVisible({ timeout: 60000 })
}

async function loginAsAdmin(page: Page) {
    await page.goto(`${baseURL}/login`)
    await page.getByTestId('login-username').fill('admin01')
    await page.getByTestId('login-password').fill('admin123')
    await page.getByTestId('login-submit').click()
    //await expect(page).toHaveURL(/\/admin\/products$/)
    //await expect(page.getByTestId('page-admin-products')).toBeVisible({ timeout: 60000 })
}

async function addProductAndCheckoutAsCustomer_Normal(page: Page, username: string, productId: string, quantity: number) {
    await page.goto(`${baseURL}/login`)
    await page.getByTestId('login-username').fill(username)
    await page.getByTestId('login-password').fill('normal123')
    await page.getByTestId('login-submit').click()
    //await expect(page).toHaveURL(/\/products$/)

    const product = page.getByTestId(`product-row-${productId}`)
    await product.getByTestId('product-add-qty').fill(quantity.toString())
    await product.getByTestId('product-add-button').click()
    await expect(page.getByTestId('product-add-success-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว')
    await page.getByTestId('nav-cart').click()
    await page.getByTestId('zone-select').selectOption('inCity')
    await page.getByTestId('speed-select').selectOption('standard')
    await page.getByTestId('checkout-button').click()
    await expect(page.getByTestId('page-checkout')).toBeVisible({ timeout: 60000 });
    await page.getByTestId('logout-button').click()
}

async function addProductAndCheckoutAsCustomer_Prime(page: Page, username: string, productId: string, quantity: number) {
    await page.goto(`${baseURL}/login`)
    await page.getByTestId('login-username').fill(username)
    await page.getByTestId('login-password').fill('prime123')
    await page.getByTestId('login-submit').click()
    //await expect(page).toHaveURL(/\/products$/)

    const product = page.getByTestId(`product-row-${productId}`)
    await product.getByTestId('product-add-qty').fill(quantity.toString())
    await product.getByTestId('product-add-button').click()
    await expect(page.getByTestId('product-add-success-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว')
    await page.getByTestId('nav-cart').click()
    await page.getByTestId('zone-select').selectOption('inCity')
    await page.getByTestId('speed-select').selectOption('standard')
    await page.getByTestId('checkout-button').click()
    await expect(page.getByTestId('page-checkout')).toBeVisible({ timeout: 60000 });
    await page.getByTestId('logout-button').click()
}

test('AC-1: Given cus_normal อยู่ stage ตะกร้า และตะกร้าว่าง When เรียก addItem(P1, 0) Then ระบบปฏิเสธด้วย QTY_OUT_OF_RANGE และตะกร้ายังว่าง', async ({ page }) => {
    await loginAsNormalCustomer(page);
    await page.getByTestId('nav-products').click();

    const product = page.getByTestId('product-row-P1')
    const addQuantity = product.getByTestId('product-add-qty');
    await expect(addQuantity).toBeVisible({ timeout: 60000 });
    await addQuantity.fill('0')

    await expect(page.getByTestId('product-quantity-error-P1')).toContainText('จำนวนต้องอยู่ระหว่าง 1 ถึง 10');
    await expect(product.getByTestId('product-add-button')).toBeDisabled()

    await page.getByTestId('nav-cart').click()
    await expect(page.getByText('ตะกร้าว่าง')).toBeVisible()
    await expect(page.locator('cart-line-P1')).toHaveCount(0)
})

test('AC-2: Given ตะกร้าของ cus_normal มี P1 quantity 8 When เรียก addItem(P1, 3) Then ระบบปฏิเสธด้วย INSUFFICIENT_STOCK และ P1 ยังมี quantity 8', async ({ page }) => {
    await loginAsNormalCustomer(page);
    await page.getByTestId('nav-products').click();

    const product = page.getByTestId('product-row-P1')
    const addQuantity = product.getByTestId('product-add-qty');
    await expect(addQuantity).toBeVisible({ timeout: 60000 });
    await addQuantity.fill('8')
    await product.getByTestId('product-add-button').click()
    await expect(page.getByTestId('product-add-success-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

    await page.getByTestId('nav-cart').click();
    const cartLine = page.getByTestId('cart-line-P1')
    await expect(cartLine.getByTestId('cart-line-qty-input')).toHaveValue('8')

    await page.getByTestId('nav-products').click();
    const addMore = page.getByTestId('product-row-P1')
    const addMoreQuantity = addMore.getByTestId('product-add-qty');
    await expect(addMoreQuantity).toBeVisible({ timeout: 60000 });
    await addMoreQuantity.fill('3')
    await expect(page.getByTestId('product-quantity-error-P1')).toContainText('จำนวนต้องอยู่ระหว่าง 1 ถึง 10');

    await page.getByTestId('nav-cart').click()
    await expect(
        page.getByTestId('cart-line-P1').getByTestId('cart-line-qty-input'),
    ).toHaveValue('8')
})

test('AC-3: Given ตะกร้าของ cus_normal มี P2 quantity 2 When เรียก addItem(P2, 2) Then ระบบปฏิเสธด้วย QTY_OUT_OF_RANGE และ P2 ยังมี quantity 2', async ({ page }) => {
    await loginAsNormalCustomer(page);
    await page.getByTestId('nav-products').click();

    const p2 = page.getByTestId('product-row-P2');
    const addQuantity = p2.getByTestId('product-add-qty');
    await expect(addQuantity).toBeVisible({ timeout: 60000 });
    await addQuantity.fill('2');
    await p2.getByTestId('product-add-button').click();
    await expect(page.getByTestId('product-add-success-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

    await expect(addQuantity).toBeVisible({ timeout: 60000 });
    await addQuantity.fill('2');
    await p2.getByTestId('product-add-button').click();
    await expect(page.getByTestId('product-quantity-error-P2')).toContainText('สินค้าเหลือ 3 ชิ้น');

    await page.getByTestId('nav-cart').click();
    await expect(page.getByTestId('cart-line-P2').getByTestId('cart-line-qty-input')).toHaveValue('2');
});

test('AC-4: Given ตะกร้าของ cus_prime มี P1 × 1 และ P2 × 1 (ยอดรวมสินค้า 1,650, น้ำหนักรวม 1,200 กรัม) และผูกคูปอง SAVE10 When เรียก pressCheckout(inCity, standard) Then ออเดอร์มีส่วนลด 165 (จากคูปอง ไม่มีส่วนลดสมาชิก), ค่าจัดส่ง 0, ยอดชำระสุทธิ 1,485', async ({ page }) => {
    await loginAsPrimeCustomer(page);
    await page.getByTestId('nav-products').click();

    const p1 = page.getByTestId('product-row-P1');
    await p1.getByTestId('product-add-qty').fill('1');
    await p1.getByTestId('product-add-button').click();
    await expect(page.getByTestId('product-add-success-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

    const p2 = page.getByTestId('product-row-P2');
    await p2.getByTestId('product-add-qty').fill('1');
    await p2.getByTestId('product-add-button').click();
    await expect(page.getByTestId('product-add-success-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

    await page.getByTestId('nav-cart').click();
    await expect(page.getByTestId('cart-subtotal')).toContainText('฿1,650');

    await page.getByTestId('coupon-input').fill('SAVE10');
    await page.getByTestId('coupon-apply').click();
    await expect(page.getByTestId('cart-coupon-code')).toHaveText('SAVE10');

    await page.getByTestId('zone-select').selectOption('inCity');
    await page.getByTestId('speed-select').selectOption('standard');
    await page.getByTestId('checkout-button').click();
    await expect(page).toHaveURL(/\/checkout$/);

    await expect(page.getByTestId('checkout-discount')).toContainText('฿165');
    await expect(page.getByTestId('checkout-shipping')).toContainText('฿0');
    await expect(page.getByTestId('checkout-total')).toContainText('฿1,485');
});

test('AC-5: Given ตะกร้าของ cus_prime มี P1 × 1 และ P2 × 1 (ยอดรวมสินค้า 1,650) และไม่มีคูปองผูก When เรียก pressCheckout(inCity, standard) Then ส่วนลดสมาชิก = floor(82.5) = 82, ค่าจัดส่ง 0, ยอดชำระสุทธิ 1,568', async ({ page }) => {
    await loginAsPrimeCustomer(page);
    await page.getByTestId('nav-products').click();

    const p1 = page.getByTestId('product-row-P1');
    await p1.getByTestId('product-add-qty').fill('1');
    await p1.getByTestId('product-add-button').click();
    await expect(page.getByTestId('product-add-success-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

    const p2 = page.getByTestId('product-row-P2');
    await p2.getByTestId('product-add-qty').fill('1');
    await p2.getByTestId('product-add-button').click();
    await expect(page.getByTestId('product-add-success-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

    await page.getByTestId('nav-cart').click();
    await expect(page.getByTestId('cart-subtotal')).toContainText('฿1,650');


    await page.getByTestId('zone-select').selectOption('inCity');
    await page.getByTestId('speed-select').selectOption('standard');
    await page.getByTestId('checkout-button').click();
    await expect(page).toHaveURL(/\/checkout$/);

    await expect(page.getByTestId('checkout-discount')).toContainText('฿82');
    await expect(page.getByTestId('checkout-shipping')).toContainText('฿0');
    await expect(page.getByTestId('checkout-total')).toContainText('฿1,568');
});

test('AC-6: Given ตะกร้าของ cus_prime มี P1 × 2 (ยอดรวมสินค้า 900, น้ำหนักรวม 600 กรัม) และผูกคูปอง SAVE10 When เรียก pressCheckout(upcountry, express) Then ระบบถอดคูปองพร้อม notice COUPON_NOT_APPLICABLE, ส่วนลดสมาชิก 45, ค่าจัดส่ง 25, ยอดชำระสุทธิ 880', async ({ page }) => {
    await loginAsPrimeCustomer(page);
    await page.getByTestId('nav-products').click();

    const p1 = page.getByTestId('product-row-P1');
    await p1.getByTestId('product-add-qty').fill('2');
    await p1.getByTestId('product-add-button').click();
    await expect(page.getByTestId('product-add-success-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

    await page.getByTestId('nav-cart').click();
    await expect(page.getByTestId('cart-subtotal')).toContainText('฿900');

    await page.getByTestId('coupon-input').fill('SAVE10');
    await page.getByTestId('coupon-apply').click();
    await expect(page.getByTestId('cart-coupon-code')).toHaveText('SAVE10');

    await page.getByTestId('zone-select').selectOption('upcountry');
    await page.getByTestId('speed-select').selectOption('express');
    await page.getByTestId('checkout-button').click();
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByTestId('app-message')).toContainText('คูปองไม่สามารถใช้กับคำสั่งซื้อนี้')

    await expect(page.getByTestId('checkout-discount')).toContainText('฿45');
    await expect(page.getByTestId('checkout-shipping')).toContainText('฿25');
    await expect(page.getByTestId('checkout-total')).toContainText('฿880');
});

test('AC-7: Given ตะกร้าของ cus_normal มี P2 × 1 (ยอดรวมสินค้า 1,200, น้ำหนักรวม 900 กรัม) และผูกคูปอง SAVE10 And admin01 เรียก setCouponStatus(SAVE10, ปิดใช้) When cus_normal เรียก pressCheckout(inCity, standard) Then ระบบถอดคูปองพร้อม notice COUPON_NOT_APPLICABLE, ส่วนลด 0, ค่าจัดส่ง 30, ยอดชำระสุทธิ 1,230', async ({ page }) => {
    await loginAsNormalCustomer(page);
    await page.getByTestId('nav-products').click();

    const p2 = page.getByTestId('product-row-P2');
    await p2.getByTestId('product-add-qty').fill('1');
    await p2.getByTestId('product-add-button').click();
    await expect(page.getByTestId('product-add-success-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

    await page.getByTestId('nav-cart').click();
    await expect(page.getByTestId('cart-subtotal')).toContainText('฿1,200');

    await page.getByTestId('coupon-input').fill('SAVE10');
    await page.getByTestId('coupon-apply').click();
    await expect(page.getByTestId('cart-coupon-code')).toHaveText('SAVE10');

    await page.getByTestId('logout-button').click();

    // admin ปิดคูปอง SAVE10
    await loginAsAdmin(page);
    await page.getByTestId('nav-admin-coupons').click();
    await page.getByTestId('admin-coupon-toggle-status').click();
    await expect(page.getByTestId('admin-coupon-status')).toContainText('ปิดใช้');
    await page.getByTestId('logout-button').click();

    // กลับไป cus_normal
    await loginAsNormalCustomer(page);
    await page.getByTestId('nav-cart').click();
    await page.getByTestId('zone-select').selectOption('inCity');
    await page.getByTestId('speed-select').selectOption('standard');
    await page.getByTestId('checkout-button').click();
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByTestId('app-message')).toContainText('คูปองไม่สามารถใช้กับคำสั่งซื้อนี้')

    await expect(page.getByTestId('checkout-discount')).toContainText('฿0');
    await expect(page.getByTestId('checkout-shipping')).toContainText('฿30');
    await expect(page.getByTestId('checkout-total')).toContainText('฿1,230');
});

test('AC-8: Given ตะกร้าของ cus_normal มี P3 × 1 (ยอดรวมสินค้า 15,000, น้ำหนักรวม 8,000 กรัม) และไม่มีคูปองผูก When เรียก pressCheckout(remote, express) Then ส่วนลด 0, ค่าจัดส่ง 270, ยอดชำระสุทธิ 15,270', async ({ page }) => {
    await loginAsNormalCustomer(page);
    await page.getByTestId('nav-products').click();

    const p3 = page.getByTestId('product-row-P3');
    await p3.getByTestId('product-add-qty').fill('1');
    await p3.getByTestId('product-add-button').click();
    await expect(page.getByTestId('product-add-success-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

    await page.getByTestId('nav-cart').click();
    await expect(page.getByTestId('cart-subtotal')).toContainText('฿15,000');

    await page.getByTestId('zone-select').selectOption('remote');
    await page.getByTestId('speed-select').selectOption('express');
    await page.getByTestId('checkout-button').click();
    await expect(page).toHaveURL(/\/checkout$/);

    await expect(page.getByTestId('checkout-discount')).toContainText('฿0');
    await expect(page.getByTestId('checkout-shipping')).toContainText('฿270');
    await expect(page.getByTestId('checkout-total')).toContainText('฿15,270');
});

test('AC-9: Given ตะกร้าของ cus_normal มี P3 × 3 (น้ำหนักรวม 24,000 กรัม) When เรียก pressCheckout(inCity, standard) Then ระบบปฏิเสธด้วย WEIGHT_LIMIT_EXCEEDED, cus_normal ยังอยู่ stage ตะกร้า และตะกร้าคงเดิม', async ({ page }) => {
    await loginAsNormalCustomer(page);
    await page.getByTestId('nav-products').click();

    const p3 = page.getByTestId('product-row-P3');
    await p3.getByTestId('product-add-qty').fill('3');
    await p3.getByTestId('product-add-button').click();
    await expect(page.getByTestId('product-add-success-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

    await page.getByTestId('nav-cart').click();
    await expect(page.getByTestId('cart-subtotal')).toContainText('฿45,000');

    await page.getByTestId('zone-select').selectOption('inCity');
    await page.getByTestId('speed-select').selectOption('standard');
    await page.getByTestId('checkout-button').click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByTestId('app-message')).toContainText('น้ำหนักรวมเกิน 20,000 กรัม');
});

test('AC-10: Given ตะกร้าของ cus_normal มี P1 × 1 And admin01 เรียก setProductStatus(P1, ปิดขาย) When cus_normal เรียก pressCheckout(inCity, standard) Then ระบบปฏิเสธด้วย ITEMS_UNAVAILABLE ระบุ [P1] และตะกร้าคงเดิม', async ({ page }) => {
    await loginAsNormalCustomer(page);
    await page.getByTestId('nav-products').click();

    const p1 = page.getByTestId('product-row-P1');
    await expect(p1).toBeVisible({ timeout: 60000 });
    await p1.getByTestId('product-add-qty').fill('1');
    await p1.getByTestId('product-add-button').click();
    await expect(page.getByTestId('product-add-success-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

    await page.getByTestId('nav-cart').click();
    await expect(page.getByTestId('cart-subtotal')).toContainText('฿450');

    await page.getByTestId('logout-button').click();

    // admin ปิดขาย P1
    await loginAsAdmin(page);
    await page.getByTestId('nav-admin-products').click();
    await page.getByTestId('admin-product-row-P1').getByTestId('admin-product-toggle-status').click();
    await expect(page.getByTestId('admin-product-row-P1').getByTestId('admin-product-status')).toContainText('ปิดขาย');
    await page.getByTestId('logout-button').click();

    // กลับไป cus_normal
    await loginAsNormalCustomer(page);
    await page.getByTestId('nav-cart').click();
    await page.getByTestId('zone-select').selectOption('inCity');
    await page.getByTestId('speed-select').selectOption('standard');
    await page.getByTestId('checkout-button').click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByTestId('app-message')).toContainText('มีสินค้าที่ไม่พร้อมขาย (P1)');
    await expect(page.getByTestId('cart-line-availability')).toContainText('ไม่พร้อมขาย');
});

test.describe('AC-11', () => {
    test('AC-11a: Given cus_normal อยู่ stage ตะกร้า และตะกร้ามี P2 × 3 (สต็อกพร้อมขายของ P2 = 3) When cus_normal เรียก pressCheckout(inCity, standard) Then ระบบสร้างออเดอร์สถานะ รอชำระเงิน, cus_normal อยู่ stage ชำระเงิน และสต็อกพร้อมขายของ P2 = 0', async ({ page }) => {
        await loginAsNormalCustomer(page);
        await page.getByTestId('nav-products').click();

        const p2 = page.getByTestId('product-row-P2');
        await p2.getByTestId('product-add-qty').fill('3');
        await p2.getByTestId('product-add-button').click();
        await expect(page.getByTestId('product-add-success-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

        await page.getByTestId('nav-cart').click();
        await expect(page.getByTestId('cart-subtotal')).toContainText('฿3,600');
        await page.getByTestId('zone-select').selectOption('inCity');
        await page.getByTestId('speed-select').selectOption('standard');
        await page.getByTestId('checkout-button').click();
        await expect(page).toHaveURL(/\/checkout$/);
        await expect(page.getByTestId('checkout-order-status')).toContainText('รอชำระเงิน');
        // ตรวจเช็คสต็อกของ P2
        await loginAsAdmin(page);
        await page.getByTestId('nav-admin-products').click();
        await expect(page.getByTestId('admin-product-row-P2').getByTestId('admin-product-stock')).toHaveText('0');
    });

    test('AC-11b: Given ตะกร้าของ cus_prime มี P2 × 1 (เพิ่มไว้ก่อนที่ cus_normal จะ checkout) And cus_normal มีออเดอร์สถานะ รอชำระเงิน ที่จอง P2 × 3 ไว้ (สต็อกพร้อมขายของ P2 = 0) When cus_prime เรียก pressCheckout(inCity, standard) Then ระบบปฏิเสธด้วย ITEMS_UNAVAILABLE ระบุ [P2], cus_prime ยังอยู่ stage ตะกร้า และตะกร้าคงเดิม', async ({ page }) => {
        await loginAsPrimeCustomer(page);
        await page.getByTestId('nav-products').click();
        const p2 = page.getByTestId('product-row-P2');
        await p2.getByTestId('product-add-qty').fill('1');
        await p2.getByTestId('product-add-button').click();
        await expect(page.getByTestId('product-add-success-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');
        await page.getByTestId('logout-button').click();

        await addProductAndCheckoutAsCustomer_Normal(page, 'cus_normal', 'P2', 3);

        await loginAsPrimeCustomer(page);
        await page.getByTestId('nav-cart').click();
        await expect(page.getByTestId('cart-subtotal')).toContainText('฿1,200');
        await page.getByTestId('zone-select').selectOption('inCity');
        await page.getByTestId('speed-select').selectOption('standard');
        await page.getByTestId('checkout-button').click();
        await expect(page).toHaveURL(/\/cart$/);
        await expect(page.getByTestId('cart-line-availability')).toContainText('ไม่พร้อมขาย');
        await expect(page.getByTestId('app-message')).toContainText('มีสินค้าที่ไม่พร้อมขาย (P2)');
    });

    test('AC-11c: Given ตะกร้าของ cus_prime ว่าง And cus_normal มีออเดอร์สถานะ รอชำระเงิน ที่จอง P2 × 3 ไว้ (สต็อกพร้อมขายของ P2 = 0) When cus_prime เรียก addItem(P2, 1) Then ระบบปฏิเสธด้วย PRODUCT_UNAVAILABLE และตะกร้าของ cus_prime ยังว่าง', async ({ page }) => {
        await loginAsPrimeCustomer(page);
        await page.getByTestId('nav-products').click();
        await page.getByTestId('nav-cart').click();
        await expect(page.getByTestId('app-message')).toContainText('ตะกร้าว่าง');
        await page.getByTestId('logout-button').click();

        await addProductAndCheckoutAsCustomer_Normal(page, 'cus_normal', 'P2', 3);

        await loginAsPrimeCustomer(page);
        await page.getByTestId('nav-products').click();
        await page.getByTestId('nav-products').click();
        await expect(page.getByTestId('product-row-P2')).toHaveCount(0);

        await page.getByTestId('nav-cart').click();
        await expect(page.getByTestId('app-message')).toContainText('ตะกร้าว่าง');
    });
});

test('AC-12:Given cus_normal อยู่ stage ชำระเงิน กับออเดอร์สถานะ รอชำระเงิน ที่มี P2 × 3 And ตะกร้าของ cus_normal มี P2 × 3 และสต็อกพร้อมขายของ P2 = 0 When cus_normal เรียก cancelCheckout() Then ออเดอร์มีสถานะ ยกเลิก, สต็อกพร้อมขายของ P2 = 3, cus_normal อยู่ stage ตะกร้า และตะกร้ามี P2 × 3', async ({ page }) => {
    await loginAsNormalCustomer(page);
    await page.getByTestId('nav-products').click();

    const p2 = page.getByTestId('product-row-P2');
    await p2.getByTestId('product-add-qty').fill('3');
    await p2.getByTestId('product-add-button').click();
    await expect(page.getByTestId('product-add-success-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

    await page.getByTestId('nav-cart').click();
    await expect(page.getByTestId('cart-subtotal')).toContainText('฿3,600');
    await page.getByTestId('zone-select').selectOption('inCity');
    await page.getByTestId('speed-select').selectOption('standard');
    await page.getByTestId('checkout-button').click();
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByTestId('checkout-order-status')).toContainText('รอชำระเงิน');

    await page.getByTestId('cancel-checkout-button').click();
    await expect(page).toHaveURL(/\/cart$/);
    await page.getByTestId('logout-button').click();

    // ตรวจเช็คสต็อกของ P2
    await loginAsAdmin(page);
    await page.getByTestId('nav-admin-products').click();
    await expect(page.getByTestId('admin-product-row-P2').getByTestId('admin-product-stock')).toHaveText('3');
    await page.getByTestId('logout-button').click();

    // ตรวจเช็คตะกร้าของ cus_normal
    await loginAsNormalCustomer(page);
    await page.getByTestId('nav-cart').click();
    await expect(page.getByTestId('cart-subtotal')).toContainText('฿3,600');
    await expect(page.getByTestId('cart-line-P2').getByTestId('cart-line-qty-input')).toHaveValue('3')
});

test('AC-13: Given cus_normal มีออเดอร์สถานะ รอชำระเงิน ที่มี P1 ราคา 450 When admin01 เรียก updateProduct(P1, price = 500) Then viewOrder ของออเดอร์นั้นยังแสดงราคา P1 = 450 และ viewCart ของ Customer ที่มี P1 ในตะกร้าแสดงราคา 500', async ({ page }) => {
    await addProductAndCheckoutAsCustomer_Normal(page, 'cus_normal', 'P1', 1);

    // ตรวจเช็ค viewOrder ของ cus_normal
    await loginAsNormalCustomer(page);
    await expect(page.getByTestId('checkout-unit-price-P1')).toContainText('฿450');
    await page.getByTestId('logout-button').click();

    // admin เปลี่ยนราคา P1 เป็น 500
    await loginAsAdmin(page);
    await page.getByTestId('nav-admin-products').click();
    await page.getByTestId('admin-product-row-P1').getByTestId('admin-product-price-input').click();
    await page.getByTestId('admin-product-row-P1').getByTestId('admin-product-price-input').fill('500');
    await page.getByTestId('admin-product-row-P1').getByTestId('admin-product-save').click();
    await expect(page.getByTestId('admin-product-row-P1').getByTestId('admin-product-price')).toContainText('฿500');
    await page.getByTestId('logout-button').click();

    // ตรวจเช็ค viewOrder ของ cus_normal หลังเปลี่ยนราคา
    await loginAsNormalCustomer(page);
    await expect(page.getByTestId('checkout-unit-price-P1')).toContainText('฿450');
    await page.getByTestId('cancel-checkout-button').click();

    //ตรวจเช็ค viewCart ของ cus_normal หลังเปลี่ยนราคา
    await page.getByTestId('nav-cart').click();
    await expect(page.getByTestId('cart-line-P1').getByTestId('cart-line-unit-price'),).toContainText('฿500')
});

test('AC-14: Given cus_normal login แล้ว When เรียก updateProduct(P1, price = 500) Then ระบบปฏิเสธด้วย AUTH_FORBIDDEN และราคาของ P1 ยังเป็น 450', async ({ page }) => {
    await loginAsNormalCustomer(page);
    await page.goto(`${baseURL}/admin/products`);

    await expect(page).toHaveURL(/\/login/);

    await loginAsAdmin(page);
    await page.getByTestId('nav-admin-products').click();

    await expect(
        page.getByTestId('admin-product-row-P1').getByTestId('admin-product-price'),
    ).toContainText('฿450');
});

test('AC-15:  Given cus_normal มีออเดอร์ที่มี orderId = X When cus_prime เรียก viewOrder(X) Then ระบบปฏิเสธด้วย ORDER_NOT_FOUND', async ({ page }) => {
    await addProductAndCheckoutAsCustomer_Normal(page, 'cus_normal', 'P1', 1);

    // ตรวจเช็คออเดอร์ของ cus_normal
    await loginAsNormalCustomer(page);
    await page.getByTestId('nav-orders').click();
    await page.getByTestId('order-view').click();
    await expect(page.getByTestId('order-id-ORD-000001')).toContainText('ORD-000001');
    await expect(page.getByTestId('order-line-P1').getByTestId('order-line-unit-price'),).toContainText('฿450')
    await page.getByTestId('logout-button').click();

    // ตรวจเช็คออเดอร์ของ cus_prime
    await loginAsPrimeCustomer(page);
    await page.getByTestId('nav-orders').click();
    await expect(page.getByTestId(/^order-id-ORD-/)).toHaveCount(0);
    await expect(page.getByRole('paragraph')).toContainText('ยังไม่มีออเดอร์');
});

test('AC-16: Given admin01 login แล้ว When เรียก updateProduct(P1, price = 0, stock = 10000) Then ระบบปฏิเสธด้วย VALIDATION_ERROR ระบุฟิลด์ [price, stock] และ P1 ยังมีราคา 450 สต็อกพร้อมขาย 20', async ({ page }) => {
    await loginAsAdmin(page)

    await page.getByTestId('nav-admin-products').click();
    await expect(page.getByTestId('admin-product-row-P1')).toBeVisible();
    await expect(page.getByTestId('admin-product-row-P1').getByTestId('admin-product-price')).toContainText('฿450');
    await expect(page.getByTestId('admin-product-row-P1').getByTestId('admin-product-stock')).toContainText('20');

    await page.getByTestId('admin-product-row-P1').getByTestId('admin-product-price-input').fill('0');
    await page.getByTestId('admin-product-row-P1').getByTestId('admin-product-stock-input').fill('10000');
    await page.getByTestId('admin-product-row-P1').getByTestId('admin-product-save').click();

    await expect(page.getByTestId('admin-product-row-P1')).toContainText('ราคาต้องเป็นจำนวนเต็ม 1 ถึง 50,000');
    await expect(page.getByTestId('admin-product-row-P1')).toContainText('สต็อกต้องเป็นจำนวนเต็ม 0 ถึง 9,999');
    await expect(page.getByTestId('app-message')).toContainText('กรุณาตรวจสอบค่าราคาและสต็อก');

    // โหลดข้อมูลจากระบบอีกครั้งเพื่อยืนยันว่าค่าที่บันทึกอยู่ยังเป็นค่าเดิม
    await page.reload();
    await expect(page.getByTestId('admin-product-row-P1').getByTestId('admin-product-price')).toContainText('฿450');
    await expect(page.getByTestId('admin-product-row-P1').getByTestId('admin-product-stock')).toContainText('20');
});

test('AC-17: Given cus_normal อยู่ stage ชำระเงิน When เรียก addItem(P1, 1) Then ระบบส่งกลับ OPERATION_NOT_ALLOWED และตะกร้า stage และสต็อกคงเดิม', async ({ page }) => {
    await addProductAndCheckoutAsCustomer_Normal(page, 'cus_normal', 'P1', 1)

    await loginAsNormalCustomer(page);
    await expect(page.getByTestId('page-checkout')).toBeVisible()
    await expect(page.getByTestId('checkout-order-status')).toHaveText('รอชำระเงิน')

    const orderId = await page.getByTestId('checkout-order-id').textContent()

    // ลองเปิดหน้าสินค้าขณะยังอยู่ใน stage ชำระเงิน
    await page.goto(`${baseURL}/products`)

    // ระบบต้องพากลับไป checkout และคงออเดอร์เดิมไว้
    await expect(page).toHaveURL(/\/checkout$/)
    await expect(page.getByTestId('page-checkout')).toBeVisible()
    await expect(page.getByTestId('checkout-order-status')).toHaveText('รอชำระเงิน')
    await expect(page.getByTestId('checkout-order-id')).toHaveText(orderId!)
});

test.describe('AC-18', () => {
    test('AC-18a: Given cus_normal อยู่ stage ชำระเงิน กับออเดอร์ Z สถานะ รอชำระเงิน When gateway เรียก paySuccess(Z) Then ออเดอร์ Z มีสถานะ ชำระเงินแล้ว, ตะกร้าของ cus_normal มีจำนวนรายการเป็นศูนย์และไม่มีคูปองผูก และ cus_normal อยู่ stage สำเร็จ.', async ({ page }) => {
        await loginAsNormalCustomer(page)

        // เพิ่ม P2 เพื่อให้ยอดถึงขั้นต่ำของคูปอง SAVE10
        await page.getByTestId('nav-products').click();
        const productP2 = page.getByTestId('product-row-P2')
        await productP2.getByTestId('product-add-qty').fill('1')
        await productP2.getByTestId('product-add-button').click()

        // ผูกคูปองกับตะกร้าก่อน checkout
        await page.getByTestId('nav-cart').click();
        await page.getByTestId('coupon-input').fill('SAVE10')
        await page.getByTestId('coupon-apply').click()
        await expect(page.getByTestId('cart-coupon-code')).toHaveText('SAVE10')

        await page.getByTestId('checkout-button').click()
        await expect(page.getByTestId('page-checkout')).toBeVisible()
        await expect(page.getByTestId('checkout-order-status')).toHaveText('รอชำระเงิน')

        const orderId = await page.getByTestId('checkout-order-id').textContent()

        await page.getByTestId('gateway-pay-success').click()

        await expect(page.getByTestId('page-success')).toBeVisible()
        await expect(page.getByTestId('success-order-id')).toHaveText(orderId!)
        await expect(page.getByTestId('page-success')).toContainText('ชำระเงินแล้ว')

        // เปิดตะกร้าหลังเลือกซื้อสินค้าต่อ เพื่อตรวจว่ารายการและคูปองถูกล้างแล้ว
        await page.getByTestId('continue-shopping-button').click()
        await page.getByTestId('nav-cart').click()

        await expect(page.getByTestId('page-cart')).toBeVisible()
        await expect(page.getByTestId('cart-line-P2')).toHaveCount(0)
        await expect(page.getByTestId('cart-coupon-code')).toHaveCount(0)
        await expect(page.getByText('ตะกร้าว่าง')).toBeVisible()
    });

    test('AC-18b: Given cus_normal อยู่ stage สำเร็จ When cus_normal เรียก continueShopping() Then cus_normal อยู่ stage ตะกร้า ที่มีจำนวนรายการเป็นศูนย์', async ({ page }) => {
        await addProductAndCheckoutAsCustomer_Normal(page, 'cus_normal', 'P2', 3);

        await loginAsNormalCustomer(page);
        await page.getByTestId('gateway-pay-success').click()
        await expect(page.getByTestId('page-success')).toBeVisible()
        await expect(page.getByTestId('page-success')).toContainText('ชำระเงินแล้ว')

        await page.getByTestId('continue-shopping-button').click()
        await expect(page).toHaveURL(/\/products$/)

        // ยืนยันว่า stage กลับเป็นตะกร้าและไม่มีสินค้า
        await page.getByTestId('nav-cart').click()
        await expect(page.getByTestId('page-cart')).toBeVisible()
        await expect(page.getByText('ตะกร้าว่าง')).toBeVisible()
        await expect(page.getByTestId('cart-line-P1')).toHaveCount(0)
    });
});

test.describe('AC-19', () => {
    test('AC-19a: Given admin01 login แล้ว และ SAVE10 มีสถานะ เปิดใช้ When admin01 เรียก setCouponStatus(SAVE10, ปิดใช้) Then ระบบเปลี่ยนสถานะของ SAVE10 เป็น ปิดใช้', async ({ page }) => {
        await loginAsAdmin(page);
        await page.getByTestId('nav-admin-coupons').click();
        await expect(page.getByTestId('page-admin-coupons')).toBeVisible();

        const coupon = page.getByTestId('admin-coupon-row-SAVE10');
        const status = coupon.getByTestId('admin-coupon-status');
        await expect(status).toHaveText('เปิดใช้');
        await coupon.getByTestId('admin-coupon-toggle-status').click();
        await expect(status).toHaveText('ปิดใช้');
    });

    test('AC-19b: Given admin01 login แล้ว และ SAVE10 มีสถานะ ปิดใช้ When admin01 เรียก listCoupons() Then รายการแสดง SAVE10 ที่มี percent 10, minSpend 1,000 และสถานะ ปิดใช้', async ({ page }) => {
        await loginAsAdmin(page);
        await page.getByTestId('nav-admin-coupons').click();
        await expect(page.getByTestId('page-admin-coupons')).toBeVisible();

        const coupon = page.getByTestId('admin-coupon-row-SAVE10');
        const status = coupon.getByTestId('admin-coupon-status');
        if (await status.textContent() !== 'ปิดใช้') {
            await coupon.getByTestId('admin-coupon-toggle-status').click();
        }

        await expect(coupon).toBeVisible();
        await expect(page.getByTestId('admin-coupon-percent')).toContainText('10%');
        await expect(page.getByTestId('admin-coupon-min-spend')).toContainText('฿1,000');
        await expect(status).toHaveText('ปิดใช้');
    });
});
