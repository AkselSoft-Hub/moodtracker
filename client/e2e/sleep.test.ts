import { Browser, ElementHandle, Page } from "puppeteer";
import { SELECTORS, URLS } from "./constants";
import { createAndSetUpBrowser, createPageAndSignIn } from "./utils";
import { ERRORS } from "../src/constants";

describe("sleep", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await createAndSetUpBrowser();
    page = await createPageAndSignIn(browser);
  });

  afterAll(async () => {
    await browser.close();
  });

  describe("adding a sleep", () => {
    let timeSleptInput: ElementHandle<HTMLInputElement>;
    let dateAwokeInput: ElementHandle<HTMLInputElement>;
    let submitButton: ElementHandle<HTMLButtonElement>;

    beforeEach(async () => {
      await page.goto(URLS.sleepAdd);
      await page.waitForSelector(SELECTORS.sleepAddPage);
      dateAwokeInput = (await page.$(
        SELECTORS.dateAwokeInput,
      )) as ElementHandle<HTMLInputElement>;
      timeSleptInput = (await page.$(
        SELECTORS.timeSleptInput,
      )) as ElementHandle<HTMLInputElement>;
      submitButton = (await page.$(
        SELECTORS.sleepAddSubmitButton,
      )) as ElementHandle<HTMLButtonElement>;
      const dateAwokeValue = await dateAwokeInput.evaluate((x) => x.value);
      expect(dateAwokeValue).toBe(new Date().toISOString().slice(0, 10));
    });

    test("no input", async () => {
      await dateAwokeInput.evaluate((el) => (el.value = ""));
      await submitButton.evaluate((el) => el.click());

      const errors = await page.$$('[data-eri-id="field-error"]');
      expect(errors).toHaveLength(2);

      const errorMessages = await Promise.all(
        errors.map((error) => error.evaluate((el) => el.textContent)),
      );

      expect(errorMessages).toStrictEqual([ERRORS.required, ERRORS.required]);
    });

    test("time slept range underflow", async () => {
      await timeSleptInput.focus();
      await timeSleptInput.type("00:00", { delay: 10 });
      const timeSleptValue = await timeSleptInput.evaluate((x) => x.value);
      expect(timeSleptValue).toBe("00:00");
      await timeSleptInput.press("Enter");

      const errors = await page.$$('[data-eri-id="field-error"]');
      expect(errors).toHaveLength(1);

      const errorMessage = await errors[0].evaluate((el) => el.textContent);
      expect(errorMessage).toBe(ERRORS.rangeUnderflow);
    });

    test("date awoke range overflow", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isoDateTomorrow = tomorrow.toISOString().slice(0, 10);

      await timeSleptInput.focus();
      await timeSleptInput.type("08:00", { delay: 10 });

      await dateAwokeInput.focus();
      await dateAwokeInput.evaluate((el) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        el.value = tomorrow.toISOString().slice(0, 10);
      });
      const dateAwokeValue = await dateAwokeInput.evaluate((x) => x.value);
      expect(dateAwokeValue).toBe(isoDateTomorrow);
      await dateAwokeInput.press("Enter");

      const errors = await page.$$('[data-eri-id="field-error"]');
      expect(errors).toHaveLength(1);

      const errorMessage = await errors[0].evaluate((el) => el.textContent);
      expect(errorMessage).toBe(ERRORS.rangeOverflow);
    });

    test("valid", async () => {
      await timeSleptInput.focus();
      await timeSleptInput.type("08:00", { delay: 10 });

      await submitButton.evaluate((el) => el.click());

      expect(page.url()).toBe(URLS.sleepLog);

      const sleepCardValue = await page.waitForSelector(
        SELECTORS.sleepCardValue,
      );
      if (!sleepCardValue) throw Error(`sleepCardValue not found`);
      const sleepText = await sleepCardValue.evaluate((el) => el.textContent);

      expect(sleepText).toBe(`8 hours`);
    });
  });
});
