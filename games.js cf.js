/* games.js — FRONTEND. Football, Assignment Rush runner, Ayo and Comics, opened from the phone (NF.openGame). */
(function(){
var NF=window.NF=window.NF||{};window.__nf={};
function rnd(){return Math.random()}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function tone(){}function vib(p){try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}
function toast(t){if(NF.toast)NF.toast(t)}
function hud(){}function addMin(){}
function chipsHtml(fx){var map={e:'Energy',g:'Grades',f:'Friends',m:'Naira'},h='<div class="gchs">';for(var k in fx){var v=fx[k];if(!v||k==='g')continue;h+='<span class="gch '+(v>0?'up':'down')+'">'+(v>0?'+':'−')+(k==='m'?'₦'+Math.abs(v):Math.abs(Math.round(v)))+' '+map[k]+'</span>'}return h+'</div>'}
function applyFx(fx){if(fx&&fx.m>0&&NF.addMoney)NF.addMoney(fx.m,'Game reward')}
var FRC=[{n:'Tobi',c:{skin:'#8d5524',hair:'#120c0a',hairStyle:'spiky',headwear:'none',glasses:'none',freckles:0,topType:'tee',top:'#38bdf8',bottom:'long',pants:'#2b4a8a',shoeType:'sneaker',shoes:'#f5f5f5',bagType:'none',bag:'#111'}},{n:'Chidi',c:{skin:'#c68642',hair:'#120c0a',hairStyle:'afro',headwear:'none',glasses:'none',freckles:0,topType:'jersey',top:'#ff5d73',bottom:'shorts',pants:'#111111',shoeType:'sneaker',shoes:'#222',bagType:'none',bag:'#111'}}];
var LECCFG={skin:'#8d5524',hair:'#bbbbbb',hairStyle:'low',headwear:'none',glasses:'round',freckles:0,topType:'jacket',top:'#7a4a24',bottom:'long',pants:'#26344f',shoeType:'formal',shoes:'#222',bagType:'none',bag:'#111'};
var CFG={g:'m',skin:'#6b4226',hair:'#111111',hairStyle:'low',headwear:'none',glasses:'none',freckles:0,topType:'tee',top:'#1e90ff',bottom:'jeans',pants:'#1f2a44',shoeType:'sneaker',shoes:'#ffffff',bagType:'back',bag:'#2c3e50'};
NF.setLook=function(f){if(f){CFG.g='f';CFG.hairStyle='puffs';CFG.top='#ff5d73';CFG.bottom='long'}};
function ask(ico,title,text){toast(ico+' '+title+' — '+text)}
/* ===== Day 8: overlay system, landscape football ===== */
var OVD=null,fbAlive=false,FBS=1,rnAlive=false,RNS=1;
function ovOpen(title,html,onClose,land){closeOv();var o=document.createElement('div');o.id='ov';if(land)o.className='land';o.innerHTML='<div class="ovh"><b>'+title+'</b><button id="ovx" aria-label="Close">✕</button></div><div class="ovb" id="ovb">'+html+'</div>'+(land?'<div class="rotcov" id="rotcov"><div><div style="font-size:56px">📱↻</div><h2>Turn your phone sideways</h2><p>This game plays in landscape.</p><button class="btn go" id="rotforce">Rotate the screen for me</button></div></div>':'');document.body.appendChild(o);
 var rs=null;if(land){rs=function(){var port=innerHeight>innerWidth,cov=o.querySelector('#rotcov');if(!cov)return;if(o.dataset.force==='1'&&port){o.classList.add('rot');cov.style.display='none'}else{o.classList.remove('rot');cov.style.display=port?'grid':'none'}};window.addEventListener('resize',rs);o.querySelector('#rotforce').onclick=function(){o.dataset.force='1';rs()};rs()}
 OVD={el:o,close:onClose,rs:rs};document.getElementById('ovx').onclick=function(){closeOv(true)};return document.getElementById('ovb')}
function closeOv(user){if(!OVD)return;var d=OVD;OVD=null;if(d.rs)window.removeEventListener('resize',d.rs);d.el.remove();if(d.close)d.close(user)}
function ovRot(){return !!(OVD&&OVD.el.classList.contains('rot'))}
function footballMatch(){
 var W=360,H=560,GL=135,GR=225,HALF=50,TOTAL=100;
 var kd,ku,fin=false;
 ovOpen('⚽ Campus match','<div class="fwrap"><canvas id="fc" width="1120" height="720"></canvas><div class="pad" id="fpad"><div class="ring" id="fring"><i id="fknob"></i></div></div><div class="fhud2" id="fh"></div><div class="fbtns2"><div class="pw" id="fpw"><i id="fpwi"></i></div><button id="fpass">PASS</button><button id="fshoot">SHOOT<small>hold = power</small></button></div><div class="fcover" id="fcv"><div><h2>Campus match</h2><p>4 v 4 · about 90 seconds.<br><b>Left thumb:</b> drag to run.<br><b>SHOOT:</b> hold to charge, let go to kick.<br><b>PASS:</b> tap to pass to a teammate.<br>Run into the ball carrier to win the ball.</p><button class="btn go" id="fstart">Kick off</button></div></div></div>',function(user){fbAlive=false;window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);if(user&&!fin)toast('You left the match early.')},true);
 var cv=document.getElementById('fc'),g=cv.getContext('2d');
 function mk(t,x,y,gk){return {t:t,x:x,y:y,hx:x,hy:y,gk:gk,fx:0,fy:t===0?-1:1,ph:rnd()*6,mv:0,hold:0,vx:0,vy:0,sk:pick(['#8d5524','#c68642','#5c3a21','#f1c27d','#3b2417'])}}
 var ps,ball,ctl=3,score=[0,0],clock=0,half=1,state='ready',stT=0,banner='',stick=null,keys={},shootDown=false,charge=0,shootRel=false,passReq=false,hudT=0,sx=0,sy=0;
 function setup(){ps=[mk(0,180,530,1),mk(0,100,420),mk(0,260,420),mk(0,180,360),mk(1,180,30,1),mk(1,100,150),mk(1,260,150),mk(1,180,200)];ball={x:180,y:280,vx:0,vy:0,own:null,cd:0,lastK:null};ctl=3}
 setup();
 function d2(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
 function kick(p,dx,dy,sp){var l=Math.hypot(dx,dy)||1;ball.vx=dx/l*sp;ball.vy=dy/l*sp;ball.own=null;ball.cd=.28;ball.lastK=p;p.fx=dx/l;p.fy=dy/l;tone(sp>380?200:300,.07,0,'square',.1)}
 function shoot(p,pw){var gy=p.t===0?0:H,tx=180+(rnd()-.5)*(p.t===0?70*(1.2-pw):90),dx=tx-p.x,dy=gy-p.y;var l=Math.hypot(dx,dy)||1;kick(p,dx/l+p.fx*.3,dy/l+p.fy*.3,300+pw*270)}
 function openness(p,q){var best=1e9;ps.forEach(function(o){if(o.t===p.t)return;var ax=q.x-p.x,ay=q.y-p.y,l2=ax*ax+ay*ay||1,t=Math.max(0,Math.min(1,((o.x-p.x)*ax+(o.y-p.y)*ay)/l2)),dd=Math.hypot(o.x-(p.x+ax*t),o.y-(p.y+ay*t));if(dd<best)best=dd});return best}
 function pass(p){var best=null,bs=-1e9;ps.forEach(function(q){if(q===p||q.t!==p.t||q.gk)return;var dx=q.x-p.x,dy=q.y-p.y,l=Math.hypot(dx,dy);if(l<28||l>300)return;var prog=p.t===0?(p.y-q.y):(q.y-p.y);var dirScore=p.t===0&&ps.indexOf(p)===ctl?(dx*p.fx+dy*p.fy)/l*60:0;var sc=prog*.45+Math.min(40,openness(p,q))*1.4-l*.12+dirScore;if(sc>bs){bs=sc;best=q}});if(best){var lead=.22;kick(p,best.x+(best.vx||0)*lead-p.x,best.y+(best.vy||0)*lead-p.y,Math.min(330,160+d2(p,best)*.9));if(p.t===0)ctl=ps.indexOf(best)}else kick(p,p.fx,p.fy,240)}
 function mv(p,tx,ty,sp,dt){var dx=tx-p.x,dy=ty-p.y,l=Math.hypot(dx,dy);if(l>3){p.vx=dx/l*sp;p.vy=dy/l*sp;p.fx=dx/l;p.fy=dy/l;p.mv=1}else{p.vx=0;p.vy=0;p.mv=0}p.x+=p.vx*dt;p.y+=p.vy*dt}
 function clampP(p){p.x=Math.max(8,Math.min(W-8,p.x));p.y=Math.max(8,Math.min(H-8,p.y))}
 function dirIn(){var x=sx,y=sy;if(keys.ArrowRight||keys.d)x+=1;if(keys.ArrowLeft||keys.a)x-=1;if(keys.ArrowDown||keys.s)y+=1;if(keys.ArrowUp||keys.w)y-=1;var l=Math.hypot(x,y);if(l>1){x/=l;y/=l}return [y,-x]}
 function update(dt){
  if(state==='ready')return;
  if(state==='goal'||state==='ht'){stT-=dt;if(stT<=0){if(state==='ht')half=2;setup();state='play';banner=''}return}
  clock+=dt;
  if(half===1&&clock>=HALF){state='ht';stT=2.2;banner='HALF TIME';return}
  if(clock>=TOTAL){state='end';finish();return}
  if(shootDown){charge=Math.min(1,charge+dt/.75)}
  var ow=ball.own,d=dirIn(),me;
  if(ow&&ow.t===0&&!ow.gk)ctl=ps.indexOf(ow);else if(!ow||ow.t===1){var bi=-1,bd=1e9;for(var i=1;i<4;i++){var q=d2(ps[i],ball);if(q<bd){bd=q;bi=i}}if(bi!==ctl&&bd<d2(ps[ctl],ball)-18)ctl=bi}
  me=ps[ctl];
  var near=[null,null];[0,1].forEach(function(t){var bd=1e9,bp=null;ps.forEach(function(p,i){if(p.t!==t||p.gk||(t===0&&i===ctl))return;var q=d2(p,ball);if(q<bd){bd=q;bp=p}});near[t]=bp});
  var hasBall=ball.own?ball.own.t:-1;
  ps.forEach(function(p,i){
   if(p.t===0&&i===ctl){var sp=(ball.own===p?90:100);p.vx=d[0]*sp;p.vy=d[1]*sp;p.mv=(d[0]||d[1])?1:0;p.x+=p.vx*dt;p.y+=p.vy*dt;if(d[0]||d[1]){p.fx=d[0];p.fy=d[1]}clampP(p);return}
   if(p.gk){var own=p.t===0?H:0,gl=p.t===0?H-24:24;var tx=180,ty=gl;
    var inc=!ball.own&&((p.t===0&&ball.vy>60)||(p.t===1&&ball.vy<-60));
    if(inc&&Math.abs(ball.vy)>1){var tt=(gl-ball.y)/ball.vy;if(tt>0&&tt<1.4){var ix=ball.x+ball.vx*tt;tx=Math.max(GL-8,Math.min(GR+8,ix))}}else tx=Math.max(155,Math.min(205,180+(ball.x-180)*.25));
    if(!ball.own&&Math.abs(ball.y-own)<110&&!inc){ty=gl+(p.t===0?-1:1)*Math.min(30,Math.abs(ball.y-gl)*.45)}
    if(ball.own===p){p.hold+=dt;mv(p,p.x,p.y,0,dt);if(p.hold>.7){p.hold=0;var tm=ps.filter(function(q){return q.t===p.t&&!q.gk});var q2=tm[Math.floor(rnd()*tm.length)];kick(p,q2.x-p.x,q2.y-p.y,290)}}else mv(p,tx,ty,inc?95:62,dt);clampP(p);return}
   var atkY=p.t===0?0:H,fw=p.t===0?-1:1;
   if(ball.own===p){var gd=Math.hypot(180-p.x,atkY-p.y);var best=null;var pressured=false;ps.forEach(function(o){if(o.t!==p.t&&!o.gk&&d2(o,p)<34)pressured=true});mv(p,180+Math.sin(clock*1.7+p.ph)*50,atkY,p.t===0?68:58,dt);if(gd<185&&rnd()<dt*(p.t===0?2.6:1.5))shoot(p,.4+rnd()*.5);else if((pressured&&rnd()<dt*2.2)||rnd()<dt*.45)pass(p)}
   else if(hasBall===p.t){var tx2=Math.max(25,Math.min(335,p.hx+(ball.x-180)*.25)),ty2=Math.max(40,Math.min(520,p.hy+(ball.y-280)*.55+fw*70));mv(p,tx2,ty2,64,dt)}
   else if(near[p.t]===p){mv(p,ball.own?ball.own.x:ball.x,ball.own?ball.own.y:ball.y,p.t===0?74:62,dt)}
   else{var gyp=p.t===0?H:0;var tx3=Math.max(25,Math.min(335,p.hx+(ball.x-180)*.3)),ty3=Math.max(40,Math.min(520,p.hy+(ball.y-280)*.5));mv(p,tx3,ty3,58,dt)}
   clampP(p)});
  if(shootRel){shootRel=false;var pw=Math.max(.15,charge);charge=0;if(ball.own===me)shoot(me,pw);else if(ball.own&&ball.own.t===1&&d2(me,ball.own)<28&&rnd()<.7){ball.own=me;ball.cd=.2;tone(180,.05,0,'sawtooth',.06)}}
  if(passReq){passReq=false;if(ball.own===me)pass(me)}
  ball.cd-=dt;
  if(ball.own){var o=ball.own;ball.x=o.x+o.fx*9;ball.y=o.y+o.fy*9;ball.vx=ball.vy=0;
   ps.forEach(function(q){if(q.t!==o.t&&!q.gk&&!o.gk&&d2(q,o)<12){var ch=(q.t===0&&ps.indexOf(q)===ctl)?4:1.5;if(rnd()<dt*ch){ball.own=q;ball.cd=.2;tone(180,.05,0,'sawtooth',.06)}}})}
  else{ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;var f=Math.exp(-1.15*dt);ball.vx*=f;ball.vy*=f;var sp=Math.hypot(ball.vx,ball.vy);
   if(ball.x<5){ball.x=5;ball.vx=Math.abs(ball.vx)*.6}if(ball.x>W-5){ball.x=W-5;ball.vx=-Math.abs(ball.vx)*.6}
   if(ball.y<2){if(ball.x>GL&&ball.x<GR){goal(0);return}ball.y=3;ball.vy=Math.abs(ball.vy)*.6}
   if(ball.y>H-2){if(ball.x>GL&&ball.x<GR){goal(1);return}ball.y=H-3;ball.vy=-Math.abs(ball.vy)*.6}
   if(ball.cd<=0){ps.forEach(function(p){if(ball.own)return;var dd=d2(p,ball);if(p.gk){if(dd<19){var chance=Math.max(.3,.8-(sp-250)/520);if(sp>240&&rnd()>chance){ball.vx=-ball.vx*.4+(rnd()-.5)*180;ball.vy=-ball.vy*.55;ball.cd=.3;tone(140,.06,0,'square',.08)}else{ball.own=p;p.hold=0}}}else if(dd<11&&sp<340){ball.own=p}})}}
 }
 function goal(t){score[t]++;state='goal';stT=2.2;banner='GOAL!  '+(t===0?'You scored':'Campus Boys scored');ball.vx=ball.vy=0;ball.own=null;tone(660,.12,0,'triangle',.2);tone(880,.18,.12,'triangle',.2);tone(1100,.3,.3,'triangle',.2);vib(150)}
 function finish(){fin=true;var w=score[0]>score[1],dr=score[0]===score[1];var fx=w?{f:8,e:-15}:dr?{f:4,e:-12}:{f:3,e:-12};applyFx(fx);addMin(60);fbAlive=false;window.__nf.fbres={s:score.slice(),w:w};
  ovOpen('Full time','<div class="fwrap" style="display:grid;place-items:center;padding:20px;text-align:center"><div style="color:#fff"><div style="font-size:54px">'+(w?'🏆':dr?'🤝':'😤')+'</div><h2 style="font-family:var(--display);font-weight:400;font-size:34px;margin:6px 0">You '+score[0]+' – '+score[1]+' Campus Boys</h2><p style="color:#9fb0d8;font-weight:700;max-width:420px">'+(w?'You beat the Campus Boys. Everyone on the pitch is shouting your name.':dr?'A fair draw. Both sides shook hands.':'You lost this one. Rematch next time.')+'</p>'+chipsHtml(fx)+'<p style="color:#9fb0d8;font-size:12px;margin-top:8px">1 hour passed.</p><button class="btn go" id="fdone" style="margin-top:14px;width:100%">Back to campus</button></div></div>',function(){});document.getElementById('fdone').onclick=function(){closeOv()}}
 function M(x,y){return [H-y,x]}
 function draw(){
  var sc=2;g.setTransform(0,sc,-sc,0,sc*H,0);
  for(var i=0;i<10;i++){g.fillStyle=i%2?'#43a652':'#3b9a4a';g.fillRect(0,i*56,W,56)}
  g.strokeStyle='#ffffffcc';g.lineWidth=2;g.strokeRect(5,1,W-10,H-2);g.beginPath();g.moveTo(5,H/2);g.lineTo(W-5,H/2);g.stroke();g.beginPath();g.arc(180,H/2,46,0,7);g.stroke();
  g.strokeRect(95,1,170,78);g.strokeRect(95,H-79,170,78);g.strokeRect(140,1,80,30);g.strokeRect(140,H-31,80,30);
  g.fillStyle='#ffffff66';g.fillRect(GL,-6,GR-GL,14);g.fillRect(GL,H-8,GR-GL,14);g.fillStyle='#fff';g.fillRect(GL-2,0,3,12);g.fillRect(GR-1,0,3,12);g.fillRect(GL-2,H-12,3,12);g.fillRect(GR-1,H-12,3,12);
  g.setTransform(sc,0,0,sc,0,0);
  var L=ps.slice().sort(function(a,b){return a.x-b.x});
  L.forEach(function(p){var i=ps.indexOf(p),m=M(p.x,p.y),X=m[0],Y=m[1],col=p.gk?(p.t===0?'#ffd23f':'#9be37a'):(p.t===0?'#2f7bff':'#ff4d5e');
   g.fillStyle='#0004';g.beginPath();g.ellipse(X,Y+9,7,3,0,0,7);g.fill();
   var sw=p.mv?Math.sin(clock*14+p.ph)*3:0;g.fillStyle='#1b2540';g.fillRect(X-4+sw,Y+2,3,8);g.fillRect(X+1-sw,Y+2,3,8);
   if(p.t===0&&i===ctl){g.strokeStyle='#ffd23f';g.lineWidth=2;g.beginPath();g.arc(X,Y+2,12,0,7);g.stroke();g.fillStyle='#ffd23f';g.beginPath();g.moveTo(X,Y-20);g.lineTo(X-5,Y-27);g.lineTo(X+5,Y-27);g.fill()}
   g.fillStyle=col;g.beginPath();g.arc(X,Y-1,7,0,7);g.fill();g.fillStyle=p.sk;g.beginPath();g.arc(X,Y-9,4.6,0,7);g.fill();g.fillStyle='#120c0a';g.beginPath();g.arc(X,Y-11,4.6,3.3,6.1);g.fill()});
  var bm=M(ball.x,ball.y);g.fillStyle='#0005';g.beginPath();g.ellipse(bm[0],bm[1]+4,4,2,0,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(bm[0],bm[1],4.2,0,7);g.fill();g.strokeStyle='#222';g.lineWidth=1;g.beginPath();g.arc(bm[0],bm[1],4.2,0,7);g.stroke();
  if(banner){g.fillStyle='#000a';g.fillRect(0,140,H,80);g.fillStyle='#FFD23F';g.font='900 30px Lilita One, sans-serif';g.textAlign='center';g.fillText(banner,H/2,190)}
 }
 var last=0;function loop(ts){if(!fbAlive)return;var dt=Math.min(.05,(ts-last)/1000||0)*FBS;last=ts;var n=Math.max(1,Math.round(FBS));for(var s=0;s<n;s++)update(dt/n);if(fbAlive){draw();hudT+=dt;if(hudT>.08){hudT=0;var h=document.getElementById('fh');if(h)h.innerHTML='<b>You '+score[0]+'</b> – <b>'+score[1]+'</b> Campus Boys · '+Math.min(90,Math.floor(clock*.9))+"' · "+(half===1?'1st half':'2nd half');var pw=document.getElementById('fpwi');if(pw)pw.style.width=(charge*100)+'%'}requestAnimationFrame(loop)}}
 var pad=document.getElementById('fpad'),knob=document.getElementById('fknob');pad.style.touchAction='none';
 function loc(dx,dy){return ovRot()?[dy,-dx]:[dx,dy]}
 pad.addEventListener('pointerdown',function(e){stick={ox:e.clientX,oy:e.clientY,id:e.pointerId};try{pad.setPointerCapture(e.pointerId)}catch(x){}});
 pad.addEventListener('pointermove',function(e){if(!stick||stick.id!==e.pointerId)return;var l=loc(e.clientX-stick.ox,e.clientY-stick.oy),m=Math.hypot(l[0],l[1]);if(m<6){sx=sy=0}else{var k=Math.min(1,m/42);sx=l[0]/m*k;sy=l[1]/m*k}knob.style.transform='translate('+(sx*30)+'px,'+(sy*30)+'px)'});
 function up(e){if(stick&&stick.id===e.pointerId){stick=null;sx=sy=0;knob.style.transform=''}}pad.addEventListener('pointerup',up);pad.addEventListener('pointercancel',up);
 kd=function(e){keys[e.key]=1;if(e.key===' '&&!shootDown){shootDown=true}if(e.key==='e'||e.key==='E')passReq=true};ku=function(e){keys[e.key]=0;if(e.key===' '){shootDown=false;shootRel=true}};
 window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);
 var bs=document.getElementById('fshoot');bs.style.touchAction='none';
 bs.addEventListener('pointerdown',function(e){e.preventDefault();shootDown=true;charge=0;try{bs.setPointerCapture(e.pointerId)}catch(x){}});
 function bsUp(e){if(shootDown){shootDown=false;shootRel=true}}bs.addEventListener('pointerup',bsUp);bs.addEventListener('pointercancel',bsUp);
 document.getElementById('fpass').addEventListener('pointerdown',function(e){e.preventDefault();passReq=true});
 document.getElementById('fstart').onclick=function(){document.getElementById('fcv').style.display='none';tone(600,.1);state='play';fbAlive=true;last=performance.now();requestAnimationFrame(loop)};
 draw();
 window.__nf.fb=function(){return {score:score.slice(),clock:clock,state:state,ps:ps,ball:ball,ctl:ctl}};window.__nf.fbspeed=function(v){FBS=v};
}

/* ===== Runner: Assignment Rush ===== */
function runnerGame(){
 var CW=360,CH=640,HZ=200,GY=520,CXr=180,LW=92,K=.09,JD=.62,SD=.55;
 var kd,over=false,started=false,alive=false;
 var TAUNT=['WHERE IS MY ASSIGNMENT?!','SUBMIT IT NOW!','DEADLINE WAS YESTERDAY!','COME BACK HERE!','I SAW YOU, FRESHER!','CARRYOVER AWAITS YOU!'];
 ovOpen('🏃 Assignment Rush','<div class="fwrap"><canvas id="rc" width="720" height="1280"></canvas><div class="fhud2" id="rh" style="top:6px"></div><div class="fcover" id="rcv"><div><div style="font-size:46px">📄🏃</div><h2>Assignment Rush</h2><p>You did not submit your assignment.<br><b>Dr. Deadline</b> is chasing you!<br>Swipe ◀ ▶ to change lane, ▲ to jump, ▼ to slide.<br>Collect 📄 pages to push him back.<br>Hit three things and he catches you.</p><button class="btn go" id="rstart">Run!</button></div></div></div>',function(){alive=false;window.removeEventListener('keydown',kd)});
 var cv=document.getElementById('rc'),g=cv.getContext('2d');
 var lane=1,lx=1,lx2=1,jt=0,stt=0,items=[],dist=0,coins=0,pages=0,LZ=-2.9,slow=0,t=0,nextSp=0,shake=0,bub={t:'',tt:0},nextTaunt=3,hits=0,speed=0;
 function rr(a,b){return a+rnd()*(b-a)}
 function sc(z){return 1/(1+z*K)}
 function X(l,z){return CXr+(l-1)*LW*sc(z)}
 function Y(z){return HZ+(GY-HZ)*sc(z)}
 function spawn(){var z=80,r=rnd(),l=Math.floor(rnd()*3);
  if(r<.3){for(var i=0;i<5;i++)items.push({z:z+i*3.2,l:l,k:'coin'})}
  else if(r<.62){items.push({z:z,l:l,k:pick(['low','high','block','block'])});if(rnd()<.5)items.push({z:z+4,l:(l+1+Math.floor(rnd()*2))%3,k:'coin'})}
  else if(r<.82){var free=Math.floor(rnd()*3);for(var q=0;q<3;q++){if(q!==free)items.push({z:z,l:q,k:rnd()<.5?'block':'low'})}for(var i2=0;i2<3;i2++)items.push({z:z+i2*3,l:free,k:'coin'})}
  else{items.push({z:z,l:l,k:'page'});items.push({z:z+10,l:(l+1)%3,k:pick(['block','low'])})}}
 function hit(){hits++;LZ+=1.25;slow=.9;shake=.35;tone(110,.2,0,'sawtooth',.2);vib(120);bub={t:'GOTCHA SOON!',tt:1.2}}
 function sfx(f){tone(f,.07,0,'square',.1)}
 function update(dt){t+=dt;var v=(13+Math.min(14,dist/90))*(slow>0?.6:1);slow-=dt;dist+=v*dt;nextSp-=v*dt;if(nextSp<=0){spawn();nextSp=rr(13,22)}
  lx+=(lane-lx)*Math.min(1,dt*14);lx2+=(lx-lx2)*Math.min(1,dt*3);if(jt>0)jt-=dt;if(stt>0)stt-=dt;
  var jh=jt>0?Math.sin(Math.PI*(1-jt/JD)):0;
  items.forEach(function(it){it.z-=v*dt;if(!it.done&&it.z<=.35){it.done=true;if(Math.abs(lx-it.l)<.62){
    if(it.k==='coin'){coins++;sfx(1200)}else if(it.k==='page'){pages++;LZ=Math.max(-2.9,LZ-.9);sfx(900);bub={t:'NO! GIVE IT BACK!',tt:1}}
    else if(it.k==='low'){if(jh<.35)hit()}else if(it.k==='high'){if(stt<=0)hit()}else hit()}}});
  items=items.filter(function(it){return it.z>-4});
  LZ=Math.max(-2.9,Math.min(-.5,LZ+.015*dt));if(shake>0)shake-=dt;
  nextTaunt-=dt;if(nextTaunt<=0&&LZ>-2.6){bub={t:pick(TAUNT),tt:1.8};nextTaunt=rr(3,5)}if(bub.tt>0)bub.tt-=dt;
  if(LZ>-.35){finish()}}
 function finish(){if(over)return;over=true;alive=false;var fx={m:coins*20,g:Math.min(10,pages*2),e:-10,f:2};applyFx(fx);addMin(20);var score=Math.floor(dist)+coins*10+pages*50;window.__nf.rnres={dist:dist,coins:coins,pages:pages,score:score};
  ovOpen('Caught!','<div style="color:#fff;text-align:center;padding:20px;max-width:420px"><div style="font-size:54px">😠📄</div><h2 style="font-family:var(--display);font-weight:400;font-size:30px;margin:6px 0">Dr. Deadline caught you!</h2><p style="color:#b9c6e6;line-height:1.5">"Where is your assignment?! Bring it tomorrow, or it is a carryover!"</p><div class="chipset" style="justify-content:center"><span class="chip">🏃 '+Math.floor(dist)+' m</span><span class="chip">₦ '+coins+' coins</span><span class="chip">📄 '+pages+' pages</span></div><p style="font-size:22px;margin:10px 0;color:#FFD23F;font-weight:800">Score '+score+'</p>'+chipsHtml(fx)+'<p style="color:#9fb0d8;font-size:12px;margin-top:8px">Every 📄 page you collected counts as assignment work done: grades go up a little. 20 minutes passed.</p><button class="btn go" id="ragain" style="margin-top:14px;width:100%">Run again</button><button class="btn" id="rback" style="margin-top:8px;width:100%;text-align:center">Back to campus</button></div>',function(){});
  document.getElementById('ragain').onclick=runnerGame;document.getElementById('rback').onclick=function(){closeOv()}}
 function fig(x,y,s,o){g.save();g.translate(x,y);g.scale(s,s*(o.sl?.55:1));var sw=Math.sin(t*14+(o.ph||0))*(o.air?0:6);
  g.fillStyle='#0003';g.beginPath();g.ellipse(0,2,16,5,0,0,7);g.fill();
  g.fillStyle=o.pants;g.fillRect(-8,-30,7,28+sw/2);g.fillRect(1,-30,7,28-sw/2);g.fillStyle=o.shoe;g.fillRect(-9,-4+sw/2,10,5);g.fillRect(0,-4-sw/2,10,5);
  g.fillStyle=o.top;g.beginPath();g.roundRect?g.roundRect(-13,-62,26,34,8):g.rect(-13,-62,26,34);g.fill();
  if(o.tie){g.fillStyle='#b91c1c';g.fillRect(-2,-60,4,18)}
  g.fillStyle=o.skin;g.fillRect(-19,-60+(o.armUp?-14:0),6,24);g.fillRect(13,-60+(o.armUp?-14:sw/2),6,24);
  if(o.bag){g.fillStyle=o.bag;g.fillRect(-16,-58,8,26)}
  g.fillStyle=o.skin;g.beginPath();g.arc(0,-72,11,0,7);g.fill();g.fillStyle=o.hair;g.beginPath();g.arc(0,-76,11,3.1,6.3);g.fill();
  if(o.glass){g.strokeStyle='#222';g.lineWidth=2;g.beginPath();g.arc(-4,-72,4,0,7);g.arc(5,-72,4,0,7);g.stroke()}
  if(o.paper){g.fillStyle='#fff';g.fillRect(19,-84,16,20);g.fillStyle='#e33';g.fillRect(21,-80,12,2)}
  g.restore()}
 function draw(){var jh=jt>0?Math.sin(Math.PI*(1-jt/JD)):0;
  g.setTransform(2,0,0,2,0,0);if(shake>0)g.translate((rnd()-.5)*6,(rnd()-.5)*6);
  var sk=g.createLinearGradient(0,0,0,HZ);sk.addColorStop(0,'#8fd1ff');sk.addColorStop(1,'#eaf7ff');g.fillStyle=sk;g.fillRect(-10,-10,CW+20,HZ+10);
  g.fillStyle='#ffe27a';g.beginPath();g.arc(285,70,26,0,7);g.fill();
  var cols=['#e7c0b8','#cfd8b0','#b9c6e6','#f0d9a8','#d8b9d8'];for(var i=0;i<9;i++){var bx=((i*58-dist*.6)%520+520)%520-80,bh=50+(i*37)%50;g.fillStyle=cols[i%5];g.fillRect(bx,HZ-bh,46,bh);g.fillStyle='#7c6a86';g.fillRect(bx-3,HZ-bh-6,52,8)}
  g.fillStyle='#cfe5a1';g.fillRect(-10,HZ,CW+20,CH-HZ+10);
  function quad(a,b,wa,wb,col){g.fillStyle=col;g.beginPath();g.moveTo(CXr-wa,Y(a));g.lineTo(CXr+wa,Y(a));g.lineTo(CXr+wb,Y(b));g.lineTo(CXr-wb,Y(b));g.closePath();g.fill()}
  var zf=90,zn=-3;g.fillStyle='#e3e6ee';g.beginPath();g.moveTo(CXr-1.95*LW*sc(zf),Y(zf));g.lineTo(CXr+1.95*LW*sc(zf),Y(zf));g.lineTo(CXr+1.95*LW*sc(zn),Y(zn));g.lineTo(CXr-1.95*LW*sc(zn),Y(zn));g.fill();
  g.fillStyle='#8d90ab';g.beginPath();g.moveTo(CXr-1.5*LW*sc(zf),Y(zf));g.lineTo(CXr+1.5*LW*sc(zf),Y(zf));g.lineTo(CXr+1.5*LW*sc(zn),Y(zn));g.lineTo(CXr-1.5*LW*sc(zn),Y(zn));g.fill();
  var off=dist%8;for(var i2=-1;i2<12;i2++){var z0=i2*8-off,z1=z0+4;if(z1<zn||z0>zf)continue;z0=Math.max(zn,z0);[-.5,.5].forEach(function(o){var w=.035*LW;g.fillStyle='#ffffffcc';g.beginPath();g.moveTo(CXr+o*LW*sc(z0)-w*sc(z0)*3,Y(z0));g.lineTo(CXr+o*LW*sc(z0)+w*sc(z0)*3,Y(z0));g.lineTo(CXr+o*LW*sc(z1)+w*sc(z1)*3,Y(z1));g.lineTo(CXr+o*LW*sc(z1)-w*sc(z1)*3,Y(z1));g.fill()})}
  var po=dist%16;for(var n=-1;n<6;n++){var z=n*16-po+6;if(z<zn||z>zf)continue;var s=sc(z);[-1,1].forEach(function(sd){var x=CXr+sd*2.4*LW*s,y=Y(z);g.fillStyle='#0002';g.beginPath();g.ellipse(x,y,20*s,6*s,0,0,7);g.fill();g.fillStyle='#8a6a4a';g.fillRect(x-3*s,y-60*s,6*s,60*s);g.fillStyle=sd>0?'#5fae55':'#6fb552';g.beginPath();g.arc(x,y-66*s,22*s,0,7);g.fill();g.fillStyle='#78c262';g.beginPath();g.arc(x-6*s,y-72*s,12*s,0,7);g.fill()})}
  var L=items.slice().sort(function(a,b){return b.z-a.z});
  L.forEach(function(it){if(it.z<-3||it.z>85)return;var s=sc(it.z),x=X(it.l,it.z),y=Y(it.z);
   if(it.k==='coin'){var yy=y-26*s-Math.sin(t*5+it.z)*3*s;g.fillStyle='#e0a200';g.beginPath();g.arc(x,yy,10*s,0,7);g.fill();g.fillStyle='#ffd23f';g.beginPath();g.arc(x,yy,8*s,0,7);g.fill();g.fillStyle='#8a5a00';g.font='800 '+(11*s)+'px sans-serif';g.textAlign='center';g.fillText('₦',x,yy+4*s)}
   else if(it.k==='page'){var yy2=y-34*s-Math.sin(t*4)*4*s;g.fillStyle='#0003';g.beginPath();g.ellipse(x,y,14*s,4*s,0,0,7);g.fill();g.fillStyle='#fff';g.fillRect(x-12*s,yy2-16*s,24*s,32*s);g.strokeStyle='#cdd6ea';g.lineWidth=1;g.strokeRect(x-12*s,yy2-16*s,24*s,32*s);g.fillStyle='#9fb4dc';for(var q=0;q<3;q++)g.fillRect(x-8*s,yy2-10*s+q*7*s,16*s,2*s);g.fillStyle='#22c55e';g.font='800 '+(14*s)+'px sans-serif';g.textAlign='center';g.fillText('✓',x+5*s,yy2+13*s)}
   else if(it.k==='low'){g.fillStyle='#0003';g.beginPath();g.ellipse(x,y,36*s,6*s,0,0,7);g.fill();for(var b=0;b<5;b++){g.fillStyle=b%2?'#fff':'#ef4444';g.fillRect(x-36*s+b*14.4*s,y-24*s,14.4*s,22*s)}g.fillStyle='#7a2020';g.fillRect(x-36*s,y-28*s,72*s,5*s);g.fillStyle='#fff';g.font='800 '+(8*s)+'px sans-serif';g.textAlign='center';g.fillText('WET FLOOR',x,y-10*s)}
   else if(it.k==='high'){g.fillStyle='#0003';g.beginPath();g.ellipse(x,y,40*s,6*s,0,0,7);g.fill();g.fillStyle='#8a6a4a';g.fillRect(x-40*s,y-92*s,6*s,92*s);g.fillRect(x+34*s,y-92*s,6*s,92*s);g.fillStyle='#16a34a';g.fillRect(x-42*s,y-96*s,84*s,34*s);g.fillStyle='#fff';g.font='800 '+(9*s)+'px sans-serif';g.textAlign='center';g.fillText('WELCOME',x,y-82*s);g.fillText('FRESHERS',x,y-70*s)}
   else{g.fillStyle='#0003';g.beginPath();g.ellipse(x,y,40*s,7*s,0,0,7);g.fill();g.fillStyle='#16a34a';g.fillRect(x-36*s,y-50*s,72*s,38*s);g.fillStyle='#facc15';g.fillRect(x-36*s,y-30*s,72*s,18*s);g.fillStyle='#14532d';g.fillRect(x-32*s,y-64*s,64*s,16*s);g.fillStyle='#bfe3ff';g.fillRect(x-26*s,y-46*s,52*s,12*s);g.fillStyle='#222';g.beginPath();g.arc(x-24*s,y-10*s,9*s,0,7);g.arc(x+24*s,y-10*s,9*s,0,7);g.fill();g.fillStyle='#fff';g.font='800 '+(7*s)+'px sans-serif';g.textAlign='center';g.fillText('KEKE',x,y-18*s)}});
  if(LZ>-3.15){var s2=sc(LZ),lyy=Y(LZ),lxx=CXr+(lx2-1)*LW*s2;fig(lxx,lyy,s2*.95,{pants:'#3b3a4a',shoe:'#111',top:'#8a5a2a',skin:'#8d5524',hair:'#bbbbbb',glass:true,tie:true,paper:true,armUp:true,ph:1});
   if(bub.tt>0){var tw=g.measureText?0:0;g.font='800 11px sans-serif';var w=g.measureText(bub.t).width+16,bx2=Math.max(6,Math.min(CW-w-6,lxx-w/2)),by=Math.max(60,lyy-110*s2-26);g.fillStyle='#fff';g.beginPath();g.roundRect?g.roundRect(bx2,by,w,22,9):g.rect(bx2,by,w,22);g.fill();g.fillStyle='#b91c1c';g.textAlign='center';g.fillText(bub.t,bx2+w/2,by+15)}}
  var py=GY-jh*78;fig(X(lx,0),py,1,{pants:CFG.pants||'#26344f',shoe:CFG.shoes||'#222',top:CFG.top||'#fff',skin:CFG.skin,hair:CFG.hair,bag:CFG.bagType!=='none'?(CFG.bag||'#1f2937'):null,sl:stt>0,air:jt>0,ph:0});
  var cl=(LZ+2.9)/2.55;g.fillStyle='#0008';g.fillRect(14,44,110,12);g.fillStyle=cl>.6?'#ef4444':cl>.3?'#f59e0b':'#22c55e';g.fillRect(14,44,110*Math.max(0,Math.min(1,cl)),12);g.fillStyle='#fff';g.font='800 9px sans-serif';g.textAlign='left';g.fillText('DR. DEADLINE',16,53)}
 var last=0,hT=0;function loop(ts){if(!alive)return;var dt=Math.min(.05,(ts-last)/1000||0)*RNS;last=ts;var n=Math.max(1,Math.round(RNS));for(var s=0;s<n&&alive;s++)update(dt/n);if(alive){draw();hT+=dt;if(hT>.1){hT=0;var h=document.getElementById('rh');if(h)h.textContent='📄 '+pages+'  ₦ '+coins+'  '+Math.floor(dist)+' m'}requestAnimationFrame(loop)}}
 function go(a){if(!alive)return;if(a==='L')lane=Math.max(0,lane-1);else if(a==='R')lane=Math.min(2,lane+1);else if(a==='U'){if(jt<=0&&stt<=0){jt=JD;sfx(500)}}else if(a==='D'){if(stt<=0){stt=SD;jt=0;sfx(300)}}}
 cv.style.touchAction='none';var sp=null;cv.addEventListener('pointerdown',function(e){sp={x:e.clientX,y:e.clientY,id:e.pointerId}});
 cv.addEventListener('pointerup',function(e){if(!sp)return;var dx=e.clientX-sp.x,dy=e.clientY-sp.y;sp=null;if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>22)go(dx>0?'R':'L');else if(dy<-22)go('U');else if(dy>22)go('D');else go('U')});
 kd=function(e){if(e.key==='ArrowLeft'||e.key==='a')go('L');else if(e.key==='ArrowRight'||e.key==='d')go('R');else if(e.key==='ArrowUp'||e.key==='w'||e.key===' ')go('U');else if(e.key==='ArrowDown'||e.key==='s')go('D')};window.addEventListener('keydown',kd);
 document.getElementById('rstart').onclick=function(){document.getElementById('rcv').style.display='none';tone(600,.1);alive=true;started=true;last=performance.now();requestAnimationFrame(loop)};
 draw();
 window.__nf.rn=function(){return {items:items,lane:lane,lx:lx,LZ:LZ,dist:dist,coins:coins,pages:pages,hits:hits,over:over,jt:jt,stt:stt}};window.__nf.rnspeed=function(v){RNS=v};window.__nf.rngo=go;
}

/* ===== Comics + Ayo ===== */
var CAST={boy:{skin:'#8d5524',hair:'#120c0a',hairStyle:'low',headwear:'none',glasses:'none',freckles:0,topType:'tee',top:'#ff5d73',bottom:'jeans',pants:'#2b4a8a',shoeType:'sneaker',shoes:'#f5f5f5',bagType:'back',bag:'#1f2937'},
 tobi:FRC[0].c,chidi:FRC[1].c,
 ada:{skin:'#a0673b',hair:'#120c0a',hairStyle:'ponytail',headwear:'none',glasses:'round',freckles:0,topType:'sweater',top:'#34d96b',bottom:'leggings',pants:'#9ca3af',shoeType:'sneaker',shoes:'#fff',bagType:'side',bag:'#FFD23F'},
 lec:LECCFG};
function cfig(k,x,y,s,flip){return '<g transform="translate('+x+' '+y+') scale('+(flip?-s:s)+' '+s+')">'+charSvg(CAST[k])+'</g>'}
var CBG={room:'<rect width="360" height="250" fill="#f3e3c3"/><rect y="170" width="360" height="80" fill="#c9a06a"/><rect x="30" y="40" width="70" height="80" fill="#9fd4ff" stroke="#fff" stroke-width="6"/><rect x="230" y="120" width="110" height="60" rx="8" fill="#5b7fb8"/><rect x="236" y="104" width="46" height="26" rx="8" fill="#fff"/>',
 campus:'<rect width="360" height="250" fill="#9fd4ff"/><circle cx="300" cy="44" r="22" fill="#ffe27a"/><rect y="150" width="360" height="100" fill="#cfe5a1"/><rect y="170" width="360" height="40" fill="#8d90ab"/><rect x="20" y="70" width="90" height="82" fill="#f0b9a5"/><rect x="14" y="62" width="102" height="12" fill="#7c6a86"/><rect x="250" y="84" width="84" height="68" fill="#f3e6bd"/><rect x="244" y="76" width="96" height="12" fill="#7c6a86"/>',
 hall:'<rect width="360" height="250" fill="#e6d8b6"/><rect y="160" width="360" height="90" fill="#b58a58"/><rect x="40" y="30" width="280" height="90" rx="4" fill="#2c5f4a"/><text x="180" y="82" text-anchor="middle" font-size="18" font-weight="800" fill="#e7f3ec">PSY 101</text><rect x="20" y="168" width="320" height="10" fill="#8a6a4a"/>',
 door:'<rect width="360" height="250" fill="#e6d8b6"/><rect x="110" y="30" width="140" height="190" fill="#8a5a30" stroke="#5c3a1e" stroke-width="8"/><circle cx="230" cy="130" r="7" fill="#ffd23f"/><rect y="220" width="360" height="30" fill="#b58a58"/><circle cx="180" cy="22" r="16" fill="#fff" stroke="#333" stroke-width="3"/><path d="M180 22 V12 M180 22 L188 26" stroke="#333" stroke-width="2.5"/>',
 canteen:'<rect width="360" height="250" fill="#fde6ea"/><rect y="175" width="360" height="75" fill="#d9a56c"/><rect x="30" y="60" width="300" height="12" fill="#ff5d73"/><text x="180" y="52" text-anchor="middle" font-size="14" font-weight="800" fill="#d2486b">CANTEEN</text><rect x="40" y="150" width="120" height="14" fill="#8a6a4a"/><rect x="200" y="150" width="120" height="14" fill="#8a6a4a"/>',
 exam:'<rect width="360" height="250" fill="#e4e1d8"/><rect y="160" width="360" height="90" fill="#a9a398"/><rect x="40" y="110" width="80" height="12" fill="#8a6a4a"/><rect x="240" y="110" width="80" height="12" fill="#8a6a4a"/><rect x="120" y="20" width="120" height="50" fill="#fff" stroke="#333" stroke-width="3"/><text x="180" y="52" text-anchor="middle" font-size="16" font-weight="800" fill="#b91c1c">SILENCE</text>'};
var COMICS=[{id:'c1',t:'Fresher Diaries',ep:'Episode 1: The 8 AM Class',e:'⏰',col:'#ff9aa8',ps:[
 {bg:'room',f:[['boy',130,150,2.1]],cap:'Monday. 7:52 AM. Class starts at 8:00.',b:[{x:46,y:8,t:'Alarm?! Why did nobody wake me?!'}]},
 {bg:'campus',f:[['boy',110,155,2],['tobi',250,155,2,1]],cap:'The road to the lecture hall.',b:[{x:4,y:6,t:'Tobi, run! Keke! KEKE!'},{x:54,y:30,t:'You have not even brushed your teeth...'}]},
 {bg:'door',f:[['lec',250,170,2.2,1]],cap:'7:59 AM. The door.',b:[{x:2,y:10,t:'In this class, the door closes at exactly eight.'}]},
 {bg:'hall',f:[['boy',120,175,2],['lec',250,175,2.2,1]],cap:'One second to spare.',b:[{x:2,y:6,t:'Made it!'},{x:50,y:20,t:'...Sit down. Front row.'}]},
 {bg:'hall',f:[['boy',180,175,2.2]],cap:'He promised himself it will never happen again.',b:[{x:30,y:8,t:'Tomorrow, I sleep early. (He did not.)'}]}]},
 {id:'c2',t:'Bread and Egg',ep:'Episode 1: Month End',e:'🍞',col:'#ffd36b',ps:[
 {bg:'canteen',f:[['boy',130,170,2.1],['chidi',250,170,2.1,1]],cap:'The 27th of the month.',b:[{x:2,y:8,t:'I have 700 naira until allowance.'}]},
 {bg:'canteen',f:[['chidi',180,170,2.2]],cap:'Chidi has a plan.',b:[{x:20,y:8,t:'Bread and egg again? Come, we share.'}]},
 {bg:'canteen',f:[['boy',110,170,2],['chidi',200,170,2],['tobi',290,170,2,1]],cap:'Three friends, one table.',b:[{x:2,y:6,t:'Tobi brought pepper!'},{x:46,y:30,t:'This is the best meal of the month.'}]},
 {bg:'campus',f:[['boy',180,170,2.2]],cap:'Allowance arrives the next morning.',b:[{x:26,y:8,t:'Next month I will budget. Maybe.'}]}]},
 {id:'c3',t:'The Carryover',ep:'Episode 1: Never Again',e:'📝',col:'#7cc7ff',ps:[
 {bg:'room',f:[['ada',130,160,2.1]],cap:'Two weeks to exams.',b:[{x:40,y:8,t:'Notes, notes, notes. No phone.'}]},
 {bg:'exam',f:[['ada',130,175,2],['lec',270,175,2.1,1]],cap:'The exam hall. Total silence.',b:[{x:6,y:6,t:'I know this one!'}]},
 {bg:'hall',f:[['ada',130,175,2],['lec',270,175,2.1,1]],cap:'Results day.',b:[{x:2,y:8,t:'PSY 101: B. I passed!'},{x:50,y:30,t:'Well done. Carryover avoided.'}]}]}];
function cpanel(c,i){var p=c.ps[i],h='<svg viewBox="0 0 360 250" class="csv">'+CBG[p.bg];p.f.forEach(function(q){h+=cfig(q[0],q[1],q[2]-48,q[3],q[4])});h+='</svg>';p.b.forEach(function(b){h+='<div class="cbub" style="left:'+b.x+'%;top:'+b.y+'%">'+b.t+'</div>'});return h}
function comicsShelf(){var h='<div style="width:100%;max-width:520px;padding:0 14px 20px;color:#fff"><p class="tbn">Short original stories about campus life. Reading helps you relax.</p><div class="shelf">';
 COMICS.forEach(function(c,i){h+='<button class="cvr" data-c="'+i+'" style="background:'+c.col+'"><span class="ce">'+c.e+'</span><b>'+c.t+'</b><small>'+c.ep+'</small><em>'+c.ps.length+' panels</em></button>'});
 ovOpen('📚 Comic corner',h+'</div></div>',function(){});document.querySelectorAll('.cvr').forEach(function(b){b.onclick=function(){comicReader(+b.getAttribute('data-c'))}})}
function comicReader(ci){var c=COMICS[ci],i=0;
 ovOpen(c.t,'<div style="width:100%;max-width:520px;padding:0 14px;color:#fff"><p class="tbn" style="margin:0 0 8px">'+c.ep+'</p><div class="cpw" id="cpw"></div><p class="ccap" id="ccap"></p><div class="cnav"><button class="btn" id="cprev">◀ Back</button><span id="cdots"></span><button class="btn go" id="cnext">Next ▶</button></div></div>',function(){});
 function draw(){document.getElementById('cpw').innerHTML=cpanel(c,i);document.getElementById('ccap').textContent=c.ps[i].cap;document.getElementById('cdots').textContent=(i+1)+' / '+c.ps.length;document.getElementById('cprev').style.visibility=i?'visible':'hidden';document.getElementById('cnext').textContent=i<c.ps.length-1?'Next ▶':'Finish ✓'}
 document.getElementById('cprev').onclick=function(){if(i>0){i--;draw()}};
 document.getElementById('cnext').onclick=function(){if(i<c.ps.length-1){i++;draw();return}var fx={e:4,f:2};applyFx(fx);addMin(15);closeOv();ask('📖','You finished the episode','You laughed a little and felt lighter. 15 minutes passed.',[{l:'Continue',c:'go',f:closeSheet}],chipsHtml(fx))};
 draw();window.__nf.cm=function(){return {i:i,n:c.ps.length}}}
/* ----- Ayo (Oware) ----- */
function ayoGame(){var B=[],sc=[0,0],turn=0,busy=false,msg='',done=false;
 function init(){B=[];for(var i=0;i<12;i++)B.push(4);sc=[0,0];turn=0;busy=false;done=false}
 function sow(b,i){var n=b[i],path=[],pos=i;b[i]=0;while(n>0){pos=(pos+1)%12;if(pos===i)continue;b[pos]++;n--;path.push(pos)}return {last:pos,path:path}}
 function caps(b,last,who){var side=who===0?[6,11]:[0,5],out=[];if(last<side[0]||last>side[1])return out;var p=last;while(p>=side[0]&&(b[p]===2||b[p]===3)){out.push(p);p--}return out}
 function legal(b,who){var r=[],a=who===0?0:6;for(var i=a;i<a+6;i++)if(b[i]>0)r.push(i);return r}
 function sim(i,who){var b=B.slice(),s=sow(b,i),c=caps(b,s.last,who),g=0;c.forEach(function(p){g+=b[p]});return g}
 var body=ovOpen('🌰 Ayo','<div style="width:100%;max-width:460px;padding:0 12px;color:#fff;text-align:center"><p class="tbn" id="amsg"></p><div class="ayosc"><span id="asc1">Tobi 0</span><span id="asc0">You 0</span></div><div class="ayob" id="ayob"></div><p style="color:#9fb4dc;font-size:12px;line-height:1.5;margin-top:10px">Tap one of your pits (bottom row). Seeds are dropped one by one, anticlockwise. If your last seed makes a pit on Tobi\'s side hold 2 or 3, you capture it. First to 25 wins.</p></div>',function(){});
 function render(){var h='';for(var r=0;r<2;r++){h+='<div class="ayor">';for(var c=0;c<6;c++){var idx=r===0?11-c:c;h+='<button class="pit'+(r===1?' me':'')+'" data-p="'+idx+'" '+((r===1&&turn===0&&!busy&&!done&&B[idx]>0)?'':'disabled')+'><b>'+B[idx]+'</b><span>'+Array(Math.min(B[idx],12)+1).join('•')+'</span></button>'}h+='</div>'}document.getElementById('ayob').innerHTML=h;document.getElementById('asc0').textContent='You '+sc[0];document.getElementById('asc1').textContent='Tobi '+sc[1];document.getElementById('amsg').textContent=msg;
  document.querySelectorAll('.pit.me').forEach(function(b){b.onclick=function(){play(+b.getAttribute('data-p'))}})}
 function end(){done=true;busy=false;var m0=0,m1=0;for(var i=0;i<6;i++){m0+=B[i];m1+=B[i+6]}sc[0]+=m0;sc[1]+=m1;for(var j=0;j<12;j++)B[j]=0;var w=sc[0]>sc[1],dr=sc[0]===sc[1];var fx=w?{f:6,e:-3}:{f:3,e:-3};applyFx(fx);addMin(30);msg=(w?'You won ':dr?'A draw ':'Tobi won ')+sc[0]+' to '+sc[1];render();window.__nf.ayres={w:w,s:sc.slice()};
  var d=document.createElement('div');d.innerHTML='<div class="chipset" style="justify-content:center">'+'</div>';var bx=document.querySelector('#ov .ovb>div');var btn=document.createElement('button');btn.className='btn go';btn.style.cssText='margin-top:12px;width:100%;text-align:center';btn.textContent=(w?'🏆 ':'')+'Play again';btn.onclick=function(){init();msg='Your turn. Pick a pit.';render()};bx.appendChild(btn);var b2=document.createElement('button');b2.className='btn';b2.style.cssText='margin-top:8px;width:100%;text-align:center';b2.textContent='Back to campus';b2.onclick=function(){closeOv()};bx.appendChild(b2)}
 function play(i){if(busy||done)return;busy=true;var who=B[i]>0&&i<6?0:1,b2=B.slice(),s=sow(b2,i),k=0;msg=who===0?'You played...':'Tobi plays...';
  (function stepA(){if(k<s.path.length){B[i]=0;B[s.path[k]]++;k++;render();setTimeout(stepA,170);return}
   var c=caps(B,s.last,who),g=0;c.forEach(function(p){g+=B[p];B[p]=0});sc[who]+=g;if(g)msg=(who===0?'You captured ':'Tobi captured ')+g+'!';render();
   if(sc[0]>=25||sc[1]>=25){return end()}
   turn=1-turn;busy=false;if(legal(B,turn).length===0){return end()}
   if(turn===1){busy=true;setTimeout(ai,600)}else{msg=msg||'Your turn.';render()}})()}
 function ai(){var m=legal(B,1);if(!m.length)return end();var best=null,bg=-1;m.forEach(function(i){var g=sim(i,1);if(g>bg||(g===bg&&rnd()<.4)){bg=g;best=i}});if(rnd()<.2)best=pick(m);busy=false;play(best)}
 init();msg='Your turn. Pick a pit.';render();
 window.__nf.ay=function(){return {B:B.slice(),sc:sc.slice(),turn:turn,done:done,busy:busy}};window.__nf.aymove=function(i){play(i)}}

function shade(c,a){var n=parseInt(c.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;return 'rgb('+Math.round(r*(1-a))+','+Math.round(g*(1-a))+','+Math.round(b*(1-a))+')'}
function charSvg(c){var sk=c.skin,skd=shade(sk,.18),skl=shade(sk,-0.0),hr=c.hair,top=c.top,topd=shade(top,.2),pa=c.pants,pad=shade(pa,.22),sh=c.shoes,bg=c.bag,hc=c.headColor||'#c0392b',s='';
 var F=(c.g==='f')||c.headwear==='hijab'||c.bottom==='skirt'||c.bottom==='leggings'||/long|ponytail|puffs/.test(c.hairStyle||''),long=c.topType==='native';
 var sw=F?6.5:7.8,ww=F?4.5:5.6,hw=F?6.9:6.2; // shoulder, waist, hip half-widths
 var HY=-24; // head centre
 // ---- back layers (hair behind, hijab, backpack) ----
 if(c.headwear==='hijab')s+='<path d="M-6.6 -24 Q-7.6 -34 0 -34 Q7.6 -34 6.6 -24 Q8.5 -13 5 -9 L-5 -9 Q-8.5 -13 -6.6 -24Z" fill="'+hc+'"/>';
 else{var hs=c.hairStyle;
  if(hs==='afro')s+='<ellipse cx="0" cy="-26.5" rx="8.6" ry="8.2" fill="'+hr+'"/>';
  if(hs==='long')s+='<path d="M-6 -31 Q-9.4 -27 -8.6 -14 Q-8.2 -9 -5.5 -8 L5.5 -8 Q8.2 -9 8.6 -14 Q9.4 -27 6 -31 Q0 -34 -6 -31Z" fill="'+hr+'"/>';
  if(hs==='ponytail')s+='<path d="M3.5 -31 Q12 -32 10 -18 Q9.5 -13 6.5 -13 Q8 -19 3.6 -25Z" fill="'+hr+'"/>'}
 if(c.bagType==='back')s+='<rect x="-7.4" y="-13" width="14.8" height="16" rx="4" fill="'+shade(bg,.25)+'"/>';
 // ---- legs ----
 function leg(side,cls){var x0=side<0?-6.2:.2,o='<g class="lg '+cls+'">',lw=6,cx=x0+lw/2;
  var ank=cx+(side<0?.2:-.2);
  if(c.bottom==='shorts'){o+='<path d="M'+(cx-2.6)+' 9 L'+(cx-1.9)+' 19.2 L'+(cx+1.9)+' 19.2 L'+(cx+2.6)+' 9Z" fill="'+sk+'"/><path d="M'+(cx+.6)+' 9 L'+(cx+1.9)+' 19.2 L'+(cx+2.6)+' 9Z" fill="'+skd+'" opacity=".5"/><path d="M'+(x0-.2)+' 3 L'+(x0+lw+.2)+' 3 L'+(x0+lw+.6)+' 13 L'+(x0-.6)+' 13Z" fill="'+pa+'"/><path d="M'+(x0+lw*.55)+' 3 L'+(x0+lw+.2)+' 3 L'+(x0+lw+.6)+' 13 L'+(x0+lw*.6)+' 13Z" fill="'+pad+'" opacity=".6"/>'}
  else if(c.bottom==='skirt'){o+='<path d="M'+(cx-2.4)+' 12 L'+(cx-1.7)+' 19.2 L'+(cx+1.7)+' 19.2 L'+(cx+2.4)+' 12Z" fill="'+sk+'"/>'}
  else{var w1=c.bottom==='leggings'?2.5:3.0,w2=c.bottom==='leggings'?1.7:2.2;
   o+='<path d="M'+(cx-w1)+' 3 L'+(cx-w2)+' 19.4 L'+(cx+w2)+' 19.4 L'+(cx+w1)+' 3Z" fill="'+pa+'"/><path d="M'+(cx+.3)+' 3 L'+(cx+w1)+' 3 L'+(cx+w2)+' 19.4 L'+(cx+.4)+' 19.4Z" fill="'+pad+'" opacity=".55"/>';
   if(c.bottom==='jeans')o+='<path d="M'+(cx-w1+.2)+' 8 L'+(cx-w1+1.2)+' 9.6 M'+(cx-w2)+' 18 H'+(cx+w2)+'" stroke="'+pad+'" stroke-width=".7" fill="none"/>'}
  var fx=cx-3.2;
  if(c.shoeType==='sandal')o+='<path d="M'+(cx-2.2)+' 19.2 L'+(cx+2.2)+' 19.2 L'+(cx+2.2)+' 20.4 L'+(cx+4)+' 21 L'+(cx+4)+' 22 L'+(cx-2.6)+' 22 Z" fill="'+sk+'"/><path d="M'+(cx-2.8)+' 21.4 H'+(cx+4.2)+' V22.4 H'+(cx-2.8)+'Z" fill="'+sh+'"/>';
  else if(c.shoeType==='boot')o+='<path d="M'+(cx-2.6)+' 15 L'+(cx+2.6)+' 15 L'+(cx+2.6)+' 20.4 L'+(cx+4.6)+' 21.6 L'+(cx+4.6)+' 22.6 L'+(cx-2.8)+' 22.6Z" fill="'+sh+'"/>';
  else if(c.shoeType==='formal')o+='<path d="M'+(cx-2.4)+' 19 L'+(cx+2.2)+' 19 L'+(cx+2.4)+' 20.6 L'+(cx+4.8)+' 21.7 L'+(cx+4.8)+' 22.6 L'+(cx-2.6)+' 22.6Z" fill="'+sh+'"/><path d="M'+(cx-2.2)+' 21.9 H'+(cx+4.6)+'" stroke="#fff" stroke-width=".4" opacity=".35"/>';
  else o+='<path d="M'+(cx-2.4)+' 18.8 L'+(cx+2.3)+' 18.8 L'+(cx+2.5)+' 20.4 Q'+(cx+5.4)+' 20.6 '+(cx+5.2)+' 22.4 L'+(cx-2.8)+' 22.4Z" fill="'+sh+'"/><rect x="'+(cx-2.9)+'" y="21.6" width="8.3" height="1" rx=".5" fill="#f2f2f2"/>';
  return o+'</g>'}
 s+=leg(-1,'la')+leg(1,'lb');
 // ---- skirt / long top lower part ----
 if(c.bottom==='skirt'&&!long)s+='<path d="M'+(-hw)+' 2 L-8.6 13.4 Q0 15.2 8.6 13.4 L'+hw+' 2Z" fill="'+pa+'"/><path d="M1 2 L'+hw+' 2 L8.6 13.4 Q4 14.6 1 14.4Z" fill="'+pad+'" opacity=".5"/>';
 // ---- neck ----
 s+='<path d="M-1.9 -19 L-1.9 -14 L1.9 -14 L1.9 -19Z" fill="'+sk+'"/><path d="M-1.9 -17.6 Q0 -15.6 1.9 -17.6 L1.9 -19 L-1.9 -19Z" fill="'+skd+'" opacity=".55"/>';
 // ---- torso (shoulders -> waist -> hips) ----
 var tl=long?19:(c.topType==='sweater'||c.topType==='hoodie'||c.topType==='jersey'?8.4:6.6),T=(c.topType==='hoodie')?-15.6:-15;
 var tors='M'+(-sw)+' '+(T+1.6)+' Q'+(-sw)+' '+T+' '+(-sw+2.6)+' '+T+' L'+(sw-2.6)+' '+T+' Q'+sw+' '+T+' '+sw+' '+(T+1.6)+' L'+ww+' -3 Q'+(ww+.4)+' 1 '+hw+' '+tl+' L'+(-hw)+' '+tl+' Q'+(-ww-.4)+' 1 '+(-ww)+' -3Z';
 s+='<path d="'+tors+'" fill="'+top+'"/>';
 s+='<path d="M1.2 '+T+' L'+(sw-2.6)+' '+T+' Q'+sw+' '+T+' '+sw+' '+(T+1.6)+' L'+ww+' -3 Q'+(ww+.4)+' 1 '+hw+' '+tl+' L2.4 '+tl+' Q'+(ww*.55)+' 0 1.2 '+(T+4)+'Z" fill="'+topd+'" opacity=".5"/>';
 if(F)s+='<path d="M-3.6 -10.6 Q-2 -8.6 -.2 -10.4 M.2 -10.4 Q2 -8.6 3.6 -10.6" stroke="'+topd+'" stroke-width=".7" fill="none" opacity=".6"/>';
 if(c.topType==='tee')s+='<path d="M-2.6 '+T+' Q0 '+(T+3.2)+' 2.6 '+T+'" fill="'+skd+'" stroke="'+topd+'" stroke-width=".6"/>';
 if(c.topType==='sweater')s+='<path d="M-2.8 '+T+' Q0 '+(T+3)+' 2.8 '+T+'" fill="'+sk+'" stroke="'+topd+'" stroke-width="1.3"/><path d="M'+(-hw)+' '+(tl-1.6)+' H'+hw+'" stroke="'+topd+'" stroke-width="1.6"/>';
 if(c.topType==='hoodie')s+='<path d="M-4.8 '+(T+.4)+' Q0 '+(T+5.4)+' 4.8 '+(T+.4)+'" fill="'+topd+'"/><path d="M-1.4 '+(T+4)+' L-1.7 -7 M1.4 '+(T+4)+' L1.7 -7" stroke="#fff" stroke-width=".6" opacity=".75"/><path d="M-4 -3 Q0 -1.6 4 -3 L3.6 2 Q0 3 -3.6 2Z" fill="none" stroke="'+topd+'" stroke-width=".7"/>';
 if(c.topType==='jacket')s+='<path d="M-1.8 '+T+' L-1.8 '+tl+' L1.8 '+tl+' L1.8 '+T+'Z" fill="#f4f4f4"/><path d="M0 '+(T+1)+' V'+tl+'" stroke="'+topd+'" stroke-width=".7"/><path d="M-1.8 '+T+' L-4.2 '+(T+.2)+' L-2 '+(T+3.6)+'Z M1.8 '+T+' L4.2 '+(T+.2)+' L2 '+(T+3.6)+'Z" fill="'+topd+'"/>';
 if(c.topType==='jersey')s+='<path d="M-2.8 '+T+' Q0 '+(T+3)+' 2.8 '+T+'" fill="'+sk+'" stroke="#fff" stroke-width="1"/><rect x="'+(-ww-.3)+'" y="-8" width="'+(ww*2+.6)+'" height="1.4" fill="#fff" opacity=".85"/><rect x="'+(-ww-.3)+'" y="-4.6" width="'+(ww*2+.6)+'" height="1.4" fill="#fff" opacity=".85"/>';
 if(long)s+='<path d="M-2.6 '+T+' L0 -7.6 L2.6 '+T+'" stroke="'+topd+'" stroke-width="1" fill="none"/><path d="M'+(-hw)+' '+(tl-1.6)+' H'+hw+'" stroke="'+topd+'" stroke-width="1.2"/><circle cx="0" cy="-5" r=".7" fill="'+topd+'"/><circle cx="0" cy="-1.4" r=".7" fill="'+topd+'"/><circle cx="0" cy="2.2" r=".7" fill="'+topd+'"/>';
 if(c.bottom!=='skirt'&&!long&&c.topType!=='sweater'&&c.topType!=='hoodie'&&c.topType!=='jersey')s+='<rect x="'+(-hw+.4)+'" y="'+(tl-.2)+'" width="'+(hw*2-.8)+'" height="1.2" fill="'+pad+'"/>';
 // ---- arms ----
 function arm(side,cls){var x=side*(sw-.6),o='<g class="ar '+cls+'">',ls=(c.topType==='sweater'||c.topType==='hoodie'||c.topType==='jacket'||long),aw=F?2.8:3.3,ax=x-aw/2;
  if(ls)o+='<path d="M'+ax+' -14.6 L'+(ax+aw)+' -14.6 L'+(ax+aw-.4)+' 0 L'+(ax+.4)+' 0Z" fill="'+top+'"/><path d="M'+(ax+aw*.55)+' -14.6 L'+(ax+aw)+' -14.6 L'+(ax+aw-.4)+' 0 L'+(ax+aw*.55)+' 0Z" fill="'+topd+'" opacity=".5"/><ellipse cx="'+x+'" cy="1.8" rx="1.5" ry="1.8" fill="'+sk+'"/>';
  else o+='<path d="M'+(ax+.2)+' -9 L'+(ax+aw-.2)+' -9 L'+(ax+aw-.5)+' 0.2 L'+(ax+.5)+' 0.2Z" fill="'+sk+'"/><path d="M'+(ax+aw*.55)+' -9 L'+(ax+aw-.2)+' -9 L'+(ax+aw-.5)+' .2 L'+(ax+aw*.55)+' .2Z" fill="'+skd+'" opacity=".45"/><ellipse cx="'+x+'" cy="1.8" rx="1.5" ry="1.8" fill="'+sk+'"/><path d="M'+ax+' -14.6 L'+(ax+aw)+' -14.6 L'+(ax+aw+.6)+' -9 L'+(ax-.6)+' -9Z" fill="'+top+'"/>';
  return o+'</g>'}
 s+=arm(-1,'aa')+arm(1,'ab');
 if(c.bagType==='back')s+='<path d="M-3.6 -14.6 Q-4.2 -8 -3.4 -2 M3.6 -14.6 Q4.2 -8 3.4 -2" stroke="'+bg+'" stroke-width="1.7" fill="none"/>';
 if(c.bagType==='side')s+='<path d="M4.6 -15 L-5.4 3.4" stroke="'+bg+'" stroke-width="1.3" fill="none"/><rect x="-11" y="1.4" width="8.6" height="6.8" rx="1.6" fill="'+bg+'"/><rect x="-11" y="1.4" width="8.6" height="2.4" rx="1" fill="'+shade(bg,.22)+'"/>';
 // ---- head ----
 s+='<ellipse cx="-4.7" cy="'+(HY+.4)+'" rx="1.1" ry="1.7" fill="'+sk+'"/><ellipse cx="4.7" cy="'+(HY+.4)+'" rx="1.1" ry="1.7" fill="'+sk+'"/><path d="M-4.4 '+(HY-4.4)+' Q-4.6 '+(HY+4.6)+' -2 '+(HY+5.6)+' Q0 '+(HY+6.4)+' 2 '+(HY+5.6)+' Q4.6 '+(HY+4.6)+' 4.4 '+(HY-4.4)+' Q4 '+(HY-6.2)+' 0 '+(HY-6.2)+' Q-4 '+(HY-6.2)+' -4.4 '+(HY-4.4)+'Z" fill="'+sk+'"/>';
 s+='<path d="M1.4 '+(HY-5.8)+' Q4.6 '+(HY-5)+' 4.4 '+(HY-3)+' Q4.7 '+(HY+4.6)+' 2 '+(HY+5.6)+' Q.6 '+(HY+6)+' 0 '+(HY+6.1)+' Q2.4 '+(HY+3)+' 1.4 '+(HY-5.8)+'Z" fill="'+skd+'" opacity=".35"/>';
 [-1,1].forEach(function(d){var x=d*2.1,ey=HY-.4;s+='<ellipse cx="'+x+'" cy="'+ey+'" rx="1.25" ry=".85" fill="#fff"/><circle cx="'+x+'" cy="'+ey+'" r=".72" fill="#2a1a10"/><path d="M'+(x-1.5)+' '+(ey-1.5)+' Q'+x+' '+(ey-2.3)+' '+(x+1.5)+' '+(ey-1.5)+'" stroke="'+(c.headwear==='hijab'?'#3a2314':shade(hr,0.0))+'" stroke-width=".7" fill="none" stroke-linecap="round"/>'});
 s+='<path d="M0 '+(HY+.6)+' Q.9 '+(HY+2.4)+' -.2 '+(HY+2.6)+'" stroke="'+skd+'" stroke-width=".6" fill="none" stroke-linecap="round"/><path d="M-1.6 '+(HY+4)+' Q0 '+(HY+4.9)+' 1.6 '+(HY+4)+'" stroke="'+(F?'#b0384a':'#7a2d2d')+'" stroke-width="'+(F?1.1:.9)+'" fill="none" stroke-linecap="round"/>';
 if(c.freckles)[[-2.6,-.2],[-1.8,.8],[2.6,-.2],[1.8,.8]].forEach(function(p){s+='<circle cx="'+p[0]+'" cy="'+(HY+p[1]+1)+'" r=".28" fill="'+shade(sk,.4)+'"/>'});
 if(c.glasses==='round')s+='<circle cx="-2.1" cy="'+(HY-.4)+'" r="2" fill="#bfe3ff" fill-opacity=".25" stroke="#111" stroke-width=".6"/><circle cx="2.1" cy="'+(HY-.4)+'" r="2" fill="#bfe3ff" fill-opacity=".25" stroke="#111" stroke-width=".6"/><path d="M-.1 '+(HY-.6)+' H.1 M-4.1 '+(HY-.6)+' L-4.6 '+(HY-.8)+' M4.1 '+(HY-.6)+' L4.6 '+(HY-.8)+'" stroke="#111" stroke-width=".6"/>';
 if(c.glasses==='square')s+='<rect x="-4.1" y="'+(HY-2)+'" width="3.8" height="3.2" rx=".8" fill="#bfe3ff" fill-opacity=".25" stroke="#111" stroke-width=".6"/><rect x=".3" y="'+(HY-2)+'" width="3.8" height="3.2" rx=".8" fill="#bfe3ff" fill-opacity=".25" stroke="#111" stroke-width=".6"/><path d="M-.3 '+(HY-.6)+' H.3" stroke="#111" stroke-width=".6"/>';
 // ---- hair front / headwear ----
 if(c.headwear==='hijab')s+='<path d="M-5.2 '+(HY-1)+' Q-5 '+(HY-9.8)+' 0 '+(HY-10)+' Q5 '+(HY-9.8)+' 5.2 '+(HY-1)+' Q4.4 '+(HY-5.8)+' 0 '+(HY-6.2)+' Q-4.4 '+(HY-5.8)+' -5.2 '+(HY-1)+'Z" fill="'+hc+'"/><path d="M-5.6 '+(HY+3)+' Q0 '+(HY+8.5)+' 5.6 '+(HY+3)+' L5 '+(HY+7)+' Q0 '+(HY+10)+' -5 '+(HY+7)+'Z" fill="'+hc+'"/>';
 else{var hs2=c.hairStyle;
  if(hs2==='puffs')s+='<circle cx="-6" cy="'+(HY-8)+'" r="3.3" fill="'+hr+'"/><circle cx="6" cy="'+(HY-8)+'" r="3.3" fill="'+hr+'"/>';
  if(hs2==='spiky')s+='<path d="M-4.6 '+(HY-5)+' L-4 '+(HY-9.8)+' L-2 '+(HY-7)+' L0 '+(HY-10.6)+' L2 '+(HY-7)+' L4 '+(HY-9.8)+' L4.6 '+(HY-5)+'Z" fill="'+hr+'"/>';
  if(hs2!=='bald')s+='<path d="M-4.9 '+(HY-2.4)+' Q-5.6 '+(HY-9.2)+' 0 '+(HY-9.4)+' Q5.6 '+(HY-9.2)+' 4.9 '+(HY-2.4)+' Q4.2 '+(HY-6)+' 0 '+(HY-6.2)+' Q-4.2 '+(HY-6)+' -4.9 '+(HY-2.4)+'Z" fill="'+hr+'"/>';
  if(hs2==='braids')for(var i=-3;i<=3;i++)s+='<path d="M'+(i*1.3)+' '+(HY-9.2)+' Q'+(i*1.5)+' '+(HY-7.6)+' '+(i*1.2)+' '+(HY-6.1)+'" stroke="#fff" stroke-width=".35" fill="none" opacity=".35"/>';
  if(hs2==='ponytail')s+='<circle cx="4.4" cy="'+(HY-7.8)+'" r=".9" fill="#ff5d73"/>';
  if(c.headwear==='cap')s+='<path d="M-5.2 '+(HY-4.4)+' Q-5.2 '+(HY-10.4)+' 0 '+(HY-10.4)+' Q5.2 '+(HY-10.4)+' 5.2 '+(HY-4.4)+'Z" fill="'+hc+'"/><path d="M-6.4 '+(HY-4.6)+' Q0 '+(HY-3.2)+' 6.8 '+(HY-4.6)+' L6.8 '+(HY-5.6)+' Q0 '+(HY-4.4)+' -6.4 '+(HY-5.6)+'Z" fill="'+shade(hc,.25)+'"/>'}
 return '<ellipse cx="0" cy="22.6" rx="9" ry="2.4" fill="#0004"/><g class="bob">'+s+'</g>'}
var GAMES=[{id:'football',e:'⚽',n:'Campus football',d:'4 v 4 match in landscape. Hold SHOOT for power.',f:function(){footballMatch()}},{id:'runner',e:'🏃',n:'Assignment Rush',d:'Run from Dr. Deadline. Swipe to dodge. Collect pages and coins.',f:function(){runnerGame()}},{id:'ayo',e:'🌰',n:'Ayo',d:'The traditional seed game. You against Tobi.',f:function(){ayoGame()}},{id:'comics',e:'📚',n:'Comic corner',d:'Short original campus stories to read and relax.',f:function(){comicsShelf()}}];
NF.games=GAMES;
NF.openGame=function(id){var g=GAMES.filter(function(x){return x.id===id})[0];if(!g)return;if(NF.phone)NF.phone.hide();setTimeout(function(){try{g.f()}catch(e){toast('Game error: '+e.message)}},260)};
})();
