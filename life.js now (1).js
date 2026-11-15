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
function todays(){var d=L.day%7;if(NF.profile&&NF.profile.tt)return NF.profile.tt.filter(function(c){return c.day===d});return d<5?CLASSES:[]}
var L=NF.life={day:0,min:355,alarm:390,asleep:false,fired:false,st:{},attended:0,missed:0,mine:'Hostel B',cur:null,classes:CLASSES,locked:{}};
var ITS={};            // built interiors
var doorCard=false,zoneKey=null,lastHud=-1,ringUntil=0,AC=null;

function hm(m){m=Math.floor(m)%1440;var h=Math.floor(m/60),mm=m%60,ap=h>=12?'PM':'AM';h=h%12;if(h===0)h=12;return h+':'+('0'+mm).slice(-2)+' '+ap}
NF.clockText=function(){return DAYS[L.day%7].slice(0,3)+' '+hm(L.min)};
L.hm=hm;
L.setAlarm=function(m){L.alarm=((m%1440)+1440)%1440;L.fired=false;if(NF.toast)NF.toast('⏰ Alarm set for '+hm(L.alarm))};
L.todays=todays;
L.week=function(){var DN=['Mon','Tue','Wed','Thu','Fri'];return (NF.profile&&NF.profile.tt?NF.profile.tt:[]).map(function(c){return {day:DN[c.day],code:c.code,place:c.place,s:hm(c.s)}})};
L.timetable=function(){return todays().map(function(c){return {code:c.code,name:c.name,place:c.place,s:hm(c.s),e:hm(c.e),lec:c.lec,status:L.st[c.code]||(L.min>=c.e?'missed':(L.min>=c.s?'now':'upcoming'))}})};
function snd(n){try{if(NF.snd)NF.snd.play(n)}catch(e){}}
function beep(){if(NF.snd&&NF.snd.ready){NF.snd.play('alarm');try{navigator.vibrate&&navigator.vibrate([300,150,300,150,300])}catch(e){}return}try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();[0,.35,.7,1.05].forEach(function(t){var o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=1100;o.connect(g);g.connect(AC.destination);var s=AC.currentTime+t;g.gain.setValueAtTime(.12,s);g.gain.exponentialRampToValueAtTime(.001,s+.25);o.start(s);o.stop(s+.28)})}catch(e){}try{navigator.vibrate&&navigator.vibrate([300,150,300,150,300])}catch(e){}}

/* ---------- building interiors ---------- */
function bx(I,w,h,d,col,x,y,z,solid){var m=new T.Mesh(new T.BoxGeometry(w,h,d),C.mat(col));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;I.g.add(m);if(solid)I.boxes.push({x0:I.ox+x-w/2,x1:I.ox+x+w/2,z0:I.oz+z-d/2,z1:I.oz+z+d/2});return m}
function lab(I,txt,x,y,z,s){var l=C.label(txt,I.ox+x,y,I.oz+z,s);I.labels.push(l);return l}
function newI(ox,oz,b){var g=new T.Group();g.position.set(ox,0,oz);C.scene.add(g);return {g:g,ox:ox,oz:oz,boxes:[],zones:[],labels:[],int:b}}
function ground(){if(ITS.ground)return;var m=new T.Mesh(new T.PlaneGeometry(600,1600),C.mat(0x4a4e5a));m.rotation.x=-Math.PI/2;m.position.set(3000,-.6,500);C.scene.add(m);ITS.ground=m}
function buildHostel(){ground();var I=newI(3000,0,{x0:2980,x1:3082,z0:-15,z1:12});var W=0xe9e2d2,H=3.4,Y1=4.2;
 /* ground floor lobby */
 bx(I,32,.3,18,0xcfc3ad,0,-.15,0);bx(I,32.6,H,.6,W,0,H/2,-9,1);bx(I,.6,H,18.6,W,-16,H/2,0,1);bx(I,.6,H,18.6,W,16,H/2,0,1);I.boxes[I.boxes.length-1].f=0;bx(I,13.8,H,.6,W,-9.1,H/2,9,1);bx(I,13.8,H,.6,W,9.1,H/2,9,1);
 bx(I,4,.04,1.6,0xb3261e,0,.03,8.2);bx(I,6,1.1,1.6,0x7a5230,-8,.55,-6,1);bx(I,1.2,.8,4,0x3b6ea5,-13.5,.4,2,1);bx(I,1.2,.8,4,0x3b6ea5,-13.5,.4,-2,1);bx(I,1.2,1.1,1.2,0x2f7d3a,12,.55,6,1);
 for(var i=0;i<10;i++){bx(I,.85,.42*(i+1),5,0x8a7a66,6.5+i*.85,.21*(i+1),-5.5)}I.boxes.push({x0:I.ox+6.5,x1:I.ox+15,z0:I.oz-8.6,z1:I.oz-8.0},{x0:I.ox+6.5,x1:I.ox+15,z0:I.oz-3.0,z1:I.oz-2.4},{x0:I.ox+14.6,x1:I.ox+15.7,z0:I.oz-8.6,z1:I.oz-2.4,f:0},{x0:I.ox+14.4,x1:I.ox+15,z0:I.oz-2.4,z1:I.oz+3.6,f:1});
 bx(I,3,.5,.1,0x1e5fa8,0,3,-8.6);
 /* first floor: corridor + 5 rooms */
 bx(I,40,.3,6.4,0xd8cdb8,56,Y1-.15,0);bx(I,40,.3,8.8,0xe3d9c6,56,Y1-.15,-7.3);
 bx(I,40.6,H,.6,W,56,Y1+H/2,3.3,1);bx(I,.6,H,8.6,W,35.7,Y1+H/2,-7.6,1);
 bx(I,6,.3,11.8,0xd8cdb8,18,Y1-.15,-2.5);bx(I,15,.3,6.6,0xd8cdb8,28.5,Y1-.15,0);bx(I,20.9,H,.6,W,25.25,Y1+H/2,3.5,1);bx(I,14.4,H,.6,W,28.5,Y1+H/2,-3.5,1);bx(I,.6,H,5.2,W,21.3,Y1+H/2,-6,1);bx(I,6.8,H,.6,W,18.2,Y1+H/2,-8.5,1);bx(I,.6,H,16,W,76.3,Y1+H/2,-4.2,1);bx(I,40.6,H,.6,W,56,Y1+H/2,-11.7,1);
 [44,52,60,68].forEach(function(x){bx(I,.5,H,8.8,W,x,Y1+H/2,-7.3,1)});
 var cxs=[40,48,56,64,72];
 cxs.forEach(function(cx,i){bx(I,(8-2.6)/2,H,.5,W,cx-4+(8-2.6)/4,Y1+H/2,-3,1);bx(I,(8-2.6)/2,H,.5,W,cx+4-(8-2.6)/4,Y1+H/2,-3,1);
  if(i!==2){bx(I,2.6,2.6,.3,0x6b4a2c,cx,Y1+1.3,-3,1)}
  lab(I,i===2?'Your room 203':'Room '+(201+i),cx,Y1+3.1,-2.6,.5)});
 /* your room (203) */
 bx(I,2.2,.7,3.4,0x3a7bd5,53.4,Y1+.35,-9.6,1);bx(I,1.6,.2,.7,0xffffff,53.4,Y1+.8,-10.8);bx(I,2,2.8,1.2,0x7a5230,59,Y1+1.4,-10.8,1);bx(I,2.6,.8,1.2,0xb08050,58.7,Y1+.4,-4.6,1);bx(I,.5,.3,.3,0xd62839,58.7,Y1+.95,-4.6);bx(I,3,1.6,.1,0x9fd8ff,56,Y1+1.9,-11.35);bx(I,3.2,.02,2.4,0x8a3b2a,56,Y1+.03,-7);
 I.up={x:4.2,z:-0.5,r:3};I.zones=[
  {k:'exit',f:0,x:0,z:7.4,r:2.8},
  {k:'sleep',f:1,x:55.6,z:-8.6,r:2.1,mine:1},
  {k:'desk',f:1,x:57.2,z:-5.6,r:2.0,mine:1},
  {k:'ward',f:1,x:58.2,z:-9,r:1.9,mine:1}];
 lab(I,'🚪 Exit door',0,3.0,8.2,.55);lab(I,'⬆ Stairs up to rooms →',5,2.8,-5.5,.5);lab(I,'⬇ Stairs down',17.5,Y1+2.6,-5.5,.5);lab(I,'🛏 Your bed',55.6,Y1+2.2,-8.6,.4);lab(I,'⏰ Alarm desk',57.2,Y1+2.4,-5.6,.4);lab(I,'👕 Wardrobe',58.2,Y1+3.1,-9,.4);
 addScenes(I,[['gist',-9,1,3],['drink',-9,5.2,3],['gang',9,5.2,3]],'hostel');
 I.fslots=[{x:-3,z:0},{x:3,z:2},{x:-5,z:-3}];I.spawn={x:0,z:3,f:0};I.upSpawn={x:41.5,z:0};I.downSpawn={x:0,z:2};I.type='hostel';return I}
function buildHall(){ground();var I=newI(3000,300,{x0:2979,x1:3021,z0:284,z1:314});var W=0xece6d6,H=3.8;
 bx(I,36,.3,26,0xd6cfc0,0,-.15,-1);bx(I,36.6,H,.6,W,0,H/2,-14,1);bx(I,.6,H,26.6,W,-18,H/2,-1,1);bx(I,.6,H,26.6,W,18,H/2,-1,1);bx(I,15.8,H,.6,W,-10.2,H/2,12,1);bx(I,15.8,H,.6,W,10.2,H/2,12,1);
 bx(I,12,2.4,.2,0x2b2f3a,0,2.1,-13.6);bx(I,11.2,1.8,.1,0xf6f6f6,0,2.1,-13.48);bx(I,4,1,1.4,0x7a5230,0,.5,-10.4,1);bx(I,4,.04,1.6,0xb3261e,0,.03,11.2);
 function chair(x,z){bx(I,.8,.08,.8,0x2f6fb5,x,.45,z);bx(I,.8,.7,.08,0x2f6fb5,x,.86,z+.4);[[-.34,-.34],[.34,-.34],[-.34,.34],[.34,.34]].forEach(function(p){bx(I,.06,.42,.06,0x555b66,x+p[0],.21,z+p[1])});I.boxes.push({x0:I.ox+x-.4,x1:I.ox+x+.4,z0:I.oz+z-.4,z1:I.oz+z+.4})}
 var CH=[];[-6,-2,2,6].forEach(function(z){[-9,-14.2,9,14.2].forEach(function(x){bx(I,4.4,.8,1.2,0xb08050,x,.4,z,1);[-1.1,1.1].forEach(function(dx){CH.push({x:x+dx,z:z+1.3});chair(x+dx,z+1.3)})})});
 var ord=CH.map(function(c,i){return i}).sort(function(){return Math.random()-.5}),occ={};ord.slice(0,11).forEach(function(i){occ[i]=1});
 lab(I,'🚪 Exit door',0,3.3,11.2,.55);
 I.zones=[{k:'hexit',f:0,x:0,z:10.4,r:2.8}];I.chairs=[];
 CH.forEach(function(c,i){if(!occ[i]){var z={k:'seat',f:0,x:c.x,z:c.z,r:1.25};I.zones.push(z);I.chairs.push(z)}});
 I.people=[];
 CH.forEach(function(c,i){if(!occ[i])return;var P=C.makePerson(C.randLook(i%2===0));P.g.position.set(c.x,0,c.z+.05);P.g.rotation.y=Math.PI;C.seatPose(P);I.g.add(P.g);I.people.push(P.g)});
 var lp=C.makePerson({f:false,skin:0x6b4226,top:0x7a4a24,bottom:0x26344f,shoe:0x222222,hair:0xbbbbbb,hairStyle:'short',hijab:0,shorts:false,bag:0x111111});lp.g.position.set(0,0,-12.3);I.g.add(lp.g);I.lec=lp.g;
 I.spawn={x:0,z:7,f:0};I.type='hall';return I}

/* ---------- venues: every other building (cafeteria, library, mosque, chapel, clinic, bank, offices, bookshop, terminal) ---------- */
var VD={
 cafe:{col:[0xf0e2c0,0xc89a5a],label:'Cafeteria',slots:[['eat',-8,-2,3],['drink',8,-2,3],['gist',-8,5,3],['gang',8,5,3],['hustle',0,-6.6,1,'cafe'],['newfriend',0,3,1]]},
 library:{col:[0xe3dccb,0x7a5a3a],label:'Library',slots:[['study',-7,0,3],['study',7,0,3],['gist',0,6,2],['hustle',0,-6.6,1,'tutor'],['newfriend',-11,5,1]]},
 mosque:{col:[0xf4efe4,0x2f7d5a],label:'Prayer hall',slots:[['pray',-6,-2,3],['pray',6,-2,3],['pray',0,4,3],['advice',0,-7.6,1,'imam']]},
 church:{col:[0xeee8dc,0x7a5a3a],label:'Sanctuary',slots:[['pray',-6,0,3],['pray',6,0,3],['advice',0,-7.6,1,'pastor']]},
 clinic:{col:[0xeaf4f4,0x7ab8c8],label:'Clinic',slots:[['nurse',0,-6.2,1],['sick',-8,0,1],['newfriend',8,3,1]]},
 bank:{col:[0xe8edf5,0x3b5ea5],label:'Bank',slots:[['info',0,-6.6,1,'teller'],['gist',-6,3,3],['newfriend',8,3,1]]},
 office:{col:[0xe9e6df,0x8a7a66],label:'Office',slots:[['info',0,-6.6,1,'clerk'],['gist',-7,3,3],['gang',8,4,3]]},
 shop:{col:[0xf7e8e8,0xc97a7a],label:'Bookshop',slots:[['hustle',0,-6.6,1,'print'],['study',-8,2,2],['newfriend',8,3,1]]},
 terminal:{col:[0xe5e8ee,0x4a5a7a],label:'Terminal',slots:[['info',0,-6.6,1,'agent'],['hustle',-8,2,1,'bags'],['newfriend',8,3,1]]}};
var KL={eat:'🍛 Eating',drink:'🍺 Drinking',gist:'🗣 Gist',gang:'😈 The boys',study:'📚 Study group',pray:'🕌 Prayer',advice:'🙂 Advice',nurse:'🩺 Nurse',sick:'🤒 Unwell student',info:'ℹ Desk',hustle:'💼 Hustle',newfriend:'👋 New face'};
var KLC={pray:'🙏 Prayer'};
function person(I,x,z,fx,fz,kind){var f=Math.random()<.5,P=C.makePerson(C.randLook(f));P.g.position.set(x,0,z);P.g.rotation.y=Math.atan2(fx-x,fz-z);I.g.add(P.g);if(kind==='gang'&&NF.street&&NF.street.gear){NF.street.dress(P);NF.street.gear(P,'stick')}I.boxes.push({x0:I.ox+x-.3,x1:I.ox+x+.3,z0:I.oz+z-.3,z1:I.oz+z+.3});if(C.seatPose&&(kind==='study'||kind==='eat'||kind==='drink')){C.seatPose(P);bx(I,.5,.45,.5,0x2f6fb5,x,.225,z)}return P}
function addScenes(I,slots,cat){I.zones=I.zones||[];slots.forEach(function(sl,i){var k=sl[0],x=sl[1],z=sl[2],n=sl[3],g=sl[4],id='s'+i;
  for(var j=0;j<n;j++){var a=j/n*6.28+.5,r=n>1?1.1:0,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;person(I,px,pz,x,z,k)}
  var nm=(KLC[k]&&cat==='church')?'🙏 Prayer':(KL[k]||k);if(k==='advice')nm=g==='imam'?'🕌 The Imam':'⛪ The Pastor';if(k==='info')nm='ℹ '+({teller:'Bank teller',clerk:'Clerk',agent:'Check-in agent'}[g]||'Desk');if(k==='hustle')nm='💼 '+({cafe:'Serve food',tutor:'Tutor juniors',print:'Printing desk',bags:'Carry bags'}[g]||'Hustle');
  lab(I,nm,x,2.6,z,.42);I.zones.push({k:'scene',id:id,f:0,x:x,z:z,r:2.7,sc:{kind:k,g:g,cat:cat,seed:Math.random()}})})}
function buildVenue(cat){ground();var d=VD[cat],idx=VK.indexOf(cat),oz=600+idx*60;var I=newI(3000,oz,{x0:2984,x1:3016,z0:oz-13,z1:oz+13}),W=d.col[0],H=3.6,F=d.col[1];
 bx(I,30,.3,22,F,0,-.15,0);bx(I,30.6,H,.6,W,0,H/2,-11,1);bx(I,.6,H,22.6,W,-15,H/2,0,1);bx(I,.6,H,22.6,W,15,H/2,0,1);bx(I,12.4,H,.6,W,-8.8,H/2,11,1);bx(I,12.4,H,.6,W,8.8,H/2,11,1);bx(I,4,.04,1.6,0xb3261e,0,.03,10.2);
 lab(I,'🚪 Exit door',0,3.0,10.2,.55);
 if(cat==='cafe'){bx(I,12,1.1,1.4,0x7a5230,0,.55,-9.2,1);[[-8,-3],[8,-3],[-8,4],[8,4]].forEach(function(p){bx(I,3,.9,2,0xb08050,p[0],.45,p[1],1)})}
 if(cat==='library'){for(var i=-12;i<=12;i+=6)bx(I,4.6,3,.8,0x6b4a2c,i,1.5,-10.3,1);[[-7,-2],[7,-2],[0,3.6]].forEach(function(p){bx(I,4,.8,1.6,0xb08050,p[0],.4,p[1],1)})}
 if(cat==='mosque'){bx(I,22,.04,16,0x1f6f4a,0,.03,-1);bx(I,5,3,.8,0xf2ede0,0,1.5,-10.3,1);bx(I,3,2.2,.2,0x2f7d5a,0,1.6,-9.8);lab(I,'Mihrab',0,3.2,-9.6,.4)}
 if(cat==='church'){[-8,-4,4,8].forEach(function(x){[-4,0,4].forEach(function(z){bx(I,2.6,.7,1,0x7a5a3a,x,.35,z+1.6,1)})});bx(I,6,.6,2,0x8a6a4a,0,.3,-9,1);bx(I,.4,2.6,.1,0xd4af37,0,2.2,-10.6)}
 if(cat==='clinic'){[-8,-2.5].forEach(function(x){bx(I,1.4,.7,3,0xffffff,x-4,.35,-6,1)});bx(I,4,1,1.2,0x7a5230,0,.5,-8.6,1)}
 if(cat==='bank'){bx(I,16,1.1,1.2,0x3b5ea5,0,.55,-8.8,1);bx(I,1.4,2.2,1,0x222a44,12,1.1,-9.4,1);lab(I,'ATM',12,3,-9.4,.35)}
 if(cat==='office'){[-9,0,9].forEach(function(x){bx(I,3,.8,1.4,0x8a6a4a,x,.4,-8.4,1)});bx(I,2.6,1.8,1,0x666d78,-13,.9,-5,1)}
 if(cat==='shop'){for(var j=-12;j<=12;j+=6)bx(I,4.6,2.6,.8,0xc9a06a,j,1.3,-10.3,1);bx(I,8,1.1,1.4,0x7a5230,0,.55,-8.6,1)}
 if(cat==='terminal'){[-8,0,8].forEach(function(x){bx(I,5,.6,1.2,0x4a5a7a,x,.3,4.5,1)});bx(I,12,1.1,1.4,0x3b5ea5,0,.55,-8.8,1)}
 I.zones=[{k:'vexit',f:0,x:0,z:8.4,r:2.8}];addScenes(I,d.slots,cat);
 I.fslots=[{x:-3.5,z:1},{x:3.5,z:1},{x:0,z:-1.5}];I.spawn={x:0,z:8};I.type='venue';I.cat=cat;return I}
function getI(t,name){var key=t==='venue'?'v:'+VEN[name]:t;if(!ITS[key])ITS[key]=(t==='hostel'?buildHostel():t==='hall'?buildHall():buildVenue(VEN[name]));return ITS[key]}

/* ---------- enter / exit ---------- */
var VEN={'Main Library':'library','Senate Building':'office','Admin Block':'office','Central Mosque':'mosque','Chapel':'church','Cafeteria':'cafe','Bookshop':'shop','Medical Centre':'clinic','Campus Bank':'bank','Airport Terminal':'terminal'};
var VK=['cafe','library','mosque','church','clinic','bank','office','shop','terminal'];
function typeOf(n){if(/Hostel/.test(n))return 'hostel';if(/Lecture|Faculty|Computer Science/.test(n))return 'hall';return VEN[n]?'venue':null}
function classHere(n){var T2=todays();for(var i=0;i<T2.length;i++)if(T2[i].place===n&&L.min<T2[i].e&&L.min>=T2[i].s-90)return T2[i];return null}
function enter(b){var t=typeOf(b.name);if(!t){C.toast('Inside view of '+b.name+' is coming soon');return}
 var cls=t==='hall'?classHere(b.name):null;
 if(cls&&L.st[cls.code]!=='attended'&&L.min>=cls.s+15){if(!L.locked[cls.code]){L.locked[cls.code]=1;if(!L.st[cls.code]){L.st[cls.code]='missed';L.missed++}}C.toast('🔒 '+cls.lec+' locked the door. You are late.');showMsg('🔒 Door locked','<b>'+cls.lec+'</b> has locked the door of '+b.name+'.<br>You came after '+hm(cls.s+15)+'. This counts as absent for '+cls.code+'.');return}
 var I=getI(t,b.name),me=C.me();L.cur={I:I,b:b,type:t,floor:0,cls:cls};
 snd('door');C.fade(function(){C.setBoxes(I.boxes);C.setInt(I.int);me.x=I.ox+I.spawn.x;me.z=I.oz+I.spawn.z;me.y=0;me.h=Math.PI;me.sp=0;C.cam(0,.5,5);C.snapCam();C.clearSel();C.hideCard();zoneKey=null;
  if(I.lec)I.lec.visible=!!(cls&&L.min>=cls.s-5);if(I.people)I.people.forEach(function(p){p.visible=!!cls})
  if(t==='hall'){if(I.board)C.scene.remove(I.board);I.board=C.label(cls?(cls.code+' · '+cls.name):'No lecture now',I.ox,3.2,I.oz-13,1.1)}
  if(NF.street&&NF.street.onEnter)NF.street.onEnter(I,b,t)},function(){C.toast('🚪 '+b.name)})}
function leave(){var cur=L.cur;if(!cur)return;var me=C.me(),b=cur.b;snd('door');
 if(NF.street&&NF.street.onLeave)NF.street.onLeave(cur.I);C.fade(function(){me.seated=false;L.sitting=null;C.setBoxes(window.__outBoxes);C.setInt(null);me.x=b.cx;me.z=b.cz;me.y=0;me.h=0;me.sp=0;C.cam(Math.PI,.42,6.5);L.cur=null;zoneKey=null;C.snapCam();C.hideCard();C.resolve(me,.35)})}
NF.lifeBusy=function(){return !!L.cur||!!(NF.street&&NF.street.jail)};

/* ---------- cards ---------- */
function showMsg(title,html,btns){C.showCard('<div class="nm">'+title+'</div><div class="sub" style="margin-bottom:10px;font-size:13px;opacity:.9">'+html+'</div><div class="row">'+(btns||'<button data-a="L:ok" class="go">OK</button>')+'</div>',true);zoneKey='msg'}
function bnl(a,t,go){return '<button data-a="L:'+a+'"'+(go?' class="go"':'')+'>'+t+'</button>'}
function zoneCard(z){var cur=L.cur,mineOK=cur.b.name===L.mine;
 if(z.k==='vexit')C.showCard('<div class="nm">🚪 '+cur.b.name+'</div><div class="row">'+bnl('leave','Go outside',1)+'</div>');
 else if(z.k==='scene'){var sh=NF.street&&NF.street.sceneCard?NF.street.sceneCard(z):null;if(sh)C.showCard(sh,true);else{zoneKey=null;return}}
 else if(z.k==='friend'){var fh=NF.street&&NF.street.friendCard?NF.street.friendCard(z):null;if(fh)C.showCard(fh,true);else{zoneKey=null;return}}
 else if(z.k==='exit'||z.k==='hexit')C.showCard('<div class="nm">🚪 '+cur.b.name+'</div><div class="row">'+bnl('leave','Go outside',1)+'</div>');
 else if(z.k==='up')C.showCard(mineOK?'<div class="nm">⬆ Upstairs</div><div class="sub">Rooms are on the first floor.</div><div class="row">'+bnl('up','Go up',1)+'</div>':'<div class="nm">⬆ Stairs</div><div class="sub">Upstairs is for residents of this hostel only.</div>');
 else if(z.k==='down')C.showCard('<div class="nm">⬇ Downstairs</div><div class="row">'+bnl('down','Go down',1)+'</div>');
 else if(z.k==='sleep'){var can=L.alarm>L.min&&L.alarm-L.min<=720;C.showCard('<div class="nm">🛏 Your bed</div><div class="sub">'+hm(L.min)+' · alarm '+hm(L.alarm)+(can?'':' — set the alarm for a later time first (desk)')+'</div><div class="row">'+(can?bnl('sleep','Sleep until alarm',1):'')+'</div>')}
 else if(z.k==='desk')C.showCard('<div class="nm">⏰ Alarm clock</div><div class="sub">Now '+hm(L.min)+' · alarm set for <b>'+hm(L.alarm)+'</b></div><div class="row">'+bnl('a-30','−30 min')+bnl('a-5','−5')+bnl('a+5','+5')+bnl('a+30','+30 min')+'</div>');
 else if(z.k==='ward')C.showCard('<div class="nm">👕 Wardrobe</div><div class="sub">Your clothes for the day.</div><div class="row">'+bnl('dress','Freshen up (+10 min)',1)+'</div>');
 else if(z.k==='seat'){var c=cur.cls;L.hitZ=z;C.showCard(c?'<div class="nm">🪑 Free seat</div><div class="sub">'+c.code+' · '+c.name+'<br>'+c.lec+' · '+hm(c.s)+'–'+hm(c.e)+(L.min<c.s?' · class has not started yet':'')+'</div><div class="row">'+bnl('sit','Sit down',1)+'</div>':'<div class="nm">🪑 Free seat</div><div class="sub">No lecture is on here right now.</div>',true)}
 zoneKey=z.k+(z.id||'')}
function act(a){
 if(a.indexOf('sc:')===0){if(NF.street&&NF.street.sceneAct)NF.street.sceneAct(L.hitZ,a.slice(3));return}
 if(a==='ok'){C.hideCard();zoneKey=null;return}
 if(a==='leave'){leave();return}
 var cur=L.cur,I=cur&&cur.I,me=C.me();
 if(a==='up'){snd('stairs');C.fade(function(){me.x=I.ox+I.upSpawn.x;me.z=I.oz+I.upSpawn.z;me.y=4.2;me.h=Math.PI/2;C.snapCam();zoneKey=null;C.hideCard()})}
 else if(a==='down'){snd('stairs');C.fade(function(){me.x=I.ox+I.downSpawn.x;me.z=I.oz+I.downSpawn.z;me.y=0;me.h=Math.PI/2;C.snapCam();zoneKey=null;C.hideCard()})}
 else if(a.indexOf('a')===0&&(a[1]==='+'||a[1]==='-')){var d=parseInt(a.slice(1),10);L.setAlarm(L.alarm+d);zoneKey=null}
 else if(a==='dress'){L.min+=10;C.toast('👕 You look fresh. (+10 minutes)');zoneKey=null;C.hideCard()}
 else if(a==='sleep'){C.fade(function(){L.asleep=true;L.min=L.alarm-.2;zoneKey=null;C.hideCard()})}
 else if(a==='wake'){L.asleep=false;C.hideCard();zoneKey=null}
 else if(a==='sit'){var c=cur.cls,z=L.hitZ;if(!c||!z||z.k!=='seat')return;
  if(L.min>=c.s+15){C.hideCard();zoneKey=null;if(!L.st[c.code]){L.st[c.code]='missed';L.missed++}L.locked[c.code]=1;showMsg('⏰ Too late','It is past '+hm(c.s+15)+'. '+c.lec+' has marked you absent for '+c.code+'.');snd('bad');return}
  snd('sit');C.fade(function(){me.x=I.ox+z.x;me.z=I.oz+z.z+.05;me.h=Math.PI;me.seated=true;me.sp=0;me.air=false;me.jy=0;C.cam(0,.4,3.3);C.snapCam();C.hideCard();zoneKey='sitting';L.sitting={c:c,s0:L.min,at:z}},null)}
 else if(a==='stand'){me.seated=false;L.sitting=null;var zz=L.hitZ;if(zz){me.x=I.ox+(zz.x<0?-5.5:5.5);me.z=I.oz+zz.z}C.cam(0,.5,5);C.snapCam();C.hideCard();zoneKey=null}
 else if(a==='seatgo'){if(!I.chairs||!I.chairs.length)return;var bz=null,bd=1e9;I.chairs.forEach(function(q){var d=Math.hypot(me.x-(I.ox+q.x),me.z-(I.oz+q.z));if(d<bd){bd=d;bz=q}});if(!bz)return;
  C.fade(function(){me.x=I.ox+bz.x;me.z=I.oz+bz.z+1.0;me.h=Math.PI;C.snapCam();C.hideCard();zoneKey=null},null)}
 else if(a==='next'){L.day++;L.min=355;L.alarm=390;L.st={};L.locked={};L.attended=0;L.missed=0;L.fired=false;L.asleep=false;toRoom(true)}
}
NF.lifeAct=act;

/* ---------- objective arrow ---------- */
var objEl=null;
function objective(){if(!objEl){objEl=document.createElement('div');objEl.id='obj';objEl.className='chip';document.body.appendChild(objEl)}
 var me=C.me(),td=todays(),nx=null;for(var i=0;i<td.length;i++)if(L.min<td[i].e&&L.st[td[i].code]!=='attended'&&!L.locked[td[i].code]){nx=td[i];break}
 var txt='';
 if(L.cur){txt=L.cur.type==='venue'?'🎯 Talk to people, or walk to the Exit door (or tap here → Go)':L.cur.type==='hostel'&&L.cur.b.name===L.mine?((me.y||0)>2?'🎯 Walk west along the corridor, then down the stairs':'🎯 Walk to the Exit door, or tap here → Go'):'🎯 Walk to the door and tap Go outside';if(L.cur.type==='hall')txt=L.sitting?'📖 Lecture in progress…':(nx&&nx.place===L.cur.b.name?'🎯 Walk to a free chair and tap Sit down (or tap here → Go)':'🎯 Walk to the south door to leave (or tap here → Go)')}
 else if(nx){var pl=null;for(var k=0;k<C.places.length;k++)if(C.places[k].name===nx.place)pl=C.places[k];
  if(pl){var dx=pl.x-me.x,dz=pl.z-me.z,d=Math.round(Math.hypot(dx,dz)),rel=Math.atan2(dx,dz)-(C.yaw()+Math.PI);txt='<span style="display:inline-block;transform:rotate('+(-rel)+'rad);font-size:16px;margin-right:4px">⬆️</span> '+nx.code+' · '+nx.place+' · '+d+' m · '+hm(nx.s)}}
 else txt='✅ No more classes right now';
 if(!objEl.onclick){objEl.onclick=function(){if(NF.goMenu)NF.goMenu()}}
 if(objEl.dataset.t!==txt){objEl.dataset.t=txt;objEl.innerHTML=txt}}
L.forceOutside=function(){if(!L.cur)return;var me=C.me();me.seated=false;L.sitting=null;C.setBoxes(window.__outBoxes);C.setInt(null);me.y=0;L.cur=null;zoneKey=null;C.cam(Math.PI,.42,6.5)};


/* ---------- GO MENU: tap where you want to go (no joystick needed) ---------- */
var gm=null;
function gmake(){if(gm)return;gm=document.createElement('div');gm.id='gomenu';gm.innerHTML='<div class="pn"></div>';document.body.appendChild(gm);
 gm.addEventListener('click',function(e){if(e.target===gm){closeGo();return}var t=e.target.closest?e.target.closest('[data-g]'):null;if(t)gmDo(t.getAttribute('data-g'))})}
NF.menuOpen=function(){return !!(gm&&gm.style.display==='flex')};
function closeGo(){if(gm)gm.style.display='none'}
function gb(g,txt,sm,hot){return '<button class="gb'+(hot?' hot':'')+'" data-g="'+g+'"><span>'+txt+'</span>'+(sm?'<small>'+sm+'</small>':'')+'</button>'}
function destOf(pl){if(pl.go)return pl.go;if(pl.name==='Campus Park')return {x:pl.x,z:pl.z+16};if(pl.name==='Campus Market')return {x:pl.x,z:pl.z};
 var bs=window.__outBoxes||C.getBoxes();for(var i=0;i<bs.length;i++)if(bs[i].name===pl.name&&bs[i].cx!=null)return {x:bs[i].cx,z:bs[i].cz};return {x:pl.x,z:pl.z+pl.d/2+3}}
function nextCls(){var td=todays();for(var i=0;i<td.length;i++)if(L.min<td[i].e&&L.st[td[i].code]!=='attended'&&!L.locked[td[i].code])return td[i];return null}
function renderGo(){var me=C.me(),h='<button class="gx" data-g="x">✕ Close</button><h3>📍 Where to?</h3>';
 if(C.travelling()){h+='<div class="note">You are travelling right now. Get off (or wait to arrive) first.</div>'}
 else if(L.asleep){h+='<div class="note">You are asleep. 😴</div>'}
 else if(L.sitting){h+='<div class="note">You are in class. It ends at '+hm(L.sitting.c.e)+'.</div>'}
 else if(L.cur){var cur=L.cur,fl=(me.y||0)>2?1:0,mine=cur.b.name===L.mine;h+='<div class="note">You are inside <b>'+cur.b.name+'</b>'+(cur.type==='hostel'?(fl?' (first floor)':' (ground floor)'):'')+'.</div>';
  if(cur.type==='hostel'){
   if(!fl){h+=gb('a:leave','🚪 Go outside','',1);if(mine)h+=gb('a:up','⬆ Skip the stairs (quick)')}
   else{h+=gb('a:down','⬇ Skip the stairs (quick)','',1);
    if(mine){var can=L.alarm>L.min&&L.alarm-L.min<=720;h+='<div class="sec">In your room</div>';
     h+=can?gb('a:sleep','🛏 Sleep until alarm',hm(L.alarm)):'<div class="note">🛏 To sleep, set the alarm to a later time first.</div>';
     h+='<div class="note">⏰ Alarm: <b>'+hm(L.alarm)+'</b></div><div class="gr"><button data-g="al:a-30">−30</button><button data-g="al:a-5">−5</button><button data-g="al:a+5">+5</button><button data-g="al:a+30">+30</button></div>';
     h+=gb('a:dress','👕 Freshen up','+10 min')}}}
  else{var cl=cur.cls;if(cl&&I_has(cur))h+=gb('a:seatgo','🪑 Go to a free seat',cl.code,1);h+=gb('a:leave','🚪 Go outside','',!cl)}}
 else{var nx=nextCls(),list=C.places.map(function(p){return {p:p,d:Math.round(Math.hypot(me.x-p.x,me.z-p.z))}}).sort(function(a,b){return a.d-b.d});
  if(nx)h+=gb('p:'+nx.place,'🎯 My next class: '+nx.code,nx.place+' · '+hm(nx.s),1);
  h+=gb('p:'+L.mine,'🏠 My hostel',L.mine);h+=gb('p:Main Gate','🚪 Main Gate','to the airport');
  h+='<div class="sec">All places · nearest first</div>';
  list.forEach(function(o){if(o.p.name===L.mine||o.p.name==='Main Gate')return;h+=gb('p:'+o.p.name,o.p.name,o.d+' m · ~'+Math.max(1,Math.round(o.d*.4))+' min')});
  h+='<div class="note">Tapping a place walks you there. It uses game time (the minutes shown).</div>'}
 gm.firstChild.innerHTML=h}
function I_has(cur){return cur.I&&cur.I.chairs&&cur.I.chairs.length}
function openGo(){if(!C){if(!NF.core)return;C=NF.core;T=C.T}if(!C.started())return;gmake();renderGo();gm.style.display='flex'}
function gmDo(g){if(g==='x'){closeGo();return}
 if(g.indexOf('al:')===0){act(g.slice(3));renderGo();return}
 if(g.indexOf('a:')===0){var a=g.slice(2);if(a==='dress'){act('dress');renderGo();return}closeGo();NF.lifeAct(a);return}
 if(g.indexOf('p:')===0){goPlace(g.slice(2))}}
function goPlace(name){var me=C.me(),pl=null;for(var i=0;i<C.places.length;i++)if(C.places[i].name===name)pl=C.places[i];if(!pl||L.cur||(NF.street&&NF.street.jail))return;
 var d=destOf(pl),dist=Math.hypot(me.x-d.x,me.z-d.z),mins=Math.max(1,Math.round(dist*.4));closeGo();C.clearSel();
 snd('whoosh');C.fade(function(){me.x=d.x;me.z=d.z;me.y=0;me.jy=0;me.air=false;me.sp=0;C.cam(Math.PI,.42,6.5);C.snapCam();C.resolve(me,.35);C.hideCard();doorCard=false;zoneKey=null;L.min+=mins},function(){C.toast('🚶 You walked to '+name+' (about '+mins+' min)')})}
NF.goMenu=openGo;NF.goTo=goPlace;NF.destOf=function(name){var pl=null;for(var i=0;i<C.places.length;i++)if(C.places[i].name===name)pl=C.places[i];return pl?destOf(pl):null};NF.typeOfPlace=function(n){return typeOf(n)};
(function(){var b=document.getElementById('bgo');if(b)b.addEventListener('click',openGo)})();

/* ---------- per-frame ---------- */
var ob=0,sitT=0;
NF.lifeTick=function(dt){if(!C){if(!NF.core)return;C=NF.core;T=C.T}if(!C.started()||!L.on)return;
 var me=C.me();
 var pm=L.min;L.min+=dt*(L.sitting?12.5:1.5);if(L.min>=1440){L.min-=1440;L.day++;L.st={};L.locked={};L.attended=0;L.missed=0;L.fired=false;pm=0}
 if(!L.sitting)todays().forEach(function(c){if((pm<c.s&&L.min>=c.s)||(pm<c.e&&L.min>=c.e))snd('bell')});
 /* sitting in a lecture: time runs fast until the class ends */
 if(L.sitting){var sc=L.sitting.c;sitT+=dt;
  if(L.min>=sc.e){L.min=sc.e;L.st[sc.code]='attended';L.attended++;var q=L.sitting;L.sitting=null;me.seated=false;
   var zz=q.at;me.x=L.cur.I.ox+(zz.x<0?-5.5:5.5);me.z=L.cur.I.oz+zz.z;C.cam(0,.5,5);C.snapCam();snd('bell');setTimeout(function(){snd('good')},900);
   showMsg('📖 '+sc.code+' class is over','You sat through <b>'+sc.name+'</b> with '+sc.lec+'.<br>Attendance recorded ✅ ('+L.attended+' attended, '+L.missed+' missed today).<br>Time now: '+hm(L.min)+'.')}
  else if(sitT>.3){sitT=0;var pr=Math.max(0,Math.min(100,(L.min-L.sitting.s0)/Math.max(1,sc.e-L.sitting.s0)*100));
   C.showCard('<div class="nm">📖 '+sc.code+' · lecture in progress</div><div class="sub">'+sc.name+' · '+sc.lec+'<br>Now '+hm(L.min)+' · ends '+hm(sc.e)+'</div><div style="height:9px;background:#fff3;border-radius:6px;overflow:hidden"><div style="width:'+pr+'%;height:100%;background:var(--gold)"></div></div>',true);zoneKey='sitting'}}
 /* mark missed classes */
 todays().forEach(function(c){if(!L.st[c.code]&&L.min>=c.e&&!(L.sitting&&L.sitting.c===c)){L.st[c.code]='missed';L.missed++;if(C.toast)C.toast('❌ You missed '+c.code);snd('bad')}});
 /* alarm */
 if(!L.fired&&L.min>=L.alarm&&L.min<L.alarm+30){L.fired=true;beep();if(L.asleep){C.showCard('<div class="nm">⏰ ALARM!</div><div class="sub">It is '+hm(L.min)+'. Time to wake up.</div><div class="row">'+bnl('wake','Wake up',1)+'</div>',true);zoneKey='alarm'}else C.toast('⏰ Alarm: '+hm(L.alarm))}
 ob+=dt;if(ob>.25){ob=0;try{objective()}catch(e){}}
 /* clock chip */
 var mi=Math.floor(L.min);if(mi!==lastHud){lastHud=mi;if(NF.updMoney)NF.updMoney()}
 if(L.asleep)return;
 /* evening summary */
 if(L.sumDone!==L.day&&L.min>=1080&&L.min<1100&&!L.cur&&zoneKey!=='msg'){L.sumDone=L.day;showMsg('🌙 End of '+DAYS[L.day%7],'Classes attended: <b>'+L.attended+'</b> · missed: <b>'+L.missed+'</b>.<br>Balance: ₦'+NF.getMoney().toLocaleString('en-NG')+'.<br>You can keep exploring or go to bed for the next day.',bnl('ok','Keep exploring')+bnl('next','Next day',1))}
 if(L.sitting)return;
 if(L.cur&&L.cur.type==='hostel'){var I0=L.cur.I,rx=me.x-I0.ox,rz=me.z-I0.oz;
  if(L.cur.b.name!==L.mine&&rx>=6.6&&rx<=15&&rz>-8&&rz<-3){me.x=I0.ox+6.3;C.toast('Upstairs is for residents of this hostel only')}
  if(rx>=6.5&&rx<=15&&rz>-8&&rz<-3){me.y=Math.max(0,Math.min(4.2,(rx-6.5)*.494));if(me.y>.1&&me.y<4.1&&!L._st){L._st=1}}
  else if(me.y>0&&me.y<4.2)me.y=me.y>2.1?4.2:0}
 if(L.cur){var I=L.cur.I,fl=(me.y||0)>2?1:0,hit=null;
  I.zones.concat(I.dyn||[]).forEach(function(z){if(hit)return;if(z.f!==fl)return;if(z.mine&&L.cur.b.name!==L.mine)return;if(Math.hypot(me.x-(I.ox+z.x),me.z-(I.oz+z.z))<z.r)hit=z});
  if(hit)L.hitZ=hit;
  if(zoneKey==='msg'||zoneKey==='alarm')return;
  if(hit){var hk=hit.k+(hit.id||'');if(zoneKey!==hk)zoneCard(hit)}
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
L.enter=enter;L.leave=leave;NF.lifeAct=function(a){if(a==='enter'){var b=L.door;doorCard=false;if(b)enter(b);return}act0(a)};

/* ---------- start of the demo ---------- */
function toRoom(fade){var bs=window.__outBoxes,b=null;for(var i=0;i<bs.length;i++)if(bs[i].name===L.mine)b=bs[i];if(!b)return;var I=getI('hostel'),me=C.me();
 function put(){L.cur={I:I,b:b,type:'hostel',floor:1,cls:null};C.setBoxes(I.boxes);C.setInt(I.int);me.x=I.ox+57;me.z=I.oz-6.4;me.y=4.2;me.h=Math.PI;me.sp=0;C.cam(0,.5,5);C.snapCam();C.hideCard();zoneKey=null}
 if(fade)C.fade(put,function(){showMsg('☀️ '+DAYS[L.day%7],'New day. It is '+hm(L.min)+' and your alarm is set for '+hm(L.alarm)+'.')});else put()}
L.begin=function(f){C=NF.core;T=C.T;L.on=true;L.mine=f?'Female Hostel E':'Hostel B';window.__outBoxes=C.getBoxes();
 L.min=355;L.alarm=390;L.day=0;L.fired=false;L.st={};L.locked={};L.attended=0;L.missed=0;toRoom(false);
 var P=NF.profile,td=todays(),lines=td.length?td.map(function(c){return c.code+' at '+hm(c.s)+' ('+c.place+')'}).join(', '):'no classes';
 showMsg('📅 Monday, Day 1',(P?'<b>'+P.uni+'</b> · '+P.dept+' · 100 Level<br>':'')+'You are in your room in <b>'+L.mine+'</b>. It is 5:55 AM and your alarm is set for 6:30.<br><b>Today:</b> '+lines+'.<br>Walk to the bed to sleep, the desk to change the alarm, then leave your room, go downstairs and out. Do not be late: lecturers lock the door.',bnl('ok','Start my day',1))};
})();
