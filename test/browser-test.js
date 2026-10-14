import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  page.on('console', msg => console.log(`[BROWSER LOG] ${msg.type()} ${msg.text()}`));
  page.on('pageerror', err => console.error('[BROWSER ERROR]', err));

  console.log('1. Navigating to http://localhost:8080/ ...');
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Check language before toggle
  const langBefore = await page.evaluate(() => {
    return window.__ENGINE__?.sceneManager?.currentScene?.container?.children?.find(c => c.cursor === 'pointer' && c.y < 100)?.children[1]?.text;
  });
  console.log('Language button text before click:', langBefore);

  // Click Language button (top right: 1280 - 110 + 45 = 1215, y = 16 + 16 = 32)
  console.log('2. Clicking Language toggle button at (1215, 32) ...');
  await page.mouse.click(1215, 32);
  await new Promise(r => setTimeout(r, 500));

  const langAfter = await page.evaluate(() => {
    return window.__ENGINE__?.sceneManager?.currentScene?.container?.children?.find(c => c.cursor === 'pointer' && c.y < 100)?.children[1]?.text;
  });
  console.log('Language button text after click:', langAfter);

  // Check Start Game button text after language toggle
  const startBtnText = await page.evaluate(() => {
    return window.__ENGINE__?.sceneManager?.currentScene?.container?.children?.find(c => c.cursor === 'pointer' && c.y > 100)?.children[1]?.text;
  });
  console.log('Start button text in new language:', startBtnText);

  // 3. Now click Start Game button
  console.log('3. Clicking Start Game button at (640, 440) ...');
  await page.mouse.click(640, 440);
  await new Promise(r => setTimeout(r, 1500));

  const sceneAfterStart = await page.evaluate(() => {
    return window.__ENGINE__?.sceneManager?.currentScene?.constructor?.name;
  });
  console.log('Current scene after clicking start:', sceneAfterStart);

  await browser.close();

  if (sceneAfterStart === 'GameScene' && langBefore !== langAfter) {
    console.log('🎉 ALL TESTS PASSED: Language toggle works, Start Game button works, GameScene loaded!');
    process.exit(0);
  } else {
    console.error('❌ Failed verification.');
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
