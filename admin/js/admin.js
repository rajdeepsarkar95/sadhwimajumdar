
/* ============ SADHWI ADMIN · panel logic (demo, localStorage-backed) ============ */
(function(){
"use strict";

const $  = (s,c=document)=>c.querySelector(s);
const $$ = (s,c=document)=>[...c.querySelectorAll(s)];

/* ---------- auth ---------- */
const AUTH_KEY="sm_admin_session";
function isAuthed(){ return sessionStorage.getItem(AUTH_KEY)==="1"; }
function requireAuth(){
  if(!isAuthed()){ location.href="login.html"; }
}
function login(u,p){
  // DEMO credentials. Replace with a real backend check.
  if(u==="sadhwi" && p==="mudra123"){
    sessionStorage.setItem(AUTH_KEY,"1");
    return true;
  }
  return false;
}
function logout(){ sessionStorage.removeItem(AUTH_KEY); location.href="login.html"; }

/* ---------- store ---------- */
const VKEY="sm_admin_videos", CKEY="sm_admin_content";
const seedVideos=[
  {id:"v1",title:"Silsila Ye Chahat Ka",caption:"Classical restaging of the Devdas bandish, 500K+ views.",src:"https://www.youtube.com/embed/xkGCTHpMBcY",price:0,access:"free",status:"published",views:512400,likes:18400,thumb:"../img/study.png",date:"2025-11-02"},
  {id:"v2",title:"An Indian Dance Odyssey (TEDx)",caption:"Talk on classical training, international stages and storytelling.",src:"https://www.youtube.com/embed/JzSUU1mVIsc",price:0,access:"free",status:"published",views:148900,likes:6200,thumb:"../img/study.png",date:"2026-01-18"},
  {id:"v3",title:"The Dance of Faith",caption:"A meditative re-reading of the bandish, filmed as a study.",src:"https://www.youtube.com/embed/jzopSS00yBs",price:0,access:"free",status:"published",views:96400,likes:3900,thumb:"../img/study.png",date:"2026-03-09"},
  {id:"v4",title:"Rehearsal Diaries, Vol. I",caption:"42-min documentary from the making of production no. 12.",src:"",price:499,access:"paid",status:"published",views:12800,likes:1100,thumb:"../img/study.png",date:"2026-06-21"},
  {id:"v5",title:"Production No. 13 (Premiere)",caption:"Newest original work; premieres on Stream first.",src:"",price:599,access:"paid",status:"unpublished",views:0,likes:0,thumb:"../img/study.png",date:"2026-09-01"}
];
function loadVideos(){
  try{ const v=JSON.parse(localStorage.getItem(VKEY)); if(Array.isArray(v)) return v; }catch(e){}
  localStorage.setItem(VKEY, JSON.stringify(seedVideos)); return [...seedVideos];
}
function saveVideos(v){ localStorage.setItem(VKEY, JSON.stringify(v)); }
function loadContent(){
  const def={
    heroKicker:"Actor, dancer and choreographer, Kolkata, India",
    heroLine1:"Sadhwi", heroLine2:"Majumder", heroLine3:"moves stories",
    statement:"Every stage teaches you the same lesson in a different language. Stand still, listen for the music, and then give the audience everything you have.",
    aboutLede:"Some performers collect stages. Sadhwi has collected whole evenings: the silence before the music, the moment a story lands in an audience that did not expect it, the walk home after a show that went better than rehearsed.",
    bookingEmail:"sadhwimajumdar@gmail.com"
  };
  try{ return Object.assign(def, JSON.parse(localStorage.getItem(CKEY))||{}); }catch(e){ return def; }
}
function saveContent(c){ localStorage.setItem(CKEY, JSON.stringify(c)); }

/* ---------- toast ---------- */
function toast(msg, isErr){
  let box=$(".toasts");
  if(!box){ box=document.createElement("div"); box.className="toasts"; document.body.appendChild(box); }
  const t=document.createElement("div");
  t.className="toast"+(isErr?" err":""); t.textContent=msg;
  box.appendChild(t);
  setTimeout(()=>{ t.style.opacity="0"; t.style.transition="opacity .4s"; setTimeout(()=>t.remove(),400); },2600);
}

/* ---------- formatting ---------- */
const fmtN = n => n>=1e6 ? (n/1e6).toFixed(1)+"M" : n>=1e3 ? (n/1e3).toFixed(1)+"K" : String(n);
const fmtINR = n => "\u20B9"+Number(n).toLocaleString("en-IN");
const esc = s => String(s).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

/* ---------- login page ---------- */
const loginForm=$("#login-form");
if(loginForm){
  loginForm.addEventListener("submit",e=>{
    e.preventDefault();
    const u=$("#lg-user").value.trim(), p=$("#lg-pass").value;
    if(login(u,p)){ location.href="dashboard.html"; }
    else{ $("#login-err").classList.add("show"); }
  });
}

/* ---------- shell: sidebar mobile + logout ---------- */
$$("[data-logout]").forEach(b=>b.addEventListener("click",logout));
const menuBtn=$(".menu-btn"), sidebar=$(".sidebar"), scrim=$(".sb-scrim");
if(menuBtn&&sidebar){
  menuBtn.addEventListener("click",()=>{ sidebar.classList.toggle("open"); scrim&&scrim.classList.toggle("show",sidebar.classList.contains("open")); });
  scrim&&scrim.addEventListener("click",()=>{ sidebar.classList.remove("open"); scrim.classList.remove("show"); });
}

/* ================= DASHBOARD ================= */
if(document.body.dataset.page==="dashboard"){
  requireAuth();
  const videos=loadVideos();
  const totViews=videos.reduce((a,v)=>a+v.views,0);
  const totLikes=videos.reduce((a,v)=>a+v.likes,0);
  const paidSales= videos.filter(v=>v.access==="paid").reduce((a,v)=>a+Math.round(v.views*0.06),0); // demo conversion
  const revenue= videos.filter(v=>v.access==="paid").reduce((a,v)=>a+v.price*Math.round(v.views*0.06),0);
  $("#k-views").textContent=fmtN(totViews);
  $("#k-likes").textContent=fmtN(totLikes);
  $("#k-sales").textContent=fmtN(paidSales)+" rentals";
  $("#k-rev").textContent=fmtINR(revenue);
  // recent uploads
  const recent=[...videos].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  $("#recent-body").innerHTML=recent.map(v=>`
    <tr>
      <td><div class="vt"><img class="vt-thumb" src="${esc(v.thumb)}" alt=""><div>
        <div class="vt-title">${esc(v.title)}</div><div class="vt-cap">${esc(v.caption)}</div></div></div></td>
      <td><span class="pill ${v.status==="published"?"pub":"unpub"}">${v.status}</span></td>
      <td style="font-family:var(--mono);font-size:.72rem">${fmtN(v.views)}</td>
      <td style="font-family:var(--mono);font-size:.72rem;color:var(--dim)">${v.date}</td>
    </tr>`).join("");
  // mini chart: views by video
  const max=Math.max(...videos.map(v=>v.views),1);
  $("#dash-bars").innerHTML=videos.map(v=>`
    <div class="bar-row">
      <span class="b-label" title="${esc(v.title)}">${esc(v.title)}</span>
      <div class="bar-track"><div class="bar-fill" data-w="${(v.views/max*100).toFixed(1)}"></div></div>
      <span class="b-val">${fmtN(v.views)}</span>
    </div>`).join("");
  setTimeout(()=>$$(".bar-fill").forEach(b=>b.style.width=b.dataset.w+"%"),150);
}

/* ================= VIDEOS ================= */
if(document.body.dataset.page==="videos"){
  requireAuth();
  const tbody=$("#vid-body");
  function render(){
    const videos=loadVideos();
    if(!videos.length){ tbody.innerHTML=`<tr><td colspan="6"><div class="empty">No videos yet. Upload your first film.</div></td></tr>`; return; }
    tbody.innerHTML=videos.map(v=>`
      <tr>
        <td><div class="vt"><img class="vt-thumb" src="${esc(v.thumb)}" alt=""><div>
          <div class="vt-title">${esc(v.title)}</div><div class="vt-cap" title="${esc(v.caption)}">${esc(v.caption)}</div></div></div></td>
        <td><span class="pill ${v.access==="paid"?"paid":""}">${v.access==="paid"?"Paid \u00B7 "+fmtINR(v.price):"Free"}</span></td>
        <td><span class="pill ${v.status==="published"?"pub":"unpub"}">${v.status}</span></td>
        <td style="font-family:var(--mono);font-size:.72rem">${fmtN(v.views)}</td>
        <td style="font-family:var(--mono);font-size:.72rem;color:var(--dim)">${v.date}</td>
        <td><div class="row-acts">
          <button class="icon-btn" data-edit="${v.id}" title="Edit" aria-label="Edit video">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 1.8 12.2 4.5 4.6 12.1 1.5 12.5 1.9 9.4 9.5 1.8Z" stroke="currentColor" stroke-width="1.2"/></svg></button>
          <button class="icon-btn del" data-del="${v.id}" title="Delete" aria-label="Delete video">
            <svg width="13" height="14" viewBox="0 0 13 14" fill="none"><path d="M1 3.5h11M4.5 3.5V2h4v1.5M2.5 3.5 3 12.5h7l.5-9" stroke="currentColor" stroke-width="1.2"/></svg></button>
        </div></td>
      </tr>`).join("");
    $$("[data-edit]",tbody).forEach(b=>b.addEventListener("click",()=>openEditor(b.dataset.edit)));
    $$("[data-del]",tbody).forEach(b=>b.addEventListener("click",()=>confirmDelete(b.dataset.del)));
  }
  render();

  // ---- editor modal (add / edit) ----
  const modal=$("#video-modal");
  let editingId=null;
  function openEditor(id){
    const videos=loadVideos();
    const v = id ? videos.find(x=>x.id===id) : null;
    editingId = v ? v.id : null;
    $("#vm-title").textContent = v ? "Edit video" : "Upload a new video";
    $("#vf-title").value=v?v.title:"";
    $("#vf-caption").value=v?v.caption:"";
    $("#vf-src").value=v?v.src:"";
    $("#vf-price").value=v?v.price:0;
    $("#vf-access").value=v?v.access:"free";
    $("#vf-status").value=v?v.status:"unpublished";
    $("#vf-date").textContent=v?v.date:"";
    $("#drop-name").textContent = v ? "Current file retained (demo)" : "Drag a video file here, or click to browse";
    modal.classList.add("open");
  }
  function closeEditor(){ modal.classList.remove("open"); }
  $("#btn-add").addEventListener("click",()=>openEditor(null));
  $(".modal-x",modal).addEventListener("click",closeEditor);
  modal.addEventListener("click",e=>{ if(e.target===modal) closeEditor(); });
  document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeEditor(); });

  // dropzone demo
  const drop=$("#dropzone"), fileInp=$("#vf-file");
  drop.addEventListener("click",()=>fileInp.click());
  ["dragover","dragenter"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add("over");}));
  ["dragleave","drop"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove("over");}));
  drop.addEventListener("drop",e=>{ if(e.dataTransfer.files.length){ $("#drop-name").textContent=e.dataTransfer.files[0].name; }});
  fileInp.addEventListener("change",()=>{ if(fileInp.files.length) $("#drop-name").textContent=fileInp.files[0].name; });

  $("#vf-access").addEventListener("change",e=>{
    $("#vf-price").disabled = e.target.value!=="paid";
  });

  $("#video-form").addEventListener("submit",e=>{
    e.preventDefault();
    const title=$("#vf-title"), caption=$("#vf-caption");
    let ok=true;
    [title,caption].forEach(i=>{
      const bad=!i.value.trim();
      i.closest(".f-field").classList.toggle("invalid",bad);
      if(bad) ok=false;
    });
    if(!ok) return;
    const videos=loadVideos();
    const access=$("#vf-access").value;
    const data={
      title:title.value.trim(),
      caption:caption.value.trim(),
      src:$("#vf-src").value.trim(),
      price: access==="paid" ? Math.max(0,+$("#vf-price").value||0) : 0,
      access, status:$("#vf-status").value
    };
    if(editingId){
      const i=videos.findIndex(x=>x.id===editingId);
      Object.assign(videos[i],data);
      toast("Video updated");
    }else{
      videos.unshift(Object.assign({
        id:"v"+Date.now(), views:0, likes:0, thumb:"../img/study.png",
        date:new Date().toISOString().slice(0,10)
      },data));
      toast("Video uploaded");
    }
    saveVideos(videos);
    closeEditor(); render();
  });

  // delete confirm
  const delModal=$("#delete-modal");
  let deletingId=null;
  function confirmDelete(id){
    deletingId=id;
    const v=loadVideos().find(x=>x.id===id);
    $("#del-name").textContent=v?v.title:"";
    delModal.classList.add("open");
  }
  $("#del-cancel").addEventListener("click",()=>delModal.classList.remove("open"));
  $(".modal-x",delModal).addEventListener("click",()=>delModal.classList.remove("open"));
  $("#del-confirm").addEventListener("click",()=>{
    saveVideos(loadVideos().filter(v=>v.id!==deletingId));
    delModal.classList.remove("open");
    toast("Video deleted");
    render();
  });
}

/* ================= ANALYTICS ================= */
if(document.body.dataset.page==="analytics"){
  requireAuth();
  const videos=loadVideos();
  const totViews=videos.reduce((a,v)=>a+v.views,0);
  const watchHrs=(totViews*8.2/60/1000); // demo avg watch
  $("#a-views").textContent=fmtN(totViews);
  $("#a-hours").textContent=watchHrs.toFixed(1)+"K hrs";
  $("#a-rentals").textContent=fmtN(videos.filter(v=>v.access==="paid").reduce((a,v)=>a+Math.round(v.views*0.06),0));
  // 30-day trend (demo series)
  const trend=[42,48,45,61,58,73,69,80,77,92,88,104,98,112,108,126,119,134,129,148,141,157,150,168,162,181,174,193,188,206];
  const svg=$("#trend-svg");
  const W=720,H=220,P=28;
  const max=Math.max(...trend)*1.15;
  const pts=trend.map((v,i)=>[P+i*(W-2*P)/(trend.length-1), H-P-(v/max)*(H-2*P)]);
  const line=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+","+p[1].toFixed(1)).join(" ");
  const area=line+` L${(W-P).toFixed(1)},${H-P} L${P},${H-P} Z`;
  svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
  svg.innerHTML=`
    <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d9922e" stop-opacity=".25"/><stop offset="1" stop-color="#d9922e" stop-opacity="0"/>
    </linearGradient></defs>
    ${[0,1,2,3].map(i=>`<line x1="${P}" x2="${W-P}" y1="${P+i*(H-2*P)/3}" y2="${P+i*(H-2*P)/3}" stroke="#2a241b" stroke-width="1"/>`).join("")}
    <path d="${area}" fill="url(#ga)"/>
    <path d="${line}" fill="none" stroke="#d9922e" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="${pts[pts.length-1][0]}" cy="${pts[pts.length-1][1]}" r="4" fill="#d9922e"/>`;
  $("#trend-note").textContent="Views, last 30 days \u00B7 demo data";
  // top videos bars
  const top=[...videos].sort((a,b)=>b.views-a.views).slice(0,5);
  const bmax=Math.max(...top.map(v=>v.views),1);
  $("#top-bars").innerHTML=top.map(v=>`
    <div class="bar-row">
      <span class="b-label" title="${esc(v.title)}">${esc(v.title)}</span>
      <div class="bar-track"><div class="bar-fill" data-w="${(v.views/bmax*100).toFixed(1)}"></div></div>
      <span class="b-val">${fmtN(v.views)}</span>
    </div>`).join("");
  setTimeout(()=>$$(".bar-fill").forEach(b=>b.style.width=b.dataset.w+"%"),150);
  // top list
  $("#top-list").innerHTML=top.map((v,i)=>`
    <div class="top-video">
      <span class="rank">0${i+1}</span>
      <img src="${esc(v.thumb)}" alt="">
      <div><div class="tv-t">${esc(v.title)}</div><div class="tv-s">${fmtN(v.views)} views &middot; ${fmtN(v.likes)} likes</div></div>
    </div>`).join("");
}

/* ================= CONTENT ================= */
if(document.body.dataset.page==="content"){
  requireAuth();
  const c=loadContent();
  const map={heroKicker:"#cf-kicker",heroLine1:"#cf-line1",heroLine2:"#cf-line2",heroLine3:"#cf-line3",statement:"#cf-statement",aboutLede:"#cf-lede",bookingEmail:"#cf-email"};
  Object.keys(map).forEach(k=>{ if(c[k]!==undefined) $(map[k]).value=c[k]; });
  $("#content-form").addEventListener("submit",e=>{
    e.preventDefault();
    const out={};
    Object.keys(map).forEach(k=>out[k]=$(map[k]).value.trim());
    const emailOk=/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(out.bookingEmail);
    $("#cf-email").closest(".f-field").classList.toggle("invalid",!emailOk);
    if(!emailOk){ toast("Enter a valid booking email",true); return; }
    saveContent(out);
    toast("Site content saved");
  });
  $("#content-form").addEventListener("input",e=>{
    const f=e.target.closest(".f-field"); if(f) f.classList.remove("invalid");
  });
}
})();
