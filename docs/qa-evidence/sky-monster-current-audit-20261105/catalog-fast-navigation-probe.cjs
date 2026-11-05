async page => {
 const events=[];const onFail=r=>events.push({url:r.url(),error:r.failure()?.errorText,atUrl:page.url(),when:Date.now()});
 page.on('requestfailed',onFail);let provider=[];await page.unroute('**/api/**');await page.route('**/api/**',r=>{provider.push(r.request().url());return r.fulfill({status:403,body:'QA guard'})});
 try {
  await page.waitForLoadState('networkidle',{timeout:15000});
  const back=page.getByRole('button',{name:'Back to home'});if(await back.count())await back.click();
  await page.getByRole('heading',{name:'Choose a world',exact:true}).waitFor();
  await page.waitForLoadState('networkidle',{timeout:15000});
  await page.locator('.discovery-world-card').filter({hasText:'Creative Lab'}).click();
  await page.getByRole('heading',{name:'Creative Lab',exact:true}).waitFor();
  const enter=page.url();await page.getByRole('button',{name:'Back to home'}).click();
  await page.getByRole('heading',{name:'Choose a world',exact:true}).waitFor();await page.waitForTimeout(2000);
  return {enter,finish:page.url(),events,provider};
 } finally {page.off('requestfailed',onFail)}
}
