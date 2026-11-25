# Library kiosk scan recovery

Prose word count — 300

A browser prototype for students recovering from missed book scans and library staff assisting at a kiosk.

## Status and stack

- **Implemented.** Student and staff screens, consecutive-miss rule, retry, back and session reset. HTML, CSS and JavaScript run locally in a browser.
- **Simulated.** Three repeatable barcode scenarios. A successful read records a demo result. No library loan is made.
- **Planned.** Connect scanner events and verify actual circulation responses. Card validation, receipts and staff alerts are outside this prototype. No runtime AI model, API or credentials are required.

## Run and inspect

Open [index.html](index.html) in a browser. Choose **One missed scan** and click **Scan book**, **Try again**, then **Finish**. Choose **Repeated missed scans**, scan twice and open **Show staff details**. Try the back and end controls. **Clear barcode** reads on the first scan.

With Node.js 18 or newer, run:

```sh
node checks.mjs
```

Eight checks exercise the browser script's event handlers with a minimal DOM stub.

## Development record

- The Week 2 storyboard covered the whole loan and explored recovery after a missed scan. The Week 3 [Python simulation](development/borrow_simulation.py) added a positioning hint and prioritised help after two misses.
- The browser prototype narrowed the task to scan recovery. It replaced simulated receipt success with explicit demo feedback and made student retry, a separate staff view and reset inspectable.
- The [browser file](https://github.com/13681123588dj-png/library-kiosk-scan-recovery/commit/e5827bfe923e503950ff03c4bab7d0d535a81130) was recovered from an earlier project Page. This repository records the recovered source and current replay checks. The earlier Git bundle was unavailable.

## AI assistance

The Week 3 prompt log records Gemini Student drafting the specification and revision options. The student condensed the draft, kept the consecutive-miss counter and set aside image recognition and cloud integration. Codex reconciled the recovered browser source with the report, drafted figures and README, and checked the displayed strings, controls and reset paths against the app.

## Submission files

The project report is submitted separately. All prototype files needed for inspection are in this repository.
