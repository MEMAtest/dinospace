async (page) => {
  await page.getByRole('button', { name: 'Try the jumps' }).click();
  const result = await page.locator('main').evaluate((main) => {
    const contrast = (fg, bg) => {
      const parse = (s) => s.match(/[\d.]+/g).map(Number);
      const rgb = parse(fg), back = parse(bg);
      const lum = (v) => { const c=v/255; return c<=0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4; };
      const l = (c) => 0.2126*lum(c[0])+0.7152*lum(c[1])+0.0722*lum(c[2]);
      const [a,b] = [l(rgb),l(back)].sort((x,y)=>y-x);
      return (a+0.05)/(b+0.05);
    };
    const background = (el) => {
      for (let n=el; n; n=n.parentElement) {
        const c=getComputedStyle(n).backgroundColor;
        if (c && !c.includes('rgba(0, 0, 0, 0)') && !c.includes('transparent')) return {element:n.tagName, className:n.className?.toString?.() || '', color:c};
      }
      return {element:'viewport',className:'',color:'rgb(255,255,255)'};
    };
    const status=[...main.querySelectorAll('p')].find(el=>/^At /.test(el.innerText));
    const step=main.querySelector('button:not([disabled])') && [...main.querySelectorAll('button')].find(el=>/Jump one step/.test(el.innerText));
    return {status: status && {text:status.innerText,className:status.className,foreground:getComputedStyle(status).color,fontSize:getComputedStyle(status).fontSize,weight:getComputedStyle(status).fontWeight,background:background(status)},stepButton:step && {text:step.innerText,foreground:getComputedStyle(step).color,background:getComputedStyle(step).backgroundColor,contrast:contrast(getComputedStyle(step).color,getComputedStyle(step).backgroundColor),bounds:[step.getBoundingClientRect().width,step.getBoundingClientRect().height]},viewport:{width:innerWidth,docWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}};
  });
  await page.screenshot({ path: 'docs/qa-evidence/monster-guided-jumps-20261003/mobile/story-q2-practice-contrast-390x844.png' });
  return result;
}
