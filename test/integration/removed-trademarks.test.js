import path from 'path';
import SeleniumHelper from '../helpers/selenium-helper';

const {
    clickText,
    clickXpath,
    findByXpath,
    notExistsByXpath,
    getDriver,
    getLogs,
    loadUri
} = new SeleniumHelper();

const uri = path.resolve(__dirname, '../../build/index.html');

let driver;

const trademarkNames = [
    'Cat',
    'Cat-Flying',
    'Gobo',
    'Pico',
    'Pico Walking',
    'Nano',
    'Tera',
    'Giga',
    'Giga Walking'
];

describe('Removed trademarks (ex: Scratch Cat)', () => {
    beforeAll(() => {
        driver = getDriver();
    });

    afterAll(async () => {
        await driver.quit();
    });

    test('Removed trademark sprites', async () => {
        await loadUri(uri);
        await clickXpath('//button[@aria-label="Choose a Sprite"]');
        await driver.sleep(5000);
        const searchElement = await findByXpath("//input[@placeholder='Search']");

        for (const name of trademarkNames) {
            searchElement.clear();
            await driver.sleep(500);
            await searchElement.sendKeys(name);
            await driver.sleep(500);
            expect(await notExistsByXpath(`//*[span[text()="${name}"]]`)).toBeTruthy();
        }

        const logs = await getLogs();
        await expect(logs).toEqual([]);
    });

    test('Removed trademark costumes', async () => {
        await loadUri(uri);
        await clickText('Costumes');
        await clickXpath('//button[@aria-label="Choose a Costume"]');
        await driver.sleep(5000);
        const searchElement = await findByXpath("//input[@placeholder='Search']");

        for (const name of trademarkNames) {
            searchElement.clear();
            await driver.sleep(500);
            const costumePrefix = `${name}-`;
            await searchElement.sendKeys(costumePrefix);
            await driver.sleep(500);
            expect(await notExistsByXpath(`//*[span[contains(text(), "${costumePrefix}")]]`)).toBeTruthy();
        }

        const logs = await getLogs();
        await expect(logs).toEqual([]);
    });
});
