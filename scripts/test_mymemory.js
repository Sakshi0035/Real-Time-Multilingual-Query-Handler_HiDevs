(async()=>{
  try {
    const q='hola';
    const encoded=encodeURIComponent(q);
    const mm=await (await fetch(`https://api.mymemory.translated.net/get?q=${encoded}&langpair=es|en`)).json();
    console.log('MM RESPONSE:', JSON.stringify(mm.responseData, null, 2));
  } catch (e) {
    console.error('ERROR', e);
  }
})();
