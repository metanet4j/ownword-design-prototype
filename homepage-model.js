/* 确定性演练数据；产品事实和生产适配边界以核心认知、v0.4.0 PRD 为准。 */
(function(root) {
  const I = typeof module !== 'undefined' ? require('./model.js') : root.OwnwordModel;
  const C = typeof module !== 'undefined' ? require('./content-model.js') : root.OwnwordContentModel;
  const defaults = {profile:'normal',content:'normal',relationship:'normal',proof:'record'};
  const additionalIds=['4','5','6','7'].map(value=>value.repeat(34));
  const additionalProfiles=[I.emptyProfile(),{name:'Eli Park',type:'Person',bio:'Field notes, photographs, and small discoveries.',image:''},{name:'Jules Morgan',type:'Person',bio:'Listening for the everyday.',image:''},{name:'Aster Library',type:'Organization',bio:'A shared collection of independent writing.',image:''}];
  const publicRoute = hash => /^#\/(?:identity\/|content\/)/.test(hash);
  function parseRoute(hash) {
    const match = /^#\/(identity|content)\/([^/?#]+)(?:\/(following|followers|history))?$/.exec(hash);
    if (!match) return {kind:'invalid',id:''};
    try {return {kind:match[1] === 'content' ? match[3]==='history'?'history':'content' : match[3] || 'identity',id:decodeURIComponent(match[2])};}
    catch {return {kind:'invalid',id:''};}
  }
  const validId = id => /^[1-9A-HJ-NP-Za-km-z]{20,64}$/.test(id);
  function resolveIdentity(id,current,scenario='normal') {
    if (!validId(id)) return {status:'invalid'};
    const index=additionalIds.indexOf(id);
    const found = I.resolveIdentity(id,current) || (index>=0?{bapId:id,profile:additionalProfiles[index]}:null);
    if (!found) return {status:'missing'};
    if (scenario === 'failure') return {status:'error',bapId:id};
    return {status:'ready',...found,...(scenario==='missing-fields'?{profile:I.emptyProfile()}:{} )};
  }
  function contentFixtures() {
    const original=C.seed().records[0];
    const media=(key,mime,src,title,publishedAt,author=0)=>({id:key,rootContentId:key,revisionNo:1,authorBapId:I.ids[author],author:{...I.fixtures[author]},title,content:title,publishedAt,txid:({image:'d4',video:'e5',audio:'f6',studio:'17'})[key].repeat(32),confirmation:'confirmed',proof:'unverified',mime,src,status:'published'});
    return [
      {...original,id:'first-words-v2',revisionNo:2,previousContentId:original.id,txid:'c3'.repeat(32),publishedAt:'2026-10-11T09:00:00Z',proof:'valid',content:original.content+'\n\n## A note from the workbench\n\nColour can hold a small memory. This public-domain image is shared as a study, with its source kept visible.\n\n![A painted hand holding colour](fixtures/homepage/painted-hand.jpg)\n\n[Image source](https://github.com/mdn/interactive-examples/tree/main/live-examples/media/cc0-images)'},
      media('image','image/jpeg','fixtures/homepage/painted-hand.jpg','Colour, held in a hand','2026-10-10T11:00:00Z'),
      media('video','video/mp4','fixtures/homepage/flower.mp4','A breeze in the garden','2026-10-09T11:00:00Z'),
      {...media('audio','audio/wav','fixtures/homepage/four-notes.wav','Four notes, one idea','2026-10-08T11:00:00Z'),source:'Local tone study: C, E, G, C.'},
      {...media('studio','image/jpeg','fixtures/homepage/painted-hand.jpg','An experiment in colour','2026-10-09T10:00:00Z',1),source:'MDN CC0 image'},
      {...original,id:'private-draft',txid:'18'.repeat(32),status:'draft',content:'# Private notebook'}
    ].map(record=>record.mime?{source:'MDN CC0 media example',...record}:record);
  }
  function records() {return [...C.load().records,...contentFixtures()];}
  const kind = record => record.mime?.startsWith('image/')?'image':record.mime?.startsWith('video/')?'video':record.mime?.startsWith('audio/')?'audio':'blog';
  function stream(author,all=records()) {
    const groups=new Map();
    for(const record of all.filter(r=>r.authorBapId===author&&r.status!=='draft')) {
      const key=record.rootContentId||record.txid,old=groups.get(key);
      if(!old || record.revisionNo>old.revisionNo || record.revisionNo===old.revisionNo&&record.publishedAt>old.publishedAt)groups.set(key,record);
    }
    return [...groups.values()].sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||'')||a.txid.localeCompare(b.txid));
  }
  function proof(record,scenario='record') {
    const source=[...C.seed().records,...contentFixtures()].find(r=>r.id===record.id);
    if(!source)return C.proofResult(record,scenario,C.load().operations);
    if(record.content!==source.content||record.authorBapId!==source.authorBapId||record.txid!==source.txid)return 'failed';
    return scenario==='record'?source.proof:['valid','failed'].includes(scenario)?scenario:'unverified';
  }
  const seedFollows = () => [{from:I.ids[0],to:I.ids[1]},{from:I.ids[1],to:I.ids[0]}];
  function list(id,direction,events=seedFollows()) {
    return [...new Set(events.filter(e=>direction==='following'?e.from===id:e.to===id).map(e=>direction==='following'?e.to:e.from))];
  }
  const api = {defaults,additionalIds,publicRoute,parseRoute,validId,resolveIdentity,records,contentFixtures,kind,stream,proof,seedFollows,list};
  if (typeof module !== 'undefined') module.exports=api; else root.OwnwordHomepageModel=api;
})(typeof window !== 'undefined' ? window : globalThis);
