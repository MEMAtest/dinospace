async page=>{
const answers={"How many fingers on one hand?": "5", "How many days in a week?": "7", "How many legs does a spider have?": "8", "How many wheels on a car?": "4", "How many months in a year?": "12", "How many eyes do you have?": "2", "Which shape has 3 sides?": "Triangle", "Which shape is round?": "Circle", "Which shape has 4 equal sides?": "Square", "A football is shaped like a...": "Sphere", "What shape is a dice?": "Cube", "Which shape has 5 points?": "Star", "Which animal is the King of the Jungle?": "Lion", "Which animal has a long trunk?": "Elephant", "Which animal says \"Moo\"?": "Cow", "Which animal can fly?": "Eagle", "Which is the tallest animal?": "Giraffe", "Which animal lives in the sea?": "Dolphin", "Which animal is the fastest on land?": "Cheetah", "What organ pumps blood around your body?": "Heart", "What do you use to breathe?": "Lungs", "What do you think with?": "Brain", "What covers your whole body?": "Skin", "What helps you chew food?": "Teeth", "What do you use to hear sounds?": "Ears", "What is the closest star to Earth?": "The Sun", "How many planets in our solar system?": "8", "What planet are we on?": "Earth", "Which planet has beautiful rings?": "Saturn", "What do astronauts wear in space?": "Space suit", "Which planet is called the Red Planet?": "Mars", "What pulls things down to the ground?": "Gravity", "Which dinosaur had tiny arms?": "T-Rex", "Which dinosaur had 3 horns?": "Triceratops", "Which dinosaur had plates on its back?": "Stegosaurus", "Which prehistoric reptile could fly?": "Pterodactyl", "What did dinosaurs hatch from?": "Eggs", "Are non-bird dinosaurs still alive today?": "No", "Who was the first person to walk on the Moon?": "Neil Armstrong", "Who was the first person ever to go to space?": "Yuri Gagarin", "Who went to the Moon with Neil Armstrong?": "Buzz Aldrin", "Who was the first Black woman to travel to space?": "Mae Jemison", "Who was the first American woman in space?": "Sally Ride", "Which astronaut sang a song from space?": "Chris Hadfield", "What was the name of the first dog sent to orbit Earth?": "Laika", "Which British astronaut ran a marathon in space?": "Tim Peake"}; const events=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/api/voice**',r=>r.fulfill({status:403,body:'QA guard'}));await page.route('**/api/story**',r=>r.fulfill({status:403,body:'QA guard'}));
await page.goto('https://dinospace-eight.vercel.app/?astro-proof='+Date.now()+'#/');await page.getByRole('button',{name:/Age 6\+ Amari/}).click();await page.locator('.discovery-world-card').filter({hasText:'Explore & Languages'}).click();await page.locator('.catalogue-game-card').filter({hasText:'Astronaut Academy'}).click();
const firstRuns={};
for(const width of [1440,390]){await page.setViewportSize({width,height:844});
await page.screenshot({path:'output/playwright/targeted-ux-final-production-20261018/astro-home-'+width+'.png',fullPage:true});
for(const title of ['Launch Lab','Earth & Life','Space Explorers']){
 await page.locator('.astro-mission-card').filter({hasText:title}).click();const questions=[];
 for(let n=0;n<5;n++){
  const q=await page.locator('.astro-question-card h1').innerText();const answer=answers[q];if(!answer)throw Error('Unknown question '+q);questions.push(q);
  if(n===0){const wrong=page.locator('.astro-answer').filter({hasNot:page.getByText(answer,{exact:true})}).first();await wrong.click();await page.getByRole('button',{name:'Try again',exact:true}).click();}
  const choicesBefore=await page.locator('.astro-answer').allTextContents();
  await page.locator('.astro-answer').filter({has:page.getByText(answer,{exact:true})}).click();
  if(JSON.stringify(choicesBefore)!==JSON.stringify(await page.locator('.astro-answer').allTextContents()))throw Error('Answers changed during feedback');
  const fact=await page.locator('.astro-feedback-copy p').innerText();if(fact.length<20)throw Error('Missing fact '+q);
  if(n===0){await page.screenshot({path:'output/playwright/targeted-ux-final-production-20261018/astro-'+title.replace(/[^a-z]/gi,'')+'-'+width+'.png',fullPage:true});if(title==='Launch Lab'&&width===1440){await page.waitForTimeout(6500);if(!await page.getByRole('button',{name:'Next question',exact:true}).isVisible())throw Error('Fact dismissed');}}
  const metric=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),targets:[...document.querySelectorAll('.astro-feedback button,.astro-answer')].map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))}));if(metric.scrollWidth>width||metric.broken.length||metric.targets.some(t=>t.width<44||t.height<44))throw Error(JSON.stringify(metric));
  await page.getByRole('button',{name:n===4?'Finish mission':'Next question',exact:true}).click();
 }
 await page.getByRole('heading',{name:'Look how far you went!',exact:true}).waitFor();
 events.push({width,title,questions,complete:true,firstQuestionWasRetried:true});
 if(width===1440)firstRuns[title]=questions;else if(questions.every(q=>firstRuns[title].includes(q)))throw Error('Replay repeated whole run');
 await page.getByRole('button',{name:'Choose another mission',exact:false}).click();
}
}
return {runs:events,pageErrors:errors};
}