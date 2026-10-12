/* 确定性演练数据；产品事实和生产适配边界以核心认知、v0.4.0 PRD 为准。 */
(function(root) {
  const I = typeof module !== 'undefined' ? require('./model.js') : root.OwnwordModel;
  const C = typeof module !== 'undefined' ? require('./content-model.js') : root.OwnwordContentModel;
  const defaults = {profile:'normal',content:'normal',relationship:'normal',proof:'record'};
  const additionalIds=['4','5','6','7'].map(value=>value.repeat(34));
  const additionalProfiles=[I.emptyProfile(),{name:'Eli Park',type:'Person',bio:'Field notes, photographs, and small discoveries.',image:''},{name:'Jules Morgan',type:'Person',bio:'Listening for the everyday.',image:''},{name:'Aster Library',type:'Organization',bio:'A shared collection of independent writing.',image:''}];
  const publicRoute = hash => /^#\/(?:identity\/|content\/)/.test(hash);
  function parseRoute(hash) {
    const match = /^#\/(identity|content)\/([^/?#]+)(?:\/(following|followers))?$/.exec(hash);
    if (!match) return {kind:'invalid',id:''};
    try {return {kind:match[1] === 'content' ? 'content' : match[3] || 'identity',id:decodeURIComponent(match[2])};}
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
  function records() {return C.load().records;}
  const seedFollows = () => [{from:I.ids[0],to:I.ids[1]},{from:I.ids[1],to:I.ids[0]}];
  function list(id,direction,events=seedFollows()) {
    return [...new Set(events.filter(e=>direction==='following'?e.from===id:e.to===id).map(e=>direction==='following'?e.to:e.from))];
  }
  const api = {defaults,additionalIds,publicRoute,parseRoute,validId,resolveIdentity,records,seedFollows,list};
  if (typeof module !== 'undefined') module.exports=api; else root.OwnwordHomepageModel=api;
})(typeof window !== 'undefined' ? window : globalThis);
