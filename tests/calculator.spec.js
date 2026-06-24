// @ts-check
// Financial-aid verification guardrail: drives the real calculator the way a
// student would (typing into the form) and checks the dollar math. If someone
// edits the formula or wires up a field wrong, these tests go red.
const { test, expect } = require('@playwright/test');

/**
 * Type a set of dollar amounts into the calculator. Keys are the input ids in
 * docs/index.html; any field left out stays blank (counts as $0).
 * @param {import('@playwright/test').Page} page
 * @param {Record<string, string>} values
 */
async function enterAmounts(page, values) {
  for (const [id, amount] of Object.entries(values)) {
    await page.fill(`#${id}`, amount);
  }
}

/** Read the displayed text of an <output> total, e.g. "1250.00". */
function output(page, id) {
  return page.locator(`#${id}`);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('an empty form shows zeros everywhere', async ({ page }) => {
  for (const id of [
    'totalDisplay1', 'totalDisplay2', 'totalDisplay3', // cost side
    'totalDisplay4', 'totalDisplay5', 'totalDisplay6', // aid side
    'totalDisplay7',                                   // balance
    'CostDisplay1', 'CostDisplay2',                    // semesters
    'CostDisplay3', 'CostDisplay4', 'CostDisplay5',    // quarters
  ]) {
    await expect(output(page, id)).toHaveText('0.00');
  }
});

test('a fully-worked award letter sums, subtracts, and splits correctly', async ({ page }) => {
  // Cost of Attendance: living 17,000 + tuition 6,000 = 23,000
  // Financial Aid:      gift  13,000 + other  7,500 = 20,500
  // Balance not covered: 23,000 - 20,500 = 2,500
  //   → per semester (÷2) = 1,250.00 ; per quarter (÷3) = 833.33
  await enterAmounts(page, {
    cell_D4: '1000',   // Books and Supplies
    cell_D5: '12000',  // Housing/Food
    cell_D6: '2000',   // Personal
    cell_D7: '1500',   // Transportation
    cell_D8: '500',    // Miscellaneous
    cell_D10: '5000',  // Systemwide fees/Tuition
    cell_D11: '1000',  // Campus Fees
    cell_D15: '6000',  // Pell Grant
    cell_D16: '4000',  // University Grant
    cell_D17: '1000',  // Other Grants
    cell_D18: '2000',  // External Scholarships
    cell_D21: '2000',  // Work Study
    cell_D22: '3500',  // Subsidized Loans
    cell_D23: '2000',  // Unsubsidized Loans
  });

  await expect(output(page, 'totalDisplay1')).toHaveText('17000.00'); // living subtotal
  await expect(output(page, 'totalDisplay2')).toHaveText('6000.00');  // tuition subtotal
  await expect(output(page, 'totalDisplay3')).toHaveText('23000.00'); // total cost
  await expect(output(page, 'totalDisplay4')).toHaveText('13000.00'); // gift aid subtotal
  await expect(output(page, 'totalDisplay5')).toHaveText('7500.00');  // other aid subtotal
  await expect(output(page, 'totalDisplay6')).toHaveText('20500.00'); // total aid
  await expect(output(page, 'totalDisplay7')).toHaveText('2500.00');  // balance

  await expect(output(page, 'CostDisplay1')).toHaveText('1250.00');   // semester 1
  await expect(output(page, 'CostDisplay2')).toHaveText('1250.00');   // semester 2
  await expect(output(page, 'CostDisplay3')).toHaveText('833.33');    // quarter 1
  await expect(output(page, 'CostDisplay4')).toHaveText('833.33');    // quarter 2
  await expect(output(page, 'CostDisplay5')).toHaveText('833.33');    // quarter 3
});

test('Clear All Data resets every field and total to zero', async ({ page }) => {
  await enterAmounts(page, { cell_D4: '500', cell_D15: '300' });
  await expect(output(page, 'totalDisplay7')).toHaveText('200.00');

  await page.getByRole('button', { name: /clear all data/i }).click();

  await expect(page.locator('#cell_D4')).toHaveValue('');
  await expect(page.locator('#cell_D15')).toHaveValue('');
  await expect(output(page, 'totalDisplay7')).toHaveText('0.00');
});

// ─────────────────────────────────────────────────────────────────────────────
// TODO(MESA): Add a real award-letter scenario.
//
// The scenario above uses made-up round numbers. Replace or supplement it with
// figures from an actual MESA transfer award letter so the test verifies a case
// you care about. Decide and encode the policy for over-award too: today, when
// aid exceeds cost, the balance shows a NEGATIVE number (e.g. -500.00). If it
// should instead read 0.00, that's a calculator change *and* a test here.
//
// test('over-award (aid greater than cost) behaves the way MESA wants', async ({ page }) => {
//   await enterAmounts(page, { cell_D4: '1000', cell_D15: '1500' });
//   await expect(output(page, 'totalDisplay7')).toHaveText('???'); // -500.00 today
// });
// ─────────────────────────────────────────────────────────────────────────────
