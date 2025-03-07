import path from 'path';
import SeleniumHelper from '../helpers/selenium-helper';

const {
    clickText,
    clickXpath,
    findByText,
    findByXpath,
    getDriver,
    getLogs,
    loadUri,
    notExistsByXpath,
    rightClickText,
    scope
} = new SeleniumHelper();

const uri = path.resolve(__dirname, '../../build/index.html');

let driver;

const FILE_MENU_XPATH = '//div[contains(@class, "menu-bar_menu-bar-item")]' +
    '[*[contains(@class, "menu-bar_collapsible-label")]//*[text()="File"]]';
const SETTINGS_MENU_XPATH = '//div[contains(@class, "menu-bar_menu-bar-item")]' +
    '[*[contains(@class, "settings-menu_dropdown-label")]//*[text()="Settings"]]';

describe('Localization', () => {
    beforeAll(() => {
        driver = getDriver();
    });

    afterAll(async () => {
        await driver.quit();
    });

    test('Switching languages', async () => {
        await loadUri(uri);
        await notExistsByXpath('//*[div[contains(@class, "loader_background")]]');

        // Add a sprite to make sure it stays when switching languages
        await clickXpath('//button[@aria-label="Choose a Sprite"]');
        await clickText('Apple', scope.modal); // Closes modal

        await clickXpath(SETTINGS_MENU_XPATH);
        await clickText('Language', scope.menuBar);
        await clickText('Deutsch');
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait for blocks refresh

        // Make sure the blocks are translating
        await clickText('Fühlen'); // Sensing category in German
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait for blocks to scroll
        await clickText('Antwort'); // Find the "answer" block in German

        // Change to the costumes tab to confirm other parts of the GUI are translating
        await clickText('Kostüme');

        // After switching languages, make sure Apple sprite still exists
        await rightClickText('Apple', scope.spriteTile); // Make sure it is there

        // Remounting re-attaches the beforeunload callback. Make sure to remove it
        driver.executeScript('window.onbeforeunload = undefined;');

        const logs = await getLogs();
        await expect(logs).toEqual([]);
    });

    // Regression test for #4476, blocks in wrong language when loaded with locale
    test('Loading with locale shows correct blocks', async () => {
        await loadUri(`${uri}?locale=de`);
        await notExistsByXpath('//*[div[contains(@class, "loader_background")]]');
        await clickText('Fühlen'); // Sensing category in German
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait for blocks to scroll
        await clickText('Antwort'); // Find the "answer" block in German
        const logs = await getLogs();
        await expect(logs).toEqual([]);
    });

    // test for #5445
    test('Loading with locale shows correct translation for string length block parameter', async () => {
        await loadUri(`${uri}?locale=ja`);
        await notExistsByXpath('//*[div[contains(@class, "loader_background")]]');
        await clickText('演算'); // Operators category in Japanese
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait for blocks to scroll
        await clickText('の長さ', scope.blocksTab); // Click "length <apple>" block
        await findByText('3', scope.reportedValue); // Tooltip with result
        const logs = await getLogs();
        await expect(logs).toEqual([]);
    });

    // Regression test for ENA-142, monitor can lag behind language selection
    test('Monitor labels update on locale change', async () => {
        await loadUri(uri);
        await notExistsByXpath('//*[div[contains(@class, "loader_background")]]');
        await clickXpath(FILE_MENU_XPATH);
        await clickText('Load from your computer');
        const input = await findByXpath('//input[@accept=".sb,.sb2,.sb3"]');
        await input.sendKeys(path.resolve(__dirname, '../fixtures/monitor-variable.sb3'));

        // Monitors are present
        await findByText('username', scope.monitors);
        await findByText('language', scope.monitors);

        // Change locale to ja
        await clickXpath(SETTINGS_MENU_XPATH);
        await clickText('Language', scope.menuBar);
        await clickText('日本語');

        // Monitor labels updated
        await findByText('ユーザー名', scope.monitors);
        await findByText('言語', scope.monitors);

        const logs = await getLogs();
        await expect(logs).toEqual([]);
    });
});
