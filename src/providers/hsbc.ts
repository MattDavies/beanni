import { BankDataProviderInterface, FassInstitutionRelationship, AccountBalance } from '../types';
import puppeteer = require('puppeteer');
import { FassExecutionContext } from '../core';

const providerName = 'HSBC';

export class Hsbc implements BankDataProviderInterface {
    executionContext: FassExecutionContext;

    browser: puppeteer.Browser | undefined;
    page: puppeteer.Page | undefined;

    constructor(executionContext : FassExecutionContext)
    {
        this.executionContext = executionContext;
    }

    async login(
        retrieveSecretCallback : (key : string) => Promise<string>
    ) {
        this.browser = await puppeteer.launch({
            headless: !this.executionContext.debug,
        });
        var page = this.page = await this.browser.newPage();

        const username = await retrieveSecretCallback('username');
        const password = await retrieveSecretCallback('password');

        await page.goto('https://www.services.online-banking.hsbc.com.au/gpib');
        this.debugLog('login', 1);

        await page.waitForSelector('span.interstitial', { visible: true });
        this.debugLog('login', 2);
        await page.waitForSelector('span.interstitial', { hidden: true });
        this.debugLog('login', 3);

        await page.waitForSelector('input[name=username]');
        await page.waitFor(2000 + Math.random() * 300);
        await page.click('input[name=username]');
        this.debugLog('login', 4);

        for (const char of username){
            await page.waitFor(250 + Math.random() * 300);
            await page.keyboard.type(char);
            this.debugLog('login', 5);
        }
        this.debugLog('login', 6);

        // TODO: Integrate https://medium.com/@jsoverson/bypassing-captchas-with-headless-chrome-93f294518337 here

        await page.click('input[type=button][value=Continue]');
        this.debugLog('login', 7);

        await page.waitForSelector('input[name=password][type=password]');
        await page.type('input[name=password][type=password]', password);
        this.debugLog('login', 8);

        await page.click('input[type=submit][value=Continue]');
        this.debugLog('login', 9);

        await page.waitForSelector('#content #_dashboardHeading');
        this.debugLog('login', 10);
    }

    async logout() {
        if (this.browser == null) throw 'Not logged in yet';
        if (this.page == null) throw 'Not logged in yet';
        var page = this.page;

        await page.click('li.logOff a');
        this.debugLog('logout', 1);

        await this.browser.close();
    }

    async getBalances() : Promise<Array<AccountBalance>>
    {
        if (this.page == null) throw 'Not logged in yet';
        var page = this.page;

        const balances = new Array<AccountBalance>();

        this.debugLog('getBalances', 0);

        const accountRowSelector = '.accordionContainer .row[data-account-number][ishomeentity=yes]';
        await page.waitForSelector(accountRowSelector);
        this.debugLog('getBalances', 2);

        var accountSummaryRows = await page.$$('.accordionContainer .row[data-account-number][ishomeentity=yes]');
        for (const row of accountSummaryRows) {
            this.debugLog('getBalances', 3);
            balances.push({
                institution: providerName,
                accountName: await row.$eval('.itemDetails .itemTitle', (el:any) => {
                    return Array.from(el.childNodes)
                        .filter((_:any) => _.nodeType == Node.TEXT_NODE)
                        .map((_:any) => _.textContent)
                        .join('')
                        .trim()
                }),
                accountNumber: await row.$eval('.itemName', (el:any) => el.textContent.trim()),
                balance: parseFloat(await row.$eval('.itemValue', (el:any) => el.textContent.trim().replace(',', '')))
            });
        }

        return balances;
    }

    private debugLog(stage: string, position: number) {
        if (this.executionContext.debug) {
            console.log('%s: %s', stage, position.toString());
        }
    }
}
