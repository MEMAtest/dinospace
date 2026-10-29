// Actual-control Ladder Rescue level flow for concatenating before the native
// matrix callback. The caller must already be on the Ladder Rescue start view.
// This helper reads only rendered UI and uses ordinary visible controls.
async function runRescueLadderLevel(page, levelIndex, opts = {}) {
  const floorsByLevel = [2, 3, 3, 4, 5];
  const roundsByLevel = [3, 4, 5, 5, 5];
  const timeoutMs = opts.timeoutMs ?? 10000;
  const expectedFloors = floorsByLevel[levelIndex];
  const expectedRounds = roundsByLevel[levelIndex];
  if (!Number.isInteger(levelIndex) || levelIndex < 0 || levelIndex >= floorsByLevel.length) {
    throw new Error(`Ladder levelIndex must be 0..4; received ${levelIndex}`);
  }

  const must = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  const box = async (locator, label, minWidth = 1, minHeight = 1) => {
    await locator.waitFor({ state: 'visible', timeout: timeoutMs });
    const rect = await locator.evaluate((element) => {
      const r = element.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
    });
    const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
    must(rect.width >= minWidth && rect.height >= minHeight, `${label} is too small: ${JSON.stringify(rect)}`);
    must(rect.x >= 0 && rect.y >= 0 && rect.right <= viewport.width + 1 && rect.bottom <= viewport.height + 1,
      `${label} is outside the viewport: ${JSON.stringify({ rect, viewport })}`);
    return rect;
  };
  const buddyBox = async (locator, label) => box(locator, label, 80, 80);
  const imagesAreReady = async (scope, label) => {
    const images = scope.locator('img');
    for (let i = 0; i < await images.count(); i += 1) {
      const image = images.nth(i);
      await image.waitFor({ state: 'visible', timeout: timeoutMs });
      const result = await image.evaluate(async (element) => {
        let decoded = false;
        try { await element.decode(); decoded = true; } catch {}
        return { decoded, src: element.currentSrc || element.src, complete: element.complete,
          naturalWidth: element.naturalWidth, naturalHeight: element.naturalHeight };
      });
      must(result.decoded && result.complete && result.naturalWidth > 0 && result.naturalHeight > 0,
        `${label} has a missing or undecoded image: ${JSON.stringify(result)}`);
    }
  };

  const levelButton = page.getByRole('button', { name: `Practice level ${levelIndex + 1}`, exact: true });
  await levelButton.waitFor({ state: 'visible', timeout: timeoutMs });
  must(await levelButton.isEnabled(), `Ladder Level ${levelIndex + 1} is not unlocked in the actual UI`);
  await levelButton.click();

  const startBuddy = page.locator('.animate-bounce-slow .h-16.w-16').first();
  await box(startBuddy, 'Ladder start buddy', 63.5, 63.5);
  await imagesAreReady(page.locator('.animate-bounce-slow'), 'Ladder start art');
  await page.locator('img[src="/art/rescue-animals-v2/animal-kitten.webp"]').waitFor({ state: 'visible', timeout: timeoutMs });
  await page.locator('img[src="/art/rescue-animals-v2/ladder-truck.webp"]').waitFor({ state: 'visible', timeout: timeoutMs });
  const start = page.getByRole('button', { name: 'Play Ladder Rescue', exact: true });
  const startActionRect = await box(start, 'Ladder start button', 48, 48);
  await opts.onStartAction?.({ page, rect: startActionRect, label: 'Play Ladder Rescue' });
  await start.click();

  const rows = [];
  const rescues = [];
  for (let round = 0; round < expectedRounds; round += 1) {
    const prompt = page.getByRole('button', { name: /^Hear again:/ });
    await prompt.waitFor({ state: 'visible', timeout: timeoutMs });
    const promptLabel = await prompt.getAttribute('aria-label');
    const promptRect = await box(prompt, `Ladder round ${round + 1} prompt`, 48, 48);

    const floors = page.locator('main button[aria-label^="Floor "]');
    await floors.first().waitFor({ state: 'visible', timeout: timeoutMs });
    const floorCount = await floors.count();
    must(floorCount === expectedFloors,
      `Ladder Level ${levelIndex + 1} should show ${expectedFloors} floors, found ${floorCount}`);
    const entries = [];
    for (let i = 0; i < floorCount; i += 1) {
      const floorButton = floors.nth(i);
      const label = await floorButton.getAttribute('aria-label');
      const floorNumber = Number(label.match(/^Floor (\d+)/)?.[1]);
      must(Number.isInteger(floorNumber) && floorNumber === i + 1, `Unexpected Ladder floor control: ${label}`);
      const rect = await box(floorButton, `Ladder floor ${floorNumber}`, 48, 48);
      entries.push({ floorNumber, label, floorButton, rect });
    }

    let targetFloor;
    const spokenNumber = promptLabel.match(/floor\s+(one|two|three|four|five)\b/i)?.[1]?.toLowerCase();
    if (spokenNumber) {
      targetFloor = ({ one: 1, two: 2, three: 3, four: 4, five: 5 })[spokenNumber];
    } else {
      const promptImage = prompt.locator('img');
      must(await promptImage.count() === 1, `Animal prompt should show one bounded portrait: ${promptLabel}`);
      const promptImageRect = await box(promptImage, `Ladder round ${round + 1} prompt portrait`, 48, 48);
      must(promptImageRect.width <= 52 && promptImageRect.height <= 52,
        `Ladder prompt portrait should remain near 48px, received ${JSON.stringify(promptImageRect)}`);
      const promptElement = await promptImage.elementHandle();
      await page.waitForFunction((image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
        promptElement, { timeout: timeoutMs });
      const promptImageInfo = await promptImage.evaluate((image) => ({ src: image.currentSrc, complete: image.complete, width: image.naturalWidth, height: image.naturalHeight }));
      must(promptImageInfo.complete && promptImageInfo.width > 0 && promptImageInfo.height > 0,
        `Ladder prompt portrait is not decoded: ${JSON.stringify(promptImageInfo)}`);
      const animal = promptLabel.match(/rescue the\s+([a-z]+)/i)?.[1]?.toLowerCase();
      must(animal, `Could not derive the target from the visible Ladder prompt: ${promptLabel}`);
      targetFloor = entries.find((entry) => entry.label.toLowerCase().includes(`the ${animal}`))?.floorNumber;
    }
    must(Number.isInteger(targetFloor) && targetFloor >= 1 && targetFloor <= expectedFloors,
      `Visible prompt did not match a shown floor: ${promptLabel}`);
    const targetControl = entries.find((entry) => entry.floorNumber === targetFloor);
    must(targetControl, `Missing visible target floor ${targetFloor}`);
    if (round === 0) {
      await opts.capture?.('ladder-level-start', page, {
        level: levelIndex + 1,
        floorLabels: entries.map(({ floorNumber, label }) => ({ floorNumber, label })),
        targetFloor,
      });
      if (expectedFloors === 5) {
        const sprites = await page.locator('main button[aria-label^="Floor "]').evaluateAll((buttons) => buttons.map((button) => {
          const image = button.querySelector('img[src^="/art/rescue-animals-v2/animal-"]');
          const frame = image?.parentElement?.parentElement;
          const rect = (element) => {
            if (!element) return null;
            const { x, y, width, height } = element.getBoundingClientRect();
            return { x, y, right: x + width, bottom: y + height, width, height };
          };
          const imageRect = rect(image);
          const frameRect = rect(frame);
          const tolerance = 1.5;
          return {
            floor: button.getAttribute('aria-label'),
            src: image?.getAttribute('src') || null,
            loaded: Boolean(image?.complete && image.naturalWidth > 0),
            imageRect,
            frameRect,
            contained: Boolean(imageRect && frameRect
              && imageRect.x >= frameRect.x - tolerance
              && imageRect.y >= frameRect.y - tolerance
              && imageRect.right <= frameRect.right + tolerance
              && imageRect.bottom <= frameRect.bottom + tolerance),
          };
        }));
        must(sprites.length === 5 && sprites.every((sprite) => sprite.loaded),
          `Ladder Level 5 must decode all five floor portraits: ${JSON.stringify(sprites)}`);
        must(sprites.every((sprite) => sprite.contained),
          `Ladder floor portraits must fit inside their own window frames: ${JSON.stringify(sprites)}`);
        must(await page.locator('img[src="/art/rescue-animals-v2/ladder-truck.webp"]').count() > 0,
          'Ladder Level 5 did not show its no-ladder truck sprite');
      }
    }

    const runWrong = typeof opts.injectWrong === 'function'
      ? await opts.injectWrong({ page, levelIndex, round, promptLabel, targetFloor, floorLabels: entries.map(({ floorNumber, label }) => ({ floorNumber, label })) })
      : (opts.injectWrong !== false);
    let heldClue = null;
    let wrongFeedbackLayout = null;
    if (runWrong && entries.length > 1) {
      const wrongControl = entries.find((entry) => entry.floorNumber !== targetFloor);
      const board = page.locator('main div[style*="aspect-ratio"]').first();
      let boardBefore = null;
      let windowsBefore = null;
      if (opts.inspectWrongLayout && round === 0) {
        boardBefore = await box(board, 'Ladder board before wrong retry');
        windowsBefore = await floors.evaluateAll((buttons) => buttons.map((button) => {
          const r = button.getBoundingClientRect();
          return { floor: button.getAttribute('aria-label'), x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
        }));
      }
      await wrongControl.floorButton.click();
      const clue = page.getByRole('alert');
      await clue.waitFor({ state: 'visible', timeout: timeoutMs });
      heldClue = (await clue.innerText()).trim();
      must(heldClue.length > 0, `Ladder round ${round + 1} wrong choice did not show a retry clue`);
      must((await prompt.getAttribute('aria-label')) === promptLabel,
        `Ladder target prompt changed after wrong floor ${wrongControl.floorNumber}`);
      await page.waitForTimeout(500);
      must(await clue.isVisible(), `Ladder retry clue did not remain held after a wrong choice`);
      must((await prompt.getAttribute('aria-label')) === promptLabel,
        `Ladder target prompt changed while retry clue was held`);
      if (boardBefore) {
        const boardAfter = await box(board, 'Ladder board while wrong retry is held');
        const windowsAfter = await floors.evaluateAll((buttons) => buttons.map((button) => {
          const r = button.getBoundingClientRect();
          return { floor: button.getAttribute('aria-label'), x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
        }));
        const clueRect = await clue.evaluate((element) => {
          const r = element.getBoundingClientRect();
          return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
        });
        const stable = JSON.stringify(windowsBefore) === JSON.stringify(windowsAfter)
          && ['x', 'y', 'right', 'bottom', 'width', 'height'].every((key) => Math.abs(boardBefore[key] - boardAfter[key]) <= 0.5);
        const withinScene = clueRect.x >= boardAfter.x && clueRect.y >= boardAfter.y
          && clueRect.right <= boardAfter.x + boardAfter.width * 0.45
          && clueRect.bottom <= boardAfter.y + boardAfter.height * 0.35;
        must(stable, `Wrong feedback shifted the Ladder board or floor controls: ${JSON.stringify({ boardBefore, boardAfter, windowsBefore, windowsAfter })}`);
        must(withinScene, `Wrong feedback card is not held in the clear upper-left sky area: ${JSON.stringify({ clueRect, boardAfter })}`);
        wrongFeedbackLayout = { boardBefore, boardAfter, windowsBefore, windowsAfter, clueRect, stableFloorTargets: stable, clearUpperLeftCard: withinScene };
      }
    }

    if (opts.doubleCorrect && round === 0) {
      await targetControl.floorButton.evaluate((element) => {
        element.click();
        element.click();
      });
    } else {
      await targetControl.floorButton.click();
    }
    const ladder = page.locator('main svg[viewBox="0 0 100 100"]');
    await ladder.waitFor({ state: 'visible', timeout: timeoutMs });
    await page.waitForFunction(() => {
      const svg = document.querySelector('main svg[viewBox="0 0 100 100"]');
      return svg && svg.querySelectorAll('line').length >= 2;
    }, null, { timeout: timeoutMs });
    const animationStart = await ladder.locator('line').first().getAttribute('x2');
    await page.waitForTimeout(180);
    const animationMid = await ladder.locator('line').first().getAttribute('x2');
    must(animationStart !== animationMid, 'Ladder rails did not visibly advance during the rescue animation');

    const review = page.getByRole('group', { name: 'Ladder rescue review', exact: true });
    await review.waitFor({ state: 'visible', timeout: timeoutMs });
    must(await review.count() === 1, 'A rapid repeated correct activation produced more than one held rescue review');
    const reviewText = (await review.innerText()).trim();
    must(reviewText.includes(`floor ${targetFloor}`), `Ladder review omitted the rescued floor: ${reviewText}`);
    if (!spokenNumber) {
      const animal = promptLabel.match(/rescue the\s+([a-z]+)/i)?.[1]?.toLowerCase();
      must(animal && reviewText.toLowerCase().includes(animal), `Ladder review omitted the prompted animal: ${reviewText}`);
    }
    const resultBuddy = page.locator('section[aria-label="Round complete"] .absolute.right-10.h-20.w-20');
    await buddyBox(resultBuddy, `Ladder round ${round + 1} rescued buddy`);
    await imagesAreReady(page.locator('section[aria-label="Round complete"]'), `Ladder round ${round + 1} review`);

    const row = {
      level: levelIndex + 1,
      round: round + 1,
      prompt: promptLabel,
      targetFloor,
      displayedFloors: floorCount,
      wrongAttempt: Boolean(runWrong),
      heldClue,
      wrongFeedbackLayout,
      animationObserved: animationStart !== animationMid,
      review: reviewText,
      promptBox: { width: promptRect.width, height: promptRect.height },
    };
    rows.push(row);
    rescues.push({ animalOrFloorPrompt: promptLabel, targetFloor });
    await opts.onReview?.({ page, row, reviewText, finalRound: round + 1 === expectedRounds });
    await opts.capture?.('ladder-round-review', page, row);

    const advanceLabel = round + 1 < expectedRounds ? 'Next round' : 'Finish game';
    const advance = page.getByRole('button', { name: advanceLabel, exact: true });
    await advance.waitFor({ state: 'visible', timeout: timeoutMs });
    if (round + 1 === expectedRounds) await opts.onBeforeFinish?.({ page, levelIndex, rows, rescues, advance });
    await advance.click();
  }

  if (opts.expectSaveError) {
    const saveError = page.getByRole('heading', { name: 'Your result is ready, but it is not saved yet.', exact: true });
    await saveError.waitFor({ state: 'visible', timeout: timeoutMs });
    return { level: levelIndex + 1, rounds: rows.length, rescues, rows, blockedSave: true };
  }
  const resultHeading = page.getByRole('heading', { name: /Well done/i });
  await resultHeading.waitFor({ state: 'visible', timeout: timeoutMs });
  const resultBuddy = page.locator('main .absolute.right-10.h-20.w-20').first();
  await buddyBox(resultBuddy, 'Ladder result buddy');
  await imagesAreReady(page.locator('main'), 'Ladder result art');
  return { level: levelIndex + 1, rounds: rows.length, rescues, rows, startActionRect };
}
