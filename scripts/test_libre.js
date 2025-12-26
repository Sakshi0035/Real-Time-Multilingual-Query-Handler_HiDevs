(async()=>{
  try {
    const q='hola!';
    const detectResp = await fetch('https://libretranslate.de/detect',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ q })
    });
    const detectText = await detectResp.text();
    console.log('DETECT RAW:', detectText.substring(0,1000));
    let detect;
    try { detect = JSON.parse(detectText); } catch(e) { detect = null; }
    const src = detect && Array.isArray(detect) && detect[0] && detect[0].language ? detect[0].language : 'auto';
    const translateResp = await fetch('https://libretranslate.de/translate',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ q, source: src, target: 'en', format: 'text' })
    });
    const translateText = await translateResp.text();
    console.log('TRANSLATE RAW:', translateText.substring(0,1000));
    let translate;
    try { translate = JSON.parse(translateText); } catch(e) { translate = null; }
    console.log('TRANSLATE PARSED:', translate);
  } catch (e) {
    console.error('ERROR', e);
  }
})();
