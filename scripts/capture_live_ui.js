const path = require('path');
const { chromium } = require(path.join(__dirname, '..', 'frontend', 'node_modules', 'playwright-core'));

const ARTIFACT_DIR = 'C:\\Users\\TGDD\\.gemini\\antigravity-ide\\brain\\cfa33719-12e0-4024-9a78-d39934eb3fd2';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function capture() {
  console.log('Launching Microsoft Edge via Playwright...');
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // 1. Capture VietQR Solana On-Ramp Page (/vi)
  console.log('Navigating to http://localhost:3000/vi...');
  try {
    await page.goto('http://localhost:3000/vi', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const onrampPath = path.join(ARTIFACT_DIR, 'bench_part1_solana_onramp_live.png');
    await page.screenshot({ path: onrampPath, fullPage: false });
    console.log('Saved Part 1 On-Ramp screenshot:', onrampPath);
  } catch (e) {
    console.error('Error capturing /vi:', e);
  }

  // 2. Capture Main Dashboard (/ - Learning, AI Tutor, Proof Explorer)
  console.log('Navigating to http://localhost:3000...');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const mainPath = path.join(ARTIFACT_DIR, 'bench_part2_main_dashboard_live.png');
    await page.screenshot({ path: mainPath, fullPage: false });
    console.log('Saved Part 2 Main Dashboard screenshot:', mainPath);

    // Scroll down to see activities & metrics
    await page.evaluate(() => window.scrollBy(0, 700));
    await page.waitForTimeout(1000);
    const activitiesPath = path.join(ARTIFACT_DIR, 'bench_part2_activities_onchain_live.png');
    await page.screenshot({ path: activitiesPath, fullPage: false });
    console.log('Saved Part 2 Activities screenshot:', activitiesPath);
  } catch (e) {
    console.error('Error capturing /:', e);
  }

  await browser.close();
  console.log('Screenshot capture complete!');
}

capture().catch(console.error);
