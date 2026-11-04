import { expect, test } from '@playwright/test';
import {
    addProductAndOpenCart,
    expectCartQuantity,
    expectAddQuantityAccepted,
    expectAddQuantityRejected,
    loginadmin,
    logincus_normal,
    prepareAddItemDecisionCase,
    restoreDecisionTableStock,
    startWithEmptyCart,
    openAdminProducts,
    setProductStock,
} from './helper.function';

// FR-2.1 BVA (Robust), ช่วง quantity 1 ถึง 10
test.describe('FR-2.1 BVA', () => {
    test('BVA-01 min-: quantity 0 ปฏิเสธ QTY_OUT_OF_RANGE และตะกร้าว่าง', async ({ page }) => {
        await startWithEmptyCart(page);
        await expectAddQuantityRejected(page, '0', 'จำนวนต้องอยู่ระหว่าง 1 ถึง 10');
    });

    test('BVA-02 min: quantity 1 สำเร็จ ได้ P1 × 1', async ({ page }) => {
        await startWithEmptyCart(page);
        await expectAddQuantityAccepted(page, 1);
    });

    test('BVA-03 min+: quantity 2 สำเร็จ ได้ P1 × 2', async ({ page }) => {
        await startWithEmptyCart(page);
        await expectAddQuantityAccepted(page, 2);
    });

    test('BVA-04 nominal: quantity 5 สำเร็จ ได้ P1 × 5', async ({ page }) => {
        await startWithEmptyCart(page);
        await expectAddQuantityAccepted(page, 5);
    });

    test('BVA-05 max-: quantity 9 สำเร็จ ได้ P1 × 9', async ({ page }) => {
        await startWithEmptyCart(page);
        await expectAddQuantityAccepted(page, 9);
    });

    test('BVA-06 max: quantity 10 สำเร็จ ได้ P1 × 10', async ({ page }) => {
        await startWithEmptyCart(page);
        await expectAddQuantityAccepted(page, 10);
    });

    test('BVA-07 max+: quantity 11 ปฏิเสธ QTY_OUT_OF_RANGE และตะกร้าว่าง', async ({ page }) => {
        await startWithEmptyCart(page);
        await expectAddQuantityRejected(page, '11', 'จำนวนต้องอยู่ระหว่าง 1 ถึง 10');
    });
});

// FR-2.1 ECT (Robust), หนึ่ง test ต่อหนึ่ง equivalence class
test.describe('FR-2.1 ECT', () => {
    test('ECT-01 V1: จำนวนเต็ม 1–10, quantity 5 สำเร็จ ได้ P1 × 5', async ({ page }) => {
        await startWithEmptyCart(page);
        await expectAddQuantityAccepted(page, 5);
    });

    test('ECT-02 I1: จำนวนเต็มต่ำกว่า 1, quantity -5 ปฏิเสธ QTY_OUT_OF_RANGE', async ({ page }) => {
        await startWithEmptyCart(page);
        await expectAddQuantityRejected(page, '-5', 'จำนวนต้องอยู่ระหว่าง 1 ถึง 10');
    });

    test('ECT-03 I2: จำนวนเต็มมากกว่า 10, quantity 50 ปฏิเสธ QTY_OUT_OF_RANGE', async ({ page }) => {
        await startWithEmptyCart(page);
        await expectAddQuantityRejected(page, '50', 'จำนวนต้องอยู่ระหว่าง 1 ถึง 10');
    });

    test('ECT-04 I3a: ทศนิยม 2.5 ปฏิเสธ VALIDATION_ERROR', async ({ page }) => {
        await startWithEmptyCart(page);
        await expectAddQuantityRejected(page, '2.5', 'จำนวนต้องเป็นจำนวนเต็ม');
    });

    test('ECT-05 I3b: abc ปฏิเสธด้วย VALIDATION_ERROR', async ({ page }) => {
        test.skip(true, 'E2E: input[type="number"] ไม่รับข้อความ abc; ต้องตรวจกรณีนี้ใน Unit/API Test');
    });

    test('ECT-06 I3c: null ปฏิเสธด้วย VALIDATION_ERROR', async ({ page }) => {
        test.skip(true, 'E2E: UI ส่ง JSON null ให้ addItem โดยตรงไม่ได้; ต้องตรวจกรณีนี้ใน Unit/API Test');
    });

    test('ECT-07 I3d: ข้อความว่างปฏิเสธ VALIDATION_ERROR', async ({ page }) => {
        await startWithEmptyCart(page);
        await expectAddQuantityRejected(page, '', 'จำนวนต้องเป็นจำนวนเต็ม');
    });
});

test.describe('FR-2.2 สินค้าใน addItems', () => {
    test.skip('FR-2.2.1 Customer เรียก addItem ด้วย productId ที่ไม่มีในระบบ', async ({ page }) => {
        // E2E ผ่านหน้า Product เลือก productId เองไม่ได้
        // กรณี PRODUCT_NOT_FOUND ให้ตรวจด้วย Unit/API Test
    });

    test.skip('FR-2.2.2 Customer เรียก addItem ด้วย productId ของสินค้าที่ไม่พร้อมขาย', async ({ page }) => {
        // สินค้าที่ไม่พร้อมขายไม่แสดงในหน้า Product จึงเรียก addItem ผ่าน UI ไม่ได้
        // กรณี PRODUCT_UNAVAILABLE ให้ตรวจด้วย Unit/API Test
    });
});

test.describe('FR-2.3 ผลของ addItems ที่ผ่านการตรวจสอบ', () => {
    test('FR-2.3.1 เพิ่มสินค้าใหม่ลงตะกร้าตามจำนวนที่ระบุ', async ({ page }) => {
        await startWithEmptyCart(page);

        const product = page.getByTestId('product-row-P1');
        await product.getByTestId('product-add-qty').fill('2');
        await product.getByTestId('product-add-button').click();

        await page.getByTestId('nav-cart').click();

        const item = page.getByTestId('cart-line-P1');
        await expect(item).toBeVisible();
        await expect(item.getByTestId('cart-line-qty-input')).toHaveValue('2');
    });

    test('FR-2.3.2 เพิ่มสินค้าที่อยู่ในตะกร้าแล้วให้บวกจำนวนเดิม', async ({ page }) => {
        await startWithEmptyCart(page);

        const product = page.getByTestId('product-row-P1');

        await product.getByTestId('product-add-qty').fill('2');
        await product.getByTestId('product-add-button').click();
        await expect(page.getByTestId('app-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

        await page.getByTestId('nav-cart').click();
        const item2 = page.getByTestId('cart-line-P1');
        await expect(item2).toBeVisible();
        await expect(item2.getByTestId('cart-line-qty-input')).toHaveValue('2');

        await page.getByTestId('nav-products').click();
        await expect(page.getByTestId('page-products')).toBeVisible();
        await product.getByTestId('product-add-qty').fill('3');
        await product.getByTestId('product-add-button').click();
        await expect(page.getByTestId('app-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

        await page.getByTestId('nav-cart').click();

        const itemsLine = page.locator('tbody > tr[data-testid^="cart-line-"]');
        await expect(itemsLine).toHaveCount(1);

        const items = page.getByTestId('cart-line-P1');
        await expect(items.getByTestId('cart-line-qty-input')).toHaveValue('5');
    });
});

test.describe('FR-2.4 quantity รวมหลัง addItem', () => {
    test.describe.configure({ mode: 'serial' });

    test('DT-01 R1 C2=F: เกิน 10 ปฏิเสธและจำนวนเดิม 5 คงอยู่', async ({ page }) => {
        await prepareAddItemDecisionCase(page, 'P1', 20, 5);
        try {
            const product = page.getByTestId('product-row-P1');
            await product.getByTestId('product-add-qty').fill('6');
            await product.getByTestId('product-add-button').click();
            await expect(product.getByTestId('app-message'))
                .toContainText('จำนวนต้องอยู่ระหว่าง 1 ถึง 10');
            await expect(product.getByTestId('product-available-stock')).toHaveValue('20');
            await expectCartQuantity(page, 'P1', 5);
        } finally {
            await restoreDecisionTableStock(page);
        }
    });

    test.skip('DT-02 R1 C2=T: เกิน 10 และสต็อก ต้องได้ QTY_OUT_OF_RANGE ก่อน', async ({ page }) => {
        await prepareAddItemDecisionCase(page, 'P1', 5, 3);

        // ทดสอบลำดับนี้ผ่าน E2E ไม่ได้ เพราะ quantity 9 เกินสต็อก 5
        // UI อาจปฏิเสธด้วย validation เรื่องสต็อกก่อน จึงยืนยันลำดับตรวจของ addItem ไม่ได้
    });

    test('DT-03 R2: เกินสต็อก ปฏิเสธและจำนวนเดิม 1 คงอยู่', async ({ page }) => {
        await prepareAddItemDecisionCase(page, 'P2', 3, 1);
        try {
            const product = page.getByTestId('product-row-P2');
            await product.getByTestId('product-add-qty').fill('3');
            await product.getByTestId('product-add-button').click();
            await expect(page.getByTestId('app-message'))
                .toContainText('สินค้าเหลือ 3 ชิ้น');
            await expect(product.getByTestId('product-available-stock')).toHaveValue('3');
            await expectCartQuantity(page, 'P2', 1);
        } finally {
            await restoreDecisionTableStock(page);
        }
    });

    test('DT-04 R3: เพิ่มสินค้าที่มีอยู่แล้วสำเร็จ ได้จำนวน 7', async ({ page }) => {
        await prepareAddItemDecisionCase(page, 'P1', 20, 4);
        try {
            const product = page.getByTestId('product-row-P1');
            await product.getByTestId('product-add-qty').fill('3');
            await product.getByTestId('product-add-button').click();
            await expect(page.getByTestId('app-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');
            await expect(product.getByTestId('product-available-stock')).toHaveValue('20');
            await expectCartQuantity(page, 'P1', 7);
        } finally {
            await restoreDecisionTableStock(page);
        }
    });

    test('DT-05 R2 เมื่อยังไม่มีสินค้าในตะกร้า: เกินสต็อกและตะกร้ายังว่าง', async ({ page }) => {
        await prepareAddItemDecisionCase(page, 'P2', 3, 0);
        try {
            const product = page.getByTestId('product-row-P2');
            await product.getByTestId('product-add-qty').fill('4');
            await product.getByTestId('product-add-button').click();
            await expect(page.getByTestId('app-message'))
                .toContainText('สินค้าเหลือ 3 ชิ้น');
            await expect(product.getByTestId('product-available-stock')).toHaveValue('3');
            await expectCartQuantity(page, 'P2', 0);
        } finally {
            await restoreDecisionTableStock(page);
        }
    });

    test('DT-06 R3 เมื่อยังไม่มีสินค้าในตะกร้า: เพิ่ม P1 จำนวน 3 สำเร็จ', async ({ page }) => {
        await prepareAddItemDecisionCase(page, 'P1', 20, 0);
        try {
            const product = page.getByTestId('product-row-P1');
            await product.getByTestId('product-add-qty').fill('3');
            await product.getByTestId('product-add-button').click();
            await expect(page.getByTestId('app-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');
            await expect(product.getByTestId('product-available-stock')).toHaveValue('20');
            await expectCartQuantity(page, 'P1', 3);
        } finally {
            await restoreDecisionTableStock(page);
        }
    });

    test('DT-07 R3 ขอบ c+a=10: เพิ่มสำเร็จ ได้จำนวน 10', async ({ page }) => {
        await prepareAddItemDecisionCase(page, 'P1', 20, 5);
        try {
            const product = page.getByTestId('product-row-P1');
            await product.getByTestId('product-add-qty').fill('5');
            await product.getByTestId('product-add-button').click();
            await expect(page.getByTestId('app-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');
            await expect(product.getByTestId('product-available-stock')).toHaveValue('20');
            await expectCartQuantity(page, 'P1', 10);
        } finally {
            await restoreDecisionTableStock(page);
        }
    });

    test('DT-08 R3 ขอบ c+a=S: เพิ่มสำเร็จ ได้จำนวน 3', async ({ page }) => {
        await prepareAddItemDecisionCase(page, 'P2', 3, 1);
        try {
            const product = page.getByTestId('product-row-P2');
            await product.getByTestId('product-add-qty').fill('2');
            await product.getByTestId('product-add-button').click();
            await expect(page.getByTestId('app-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');
            await expect(product.getByTestId('product-available-stock')).toHaveValue('3');
            await expectCartQuantity(page, 'P2', 3);
        } finally {
            await restoreDecisionTableStock(page);
        }
    });

    test('DT-09 R1 เมื่อเกินทั้งเพดาน 10 และสต็อก: ได้ QTY_OUT_OF_RANGE', async ({ page }) => {
        await prepareAddItemDecisionCase(page, 'P1', 10, 5);
        try {
            const product = page.getByTestId('product-row-P1');
            await product.getByTestId('product-add-qty').fill('6');
            await product.getByTestId('product-add-button').click();
            await expect(page.getByTestId('app-message'))
                .toContainText('จำนวนต้องอยู่ระหว่าง 1 ถึง 10');
            await expect(product.getByTestId('product-available-stock')).toHaveValue('10');
            await expectCartQuantity(page, 'P1', 5);
        } finally {
            await restoreDecisionTableStock(page);
        }
    });

    test('DT-10 R2 เมื่อ c+a=10 แต่เกินสต็อก 9: ได้ INSUFFICIENT_STOCK', async ({ page }) => {
        await prepareAddItemDecisionCase(page, 'P1', 9, 5);
        try {
            const product = page.getByTestId('product-row-P1');
            await product.getByTestId('product-add-qty').fill('5');
            await product.getByTestId('product-add-button').click();
            await expect(page.getByTestId('app-message'))
                .toContainText('สินค้าเหลือ 9 ชิ้น');
            await expect(product.getByTestId('product-available-stock')).toHaveValue('9');
            await expectCartQuantity(page, 'P1', 5);
        } finally {
            await restoreDecisionTableStock(page);
        }
    });
});

test.describe('FR-2.5 updateQuantity', () => {
    test('FR-2.5.1 ทศนิยมถูกปฏิเสธด้วย VALIDATION_ERROR', async ({ page }) => {
        const item = await addProductAndOpenCart(page, 'P1', 1);

        await item.getByTestId('cart-line-qty-input').fill('2.5');

        const error = item.getByTestId('app-message');
        await expect(error).toContainText('จำนวนต้องเป็นจำนวนเต็ม');
        await expect(item.getByTestId('cart-line-update')).toBeDisabled();

        await page.reload();
        await expect(page.getByTestId('cart-line-P1').getByTestId('cart-line-qty-input'))
            .toHaveValue('1');
    });

    for (const quantity of ['0', '11']) {
        test(`FR-2.5.2 quantity ${quantity} ถูกปฏิเสธด้วย QTY_OUT_OF_RANGE`, async ({ page }) => {
            const item = await addProductAndOpenCart(page, 'P1', 1);

            await item.getByTestId('cart-line-qty-input').fill(quantity);

            const error = item.getByTestId('app-message');
            await expect(error).toContainText('จำนวนต้องอยู่ระหว่าง 1 ถึง 10');
            await expect(item.getByTestId('cart-line-update')).toBeDisabled();

            await page.reload();
            await expect(page.getByTestId('cart-line-P1').getByTestId('cart-line-qty-input'))
                .toHaveValue('1');
        });
    }

    test('FR-2.5.3 สินค้าที่ไม่มีในตะกร้า', async ({ page }) => {
        test.skip(true, 'ไม่มีแถวสินค้าและปุ่ม updateQuantity ให้เรียกจาก UI; ตรวจใน Unit/API Test');
    });

    test('FR-2.5.4 updateQuantity สินค้าที่ไม่พร้อมขายถูกปฏิเสธ', async ({ page }) => {
        const productId = 'P1';

        // เก็บสถานะเดิมและเปิดขายชั่วคราว เพื่อให้ Customer เพิ่มสินค้าได้
        await page.goto('http://localhost:3000/');
        await loginadmin(page);

        const adminProduct = page.getByTestId(`admin-product-row-${productId}`);
        const originalStatus = (await adminProduct.getByTestId('admin-product-status').textContent())?.trim();

        try {
            if (originalStatus !== 'เปิดขาย') {
                await adminProduct.getByTestId('admin-product-toggle-status').click();
                await expect(adminProduct.getByTestId('admin-product-status')).toHaveText('เปิดขาย');
            }

            // Customer เพิ่ม P1 ลงตะกร้าก่อน
            await page.goto('http://localhost:3000/');
            await logincus_normal(page);
            await expect(page.getByTestId('page-products')).toBeVisible();

            const product = page.getByTestId(`product-row-${productId}`);
            await product.getByTestId('product-add-qty').fill('1');
            await product.getByTestId('product-add-button').click();
            await expect(page.getByTestId('app-message')).toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

            // Admin ปิดขาย P1 ขณะที่สินค้ายังอยู่ในตะกร้า Customer
            await page.goto('http://localhost:3000/');
            await loginadmin(page);

            const productToClose = page.getByTestId(`admin-product-row-${productId}`);
            if ((await productToClose.getByTestId('admin-product-status').textContent())?.trim() !== 'ปิดขาย') {
                await productToClose.getByTestId('admin-product-toggle-status').click();
            }
            await expect(productToClose.getByTestId('admin-product-status')).toHaveText('ปิดขาย');

            // กลับมาเป็น Customer แล้วลองเปลี่ยนจำนวนในตะกร้า
            await page.goto('http://localhost:3000/');
            await logincus_normal(page);
            await page.getByTestId('nav-cart').click();

            const cartItem = page.getByTestId(`cart-line-${productId}`);
            await expect(cartItem).toBeVisible();
            await expect(cartItem.getByTestId('cart-line-availability'))
                .toHaveText('ไม่พร้อมขาย');

            await cartItem.getByTestId('cart-line-qty-input').fill('2');

            await expect(cartItem.getByTestId('app-message'))
                .toContainText('สินค้านี้ไม่พร้อมขาย');
            await expect(cartItem.getByTestId('cart-line-update')).toBeDisabled();

            // จำนวนที่บันทึกไว้เดิมต้องยังเป็น 1
            await page.reload();
            await expect(page.getByTestId(`cart-line-${productId}`).getByTestId('cart-line-qty-input'))
                .toHaveValue('1');
        } finally {
            // คืนสถานะสินค้าเดิม เพื่อไม่กระทบ test อื่น
            await page.goto('http://localhost:3000/');
            await loginadmin(page);

            const productToRestore = page.getByTestId(`admin-product-row-${productId}`);
            const currentStatus = (await productToRestore.getByTestId('admin-product-status').textContent())?.trim();

            if (currentStatus !== originalStatus) {
                await productToRestore.getByTestId('admin-product-toggle-status').click();
                await expect(productToRestore.getByTestId('admin-product-status')).toHaveText(originalStatus ?? 'เปิดขาย');
            }
        }
    });

    test('FR-2.5.5 เกินสต็อกถูกปฏิเสธด้วย INSUFFICIENT_STOCK', async ({ page }) => {
        const item = await addProductAndOpenCart(page, 'P2', 1);

        await item.getByTestId('cart-line-qty-input').fill('4');
        await item.getByTestId('cart-line-update').click();

        await expect(item.getByTestId('app-message'))
            .toContainText('สินค้าเหลือ 3 ชิ้น');

        await page.reload();
        await expect(page.getByTestId('cart-line-P2').getByTestId('cart-line-qty-input'))
            .toHaveValue('1');
    });

    test('FR-2.5.6 จำนวนถูกแทนที่ด้วยค่าใหม่', async ({ page }) => {
        const item = await addProductAndOpenCart(page, 'P1', 1);

        await item.getByTestId('cart-line-qty-input').fill('3');
        await item.getByTestId('cart-line-update').click();

        await expect(item.getByTestId('cart-line-qty-input'))
            .toHaveValue('3');
    });
});

test.describe('FR-2.6 ลำดับการตรวจสอบ', () => {
    // FR-2.6 ขั้น 1 ต้องตรวจจำนวนเต็มก่อนช่วง 1–10
    test('FR-2.6 addItem: quantity 0.5 ได้ VALIDATION_ERROR ก่อน QTY_OUT_OF_RANGE', async ({ page }) => {
        await startWithEmptyCart(page);

        const product = page.getByTestId('product-row-P1');
        await product.getByTestId('product-add-qty').fill('0.5');

        await expect(product.getByTestId('app-message'))
            .toContainText('จำนวนต้องเป็นจำนวนเต็ม');    
        await expect(product.getByTestId('product-add-button')).toBeDisabled();

        // กรณีนี้ Frontend ปฏิเสธก่อนเรียก addItem จึงตรวจลำดับ validation ใน UI เท่านั้น
        await page.getByTestId('nav-cart').click();
        await expect(page.locator('tbody > tr[data-testid^="cart-line-"]')).toHaveCount(0);
    });

    // FR-2.6 ขั้น 5 ต้องตรวจ quantity รวมก่อนตรวจสต็อก (ขั้น 6)
    test('FR-2.6 addItem: quantity รวมเกิน 10 และเกินสต็อก ต้องได้ QTY_OUT_OF_RANGE', async ({ page }) => {
        // ปรับ P1 เป็นสต็อก 8 เพื่อให้ 6 + 5 เกินทั้ง 10 และสต็อก
        await openAdminProducts(page);

        const productId = 'P1';
        const adminProduct = page.getByTestId(`admin-product-row-${productId}`);
        const originalStock = Number(
            await adminProduct.getByTestId('admin-product-stock').getAttribute('data-value'),
        );

        try {
            await setProductStock(page, productId, 8);

            await startWithEmptyCart(page);

            const product = page.getByTestId(`product-row-${productId}`);

            // ครั้งแรก: 6 ชิ้น
            await product.getByTestId('product-add-qty').fill('6');
            await product.getByTestId('product-add-button').click();
            await expect(page.getByTestId('app-message'))
                .toContainText('เพิ่มสินค้าลงตะกร้าแล้ว');

            // ครั้งที่สอง: เพิ่ม 5 ชิ้น รวมเป็น 11 ซึ่งเกินทั้ง 10 และสต็อก 8
            await product.getByTestId('product-add-qty').fill('5');
            await product.getByTestId('product-add-button').click();

            await expect(product.getByTestId('app-message'))
                .toContainText('จำนวนต้องอยู่ระหว่าง 1 ถึง 10');

            // ยืนยันว่ารายการเดิมยังเป็น 6 ชิ้น
            await page.getByTestId('nav-cart').click();
            await expect(page.getByTestId('cart-line-P1').getByTestId('cart-line-qty-input'))
                .toHaveValue('6');
        } finally {
            // คืนสต็อกเดิม
            await openAdminProducts(page);
            await setProductStock(page, productId, originalStock);
        }
    });

    // เรียก addItem ด้วย productId ที่ไม่มี: หน้าเว็บไม่มีช่องให้กรอก productId
    test('FR-2.6 addItem: quantity ผิดและ productId ไม่มีในระบบ', async ({ page }) => {
        test.skip(true, 'หน้าเว็บเลือกได้เฉพาะสินค้าที่แสดงอยู่ จึงส่ง productId ที่ไม่มีเข้า addItem ผ่าน UI ไม่ได้');
    });

    // เรียก updateQuantity เมื่อไม่มีรายการนั้นในตะกร้า: ไม่มีแถวหรือปุ่มอัปเดตให้กด
    test('FR-2.6 updateQuantity: quantity ผิดและสินค้าไม่อยู่ในตะกร้า', async ({ page }) => {
        test.skip(true, 'หน้าเว็บไม่มี control สำหรับเรียก updateQuantity กับสินค้าที่ไม่มีในตะกร้า');
    });

    // เรียก addItem สินค้าปิดขายพร้อม quantity ที่ทำให้ชน validation ขั้นถัดไป
    test('FR-2.6 addItem: สินค้าไม่พร้อมขายและ quantity รวมเกิน 10', async ({ page }) => {
        test.skip(true, 'สินค้าปิดขายไม่แสดงให้ Customer เลือกจากหน้า Product จึงสร้างเงื่อนไขนี้ผ่าน UI ปกติไม่ได้');
    });
});