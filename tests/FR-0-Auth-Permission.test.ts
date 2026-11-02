import { test, expect } from '@playwright/test';
import { createPaidOrder, loginadmin, logincus_normal, logincus_prime } from './helper.function';

test('has title', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle('Roast & Roll');
});
// ##################### FR-0.1 การ Login ######################## 
test('FR-0.1.1 valid login credentials with customer_normal role', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('login-username').click();
    await page.getByTestId('login-username').fill('cus_normal');
    await page.getByTestId('login-password').click();
    await page.getByTestId('login-password').fill('123456');
    await page.getByTestId('login-submit').click();
    await expect(page.getByText('cus_normal')).toBeVisible();
    await expect(page.getByText('customer')).toBeVisible();
    await expect(page.getByTestId('nav-products')).toBeVisible();
    await expect(page.getByTestId('nav-cart')).toBeVisible();
    await expect(page.getByTestId('nav-orders')).toBeVisible();
});

test('FR-0.1.1 valid login credentials with customer_prime role', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('login-username').click();
    await page.getByTestId('login-username').fill('cus_prime');
    await page.getByTestId('login-password').click();
    await page.getByTestId('login-password').fill('123456');
    await page.getByTestId('login-submit').click();
    await expect(page.getByText('cus_prime')).toBeVisible();
    await expect(page.getByText('customer')).toBeVisible();
    await expect(page.getByTestId('nav-products')).toBeVisible();
    await expect(page.getByTestId('nav-cart')).toBeVisible();
    await expect(page.getByTestId('nav-orders')).toBeVisible();
});

test('FR-0.1.1 valid login credentials with admin role', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('login-username').click();
    await page.getByTestId('login-username').fill('admin01');
    await page.getByTestId('login-password').click();
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();
    await expect(page.getByText('admin01')).toBeVisible();
    await expect(page.getByText('ผู้ดูแล')).toBeVisible();
    await expect(page.getByTestId('nav-admin-products')).toBeVisible();
    await expect(page.getByTestId('nav-admin-coupons')).toBeVisible();
});

test('FR-0.1.2 invalid login credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('login-username').click();
    await page.getByTestId('login-username').fill('cus_normal');
    await page.getByTestId('login-password').click();
    await page.getByTestId('login-password').fill('12345');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('app-message')).toContainText('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
});

test('FR-0.1.2 don\'t fill username', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('login-username').click();
    await page.getByTestId('login-username').fill('');
    await page.getByTestId('login-password').click();
    await page.getByTestId('login-password').fill('12345');
    await page.getByTestId('login-submit').click();
    await expect(page.locator('#login-username-error')).toContainText('กรุณากรอก Username');
});

test('FR-0.1.2 don\'t fill password', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('login-username').click();
    await page.getByTestId('login-username').fill('cus_normal');
    await page.getByTestId('login-password').click();
    await page.getByTestId('login-password').fill('');
    await page.getByTestId('login-submit').click();
    await expect(page.locator('#login-password-error')).toContainText('กรุณากรอก Password');
});

test('FR-0.1.2 don\'t fill all fields', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByTestId('login-username').click();
    await page.getByTestId('login-username').fill('');
    await page.getByTestId('login-password').click();
    await page.getByTestId('login-password').fill('');
    await page.getByTestId('login-submit').click();
    await expect(page.locator('#login-username-error')).toContainText('กรุณากรอก Username');
    await expect(page.locator('#login-password-error')).toContainText('กรุณากรอก Password');
});

// ##################### FR-0.2 การเข้าถึงเว็บไซต์โดยไม่ต้อง login ######################## 
test('FR-0.2 access /products without login', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    await expect(page.getByTestId('app-message')).toContainText('กรุณาเข้าสู่ระบบก่อน');
});

test('FR-0.2 access /cart without login', async ({ page }) => {
    await page.goto('http://localhost:3000/cart');
    await expect(page.getByTestId('app-message')).toContainText('กรุณาเข้าสู่ระบบก่อน');
});

test('FR-0.2 access /checkout without login', async ({ page }) => {
    await page.goto('http://localhost:3000/checkout');
    await expect(page.getByTestId('app-message')).toContainText('กรุณาเข้าสู่ระบบก่อน');
});

test('FR-0.2 access /success without login', async ({ page }) => {
    await page.goto('http://localhost:3000/success');
    await expect(page.getByTestId('app-message')).toContainText('กรุณาเข้าสู่ระบบก่อน');
});

test('FR-0.2 access /orders without login', async ({ page }) => {
    await page.goto('http://localhost:3000/orders');
    await expect(page.getByTestId('app-message')).toContainText('กรุณาเข้าสู่ระบบก่อน');
});

test('FR-0.2 access /orders/{id} without login', async ({ page }) => {
    await page.goto(`http://localhost:3000/orders/ORD-000001`);
    await expect(page.getByTestId('app-message')).toContainText('กรุณาเข้าสู่ระบบก่อน');
});

test('FR-0.2 access /admin/products without login', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/products');
    await expect(page.getByTestId('app-message')).toContainText('กรุณาเข้าสู่ระบบก่อน');
});

test('FR-0.2 access /admin/coupons without login', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/coupons');
    await expect(page.getByTestId('app-message')).toContainText('กรุณาเข้าสู่ระบบก่อน');
});

// ##################### FR-0.3 ตรวจสอบสิทธิ์การเข้าถึง ######################## 
test('FR-0.3.1 access /products with admin role', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await loginadmin(page);
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByTestId('page-admin-products')).toBeVisible();

    await page.goto('http://localhost:3000/products');
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByTestId('page-admin-products')).toBeVisible();
});

test('FR-0.3.1 access /carts with admin role', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await loginadmin(page);
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByTestId('page-admin-products')).toBeVisible();

    await page.goto('http://localhost:3000/cart');
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByTestId('page-admin-products')).toBeVisible();
});

test('FR-0.3.1 access /checkout with admin role', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await loginadmin(page);
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByTestId('page-admin-products')).toBeVisible();

    await page.goto('http://localhost:3000/checkout');
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByTestId('page-admin-products')).toBeVisible();
});

test('FR-0.3.1 access /success with admin role', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await loginadmin(page);
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByTestId('page-admin-products')).toBeVisible();

    await page.goto('http://localhost:3000/success');
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByTestId('page-admin-products')).toBeVisible();
});

test('FR-0.3.1 access /orders with admin role', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await loginadmin(page);
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByTestId('page-admin-products')).toBeVisible();

    await page.goto('http://localhost:3000/orders');
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByTestId('page-admin-products')).toBeVisible();
});

test('FR-0.3.1 access /orders/{id} with admin role', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await loginadmin(page);
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByTestId('page-admin-products')).toBeVisible();

    await page.goto('http://localhost:3000/orders/ORD-000001');
    await expect(page).toHaveURL(/\/admin\/products$/);
    await expect(page.getByTestId('page-admin-products')).toBeVisible();
});

test('FR-0.3.2 access /admin/products with customer role', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await logincus_normal(page);
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByTestId('page-products')).toBeVisible();

    await page.goto('http://localhost:3000/admin/products');
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByTestId('page-products')).toBeVisible();
});

test('FR-0.3.2 access /admin/coupons with customer role', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await logincus_normal(page);
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByTestId('page-products')).toBeVisible();

    await page.goto('http://localhost:3000/admin/coupons');
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByTestId('page-products')).toBeVisible();
});

// ##################### FR-0.4 Operation ต้องแยกตาม Customer ######################## 
test('FR-0.4 operation by cus_normal ต้องไม่รบกวน state ของ cus_prime', async ({ page }) => {
    // Login as cus_normal
    await page.goto('http://localhost:3000/');
    await logincus_normal(page);
    await page.getByTestId('product-row-P1').getByTestId('product-qty-increase').click();
    await page.getByTestId('product-row-P1').getByTestId('product-add-button').click();
    // Logout
    await page.getByRole('link', { name: 'ออกจากระบบ' }).click();

    // Login as cus_prime
    await logincus_prime(page);
    // ตรวจเช็คตระกร้า
    await expect(page.getByTestId('nav-cart').locator('span')).toContainText('0');
});

// ##################### FR-0.5 การมองเห็นออเดอร์ ########################
test('FR-0.5.1 ต้องแสดงออเดอร์เฉพาะของตนเองเท่านั้น', async ({ page }) => {
    // Login as cus_normal
    await page.goto('http://localhost:3000/');
    await logincus_normal(page);
    await createPaidOrder(page);
    // ตรวจเช็คออเดอร์ของ cus_normal
    await page.goto(`http://localhost:3000/orders/`);
    await expect(page.getByTestId('order-row-ORD-000001')).toBeVisible();

    // Login as cus_prime
    await page.getByRole('link', { name: 'ออกจากระบบ' }).click();
    await logincus_prime(page);
    await createPaidOrder(page);
    // ตรวจเช็คออเดอร์ของ cus_prime
    await page.goto(`http://localhost:3000/orders/`);
    await expect(page.getByTestId('order-row-ORD-000001')).not.toBeVisible();
    await expect(page.getByTestId('order-row-ORD-000002')).toBeVisible();
});

test('FR-0.5.2 ต้องไม่สามารถเข้าถึงออเดอร์ของผู้อื่นได้', async ({ page }) => {
    // Login as cus_normal
    await page.goto('http://localhost:3000/');
    await logincus_normal(page);
    const order = await createPaidOrder(page);
    // ตรวจเช็คออเดอร์ของ cus_normal
    await page.goto(`http://localhost:3000/orders/${order}`);
    await expect(page.getByTestId('order-detail-id')).toBeVisible();

    // Login as cus_prime
    await page.getByRole('link', { name: 'ออกจากระบบ' }).click();
    await logincus_prime(page);
    await createPaidOrder(page);
    // ตรวจเช็คออเดอร์ของ cus_prime
    await page.goto(`http://localhost:3000/orders/${order}`);
    await expect(page.getByTestId('app-message')).toContainText('ไม่พบออเดอร์');
});

// ##################### FR-0.6 ออเดอร์เรียงจากใหม่ไปเก่า ########################
test('FR-0.6 order list should be sorted by created date desc', async ({ page }) => {
    // Login as cus_normal
    await page.goto('http://localhost:3000/');
    await logincus_normal(page);
    const order1 = await createPaidOrder(page);
    const order2 = await createPaidOrder(page);
    const order3 = await createPaidOrder(page);
    // ตรวจเช็คออเดอร์ของ cus_normal
    await page.goto(`http://localhost:3000/orders/`);
    const orderRows = page.locator('[data-testid^="order-row-"]');
    const orderIds = await orderRows.evaluateAll((rows) => rows.map((row) => row.getAttribute('data-testid')!.replace('order-row-', '')));
    expect(orderIds).toEqual([order3, order2, order1]);
});

// ##################### FR-0.7 ปฎิเสธ operation ต้องไม่เปลี่ยนข้อมูลเดิม ########################
test('FR-0.7 ใช้คูปองผิดแล้วข้อมูลเดิมต้องไม่เปลี่ยน', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Login เป็น Customer
    await logincus_normal(page);
    await expect(page).toHaveURL(/\/products$/);

    // บันทึกจำนวนออเดอร์ก่อนทำรายการ
    await page.getByTestId('nav-orders').click();
    const orderRows = page.locator('[data-testid^="order-row-"]');
    const orderCountBefore = await orderRows.count();

    // กลับไปหน้าสินค้า แล้วบันทึกสต็อก P2 ก่อนเพิ่มลงตะกร้า
    await page.getByTestId('nav-products').click();
    const product = page.getByTestId('product-row-P2');
    const stockBefore = await product.getByTestId('product-stock').getAttribute('data-value');

    // เพิ่ม P2 ลงตะกร้า
    await product.getByTestId('product-add-button').click();
    await page.getByTestId('nav-cart').click();

    // ใช้คูปองที่ถูกต้องก่อน เพื่อให้มีคูปองเดิมผูกกับตะกร้า
    await page.getByTestId('coupon-input').fill('SAVE10');
    await page.getByTestId('coupon-apply').click();
    await expect(page.getByTestId('cart-coupon-code')).toHaveText('SAVE10');

    // บันทึกข้อมูลตะกร้าก่อนลองใช้คูปองผิด
    const subtotalBefore = await page.getByTestId('cart-subtotal').getAttribute('data-value');
    const quantityBefore = await page
        .getByTestId('cart-line-P2')
        .getByTestId('cart-line-qty-input')
        .inputValue();

    // ใช้คูปองผิด
    await page.getByTestId('coupon-input').fill('INVALID-CODE');
    await page.getByTestId('coupon-apply').click();

    const error = page.getByTestId('app-message');
    await expect(error).toBeVisible();
    await expect(error).toHaveAttribute('data-code', 'COUPON_INVALID');

    // ข้อมูลตะกร้าและคูปองเดิมต้องยังเหมือนเดิม
    await expect(page.getByTestId('cart-subtotal')).toHaveAttribute('data-value', subtotalBefore!);
    await expect(
        page.getByTestId('cart-line-P2').getByTestId('cart-line-qty-input'),
    ).toHaveValue(quantityBefore);
    await expect(page.getByTestId('cart-coupon-code')).toHaveText('SAVE10');

    // checkout ยังใช้งานได้ แสดงว่า stage ยังอยู่ที่ตะกร้า
    await expect(page.getByTestId('checkout-button')).toBeEnabled();

    // สต็อกสินค้าและจำนวนออเดอร์ต้องไม่เปลี่ยน
    await page.getByTestId('nav-products').click();
    await expect(
        page.getByTestId('product-row-P2').getByTestId('product-stock'),
    ).toHaveAttribute('data-value', stockBefore!);

    await page.getByTestId('nav-orders').click();
    await expect(orderRows).toHaveCount(orderCountBefore);
});