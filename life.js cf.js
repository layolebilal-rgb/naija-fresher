/* life.js — FRONTEND. The student day: clock, alarm, hostel (ground floor + upstairs + your room),
   lecture hall, timetable and attendance. Uses the 3D engine through NF.core (js/game.js). */
(function(){
var NF=window.NF=window.NF||{};
var C=null,T=null;
var DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
var CLASSES=[
 {code:'PSY 101',name:'Introduction to Psychology',place:'Lecture Theatre 1',s:480,e:600,lec:'Dr. Adeyemi'},
 {code:'GNS 101',name:'Use of English',place:'Lecture Theatre 2',s:720,e:840,lec:'Mrs. Okafor'},
 {code:'PSY 103',name:'Social Psychology I',place:'Faculty of Social Science',s:960,e:1080,lec:'Prof. Bello'}];
var L=NF.life={day:0,min:355,alarm:390,asleep:false,fired:false,st:{},attended:0,missed:0,mine:'Hostel B',cur:null,classes:CLASSES,locked:{}};
var ITS={};            // built interiors
var doorCard=false,zoneKey=null,lastHud=-1,ringUntil=0,AC=null;

function hm(m){m=Math.floor(m)%1440;var h=Math.floor(m/60),mm=m%60,ap=h>=12?'PM':'AM';h=h%12;if(h===0)h=12;return h+':'+('0'+mm).slice(-2)+' '+ap}
NF.clockText=function(){return DAYS[L.day%7].slice(0,3)+' '+hm(L.min)};
L.hm=hm;
L.setAlarm=function(m){L.alarm=((m%1440)+1440)%1440;L.fired=false;if(NF.toast)NF.toast('⏰ Alarm set for '+hm(L.alarm))};
L.timetable=function(){return CLASSES.map(function(c){return {code:c.code,name:c.name,place:c.place,s:hm(c.s),e:hm(c.e),lec:c.lec,status:L.st[c.code]||(L.min>=c.e?'missed':(L.min>=c.s?'now':'upcoming'))}})};
function beep(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();[0,.35,.7,1.05].forEach(function(t){var o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=1100;o.connect(g);g.connect(AC.destination);var s=AC.currentTime+t;g.gain.setValueAtTime(.12,s);g.gain.exponentialRampToValueAtTime(.001,s+.25);o.start(s);o.stop(s+.28)})}catch(e){}try{navigator.vibrate&&navigator.vibrate([300,150,300,150,300])}catch(e){}}

/* ---------- building interiors ---------- */
function bx(I,w,h,d,col,x,y,z,solid){var m=new T.Mesh(new T.BoxGeometry(w,h,d),C.mat(col));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;I.g.add(m);if(solid)I.boxes.push({x0:I.ox+x-w/2,x1:I.ox+x+w/2,z0:I.oz+z-d/2,z1:I.oz+z+d/2});return m}
function lab(I,txt,x,y,z,s){var l=C.label(txt,I.ox+x,y,I.oz+z,s);I.labels.push(l);return l}
function newI(ox,oz,b){var g=new T.Group();g.position.set(ox,0,oz);C.scene.add(g);return {g:g,ox:ox,oz:oz,boxes:[],zones:[],labels:[],int:b}}
function ground(){if(ITS.ground)return;var m=new T.Mesh(new T.PlaneGeometry(600,600),C.mat(0x4a4e5a));m.rotation.x=-Math.PI/2;m.position.set(3000,-.6,150);C.scene.add(m);ITS.ground=m}
function buildHostel(){ground();var I=newI(3000,0,{x0:2980,x1:3082,z0:-15,z1:12});var W=0xe9e2d2,H=3.4,Y1=4.2;
 /* ground floor lobby */
 bx(I,32,.3,18,0xcfc3ad,0,-.15,0);bx(I,32.6,H,.6,W,0,H/2,-9,1);bx(I,.6,H,18.6,W,-16,H/2,0,1);bx(I,.6,H,18.6,W,16,H/2,0,1);bx(I,13.8,H,.6,W,-9.1,H/2,9,1);bx(I,13.8,H,.6,W,9.1,H/2,9,1);
 bx(I,4,.04,1.6,0xb3261e,0,.03,8.2);bx(I,6,1.1,1.6,0x7a5230,-8,.55,-6,1);bx(I,1.2,.8,4,0x3b6ea5,-13.5,.4,2,1);bx(I,1.2,.8,4,0x3b6ea5,-13.5,.4,-2,1);bx(I,1.2,1.1,1.2,0x2f7d3a,12,.55,6,1);
 for(var i=0;i<10;i++){bx(I,.85,.42*(i+1),5,0x8a7a66,6.5+i*.85,.21*(i+1),-5.5)}I.boxes.push({x0:I.ox+6,x1:I.ox+15,z0:I.oz-8,z1:I.oz-3});
 bx(I,3,.5,.1,0x1e5fa8,0,3,-8.6);
 /* first floor: corridor + 5 rooms */
 bx(I,40,.3,6.4,0xd8cdb8,56,Y1-.15,0);bx(I,40,.3,8.8,0xe3d9c6,56,Y1-.15,-7.3);
 bx(I,40.6,H,.6,W,56,Y1+H/2,3.3,1);bx(I,.6,H,16,W,35.7,Y1+H/2,-4.2,1);bx(I,.6,H,16,W,76.3,Y1+H/2,-4.2,1);bx(I,40.6,H,.6,W,56,Y1+H/2,-11.7,1);
 [44,52,60,68].forEach(function(x){bx(I,.5,H,8.8,W,x,Y1+H/2,-7.3,1)});
 var cxs=[40,48,56,64,72];
 cxs.forEach(function(cx,i){bx(I,(8-2.6)/2,H,.5,W,cx-4+(8-2.6)/4,Y1+H/2,-3,1);bx(I,(8-2.6)/2,H,.5,W,cx+4-(8-2.6)/4,Y1+H/2,-3,1);
  if(i!==2){bx(I,2.6,2.6,.3,0x6b4a2c,cx,Y1+1.3,-3,1)}
  lab(I,i===2?'Your room 203':'Room '+(201+i),cx,Y1+3.1,-2.6,.5)});
 /* your room (203) */
 bx(I,2.2,.7,3.4,0x3a7bd5,53.4,Y1+.35,-9.6,1);bx(I,1.6,.2,.7,0xffffff,53.4,Y1+.8,-10.8);bx(I,2,2.8,1.2,0x7a5230,59,Y1+1.4,-10.8,1);bx(I,2.6,.8,1.2,0xb08050,58.7,Y1+.4,-4.6,1);bx(I,.5,.3,.3,0xd62839,58.7,Y1+.95,-4.6);bx(I,3,1.6,.1,0x9fd8ff,56,Y1+1.9,-11.35);bx(I,3.2,.02,2.4,0x8a3b2a,56,Y1+.03,-7);
 I.up={x:4.2,z:-0.5,r:3};I.zones=[
  {k:'exit',f:0,x:0,z:7.4,r:2.8},
  {k:'up',f:0,x:4,z:-1.2,r:3},
  {k:'down',f:1,x:38,z:0,r:2.6},
  {k:'sleep',f:1,x:55.6,z:-8.6,r:2.1,mine:1},
  {k:'desk',f:1,x:57.2,z:-5.6,r:2.0,mine:1},
  {k:'ward',f:1,x:58.2,z:-9,r:1.9,mine:1}];
 I.spawn={x:0,z:3,f:0};I.upSpawn={x:41.5,z:0};I.downSpawn={x:0,z:2};I.type='hostel';return I}
function buildHall(){ground();var I=newI(3000,300,{x0:2979,x1:3021,z0:284,z1:314});var W=0xece6d6,H=3.8;
 bx(I,36,.3,26,0xd6cfc0,0,-.15,-1);bx(I,36.6,H,.6,W,0,H/2,-14,1);bx(I,.6,H,26.6,W,-18,H/2,-1,1);bx(I,.6,H,26.6,W,18,H/2,-1,1);bx(I,15.8,H,.6,W,-10.2,H/2,12,1);bx(I,15.8,H,.6,W,10.2,H/2,12,1);
 bx(I,12,2.4,.2,0x2b2f3a,0,2.1,-13.6);bx(I,11.2,1.8,.1,0xf6f6f6,0,2.1,-13.48);bx(I,4,1,1.4,0x7a5230,0,.5,-10.4,1);bx(I,4,.04,1.6,0xb3261e,0,.03,11.2);
 [-6,-2,2,6].forEach(function(z){[-9,-14.2,9,14.2].forEach(function(x){bx(I,4.4,.8,1.2,0xb08050,x,.4,z,1)})});
 I.zones=[{k:'hexit',f:0,x:0,z:10.4,r:2.8},{k:'seat',f:0,x:0,z:-0.8,r:3.2}];
 I.people=[];var spots=[[-9,-5],[-14.2,-1],[9,3],[14.2,-5],[-9,7],[14.2,7],[-14.2,3],[9,-1]];
 spots.forEach(function(p,i){var P=C.makePerson(C.randLook(i%2===0));P.g.position.set(p[0],0,p[1]);P.g.rotation.y=Math.PI;I.g.add(P.g);I.people.push(P.g)});
 var lp=C.makePerson({f:false,skin:0x6b4226,top:0x7a4a24,bottom:0x26344f,shoe:0x222222,hair:0xbbbbbb,hairStyle:'short',hijab:0,shorts:false,bag:0x111111});lp.g.position.set(0,0,-12.3);I.g.add(lp.g);I.lec=lp.g;
 I.spawn={x:0,z:7,f:0};I.type='hall';return I}
function getI(t){if(!ITS[t])ITS[t]=(t==='hostel'?buildHostel():buildHall());return ITS[t]}

/* ---------- enter / exit ---------- */
function typeOf(n){if(/Hostel/.test(n))return 'hostel';if(/Lecture|Faculty|Computer Science|Library|Senate|Admin/.test(n))return 'hall';return null}
function classHere(n){for(var i=0;i<CLASSES.length;i++)if(CLASSES[i].place===n&&L.min<CLASSES[i].e&&L.min>=CLASSES[i].s-90)return CLASSES[i];return null}
function enter(b){var t=typeOf(b.name);if(!t){C.toast('Inside view of '+b.name+' is coming soon');return}
 var cls=t==='hall'?classHere(b.name):null;
 if(cls&&L.st[cls.code]!=='attended'&&L.min>=cls.s+15){if(!L.locked[cls.code]){L.locked[cls.code]=1;if(!L.st[cls.code]){L.st[cls.code]='missed';L.missed++}}C.toast('🔒 '+cls.lec+' locked the door. You are late.');showMsg('🔒 Door locked','<b>'+cls.lec+'</b> has locked the door of '+b.name+'.<br>You came after '+hm(cls.s+15)+'. This counts as absent for '+cls.code+'.');return}
 var I=getI(t),me=C.me();L.cur={I:I,b:b,type:t,floor:0,cls:cls};
 C.fade(function(){C.setBoxes(I.boxes);C.setInt(I.int);me.x=I.ox+I.spawn.x;me.z=I.oz+I.spawn.z;me.y=0;me.h=Math.PI;me.sp=0;C.cam(0,.5,5);C.snapCam();C.clearSel();C.hideCard();zoneKey=null;
  if(I.lec)I.lec.visible=!!(cls&&L.min>=cls.s-5);if(I.people)I.people.forEach(function(p){p.visible=!!cls})
  if(t==='hall'){if(I.board)C.scene.remove(I.board);I.board=C.label(cls?(cls.code+' · '+cls.name):'No lecture now',I.ox,3.2,I.oz-13,1.1)}},function(){C.toast('🚪 '+b.name)})}
function leave(){var cur=L.cur;if(!cur)return;var me=C.me(),b=cur.b;
 C.fade(function(){C.setBoxes(window.__outBoxes);C.setInt(null);me.x=b.cx;me.z=b.cz;me.y=0;me.h=0;me.sp=0;C.cam(Math.PI,.42,6.5);L.cur=null;zoneKey=null;C.snapCam();C.hideCard();C.resolve(me,.35)})}
NF.lifeBusy=function(){return !!L.cur};

/* ---------- cards ---------- */
function showMsg(title,html,btns){C.showCard('<div class="nm">'+title+'</div><div class="sub" style="margin-bottom:10px;font-size:13px;opacity:.9">'+html+'</div><div class="row">'+(btns||'<button data-a="L:ok" class="go">OK</button>')+'</div>');zoneKey='msg'}
function bnl(a,t,go){return '<button data-a="L:'+a+'"'+(go?' class="go"':'')+'>'+t+'</button>'}
function zoneCard(z){var cur=L.cur,mineOK=cur.b.name===L.mine;
 if(z.k==='exit'||z.k==='hexit')C.showCard('<div class="nm">🚪 '+cur.b.name+'</div><div class="row">'+bnl('leave','Go outside',1)+'</div>');
 else if(z.k==='up')C.showCard(mineOK?'<div class="nm">⬆ Upstairs</div><div class="sub">Rooms are on the first floor.</div><div class="row">'+bnl('up','Go up',1)+'</div>':'<div class="nm">⬆ Stairs</div><div class="sub">Upstairs is for residents of this hostel only.</div>');
 else if(z.k==='down')C.showCard('<div class="nm">⬇ Downstairs</div><div class="row">'+bnl('down','Go down',1)+'</div>');
 else if(z.k==='sleep'){var can=L.alarm>L.min&&L.alarm-L.min<=720;C.showCard('<div class="nm">🛏 Your bed</div><div class="sub">'+hm(L.min)+' · alarm '+hm(L.alarm)+(can?'':' — set the alarm for a later time first (desk)')+'</div><div class="row">'+(can?bnl('sleep','Sleep until alarm',1):'')+'</div>')}
 else if(z.k==='desk')C.showCard('<div class="nm">⏰ Alarm clock</div><div class="sub">Now '+hm(L.min)+' · alarm set for <b>'+hm(L.alarm)+'</b></div><div class="row">'+bnl('a-30','−30 min')+bnl('a-5','−5')+bnl('a+5','+5')+bnl('a+30','+30 min')+'</div>');
 else if(z.k==='ward')C.showCard('<div class="nm">👕 Wardrobe</div><div class="sub">Your clothes for the day.</div><div class="row">'+bnl('dress','Freshen up (+10 min)',1)+'</div>');
 else if(z.k==='seat'){var c=cur.cls;C.showCard(c?'<div class="nm">🪑 '+c.code+' · '+c.name+'</div><div class="sub">'+c.lec+' · '+hm(c.s)+'–'+hm(c.e)+(L.min<c.s?' · class has not started yet':'')+'</div><div class="row">'+bnl('sit','Take a seat & attend',1)+'</div>':'<div class="nm">🪑 Empty hall</div><div class="sub">No lecture is on here right now.</div>')}
 zoneKey=z.k}
function act(a){
 if(a==='ok'){C.hideCard();zoneKey=null;return}
 if(a==='leave'){leave();return}
 var cur=L.cur,I=cur&&cur.I,me=C.me();
 if(a==='up'){C.fade(function(){me.x=I.ox+I.upSpawn.x;me.z=I.oz+I.upSpawn.z;me.y=4.2;me.h=Math.PI/2;C.snapCam();zoneKey=null;C.hideCard()})}
 else if(a==='down'){C.fade(function(){me.x=I.ox+I.downSpawn.x;me.z=I.oz+I.downSpawn.z;me.y=0;me.h=Math.PI/2;C.snapCam();zoneKey=null;C.hideCard()})}
 else if(a.indexOf('a')===0&&(a[1]==='+'||a[1]==='-')){var d=parseInt(a.slice(1),10);L.setAlarm(L.alarm+d);zoneKey=null}
 else if(a==='dress'){L.min+=10;C.toast('👕 You look fresh. (+10 minutes)');zoneKey=null;C.hideCard()}
 else if(a==='sleep'){C.fade(function(){L.asleep=true;L.min=L.alarm-.2;zoneKey=null;C.hideCard()})}
 else if(a==='wake'){L.asleep=false;C.hideCard();zoneKey=null}
 else if(a==='sit'){var c=cur.cls;if(!c)return;
  C.fade(function(){C.hideCard();zoneKey=null;if(L.min<c.s)L.min=c.s;L.min=c.e;L.st[c.code]='attended';L.attended++;},function(){showMsg('📖 '+c.code+' class is over','You sat through '+c.name+' with '+c.lec+'.<br>Attendance recorded ✅ ('+L.attended+' attended, '+L.missed+' missed today).<br>Time now: '+hm(L.min)+'.')})}
 else if(a==='next'){L.day++;L.min=355;L.alarm=390;L.st={};L.locked={};L.attended=0;L.missed=0;L.fired=false;L.asleep=false;toRoom(true)}
}
NF.lifeAct=act;

/* ---------- per-frame ---------- */
var ob=0;
NF.lifeTick=function(dt){if(!C){if(!NF.core)return;C=NF.core;T=C.T}if(!C.started()||!L.on)return;
 var me=C.me();
 if(!ob)ob=1;
 L.min+=dt*1.5;if(L.min>=1440){L.min-=1440;L.day++;L.st={};L.locked={};L.attended=0;L.missed=0;L.fired=false}
 /* mark missed classes */
 CLASSES.forEach(function(c){if(!L.st[c.code]&&L.min>=c.e){L.st[c.code]='missed';L.missed++;if(C.toast)C.toast('❌ You missed '+c.code)}});
 /* alarm */
 if(!L.fired&&L.min>=L.alarm&&L.min<L.alarm+30){L.fired=true;beep();if(L.asleep){C.showCard('<div class="nm">⏰ ALARM!</div><div class="sub">It is '+hm(L.min)+'. Time to wake up.</div><div class="row">'+bnl('wake','Wake up',1)+'</div>');zoneKey='alarm'}else C.toast('⏰ Alarm: '+hm(L.alarm))}
 /* clock chip */
 var mi=Math.floor(L.min);if(mi!==lastHud){lastHud=mi;if(NF.updMoney)NF.updMoney()}
 if(L.asleep)return;
 /* evening summary */
 if(L.sumDone!==L.day&&L.min>=1080&&L.min<1100&&!L.cur&&zoneKey!=='msg'){L.sumDone=L.day;showMsg('🌙 End of '+DAYS[L.day%7],'Classes attended: <b>'+L.attended+'</b> · missed: <b>'+L.missed+'</b>.<br>Balance: ₦'+C.money().toLocaleString('en-NG')+'.<br>You can keep exploring or go to bed for the next day.',bnl('ok','Keep exploring')+bnl('next','Next day',1))}
 if(L.cur){var I=L.cur.I,fl=(me.y||0)>2?1:0,hit=null;
  I.zones.forEach(function(z){if(hit)return;if(z.f!==fl)return;if(z.mine&&L.cur.b.name!==L.mine)return;if(Math.hypot(me.x-(I.ox+z.x),me.z-(I.oz+z.z))<z.r)hit=z});
  if(zoneKey==='msg'||zoneKey==='alarm')return;
  if(hit){if(zoneKey!==hit.k)zoneCard(hit)}
  else if(zoneKey){C.hideCard();zoneKey=null}
  return}
 /* outside: door cards */
 if(zoneKey==='msg'||zoneKey==='alarm')return;
 if(C.cardBusy()){if(doorCard){doorCard=false}return}
 var best=null,bd=4.4,bs=window.__outBoxes||(window.__outBoxes=C.getBoxes());
 for(var i=0;i<bs.length;i++){var b=bs[i];if(!b.name||b.cx==null)continue;var d=Math.hypot(me.x-b.cx,me.z-(b.cz-3));if(d<bd){bd=d;best=b}}
 if(best&&typeOf(best.name)!==null){if(doorCard!==best.name){doorCard=best.name;L.door=best;C.showCard('<div class="nm">🚪 '+best.name+'</div><div class="sub">'+(typeOf(best.name)==='hostel'?(best.name===L.mine?'Your hostel · tap to go in':'Visitors: lobby only'):'Tap to go in')+'</div><div class="row">'+bnl('enter','Enter',1)+'</div>')}}
 else if(best&&!typeOf(best.name)){}
 else if(doorCard){doorCard=false;L.door=null;C.hideCard()}
};
var act0=act;
NF.lifeAct=function(a){if(a==='enter'){var b=L.door;doorCard=false;if(b)enter(b);return}act0(a)};

/* ---------- start of the demo ---------- */
function toRoom(fade){var bs=window.__outBoxes,b=null;for(var i=0;i<bs.length;i++)if(bs[i].name===L.mine)b=bs[i];if(!b)return;var I=getI('hostel'),me=C.me();
 function put(){L.cur={I:I,b:b,type:'hostel',floor:1,cls:null};C.setBoxes(I.boxes);C.setInt(I.int);me.x=I.ox+57;me.z=I.oz-6.4;me.y=4.2;me.h=Math.PI;me.sp=0;C.cam(0,.5,5);C.snapCam();C.hideCard();zoneKey=null}
 if(fade)C.fade(put,function(){showMsg('☀️ '+DAYS[L.day%7],'New day. It is '+hm(L.min)+' and your alarm is set for '+hm(L.alarm)+'.')});else put()}
L.begin=function(f){C=NF.core;T=C.T;L.on=true;L.mine=f?'Female Hostel E':'Hostel B';window.__outBoxes=C.getBoxes();
 L.min=355;L.alarm=390;L.day=0;L.fired=false;toRoom(false);
 showMsg('📅 Monday, Day 1',"You are in your room in <b>"+L.mine+"</b>. It is 5:55 AM and your alarm is set for 6:30.<br><b>Today:</b> PSY 101 at 8:00 (Lecture Theatre 1), GNS 101 at 12:00, PSY 103 at 4:00.<br>Walk to the bed to sleep, the desk to change the alarm, then leave your room, go downstairs and out. Don't be late: lecturers lock the door.",bnl('ok','Start my day',1))};
})();
