import { test, expect } from '@playwright/test';

test('solution cards resize with mode and content on mobile and desktop', async ({
  page,
}, info) => {
  test.setTimeout(90000);
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const formula of ['arithmetic-mean', 'z-test', 'regression']) {
      await page.goto('/#/solver?formula=' + formula);
      if (formula === 'arithmetic-mean')
        await page.getByLabel('Data set', { exact: true }).fill('1,2,9');
      await page.getByRole('button', { name: 'Quick Solution', exact: true }).click();
      await page.getByRole('button', { name: 'Solve problem', exact: true }).click();
      await page.evaluate(() => document.fonts.ready);
      const panel = page.getByRole('region', { name: 'Statistical solution', exact: true });
      const answer = page.locator('.result-answer');
      const value = await answer.getAttribute('data-result-value');
      const quick = (await panel.boundingBox())!;
      const quickAnswer = (await answer.boundingBox())!;
      expect(quick.height, `${width}/${formula} compact height`).toBeLessThan(750);
      await expect(panel).toHaveClass(/stat-result-quick/);
      await expect(page.locator('.visualization')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      if (width === 1440 && formula === 'arithmetic-mean') {
        await page.getByLabel('Data set', { exact: true }).evaluate((element) => {
          (element as HTMLElement).style.height = '1000px';
        });
        expect((await panel.boundingBox())!.height).toBeCloseTo(quick.height, 0);
        expect((await panel.boundingBox())!.height).toBeLessThan(
          (await page.locator('.stat-input').boundingBox())!.height,
        );
        await page.getByLabel('Data set', { exact: true }).evaluate((element) => {
          (element as HTMLElement).style.height = '';
        });
      }
      if (formula === 'arithmetic-mean')
        await panel.screenshot({ path: info.outputPath(`quick-${width}.png`) });
      await page.getByRole('button', { name: 'Detailed Step-by-Step', exact: true }).click();
      await page.evaluate(() => document.fonts.ready);
      await expect(panel).toHaveClass(/stat-result-detailed/);
      await expect(answer).toHaveAttribute('data-result-value', value!);
      const detailed = (await panel.boundingBox())!;
      expect(detailed.height).toBeGreaterThan(quick.height + 250);
      expect((await answer.boundingBox())!.height).toBeGreaterThan(quickAnswer.height);
      await expect(page.locator('.visualization svg')).not.toHaveCount(0);
      expect(await panel.evaluate((el) => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(
        1,
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      if (formula === 'arithmetic-mean')
        await panel.screenshot({ path: info.outputPath(`detailed-${width}.png`) });
      await page.getByRole('button', { name: 'Quick Solution', exact: true }).click();
      expect((await panel.boundingBox())!.height).toBeCloseTo(quick.height, 0);
      await expect(answer).toHaveAttribute('data-result-value', value!);
    }
  }
});

test('project information uses the exact labels and values in desktop and mobile views', async ({
  page,
}) => {
  const labels = ['Student Name', 'University', 'Supervised By', 'Subject'];
  const values = [
    'Ahmed Waleed Reda Gad',
    'Horus University',
    'Dr. Mohamed Ibrahim Sobh',
    'Advanced Probability and Statistics',
  ];
  await page.goto('/');
  await expect(page.locator('.project-information dt')).toHaveText(labels);
  await expect(page.locator('.project-information dd')).toHaveText(values);
  await page.setViewportSize({ width: 375, height: 950 });
  await page.locator('.mobile-project-information summary').click();
  await expect(page.locator('.mobile-project-information dt')).toHaveText(labels);
  await expect(page.locator('.mobile-project-information dd')).toHaveText(values);
  await expect(page.locator('.mobile-project-information')).not.toContainText('Doctor Name');
});
