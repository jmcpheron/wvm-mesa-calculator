// @ts-check
// Guards the print option and the dollar/mobile input affordances added on top
// of the original calculator.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('money fields are dollar-friendly and mobile-friendly', async ({ page }) => {
  const input = page.locator('#cell_D4');
  await expect(input).toHaveAttribute('inputmode', 'decimal'); // decimal keypad on phones
  await expect(input).toHaveAttribute('placeholder', '0.00');  // shows the expected format

  // The "$" affordance is a CSS ::before on the .amount-input wrapper.
  const dollar = await page.evaluate(() => {
    const wrap = document.querySelector('#cell_D4').closest('.amount-input');
    return getComputedStyle(wrap, '::before').content;
  });
  expect(dollar.replace(/["']/g, '')).toBe('$');
});

test('every money input gets the decimal keypad hint', async ({ page }) => {
  const total = await page.locator('input[type="number"]').count();
  const withInputmode = await page.locator('input[type="number"][inputmode="decimal"]').count();
  expect(total).toBe(15);
  expect(withInputmode).toBe(total);
});

test('Print / Save Results triggers the browser print dialog', async ({ page }) => {
  await page.evaluate(() => {
    window.__printCount = 0;
    window.print = () => { window.__printCount++; };
  });

  await page.getByRole('button', { name: /print \/ save results/i }).click();

  expect(await page.evaluate(() => window.__printCount)).toBe(1);
});

test('the print-only header is stamped with the date when printing starts', async ({ page }) => {
  // beforeprint normally fires from the print dialog; dispatch it directly to test the handler.
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await expect(page.locator('#print-date')).toContainText('Printed');
});

test('the print button does not submit or clear the form', async ({ page }) => {
  await page.fill('#cell_D4', '500');
  await page.evaluate(() => { window.print = () => {}; }); // swallow the dialog
  await page.getByRole('button', { name: /print \/ save results/i }).click();

  // type="button" (not submit) means the entered data must survive the click.
  await expect(page.locator('#cell_D4')).toHaveValue('500');
  await expect(page.locator('#totalDisplay1')).toHaveText('500.00');
});
