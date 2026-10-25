async page=>{
 const guides=TRACE_GUIDES,rows=[],errors=[],providers=[];page.on('pageerror',e=>errors.push(e.message));await page.unroute('**/api/**');await page.route('**/api/**',r=>{providers.push(r.request().url());return r.fulfill({status:403,body:'QA guard'})});await page.setViewportSize({width:390,height:900});
 const root=QA_ORIGIN+'/?dot-qa='+Date.now();await page.goto(root+'#/');await page.getByRole('button',{name:/Age 6\+.*Amari/}).click();await page.goto(root+'#/play/trace');await page.getByRole('button',{name:'Big and little',exact:true}).click();await page.getByRole('button',{name:'Start Big and little →',exact:true}).click();
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('amari_letter_trace_progress_v1')));let found=false;
 for(let run=0;run<8&&!found;run++){
  for(let round=0;round<8;round++){
   const canvas=page.locator('canvas');await canvas.waitFor();const letter=await page.locator('main[data-trace-letter]').getAttribute('data-trace-letter'),strokes=guides[letter];
   if(letter==='i'){
    await canvas.scrollIntoViewIfNeeded();const box=await canvas.boundingBox(),scale=Math.min(box.width,box.height)*.86,left=(box.width-scale)/2,top=(box.height-scale)/2+8;const c=await page.context().newCDPSession(page);await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
    for(const stroke of strokes){const points=stroke.map(([x,y])=>({x:box.x+left+x*scale,y:box.y+top+y*scale,id:1}));await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points[0]]});if(!stroke.every(p=>p[0]===stroke[0][0]&&p[1]===stroke[0][1]))for(let j=1;j<points.length;j++)await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[points[j]]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
    await c.send('Emulation.setTouchEmulationEnabled',{enabled:false});await c.detach();if(!await page.getByRole('button',{name:'Check shape',exact:true}).isEnabled())throw Error('Native dot tap did not complete i');found=true;
   }else{await page.getByText('More tracing tools',{exact:true}).click();await page.getByRole('button',{name:'Use keyboard',exact:true}).click();await canvas.focus();for(const stroke of strokes){await page.keyboard.press('Space');for(let j=1;j<stroke.length;j++)await page.keyboard.press('ArrowRight');await page.keyboard.press('Space')}}
   await page.getByRole('button',{name:'Check shape',exact:true}).click();await page.getByRole('region',{name:'Completed letter'}).waitFor();rows.push({run,round,letter,input:found?'native touch line and dot tap':'keyboard practice'});if(found)break;await page.getByRole('button',{name:round===7?'Finish chapter →':'Next letter →',exact:true}).click();
  }
  if(!found)await page.getByRole('button',{name:'Replay chapter',exact:true}).click();
 }
 if(!found)throw Error('No lower i in bounded natural replay');if(errors.length||providers.length)throw Error('Runtime error');const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('amari_letter_trace_progress_v1')));await page.getByRole('button',{name:'Back to learning world',exact:true}).click();return{passed:true,game:'trace-dot',width:390,origin:QA_ORIGIN,at:new Date().toISOString(),runtimeExpected:QA_RUNTIME,entry:await page.locator('script[type=module][src]').getAttribute('src'),before,after,rows,errors,providers};
}
