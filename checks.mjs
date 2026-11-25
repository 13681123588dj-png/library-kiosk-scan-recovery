import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'The prototype should contain its inline application script');

function element() {
  return {
    textContent: '',
    children: [],
    events: new Map(),
    focusCount: 0,
    addEventListener(name, handler) { this.events.set(name, handler); },
    replaceChildren() { this.children = []; },
    appendChild(child) { this.children.push(child); },
    focus() { this.focusCount += 1; },
  };
}

function start(scenario = 'recover') {
  const select = element();
  const title = element();
  const status = element();
  const actions = element();
  select.value = scenario;
  const nodes = { scenario: select, 'screen-title': title, message: status, actions };
  const document = { getElementById: id => nodes[id], createElement: element };
  runInNewContext(script, { document }, { filename: 'index.html', timeout: 1000 });

  return {
    get title() { return title.textContent; },
    get status() { return status.textContent; },
    get buttons() { return actions.children.map(button => button.textContent); },
    get focusCount() { return title.focusCount; },
    click(label) {
      const button = actions.children.find(candidate => candidate.textContent === label);
      assert.ok(button, 'Expected a visible button named ' + label);
      assert.equal(button.type, 'button');
      button.events.get('click')();
    },
    choose(value) {
      select.value = value;
      select.events.get('change')();
    },
  };
}

test('one miss offers a physical adjustment and puts retry first', () => {
  const kiosk = start();
  assert.equal(kiosk.title, 'Scan your book');
  kiosk.click('Scan book');
  assert.equal(kiosk.title, 'Barcode not read');
  assert.match(kiosk.status, /not been recorded.*Flatten the page.*library barcode/);
  assert.deepEqual(kiosk.buttons, ['Try again', 'Show staff details', 'End session']);
});

test('retry reads the barcode and says no loan was made', () => {
  const kiosk = start();
  kiosk.click('Scan book');
  kiosk.click('Try again');
  assert.equal(kiosk.title, 'Book recorded in this demo');
  assert.equal(kiosk.status, 'The barcode was read. No library loan has been made.');
  assert.deepEqual(kiosk.buttons, ['Finish']);
  kiosk.click('Finish');
  assert.deepEqual(kiosk.buttons, ['Scan book']);
});

test('two consecutive misses promote staff details and keep retry', () => {
  const kiosk = start('repeat');
  kiosk.click('Scan book');
  assert.equal(kiosk.buttons[0], 'Try again');
  kiosk.click('Try again');
  assert.equal(kiosk.title, 'Staff can help with this book');
  assert.match(kiosk.status, /last 2 scans were unsuccessful/);
  assert.deepEqual(kiosk.buttons, ['Show staff details', 'Try again', 'End session']);
});

test('staff sees the event and count, and returning preserves both misses', () => {
  const kiosk = start('repeat');
  kiosk.click('Scan book');
  kiosk.click('Try again');
  kiosk.click('Show staff details');
  assert.equal(kiosk.title, 'Staff details');
  assert.match(kiosk.status, /no barcode read.*Consecutive missed scans: 2.*No loan recorded/);
  kiosk.click('Back to student screen');
  assert.equal(kiosk.title, 'Staff can help with this book');
  assert.match(kiosk.status, /last 2 scans were unsuccessful/);
});

test('staff details are available after the first miss with retry still first on return', () => {
  const kiosk = start('repeat');
  kiosk.click('Scan book');
  kiosk.click('Show staff details');
  assert.match(kiosk.status, /Consecutive missed scans: 1\b/);
  kiosk.click('Back to student screen');
  assert.equal(kiosk.title, 'Barcode not read');
  assert.equal(kiosk.buttons[0], 'Try again');
});

test('ending from staff details clears attempts for the next session', () => {
  const kiosk = start('repeat');
  kiosk.click('Scan book');
  kiosk.click('Try again');
  kiosk.click('Show staff details');
  kiosk.click('End session');
  assert.equal(kiosk.title, 'Scan your book');
  kiosk.click('Scan book');
  kiosk.click('Show staff details');
  assert.match(kiosk.status, /Consecutive missed scans: 1\b/);
});

test('changing scenario resets the session and clear barcode reads immediately', () => {
  const kiosk = start('repeat');
  kiosk.click('Scan book');
  kiosk.choose('clear');
  assert.equal(kiosk.title, 'Scan your book');
  kiosk.click('Scan book');
  assert.equal(kiosk.title, 'Book recorded in this demo');
  assert.match(kiosk.status, /No library loan has been made/);
});

test('actions request focus on the next heading and the message has a status role', () => {
  const kiosk = start();
  kiosk.click('Scan book');
  kiosk.choose('clear');
  assert.equal(kiosk.focusCount, 2);
  assert.match(html, /id="screen-title" tabindex="-1"/);
  assert.match(html, /id="message" role="status"/);
});
