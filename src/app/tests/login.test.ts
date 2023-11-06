/**
 * @jest-environment node
 */

import { chromium, Page } from "playwright";

let page: Page;

beforeAll(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto('http://localhost:3000'); // Assuming your Next.js app is running locally on port 3000
});

afterAll(async () => {
    await page.close();

});

describe("Login Page", () => {
    it("should display the login form", async () => {
        const form = await page.$("form");
        expect(form).not.toBeNull();
    });

    it("should validate and submit the login form", async () => {
        await page.fill('input[name="email"]', "test@email.com");
        await page.fill('input[name="password"]', "password123");
        await page.click('button[type="submit"]');
        // You might want to add more assertions here, for example checking if you navigated to the profile page
    });


    it("should click on Google login", async () => {
        await page.click('button:has-text("Google")');
        // Here, you can add assertions based on your application behavior after clicking Google login.
    });

    it("should click on Microsoft login", async () => {
        await page.click('button:has-text("Microsoft")');
        // Similarly, add assertions based on your application behavior after clicking Microsoft login.
    });

    it("should navigate to forgot password", async () => {

        await page.getByText('Forgot password?').click();
        await page.waitForURL('http://localhost:3000/forgot-password');
        expect(page.url()).toBe("http://localhost:3000/forgot-password");
    });



});
