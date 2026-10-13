(()=>{'use strict';
const C=window.PORTAL_CONFIG, auth=window.S4UAuth;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const pages=[['dashboard','Dashboard'],['company','Company'],['people','Employees'],['testing','Testing'],['results','Results'],['documents','Documents'],['consents','Consents'],['reports','Reports'],['programs','Programs'],['pools','Pools'],['selections','Selections'],['notifications','Notifications'],['support','Support']];
const page=()=>location.pathname.split('/').pop().replace('.html','')||'dashboard';
async function boot(){
 document.body.className='';
 const root=document.createElement('div');root.id='sponsoredRoot';document.body.replaceChildren(root);
 const show=(title,description)=>{root.innerHTML='<main class="login-page"><section class="login-card"><h1>'+esc(title)+'</h1><p>'+esc(description)+'</p><a class="btn primary" href="https://portal.screenings4u.com/selector.html">Switch Portal</a></section></main>'};
 const session=await auth.getSession();if(!session){location.replace('https://portal.screenings4u.com/');return}
 try{
  const requested=page()==='welcome'?'dashboard':page();
  const res=await fetch(C.workforceUrl+'/functions/v1/nondot-sponsored-employer-context',{method:'POST',headers:{'Content-Type':'application/json',apikey:C.workforceKey,Authorization:'Bearer '+session.access_token},body:JSON.stringify({portal_code:C.portalCode,page:requested})});
  const d=await res.json();if(!res.ok||!d.has_access){show(res.status===403?'Access not assigned':'Access unavailable',d.error||'Your sponsoring C/TPA has not enabled this feature.');return}
  const nav=pages.filter(([id])=>d.allowed_pages.includes(id)).map(([id,label])=>'<a href="/'+id+'.html" class="'+(requested===id?'active':'')+'">'+esc(label)+'</a>').join('');
  const rows=(d.rows||[]).map(x=>'<tr>'+Object.entries(x).filter(([k])=>k!=='id').map(([k,v])=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('');
  const headings=Object.keys((d.rows||[])[0]||{}).filter(k=>k!=='id');const table='<div class="table-wrap"><table><thead><tr>'+headings.map(k=>'<th>'+esc(k.replaceAll('_',' '))+'</th>').join('')+'</tr></thead><tbody>'+rows+'</tbody></table></div>';const body=requested==='dashboard'?'<h2>Sponsored Employer Dashboard</h2><p>Managed by your sponsoring C/TPA. Available functions are listed in the navigation.</p>':'<h2>'+esc(pages.find(x=>x[0]===requested)?.[1]||requested)+'</h2>'+(headings.length?table:'<p>No records available for this function.</p>');
  root.innerHTML='<div class="app"><aside class="side"><h2>C/TPA Sponsored Employer</h2><p>'+esc(d.employer?.name||'')+'</p><nav>'+nav+'</nav></aside><div class="main"><header class="top"><div class="top-left"><strong>'+esc(d.employer?.name||'Employer')+'</strong></div><div class="top-right"><a class="top-support" href="/support.html">Support</a><a id="s4uSwitchPortal" class="btn" href="https://portal.screenings4u.com/selector.html">↔ Switch Portal</a><button class="signout" id="logout" type="button">Sign out</button></div></header><section class="content"><div class="panel" style="padding:24px">'+body+'</div></section></div></div>';
  document.getElementById('logout').onclick=async()=>{await auth.signOut();location.replace('https://portal.screenings4u.com/')};
 }catch(e){show('Unable to load sponsored employer portal',e.message||String(e))}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();