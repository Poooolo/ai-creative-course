
(()=>{'use strict';
const canvas=document.querySelector('#city-cloud'),ctx=canvas.getContext('2d'),stage=document.querySelector('#city-stage'),visual=document.querySelector('#city-visual'),pauseBtn=document.querySelector('#city-pause'),status=document.querySelector('#city-status');if(!ctx)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),css=getComputedStyle(document.documentElement),colors=['--pointlo','--pointmid','--pointhi','--lime'].map(x=>css.getPropertyValue(x).trim());
let paused=reduced.matches,visible=true,w=0,h=0,dpr=1,pts=[],clock=0,last=0,frame=0,drag=null,view=0;
const cameras=[{yaw:-.55,pitch:.93,zoom:1},{yaw:-.18,pitch:.65,zoom:1.08},{yaw:-.45,pitch:1.24,zoom:1.02}];let cam={...cameras[0]},target={...cam};
let seed=82173;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}function add(x,y,z,t=1,shine=rand()){pts.push({x,y,z,t,shine})}
function building(x,z,wx,wz,height,style=0){
 // Ordered facade dots, window rows, roof perimeter and stepped crowns.
 const floors=Math.max(2,Math.round(height/.105));
 for(let f=0;f<=floors;f++){let y=height*f/floors;for(let u=-wx/2;u<=wx/2+.001;u+=.045){add(x+u,y,z-wz/2,1,.5+rand()*.5);add(x+u,y,z+wz/2,1,rand())}for(let v=-wz/2;v<=wz/2+.001;v+=.045){add(x-wx/2,y,z+v,1,.4+rand()*.6);add(x+wx/2,y,z+v,1,rand())}}
 for(let u=-wx/2;u<=wx/2+.001;u+=.065)for(let v=-wz/2;v<=wz/2+.001;v+=.065)add(x+u,height,z+v,2,rand());
 if(style){for(let k=1;k<=2;k++){let a=wx*(.5-k*.12),b=wz*(.5-k*.12),y=height+k*.055;for(let u=-a;u<=a;u+=.035){add(x+u,y,z-b,2);add(x+u,y,z+b,2)}for(let v=-b;v<=b;v+=.035){add(x-a,y,z+v,2);add(x+a,y,z+v,2)}}}
}
function tree(x,z,r){for(let i=0;i<30;i++){let a=rand()*Math.PI*2,rr=Math.sqrt(rand())*r;add(x+Math.cos(a)*rr,.11+Math.sqrt(Math.max(0,1-rr*rr/(r*r)))*r*.8,z+Math.sin(a)*rr,0,rand())}for(let i=0;i<5;i++)add(x,i*.025,z,0)}
function build(){seed=82173;pts=[];
 // Blocks separated by legible, uninterrupted street corridors; the eastern edge is a river.
 const buildings=[[-1.16,-.91,.30,.30,.37,0],[-.77,-.91,.29,.30,.53,1],[-.36,-.91,.30,.30,.29,0],[.08,-.91,.35,.30,.42,0],
 [-1.16,-.43,.30,.29,.49,1],[-.76,-.43,.30,.29,.84,1],[-.35,-.43,.30,.29,.63,1],[.08,-.43,.34,.29,.32,0],
 [-1.16,.05,.30,.28,.31,0],[-.76,.05,.30,.28,.59,1],[-.35,.05,.31,.28,1.05,1],[.09,.05,.34,.28,.48,1],
 [-1.16,.53,.30,.29,.26,0],[-.76,.53,.30,.29,.38,0],[-.35,.53,.30,.29,.27,0],[.07,.53,.33,.29,.33,0],
 [-1.16,1.0,.30,.25,.23,0],[-.77,1.0,.30,.25,.30,0],[.08,1.0,.33,.25,.22,0],
 [1.13,-.90,.24,.29,.25,0],[1.13,-.42,.25,.29,.37,0],[1.13,.05,.25,.29,.24,0]];
 buildings.forEach(b=>building(...b));
 // Dotted streets and riverside promenades, never a perspective grid floor.
 for(let z=-1.19;z<=1.20;z+=.035){for(const x of [-1.37,-.96,-.56,-.14,.30,.50,.96,1.34]){if(rand()>.15)add(x,.015,z,0,rand());if((x===-.96||x===-.14)&&rand()>.24)add(x+.023,.018,z,1,rand()*.6)}}
 for(let x=-1.37;x<=1.34;x+=.035){for(const z of [-1.16,-.68,-.19,.29,.77,1.18]){if(rand()>.13)add(x,.015,z,0,rand())}}
 // River: calm, sparse horizontal ripples, bridge crossing as parallel dotted spans.
 for(let z=-1.16;z<1.18;z+=.12)for(let x=.58;x<.91;x+=.045)if(rand()>.36)add(x,-.025,z,0,rand()*.55);
 for(let x=.48;x<=.98;x+=.027)for(const z of [-.22,-.17,.73,.78])add(x,.045,z,1,rand());
 // Riverside and park trees: small clustered crowns, open lawn.
 for(let i=0;i<27;i++){let x=-.50+rand()*.37,z=.82+rand()*.28;tree(x,z,.045+rand()*.025)}for(let z=-1.02;z<1.12;z+=.19)tree(.40,z,.048);
 // Traffic is a small number of moving, cool points, not a neon field.
 for(let i=0;i<18;i++)add(-1.37+rand()*2.67,.035,[-.68,-.19,.29,.77][i%4],3,rand());
 if(innerWidth<801)pts=pts.filter((p,i)=>p.t===3 || i%4!==0);
}
function size(){const r=stage.getBoundingClientRect();w=r.width;h=r.height;dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);build();draw()}
function draw(){ctx.clearRect(0,0,w,h);let cy=Math.cos(cam.yaw),sy=Math.sin(cam.yaw),cp=Math.cos(cam.pitch),sp=Math.sin(cam.pitch),scale=Math.min(w*.275,h*.31)*cam.zoom,sweep=Math.sin(clock*.00065)*1.4,projected=[];
 for(const p of pts){let x=p.x,z=p.z;if(p.t===3)x=-1.37+((p.x+1.37+clock*.00009)%2.67);let X=x*cy-z*sy,Z=x*sy+z*cy,Y=-(p.y-.30)*cp+Z*sp,depth=Z*cp+(p.y-.30)*sp,persp=4.8/(4.8+depth*.24);let px=w*.50+X*scale*persp,py=h*.47+Y*scale*persp;let hit=Math.abs(x-sweep)<.035&&p.shine>.81;let band=hit?3:p.t===2?(p.shine>.38?2:1):p.t===3?2:p.t===0?0:(p.shine>.55?2:1);projected.push({px,py,depth,band,r:Math.max(.8,Math.min(2.05,(p.t===2?1.28:1.05)*persp*(.85+p.shine*.3)))})}
 projected.sort((a,b)=>b.depth-a.depth);for(const p of projected){ctx.fillStyle=colors[p.band];ctx.globalAlpha=[.57,.70,.88,.92][p.band];ctx.fillRect(p.px,p.py,p.r,p.r)}ctx.globalAlpha=1;canvas.dataset.frame=++frame;canvas.dataset.points=pts.length;canvas.dataset.camera=JSON.stringify(cam)}
 function loop(t){let dt=Math.min(t-last,60);if(!last)dt=0;if(!paused&&visible&&!document.hidden){clock+=dt;target.yaw+=dt*.00008;let easing=1-Math.exp(-dt*.006);for(const k of ['yaw','pitch','zoom'])cam[k]+=(target[k]-cam[k])*easing;draw()}last=t;requestAnimationFrame(loop)}
 function updatePause(){pauseBtn.textContent=paused?'播放动态':'暂停动态';pauseBtn.setAttribute('aria-pressed',String(paused))}pauseBtn.addEventListener('click',()=>{paused=!paused;updatePause();status.textContent=paused?'动态已暂停':'动态已播放'});
 document.querySelectorAll('.city-mode').forEach(b=>b.addEventListener('click',()=>{view=Number(b.dataset.mode);target={...cameras[view]};if(paused||reduced.matches){cam={...target};draw()}document.querySelectorAll('.city-mode').forEach(a=>a.setAttribute('aria-pressed',String(a===b)));status.textContent='已切换至'+b.textContent}));
 stage.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};stage.setPointerCapture(e.pointerId)});stage.addEventListener('pointermove',e=>{if(!drag)return;target.yaw+=(e.clientX-drag.x)*.008;target.pitch=Math.max(.20,Math.min(1.35,target.pitch+(e.clientY-drag.y)*.005));cam={...target};drag={x:e.clientX,y:e.clientY};draw()});stage.addEventListener('pointerup',()=>drag=null);stage.addEventListener('pointercancel',()=>drag=null);
 reduced.addEventListener('change',e=>{paused=e.matches;updatePause();draw()});new IntersectionObserver(e=>{visible=e[0].isIntersecting},{threshold:.01}).observe(visual);window.addEventListener('resize',size);size();visual.classList.add('ready');updatePause();requestAnimationFrame(loop)})();
