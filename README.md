# MESA Cost of Attendance Calculator

An interactive calculator that helps MESA students read a transfer financial aid
award letter: it adds up the **Cost of Attendance**, adds up the **Financial Aid**
offered, and shows the **balance not covered by aid** — broken down per semester
and per quarter.

It's built for the **MESA program** (Math · Engineering · Science · Achievement) at
the **West Valley–Mission Community College District**, and is designed to be embedded
in a Canvas course.

> **Live page:** https://jmcpheron.github.io/wvm-mesa-calculator/
> _(served by GitHub Pages from the [`docs/`](docs/) folder of this repository)_

---

## Embedding it in Canvas

Paste this into a Canvas page using the HTML editor (`</>`):

```html
<iframe
  src="https://jmcpheron.github.io/wvm-mesa-calculator/"
  title="MESA Cost of Attendance Calculator"
  width="100%"
  height="2200"
  style="border: 0;"
  loading="lazy">
</iframe>
```

Notes:
- The calculator is **responsive** and has a transparent background, so it blends
  into the surrounding Canvas page and reflows on phones.
- An iframe can't auto-size to its contents, so set `height` to fit the page. ~2200px
  fits the calculator plus the glossary on a desktop; nudge it if Canvas adds a
  scrollbar.
- Nothing students type is saved or sent anywhere — it all stays in their browser and
  clears on refresh.

## How the calculator works

All the logic lives in [`docs/index.html`](docs/index.html) (one self-contained file —
HTML, CSS, and a small `<script>`). The math is intentionally simple:

| Step | What it does |
| --- | --- |
| **Cost of Attendance** | Sums Living Expenses (books, housing/food, personal, transportation, misc.) and Tuition (systemwide fees, campus fees, other). |
| **Financial Aid** | Sums Gift Aid (Pell, university grant, other grants, external scholarships) and Other Aid (work study, subsidized + unsubsidized loans). |
| **Balance not covered** | `Total Cost of Attendance − Total Aid`. |
| **By semester** | Balance ÷ 2. |
| **By quarter** | Balance ÷ 3. |

A **Glossary** section below the calculator explains terms like EFC, subsidized vs.
unsubsidized loans, and work study.

> ⚠️ **Known behavior:** if total aid is greater than total cost, the balance shows a
> *negative* number rather than `$0`. Whether that should clamp to `$0` is a program
> decision — see the roadmap below.

## Repository layout

```
docs/                 ← the published website (this folder IS the site root)
  index.html          ← the calculator + glossary
  assets/             ← logos
tests/                ← automated checks (not published)
  calculator.spec.js  ← verifies the dollar math
  accessibility.spec.js ← scans for accessibility problems
.github/workflows/    ← CI that runs the tests on every change
package.json          ← test tooling
```

Only the `docs/` folder is served to the public. Everything else is project tooling
and documentation.

## Editing the calculator

You don't need to be a programmer to make small changes (fixing a typo, updating a
glossary figure):

1. Open [`docs/index.html`](docs/index.html) on GitHub and click the ✏️ pencil to edit
   in the browser (or clone the repo and edit locally).
2. Propose your change as a **Pull Request** rather than committing straight to `main`.
   That gives others a chance to review and keeps a record of who changed what and why.
3. The automated **checks** (see below) run on your PR. Once they pass and the change is
   approved, **merge to `main`**.
4. Merging to `main` **automatically redeploys** the live page within a minute or two —
   there's no separate publish step.

## Automated checks (CI)

Every pull request and every push to `main` runs two test suites in a headless browser
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)):

- **Calculator verification** — types numbers into the real form and confirms the totals,
  balance, and per-term splits are correct.
- **Accessibility** — scans the rendered page with [axe-core](https://github.com/dequelabs/axe-core)
  for WCAG 2.1 A/AA problems (missing labels, low color contrast, missing alt text, etc.).

If either fails, the check goes red and the report is attached to the workflow run.

### Running the checks locally

You'll need [Node.js](https://nodejs.org/) 18+ installed.

```bash
npm install                              # install test tools
npx playwright install --with-deps chromium  # one-time browser download
npm test                                 # run both test suites
npm run serve                            # optional: preview docs/ at http://localhost:4173
```

## Roadmap / where this is going

Not done yet — open for discussion and contributions:

- [ ] Decide whether an over-award (aid > cost) should show `$0` instead of a negative
      balance, and encode it in `tests/calculator.spec.js`.
- [ ] Add a real MESA award-letter scenario to the calculator tests (see the
      `TODO(MESA)` note in `tests/calculator.spec.js`).
- [ ] Keep the glossary current (e.g. the subsidized-loan interest figure is hard-coded
      and dated "2026").
- [ ] Optionally shrink the MESA logo image (~470 KB) so the iframe loads faster.
- [ ] Consider giving the page a top-level `<h1>` and friendlier field IDs.

## Maintainers

Set up by **Jason McPheron** (West Valley–Mission CCD IT) on behalf of the MESA program.
Questions or changes: open an [issue](https://github.com/jmcpheron/wvm-mesa-calculator/issues)
or a pull request.

## License

[MIT](LICENSE).
