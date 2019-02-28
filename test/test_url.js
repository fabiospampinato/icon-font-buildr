
/* IMPORT */

const puppeteer = require ( 'puppeteer' );

/* TEST URL */

//TODO: Publish as `test-url` or something

async function testURL ( url ) {

  const browser = await puppeteer.launch ({ headless: false }),
        page = await browser.newPage ();

  await page.goto ( url );

  return new Promise ( res => {

    browser.on ( 'targetdestroyed', res );

  });

}

/* EXPORT */

module.exports = testURL;
