import * as puppeteer from "puppeteer";

const endpoint = 'https://coinmarketcap.com/currencies/secret/';

let browser: puppeteer.Browser | null = null;
let page: puppeteer.Page | null = null;
export let currTime: number | null = null;
let lastPrice: string | undefined = '0';

export function wait(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

function diffDays(t1: number, t2: number) {
    const diff = Math.abs(t1 - t2);
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    return { hours, days };
}

export async function start() {
    currTime = Date.now();
    if(process.env.NODE_ENV === 'production') {
        browser = await puppeteer.launch({
            executablePath: '/snap/bin/chromium'
        });
    } else {
        browser = await puppeteer.launch();
    }
    page = await browser.newPage();
    await page.goto(endpoint);

    return Promise.resolve();
}

export async function restart() {
    await browser?.close();
    await wait(100);
    await start();

    return Promise.resolve();
}

export async function reload() {
    await page?.close();
    page = await browser!.newPage();
    await page.goto(endpoint);
}

export async function getPriceHistorical(timestamp: number) {
    // const endpoint = 'https://www.coindesk.com/price/secret/';
    const tabsSelector = '.react-tabs__tabs-list';
    const chartSelector = '.tv-lightweight-charts canvas';
    const page = await browser!.newPage();
    await page.goto(endpoint);
    await page.waitForSelector(chartSelector);

    const diff =  diffDays(Date.now(), timestamp);
    if(diff.days < 1) {
        const cursor = diff.hours / 24 * 100;
    }
    if(diff.days > 7) {
        const cursor = diff.days / 30 * 100;
    }
    const cursor = diff.days / 7 * 100;
}

export async function getPrice(timestamp?: number) {
    const priceSelector = '.top-summary-container .priceSection .priceValue';

    await page?.waitForSelector(priceSelector);
    const price = await page?.evaluate(priceSelector => {
        return document.querySelector(priceSelector)?.querySelector('span')?.innerText;
    }, priceSelector)

    if(lastPrice !== price) {
        currTime = Date.now();
        lastPrice = price;
    }

    return Promise.resolve(price);
}
