import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generatePDF() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  const htmlPath = path.join(__dirname, 'project-documentation.html');
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, {
    waitUntil: 'networkidle0'
  });
  
  await page.pdf({
    path: path.join(__dirname, 'Sanjeevni-Project-Documentation.pdf'),
    format: 'A4',
    margin: {
      top: '20mm',
      right: '18mm',
      bottom: '20mm',
      left: '18mm'
    },
    printBackground: true,
    displayHeaderFooter: false,
  });
  
  await browser.close();
  console.log('PDF generated successfully: Sanjeevni-Project-Documentation.pdf');
}

generatePDF().catch(console.error);
