# Playwright Usage

เปิดเว็บแอปที่ต้องการทดสอบก่อนใช้งานคำสั่งด้านล่าง

## Codegen

เปิดเบราว์เซอร์เพื่อบันทึกการกระทำและสร้างโค้ดเทสต์:

```bash
npx playwright codegen http://localhost:3000
```

## Run Tests

รันเทสต์ทั้งหมด:

```bash
npx playwright test
```

รันเทสต์ในไฟล์ที่ระบุ:

```bash
npx playwright test tests/example.spec.ts
```

## Run UI

เปิด Playwright UI เพื่อเลือกและรันเทสต์แบบโต้ตอบ:

```bash
npx playwright test --ui
```