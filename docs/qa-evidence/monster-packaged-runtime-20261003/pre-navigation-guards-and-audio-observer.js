async page => {
  await page.route('**/api/voice**', route => route.abort());
  await page.route('**/api/story**', route => route.abort());
  await page.addInitScript(() => {
    window.__qaMediaEvents = [];
    const NativeAudio = window.Audio;
    window.Audio = new Proxy(NativeAudio, { construct(Target, args) {
      const media = Reflect.construct(Target, args, Target);
      for (const type of ['loadstart','loadedmetadata','canplay','play','playing','timeupdate','pause','ended','error','abort','emptied']) media.addEventListener(type, () => window.__qaMediaEvents.push({type,src:media.currentSrc||media.src,currentTime:media.currentTime,duration:media.duration,paused:media.paused,networkState:media.networkState,error:media.error&&media.error.code,at:Date.now()}));
      return media;
    }});
  });
  return 'guarded routes installed before first navigation; native Audio event observer set';
}
