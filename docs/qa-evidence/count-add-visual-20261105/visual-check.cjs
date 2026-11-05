async page => {
 await page.setViewportSize({width:390,height:740});
 const card=page.locator('.catalogue-game-card').filter({hasText:'Count the Stars'});await card.scrollIntoViewIfNeeded();await card.click();
 const title=page.getByRole('heading',{name:'Count the Stars',exact:true});await title.waitFor();
 const header=()=>title.locator('..').locator('p').innerText();
 const first=(await header()).trim(), selected=(await page.locator('main h2').first().innerText()).trim();
 if(first!==selected)throw Error(`Mismatched selected survey ${first} vs ${selected}`);
 await page.screenshot({path:'/tmp/amari-count-v65.png'});
 await page.getByText('Choose another survey',{exact:true}).click();
 const option=page.getByRole('button',{name:/^Star Garden ·/}); if(!await option.isDisabled())await option.click();
 const nextHeader=(await header()).trim(),nextSelected=(await page.locator('main h2').first().innerText()).trim();if(nextHeader!==nextSelected)throw Error('Header mismatch after changing survey');
 await page.getByRole('button',{name:/Constellation book/}).click();const bookHeader=(await header()).trim();if(bookHeader!=='Constellation book')throw Error('Book header is not labelled');
 await page.getByRole('button',{name:'Back to Maths Missions'}).click();
 const add=page.locator('.catalogue-game-card').filter({hasText:'Addition Adventure'});await add.scrollIntoViewIfNeeded();await add.click();
 const art=page.locator('[data-addition-menu] img[src="/art/catalog-v3/game-addition.webp"]');await art.waitFor();await page.waitForFunction(()=>{const i=document.querySelector('[data-addition-menu] img');return i?.complete&&i.naturalWidth>0});
 await page.screenshot({path:'/tmp/amari-add-v65.png'});
 const geometry=await page.evaluate(()=>{const el=document.querySelector('[data-addition-start]'),r=el.getBoundingClientRect();return {width:r.width,height:r.height,top:r.top,bottom:r.bottom,viewport:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,hit:el.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2))}});
 return {passed:first===selected&&nextHeader===nextSelected&&bookHeader==='Constellation book'&&!geometry.overflow&&geometry.height>=44&&geometry.hit,first,nextHeader,bookHeader,geometry};
}
