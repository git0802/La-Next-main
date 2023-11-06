/**
 * @jest-environment node
 */

import { chromium, Page } from "playwright";

let page: Page

// Helper function to login
const login = async () => {
    await page.goto('http://localhost:3000/login');

    // Type in the email and password
    await page.fill('input[name="email"]', 'robpercival81+2@gmail.com');
    await page.fill('input[name="password"]', 'gopcot-0dyfda-jipxYn');

    // Click the login button
    const loginButton = await page.$('button:has-text("Login")');  // Adjust the button selector if it's different
    if (loginButton) {
        await loginButton.click();
    }

    // Optionally, wait for navigation or some indication that login was successful
    await page.waitForURL('http://localhost:3000/profile');
};

beforeAll(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto('http://localhost:3000'); // Assuming your Next.js app is running locally on port 3000
    await login();
});

afterAll(async () => {
    await page.close();

});

describe('Stream Page', () => {

    beforeEach(async () => {
        await page.goto('http://localhost:3000/stream');
    });

    it('should fetch and display generated bios on button click', async () => {
        // Ensure the button exists
        const goButton = await page.$('button:has-text("Go")');
        expect(goButton).not.toBeNull();

        // Click the button
        if (goButton) {
            await goButton.click();

            // Wait for the response and check if the generatedBios is displayed
            await page.waitForSelector('div.space-y-8');

            const bioContent = await page.$eval('div.space-y-8 p', el => el.textContent);
            expect(bioContent).not.toEqual("");
        }
    });
});
