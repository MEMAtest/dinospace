async page => {
  const sample=[];
  const maxRuns=60;
  for(let run=1;run<=maxRuns;run++){
    if(run>1) {
      await page.getByRole('button',{name:'Replay episode',exact:true}).click();
      await page.getByRole('heading',{name:'Monster Math',exact:true}).waitFor({state:'visible'});
    }
    for(let q=1;q<=6;q++){
      const prompt=(await page.locator('main h2').innerText()).trim();
      const mainText=await page.locator('main').innerText();
      const match=mainText.match(/(\d+)\s*([+−-])\s*(\d+)\s*=\s*\?/);
      if(!match) throw new Error('Unrecognized visible math model: '+JSON.stringify({run,q,prompt,mainText}));
      const a=Number(match[1]), op=match[2], b=Number(match[3]);
      if(a===2 && op==='+' && b===10){
        await page.screenshot({path:'/tmp/monster-exact-2plus10-desktop.png',fullPage:true});
        await page.setViewportSize({width:390,height:844});
        await page.screenshot({path:'/tmp/monster-exact-2plus10-mobile.png',fullPage:true});
        await page.setViewportSize({width:1280,height:800});
        return {status:'found',run,q,prompt,visibleEquation:match[0],visibleModelText:mainText.slice(0,1400),completedVisibleQuestions:sample.length,screenshots:['/tmp/monster-exact-2plus10-desktop.png','/tmp/monster-exact-2plus10-mobile.png'],sample};
      }
      const answer=String(op==='+' ? a+b : a-b);
      const numericOptions=(await page.getByRole('main').getByRole('button').allTextContents()).map(s=>s.trim()).filter(s=>/^\d+$/.test(s));
      if(!numericOptions.includes(answer)) throw new Error('Calculated result absent from visible answer options: '+JSON.stringify({run,q,prompt,equation:match[0],answer,numericOptions}));
      const row={run,q,prompt,equation:match[0],visibleNumericOptions:numericOptions,selected:answer};
      await page.getByRole('button',{name:answer,exact:true}).click();
      const advance= q<6 ? 'Next question' : 'Finish episode';
      await page.getByRole('button',{name:advance,exact:true}).waitFor({state:'visible'});
      const held=(await page.locator('main').innerText()).slice(-350);
      row.heldVisibleFeedback=held;
      sample.push(row);
      if(q<6) await page.getByRole('button',{name:'Next question',exact:true}).click();
      else {
        await page.getByRole('button',{name:'Finish episode',exact:true}).click();
        await page.getByRole('button',{name:'Replay episode',exact:true}).waitFor({state:'visible'});
      }
    }
  }
  return {status:'not-seen',capRuns:maxRuns,visibleQuestions:sample.length,sample};
}
