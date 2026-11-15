/* street.js — FRONTEND. Street life: two life paths (good student / gangster), people who shout at you,
   insults and apologies, weapons, crew, police, scenes in every building (gangs, drinkers, study groups, prayer...),
   football at the Sports Complex, hustles (side jobs), and the Hustle + Profile phone apps.
   Uses the 3D engine through NF.core (game.js) and the day clock through NF.life (life.js). */
(function(){
var NF=window.NF=window.NF||{};
var C=null,T=null;
var S=NF.street={wanted:0,hide:0,away:0,cops:[],crew:[],weapon:'stick',rep:0,know:0,peace:0,heat:0,joined:false,cur:null,out:[],pitch:null,card:false,init:false,tipsy:0,jobs:0,earned:0,fines:0};
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function rnd(a,b){return a+Math.random()*(b-a)}
function isBad(){return !!(NF.profile&&NF.profile.path==='bad')}
function me(){return C.me()}
function L(){return NF.life}
function toast(t){if(C&&C.toast)C.toast(t)}
function snd(n){try{if(NF.snd)NF.snd.play(n)}catch(e){}}
function money(){return NF.getMoney?NF.getMoney():0}
function absMin(){var l=L();return l?l.day*1440+l.min:0}
function spend(m){var l=L();if(l)l.min+=m}
function btn(a,t,cls,pre){return '<button data-a="'+(pre||'')+a+'"'+(cls?' class="'+cls+'"':'')+'>'+t+'</button>'}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var FN=['Kelechi','Ngozi','Ibrahim','Bisi','Segun','Zainab','Obinna','Hauwa','Femi','Ada','Yusuf','Chioma','Dayo','Maryam','Tolu','Halima','Uche','Sade','Kunle','Bukky','Musa','Ifeoma','Gbenga','Rahma'];
var DP=['Psychology','Law','Computer Science','Medicine','Economics','Sociology','Political Science','Mass Communication','Engineering','Accounting'];
function ensure(){if(!C){if(!NF.core)return false;C=NF.core;T=C.T}return true}
/* ---- looks: weapon in hand, cap and gold chain for gangsters ---- */
S.gear=function(P,kind){if(!P||!P.arms||!ensure())return;var el=P.arms[1].el;if(P.gearM){el.remove(P.gearM);P.gearM=null}if(!kind)return;
 var m=new T.Group();
 if(kind==='stick'){var g=new T.CylinderGeometry(.03,.042,.85,8);g.translate(0,.42,0);m.add(new T.Mesh(g,C.mat(0x7a4a22)));m.rotation.x=2.25;m.position.set(0,-.29,.02)}
 else if(kind==='bottle'){var b=new T.Mesh(new T.CylinderGeometry(.045,.05,.2,8),C.mat(0x2e8b57));b.position.y=.1;var nk=new T.Mesh(new T.CylinderGeometry(.02,.03,.12,8),C.mat(0x2e8b57));nk.position.y=.26;m.add(b,nk);m.rotation.x=2.3;m.position.set(0,-.29,.02)}
 else{var gb=new T.Mesh(new T.BoxGeometry(.05,.11,.26),C.mat(0x1a1a1a));gb.position.set(0,.02,.12);var gh=new T.Mesh(new T.BoxGeometry(.045,.13,.06),C.mat(0x1a1a1a));gh.position.set(0,-.06,.03);gh.rotation.x=.2;m.add(gb,gh);m.position.set(0,-.29,.04)}
 el.add(m);P.gearM=m};
S.dress=function(P){if(!P||P.dressed||!ensure())return;P.dressed=1;var cap=new T.Mesh(new T.SphereGeometry(.13,12,8,0,Math.PI*2,0,Math.PI*.5),C.mat(0x15151b));cap.position.set(0,.15,0);cap.scale.y=1.05;P.head.add(cap);
 var br=new T.Mesh(new T.BoxGeometry(.2,.016,.12),C.mat(0x15151b));br.position.set(0,.17,.12);P.head.add(br);
 var ch=new T.Mesh(new T.TorusGeometry(.085,.012,6,14),C.mat(0xd4af37));ch.position.set(0,.5,.055);ch.rotation.x=1.1;P.sp.add(ch)};
function swing(n,gun){if(!n.p)return;n.swT=gun?.7:.5;n.swG=!!gun}
function clashAt(mins){var l=L();if(!l||!l.todays)return null;var td=l.todays(),a=l.min,b=l.min+mins;for(var i=0;i<td.length;i++){var c=td[i];if(l.st&&l.st[c.code]==='attended')continue;if(a<c.e&&b>c.s)return c}return null}
function newContact(nm,lvl,dept,mood){var n={name:nm||pick(FN),lvl:lvl||pick([100,200,300,400]),dept:dept||pick(DP),mood:mood||'lively',num:'0'+pick(['801','803','805','810','812','903','906'])+(1000000+((Math.random()*8999999)|0)),friend:true};if(NF.phone&&NF.phone.add){NF.phone.add(n);n.c.friend=true;n.c.num=n.num}return n}

/* =============== PEOPLE ON THE ROAD =============== */
var HOSTILE=['"What do you need my number for, friend? God forbid!"','"Small boy like you wants my number? Abeg, comot!"','"Who be you sef? You think we dey the same level?"','"Number? For what? Go and sit down!"','"See this one o! Are you mad?"'];
var CONDESC=['"Hmm. Fresher. Small boy. What do you want?"','"Yes? Make it quick. I am a 400 level student."','"Do I know you? Why are you talking to me?"'];
var INSULTS=['I don\'t even need your number. Who are you?!','Your number sef, e no worth ₦50 airtime 😒','Na your face I dey look? Dey go!'];
var RETORT=['"You dey craze?!"','"Say that again, fresher!"','"Ehn? You will see o!"'];
var SORRY=['"Sorry about earlier. I was stressed. Take my number."','"Eh, I over-reacted. No hard feelings. Here is my number."'];
function giveNum(n,line){n.num='0'+pick(['801','803','805','810','812','903','906'])+(1000000+((Math.random()*8999999)|0));if(NF.phone&&NF.phone.add)NF.phone.add(n).num=n.num;if(NF.phone&&NF.phone.save)NF.phone.save();n.mood='lively';n.stage=null;n.say=line||'"Sure! Save it: '+n.num+' 😊"';toast('📱 '+n.name+' saved in Contacts');C.showCard(NF.street.cardHTML(n))}
function hostile(n){return n.lvl===400||n.mood==='aggressive'}
S.cardHTML=function(n){
 if(!ensure())return null;n.st=n.st||0;var bad=isBad(),mood=n.mood==='aggressive'?' 😠':'',h='<div class="nm">'+esc(n.name)+(n.friend?' ✅':'')+mood+(n.crew?' 😈':'')+'</div><div class="sub">'+n.lvl+' Level · '+esc(n.dept)+(n.num?' · 📞 '+n.num:'')+'</div>';
 if(n.say)h+='<div class="sub" style="font-size:13px;opacity:.95;margin-bottom:8px;background:#252e46;padding:7px 9px;border-radius:10px">'+n.say+'</div>';
 var r='';
 if(n.stage==='insult'){INSULTS.forEach(function(t,i){r+=btn('ins'+i,'🗣 '+t)});r+=btn('back','← Back')}
 else if(n.stage==='hostile'||n.stage==='angry'){r=btn('sorry','🙏 Apologise','go')+(n.stage==='hostile'?btn('insult','🗣 Insult back'):'')+(bad?btn('hit',wl(),'danger'):'')+btn('walk','🚶 Walk away')}
 else if(n.stage==='sorry'){r=btn('take','📱 Take number','go')+btn('walk','Walk away')}
 else{r=btn('hi','👋 Say hi')+btn('fr','🤝 Be friends')+btn('num','📱 Get number','go');if(n.c)r+=btn('chat','💬 Chat');
  if(bad){if(n.num&&!n.crew&&n.id!=='x')r+=btn('crew','😈 Join me to attack');if(n.crew)r+=btn('uncrew','Send him home');r+=btn('hit',wl(),'danger')}}
 if(bad)r+=btn('wpn','Weapon: '+wname());
 return h+'<div class="row">'+r+'</div>'}
var WP=['stick','bottle','gun'];
function wname(){return {stick:'🏏 Stick',bottle:'🍾 Bottle',gun:'🔫 Gun'}[S.weapon]}
function wl(){return {stick:'🏏 Hit with stick',bottle:'🍾 Smash with bottle',gun:'🔫 Shoot'}[S.weapon]}
S.act=function(n,a){
 if(!ensure())return false;var bad=isBad(),show=function(){C.showCard(S.cardHTML(n))};n.eng=8;
 if(a==='wpn'){S.weapon=WP[(WP.indexOf(S.weapon)+1)%WP.length];S.gear(me().p,S.weapon);show();return true}
 if(a==='walk'){n.stage=null;n.say='';n.snooze=1;n.eng=0;C.hideCard();C.clearSel();n.snoozeT=6;return true}
 if(a==='back'){n.stage=n.lastStage||null;show();return true}
 if(a==='hi'){n.stage=null;if(n.lvl===400&&!n.friend){n.say=pick(CONDESC);C.bubble(n,n.say.replace(/"/g,''),3500,true)}else{n.say=null;return false}show();return true}
 if(a==='fr'){if(hostile(n)&&!n.friend){n.stage='hostile';n.say=pick(HOSTILE);C.bubble(n,n.say.replace(/"/g,''),3800,true);show();return true}return false}
 if(a==='num'){if(n.num){n.say='"You already have my number 😄"';show();return true}
  if(n.lvl===400&&Math.random()<.85||n.mood==='aggressive'){n.stage='hostile';n.lastStage='hostile';n.say=pick(HOSTILE);C.bubble(n,n.say.replace(/"/g,''),3800,true);snd('pop');show();return true}
  return false}
 if(a==='sorry'){if(Math.random()<(n.lvl===400?.4:.6)){giveNum(n,'"Hmm. At least you have respect. Fine, take it."')}else{n.stage=null;n.say='"Learn respect, fresher. Move!"';n.snoozeT=10;n.eng=0;show()}return true}
 if(a==='insult'){n.stage='insult';n.lastStage='hostile';show();return true}
 if(a.indexOf('ins')===0){var i=+a.slice(3);n.ins=(n.ins||0)+1;n.stage='angry';n.say=pick(RETORT);C.bubble(n,n.say.replace(/"/g,''),3200,true);S.rep+=bad?1:0;
  if(Math.random()<.3&&!n.sorryT){n.sorryT=9+Math.random()*8}
  show();return true}
 if(a==='take'){giveNum(n,'"Take it. No hard feelings."');return true}
 if(a==='hit'){attack(n);return true}
 if(a==='crew'){recruit(n);return true}
 if(a==='uncrew'){dismiss(n);show();return true}
 if(a==='chat'){return false}
 return false}

/* =============== FIGHTS, CREW AND POLICE =============== */
function crewNear(){return S.crew.filter(function(c){return !c.gone&&c.crew})}
function recruit(n){
 var ch=NF.chat&&NF.chat.persona?NF.chat.persona(n.c||{name:n.name,dept:n.dept,mood:n.mood}):{temper:50};
 if(S.crew.length>=3){n.say='"Your crew is already full. Three is enough."';C.showCard(S.cardHTML(n));return}
 if(ch.temper<55&&!n.gang){n.say='"No o. I don\'t do violence. Police will pick us all. Calm down."';C.showCard(S.cardHTML(n));return}
 n.crew=true;n.follow=true;n.eng=0;n.stage=null;S.gear(n.p,'stick');n.say='"Who are we dealing with? Let us go."';S.crew.push(n);C.bubble(n,'Who are we dealing with?',3000);toast('😈 '+n.name+' joined your crew ('+S.crew.length+'/3)');C.showCard(S.cardHTML(n))}
function dismiss(n){S.gear(n.p,null);n.crew=false;n.follow=false;n.wait=3;S.crew=S.crew.filter(function(c){return c!==n});n.say='"Alright, I am going."'}
function attack(n){
 var w=S.weapon,gun=w==='gun',m=me();C.hideCard();C.clearSel();
 n.down=gun?10:8;n.stage=null;n.say='';n.mood='aggressive';n.eng=0;n.snoozeT=12;
 C.bubble(n,gun?'AAAH!':'Ouch!',2500,true);snd(gun?'bang':'hit');swing(me(),gun);
 var cr=crewNear();cr.forEach(function(c){c.x=n.x+rnd(-2.2,2.2);c.z=n.z+rnd(1.2,2.4);c.h=Math.atan2(n.x-c.x,n.z-c.z);c.p.g.position.set(c.x,0,c.z);C.bubble(c,pick(['Hit am!','Deal with him!','Oya!']),2500,true);swing(c,false)});
 toast((gun?'🔫 BANG! ':'💥 ')+'You '+(gun?'shot at ':'attacked ')+n.name+(cr.length?' with '+cr.map(function(c){return c.name}).join(' and '):'')+'. Police are coming. RUN!');
 S.heat+=gun?3:1;S.rep+=2;raise(gun?2:1)}
function copLook(){return {f:false,skin:0x5a3a22,top:0x1b2a5a,bottom:0x10204a,shoe:0x111111,hair:0x111111,hairStyle:'short',hijab:0,shorts:false,bag:0}}
function raise(level){var first=!S.wanted;S.wanted=Math.max(S.wanted,level);S.hide=0;S.away=0;if(!first&&S.cops.length)return;
 var cnt=2+crewNear().length+(level>=2?2:0),m=me();for(var i=0;i<cnt;i++){var a=Math.random()*6.28,d=rnd(55,75),P=C.makePerson(copLook()),x=m.x+Math.cos(a)*d,z=m.z+Math.sin(a)*d,o={x:x,z:z};C.resolve(o,.4);P.g.position.set(o.x,0,o.z);C.scene.add(P.g);S.cops.push({p:P,x:o.x,z:o.z,h:0,sp:0,v:level>=2?6.4:5.3})}
 snd('siren');updWanted()}
function clearCops(){S.cops.forEach(function(c){C.scene.remove(c.p.g)});S.cops=[]}
function escape(msg){S.wanted=0;S.hide=0;S.away=0;clearCops();crewNear().forEach(function(c){dismiss(c)});updWanted();toast(msg)}
function busted(){
 if(S.over||S.jail)return;var cr=crewNear(),fine=Math.min(money(),S.weapon==='gun'?9000:5000);clearCops();S.wanted=0;
 if(fine>0)NF.pay('Police fine',fine);S.fines+=fine;S.rep=Math.max(0,S.rep-1);
 var names=cr.map(function(c){return c.name});cr.forEach(function(c){S.gear(c.p,null);c.crew=false;c.follow=false;c.gone=true;c.p.g.visible=false;c.arrested=true;if(c.c&&c.c.mem)c.c.mem.angry=1});S.crew=[];
 jail(names,(S.weapon==='gun'?720:360)+names.length*60,fine)}
/* ---- the prison: a real cell you can see yourself in ---- */
var PR=null;
function buildPrison(){if(PR)return PR;var ox=3000,oz=1200,g=new T.Group();g.position.set(ox,0,oz);C.scene.add(g);var bs=[];
 function bx(w,h,d,col,x,y,z,solid){var m=new T.Mesh(new T.BoxGeometry(w,h,d),C.mat(col));m.position.set(x,y,z);g.add(m);if(solid)bs.push({x0:ox+x-w/2,x1:ox+x+w/2,z0:oz+z-d/2,z1:oz+z+d/2});return m}
 bx(28,.3,26,0x777b84,0,-.15,0);bx(28,4.4,.6,0x4f535c,0,2.2,-13,1);bx(.6,4.4,26,0x4f535c,-14,2.2,0,1);bx(.6,4.4,26,0x4f535c,14,2.2,0,1);bx(28,4.4,.6,0x4f535c,0,2.2,13,1);
 bx(.5,3.4,13.4,0x5c606a,-7.2,1.7,-5.1,1);bx(.5,3.4,13.4,0x5c606a,7.2,1.7,-5.1,1);
 for(var i=-7;i<=7.01;i+=.55)bx(.09,3.4,.09,0x2a2d33,i,1.7,1.6);bx(14.8,.14,.16,0x2a2d33,0,3.4,1.6);bx(14.8,.14,.16,0x2a2d33,0,.12,1.6);bs.push({x0:ox-7.4,x1:ox+7.4,z0:oz+1.45,z1:oz+1.8});
 bx(2.4,.55,1.1,0x3a5f8f,-5.2,.5,-11.6,1);bx(2.4,.55,1.1,0x3a5f8f,-5.2,1.9,-11.6,1);bx(.12,2.2,.12,0x2a2d33,-6.4,1.1,-11.1);bx(.12,2.2,.12,0x2a2d33,-4.0,1.1,-11.1);
 bx(2.4,.55,1.1,0x3a5f8f,5.2,.5,-11.6,1);bx(.5,.5,.5,0x8a8f98,0,.25,-11.6,1);bx(3.2,.45,.8,0x6b4a2c,3,.225,-9,1);
 bx(3,1,1.2,0x7a5230,0,.5,7,1);bx(26,.05,.6,0xf5c518,0,.02,5);
 bx(1.6,.5,1.2,0x8a8f98,0,.25,-6.2);bx(.9,.35,.8,0x777b84,.9,.18,-6.0);bx(.7,.3,.7,0x9a9fa8,-.8,.15,-6.3);
 C.label('🔒 Police Station · Cell 3',ox,4.8,oz-4,.95);
 var ps=[];function pers(x,z,fz,top,seat){var P=C.makePerson({f:false,skin:C.randLook(false).skin,top:top,bottom:top,shoe:0x222222,hair:0x111111,hairStyle:'short',hijab:0,shorts:false,bag:0});P.g.position.set(x,0,z);P.g.rotation.y=Math.atan2(0-x,fz-z);if(seat)C.seatPose(P);g.add(P.g);return P}
 pers(-1.5,-3,6,0xe8761a);pers(3,-9,0,0xe8761a,1);
 var cop=C.makePerson(copLook());cop.g.position.set(0,0,5.4);cop.g.rotation.y=Math.PI;g.add(cop.g);C.label('👮 Warden',ox,2.6,oz+5.4,.45);
 PR={cop:cop,ox:ox,oz:oz,g:g,boxes:bs,int:{x0:ox-6.6,x1:ox+6.6,z0:oz-12,z1:oz+1.2},mates:[],pers:pers};return PR}
function hmtxt(m){m=Math.max(0,Math.ceil(m));return Math.floor(m/60)+'h '+('0'+(m%60)).slice(-2)+'m'}
function jailCard(msg){var J=S.jail;S.card=true;var working=J.work>0;C.showCard('<div class="nm">🔒 You are in prison</div><div class="sub" style="font-size:13px;opacity:.95;margin-bottom:8px">Arrested for fighting'+(J.fine?' · fined ₦'+J.fine.toLocaleString('en-NG'):'')+'.'+(J.names.length?'<br>Locked up with you: <b>'+J.names.join(', ')+'</b>.':'')+'<br>Time left: <b id="jl">'+hmtxt(J.left)+'</b>'+(msg?'<br><span style="color:#ffb4a8">'+msg+'</span>':'')+'</div><div class="row">'+(working?'<button disabled>⛏ Breaking stones… <span id="jw">'+Math.ceil(J.work)+'</span>s</button>':'<button data-a="S:jwork" class="go">⛏ Do forced labour (2 hrs)</button>')+'<button data-a="S:skipjail"'+'>⏩ Skip to the end of my sentence</button></div>',true)}
function beat(why){var J=S.jail;if(!J||J.down>0)return;J.down=1.8;J.hit=1.2;S.beaten=(S.beaten||0)+1;snd('hit');setTimeout(function(){snd('hit')},350);C.bubble&&0;toast('👮 The warden beats you: "'+why+'"');}
function jail(names,mins,fine){if(S.jail)return;try{buildPrison()}catch(e){if(window.console)console.log('prison',e);return}
 var m=me();S._ob=C.getBoxes();S.jail={left:mins,total:mins,names:names,fine:fine,work:0,idle:0,down:0,hit:0};S.cur=null;S.over=1;
 C.fade(function(){C.setBoxes(PR.boxes);C.setInt(PR.int);m.x=PR.ox;m.z=PR.oz-3;m.y=0;m.sp=0;m.h=Math.PI;m.riding=null;m.p.g.visible=true;m.tag.visible=true;C.cam(0,.5,5.5);C.snapCam();C.clearSel();C.hideCard();
   PR.mates.forEach(function(g){PR.g.remove(g)});PR.mates=[];names.forEach(function(n,i){var P=PR.pers(-4+i*3,-6-(i%2)*1.5,0,0xe8761a);PR.mates.push(P.g)});
   ['bgo','bjump'].forEach(function(id){var e=document.getElementById(id);if(e)e.style.display='none'});snd('door')},function(){S.over=0;jailCard('The warden beat you for fighting. Now you must work off your sentence.');beat('That is for fighting, you thug!');snd('bad')})}
function jailTick(dt){var J=S.jail,m=me(),dm=dt*(L()?(L().mult||1):1)/60;spend(dm);J.left-=dm;
 if(J.work>0){var w=Math.min(dt,J.work),x=w*12;spend(x);J.left-=x;J.work-=w;J.idle=0;var t=performance.now()/1000;m.h=Math.PI;m.sp=0;var P=m.p;P.arms[0].sh.rotation.x=-1.6+Math.sin(t*9)*.9;P.arms[1].sh.rotation.x=-1.6+Math.sin(t*9+Math.PI)*.9;P.arms[0].el.rotation.x=P.arms[1].el.rotation.x=-.5;P.sp.rotation.x=.25+Math.sin(t*9)*.1;
  if(Math.random()<dt*3&&Math.floor(t*9/Math.PI)%2===0)snd('step');var jw=document.getElementById('jw');if(jw)jw.textContent=Math.ceil(J.work);
  if(J.work<=0){snd('good');if(Math.random()<.45)beat('Faster! Lazy boy!');jailCard(J.down>0?'You worked hard, but the warden still beat you.':'You finished a shift. Rest, then work again.')}}
 else if(J.down<=0){J.idle+=dt;if(J.idle>18){J.idle=0;J.left+=30;beat('Why are you idle? Get to work! (+30 minutes)');jailCard('Idle prisoners are beaten and given extra time.')}}
 if(J.down>0){J.down-=dt;m.y=.22;m.sp=0;m.p.g.rotation.x=-1.5;if(PR&&PR.cop&&J.hit>0){J.hit-=dt;PR.cop.arms[1].sh.rotation.x=-1.4-1.4*Math.abs(Math.sin(J.hit*12))}if(J.down<=0){m.y=0;m.p.g.rotation.x=0}}
 S.frozen=J.work>0||J.down>0;var jl=document.getElementById('jl');if(jl)jl.textContent=hmtxt(J.left);if(J.left<=0)release()}
function release(){var J=S.jail;if(!J)return;S.jail=null;S.over=1;S.frozen=false;var m=me();m.y=0;m.p.g.rotation.x=0;
 C.fade(function(){C.setBoxes(S._ob||window.__outBoxes);C.setInt(null);var d=NF.destOf?NF.destOf('Main Gate'):null;m.x=d?d.x:0;m.z=d?d.z:0;m.y=0;m.sp=0;m.h=0;C.resolve(m,.35);C.cam(Math.PI,.42,6.5);C.snapCam();
   ['bgo','bjump'].forEach(function(id){var e=document.getElementById(id);if(e)e.style.display=''});PR.mates.forEach(function(g){PR.g.remove(g)});PR.mates=[];snd('door')},function(){S.over=0;
   S.card=true;C.showCard('<div class="nm">🔓 Released</div><div class="sub" style="font-size:13px;margin-bottom:10px">You served your sentence, bruised and tired. It is now '+(L()&&L().hm?L().hm(L().min):'')+'. Classes you missed count as absent. Think twice before fighting again.</div><div class="row">'+btn('ok','OK','go','S:')+'</div>',true)})}
S.jailed=function(){return !!S.jail};
function updRep(){var e=document.getElementById('repc');if(!e){e=document.createElement('div');e.id='repc';document.body.appendChild(e)}if(isBad()&&C&&C.started()){e.style.display='block';e.textContent='😈 Respect '+S.rep+(S.crew.length?' · Crew '+S.crew.length:'')}else e.style.display='none'}
function updWanted(){updRep();var e=document.getElementById('wanted');if(!e){e=document.createElement('div');e.id='wanted';e.className='chip';document.body.appendChild(e)}e.style.display=S.wanted?'block':'none';e.textContent=S.hide>0?'🙈 Hiding… stay inside':(S.wanted>1?'🚓🚓 POLICE · RUN!':'🚓 POLICE · RUN!')}
NF.crewSpeed=function(){return S.wanted?7.5:4.2};

/* =============== SCENES (inside buildings and outdoors) =============== */
var HUS={
 water:{t:'Sell sachet water',place:'Campus Market',pay:1500,min:120},
 cafe:{t:'Serve food at the cafeteria',place:'Cafeteria',pay:2500,min:180},
 tutor:{t:'Tutor a junior student',place:'Main Library',pay:3000,min:120,need:2},
 print:{t:'Printing and photocopy desk',place:'Bookshop',pay:1800,min:120},
 bags:{t:'Carry travellers\' bags',place:'Airport Terminal',pay:2000,min:90},
 pitch:{t:'Sell water at the pitch',place:'Sports Complex',pay:1200,min:60},
 errand:{t:'Deliver an envelope for the boys',place:'Campus Market',pay:8000,min:40,risk:.35,gang:1}};
S.HUS=HUS;
var TIPS=function(){var l=L(),td=l&&l.todays?l.todays():[];var t=[];td.forEach(function(c){t.push(c.lec+' locks the door 15 minutes after '+c.code+' starts.')});t.push('The cafeteria jollof is cheaper before noon.','The library is quiet after 4 PM. Good for reading.','There are free seats at the back of the hall.','Some hostel porters hand out spare keys. Do not trust them.');return pick(t)};
function res(title,html,pre){S.card=true;C.showCard('<div class="nm">'+title+'</div><div class="sub" style="font-size:13px;opacity:.95;margin-bottom:10px">'+html+'</div><div class="row">'+btn('ok','OK','go',pre)+'</div>',true)}
var KIND={
 eat:['🍛 Students eating','A table of students is sharing jollof rice and laughing.',function(g,p){return btn('join','Join them · ₦700','go',p)+btn('walk','Walk away','',p)}],
 drink:['🍺 People drinking alcohol','A group is drinking and getting loud. One of them waves you over.',function(g,p){return btn('join','Join them · ₦500','go',p)+(isBad()?'':btn('advise','Advise them to stop',' ',p))+btn('decline','Politely decline','',p)+btn('walk','Walk away','',p)}],
 gang:['😈 The boys','Three guys in hoodies are standing in a corner. They look at you.',function(g,p){return isBad()?(S.joined?btn('bring','Bring two boys with me','go',p)+btn('errand','Ask for work (risky)','',p)+btn('walk','Walk away','',p):btn('joingang','Join the boys','go',p)+btn('respect','Pay respect · ₦300','',p)+btn('walk','Walk away','',p)):btn('pay','Pay ₦500 "levy"','',p)+btn('refuse','Refuse','',p)+btn('walk','Walk away','go',p)}],
 study:['📚 Study group','A group is revising for a test with notes and highlighters.',function(g,p){return btn('join','Join the group · 90 min','go',p)+btn('copy','Ask to copy notes','',p)+btn('walk','Walk away','',p)}],
 gist:['🗣 People gisting','A few people are gisting about lecturers and campus news.',function(g,p){return btn('join','Join the gist · 20 min','go',p)+btn('walk','Walk away','',p)}],
 pray:['🙏 Prayer','People are praying quietly.',function(g,p){return btn('join','Join the prayer · 15 min','go',p)+btn('walk','Walk away','',p)}],
 advice:['🙂 Religious leader','He greets you warmly and asks how you are coping on campus.',function(g,p){return btn('join','Ask for advice · 10 min','go',p)+btn('walk','Walk away','',p)}],
 nurse:['🩺 The nurse','The nurse is at her desk. "How are you feeling today?"',function(g,p){return btn('check','Medical check-up · ₦500','go',p)+btn('drugs','Buy malaria drugs · ₦1,200','',p)+btn('walk','Walk away','',p)}],
 sick:['🤒 An unwell student','A student is sitting with a headache and no money for drugs.',function(g,p){return btn('help','Help (give ₦500)','go',p)+btn('walk','Walk away','',p)}],
 info:['ℹ Desk','','' ],
 newfriend:['👋 A new face','A student is sitting alone, scrolling on a phone.',function(g,p){return btn('hi','Say hi','go',p)+btn('walk','Walk away','',p)}],
 hustle:['💼 Hustle','','' ],
 football:['⚽ Football at the Sports Complex','Students are playing a match. A boy shouts: "We need one more player!"',function(g,p){return btn('play','Join the game','go',p)+btn('watch','Watch · 20 min','',p)+btn('walk','Walk away','',p)}]};
function sceneHTML(z,out){var sc=z.sc,p=out?'S:':'L:sc:',k=KIND[sc.kind];if(!k)return null;var t=k[0],d=k[1],b='';
 if(sc.kind==='info'){var g=sc.g;t='ℹ '+({teller:'Bank teller',clerk:'Admin clerk',agent:'Check-in agent'}[g]||'Desk');d=g==='teller'?'"Welcome. Your balance is ₦'+money().toLocaleString('en-NG')+'. You can do transfers on your phone, in the Bank app."':g==='clerk'?'"School fees, course registration and results are processed here. Nothing is due today."':'"Flights are booked in your Flights app. Sit anywhere and wait."';b=btn('ok','OK','go',p)+btn('walk','Walk away','',p)}
 else if(sc.kind==='hustle'){var H=HUS[sc.g];if(!H)return null;t='💼 '+H.t;d='Pay ₦'+H.pay.toLocaleString('en-NG')+' · takes '+Math.round(H.min/60*10)/10+' hours'+(H.need?' · needs Knowledge '+H.need+' (you have '+S.know+')':'')+'.';b=btn('work','Work now','go',p)+btn('walk','Not now','',p)}
 else if(sc.kind==='advice'){t=sc.g==='imam'?'🕌 The Imam':'⛪ The Pastor';b=k[2](sc.g,p)}
 else if(sc.kind==='pray'){t=sc.cat==='mosque'?'🕌 Prayer':'⛪ Prayer';d=sc.cat==='mosque'||sc.cat==='church'?'People are praying quietly in rows.':'';b=k[2](sc.g,p)}
 else if(sc.kind==='gang'&&isBad()){t=S.joined?'😈 Your boys':'😈 The boys';d=S.joined?'"Oga! What is the plan today?"':'"Eyy! New boy! You want to roll with us, or you dey lost?"';b=k[2](sc.g,p)}
 else b=k[2]?k[2](sc.g,p):'';
 return '<div class="nm">'+t+'</div><div class="sub" style="font-size:13px;opacity:.95;margin-bottom:10px">'+d+'</div><div class="row">'+b+'</div>'}
S.sceneCard=function(z){if(!ensure())return null;S.cur=z;S.card=true;return sceneHTML(z,false)};
function doHustle(id){var H=HUS[id];if(!H)return;var l=L();
 if(l&&l.asleep)return;if(H.need&&S.know<H.need){res('💼 '+H.t,'You need more Knowledge for this job ('+H.need+'). Study with a group in the library first.',S.cur&&S.cur.out?'S:':'L:sc:');return}
 if(H.gang&&!S.joined){res('💼 '+H.t,'Only the boys can give you this work.',S.cur&&S.cur.out?'S:':'L:sc:');return}
 var cl=clashAt(H.min);if(cl&&!S._ok){S._pendH=id;var p0=S.cur&&S.cur.out?'S:':'L:sc:';S.card=true;C.showCard('<div class="nm">⚠ Class clash</div><div class="sub" style="font-size:13px;margin-bottom:10px">This job takes '+Math.round(H.min/60*10)/10+' hours and clashes with <b>'+cl.code+'</b> ('+l.hm(cl.s)+'). You will be marked absent. Work anyway?</div><div class="row">'+btn('workok','Work anyway','danger',p0)+btn('walk','Cancel','',p0)+'</div>',true);return}
 S._ok=false;var pre=S.cur&&S.cur.out?'S:':'L:sc:';
 C.fade(function(){spend(H.min)},function(){NF.addMoney(H.pay,'Hustle · '+H.t);S.jobs++;S.earned+=H.pay;
  if(H.risk&&Math.random()<H.risk&&!(l&&l.cur)){res('💼 Delivered… but!','You delivered the envelope and got ₦'+H.pay.toLocaleString('en-NG')+'. A police patrol saw you. RUN!',pre);raise(1);S.heat+=1}
  else res('💼 Done','You worked for '+Math.round(H.min/60*10)/10+' hours and earned <b>₦'+H.pay.toLocaleString('en-NG')+'</b>. Sweat pays.',pre)})}
S.doHustle=doHustle;
function sceneDo(z,a,pre){var sc=z&&z.sc;if(!sc)return;var k=sc.kind,bad=isBad(),l=L();
 if(a==='ok'||a==='walk'){S.card=false;S.cur=null;C.hideCard();if(z.out)z.snooze=8;return}
 function clash(mins,cont){var cl=clashAt(mins);if(cl&&!S._ok){S._pend=cont;S.card=true;C.showCard('<div class="nm">⚠ Class clash</div><div class="sub" style="font-size:13px;margin-bottom:10px">This takes about '+mins+' minutes and clashes with <b>'+cl.code+'</b> ('+l.hm(cl.s)+'). You will be marked absent. Continue?</div><div class="row">'+btn('goon','Continue','danger',pre)+btn('walk','Cancel','',pre)+'</div>',true);return true}S._ok=false;return false}
 if(a==='goon'){S._ok=true;var c=S._pend;S._pend=null;if(c)c();return}
 if(a==='workok'){S._ok=true;doHustle(S._pendH);return}
 if(k==='hustle'&&a==='work'){doHustle(sc.g);return}
 if(k==='eat'&&a==='join'){if(money()<700){res('🍛 Not enough money','You cannot afford ₦700.',pre);return}
  if(clash(30,function(){sceneDo(z,a,pre)}))return;NF.pay('Cafeteria · food',700);spend(30);var nf=Math.random()<.4;var f=nf?newContact():null;res('🍛 Lunch with new people','The jollof was good. '+(f?'You exchanged numbers with <b>'+f.name+'</b> ('+f.lvl+'L '+f.dept+').':'You made small talk and left full.'),pre);return}
 if(k==='drink'){
  if(a==='join'){if(money()<500){res('🍺 No money','You cannot afford ₦500.',pre);return}if(clash(60,function(){sceneDo(z,a,pre)}))return;NF.pay('Drinks',500);spend(60);S.rep+=bad?2:1;S.peace=Math.max(-5,S.peace-1);S.tipsy=120;res('🍺 You drank with them','They cheered. You feel tipsy for a while. <small>(Respect +'+(bad?2:1)+', Peace −1)</small>',pre);return}
  if(a==='decline'){res('🙂 Declined','"Ah, holy boy!" they tease, then leave you alone.',pre);return}
  if(a==='advise'){var ok=Math.random()<.4;if(ok){S.peace+=2}res(ok?'🙏 They listened':'😒 They laughed',ok?'"You are right. Let us stop for today." You feel good. <small>(Peace +2)</small>':'"Who made you our parent?" They mock you and turn away.',pre);return}}
 if(k==='gang'){
  if(!bad){if(a==='pay'){if(money()<500){res('😈 No money','You have nothing to give. They push you aside and laugh.',pre);return}NF.pay('Levy',500);res('😈 Levy paid','"Good boy. You are safe here."',pre);return}
   if(a==='refuse'){if(Math.random()<.5){res('😈 They let you go','"Next time." They stare as you walk off.',pre)}else{var t=Math.min(1000,money());if(t>0)NF.pay('Robbed',t);res('😈 They shoved you','They took ₦'+t.toLocaleString('en-NG')+' from you. Stay out of corners like this.',pre)}return}}
  else{
   if(a==='joingang'){S.joined=true;S.rep+=3;S.heat+=1;var g1=newContact(pick(['Bobo','Slim','Dagger','Ice','Jaga','Kano']),pick([300,400]),pick(DP),'aggressive'),g2=newContact(pick(['Shaggy','Blaze','Tiger','Mayor','Stubborn']),pick([200,300]),pick(DP),'aggressive');g1.c.mem={angry:0};g2.c.mem={angry:0};g1.c._p={temper:90,party:80,study:10,broke:50,gist:60,slot:480,slot2:600};g2.c._p={temper:88,party:70,study:20,broke:40,gist:70,slot:720,slot2:840};
    res('😈 You are in','They bump fists. "Welcome, new boy." <b>'+g1.name+'</b> and <b>'+g2.name+'</b> gave you their numbers. Call them to meet, then attack together. <small>(Respect +3)</small>',pre);return}
   if(a==='respect'){if(money()<300){res('😈 No money','"Come back when you have something."',pre);return}NF.pay('Respect money',300);S.rep+=1;res('😈 Respect','"Good boy." They nod. <small>(Respect +1)</small>',pre);return}
   if(a==='errand'){doHustle('errand');return}
   if(a==='bring'){var cand=null;S.crew=S.crew.filter(function(c){return !c.gone});var made=0;for(var i=0;i<2&&S.crew.length<3;i++){var P2=C.spawn({name:pick(['Bobo','Slim','Dagger','Ice','Jaga']),lvl:pick([300,400]),dept:pick(DP),mood:'aggressive',f:false,x:me().x+rnd(-3,3),z:me().z+rnd(2,4),wait:0});P2.gang=true;P2.crew=true;P2.follow=true;S.crew.push(P2);made++}
    res('😈 The boys are with you',made?'Two of the boys step out behind you. Find your target, then use the stick or gun.':'Your crew is already full.',pre);return}}}
 if(k==='study'){
  if(a==='join'){if(clash(90,function(){sceneDo(z,a,pre)}))return;spend(90);S.know+=2;res('📚 Good session','You revised hard. <small>(Knowledge +2)</small>',pre);return}
  if(a==='copy'){if(Math.random()<.7){spend(20);S.know+=1;res('📚 Notes copied','They let you copy. <small>(Knowledge +1)</small>',pre)}else res('📚 No notes','"Do your own work." They keep the notes.',pre);return}}
 if(k==='gist'&&a==='join'){if(clash(20,function(){sceneDo(z,a,pre)}))return;spend(20);res('🗣 Gist','You heard: '+TIPS(),pre);return}
 if(k==='pray'&&a==='join'){spend(15);S.peace+=1;res('🙏 Peace','You joined them quietly. Your mind feels calm. <small>(Peace +1)</small>',pre);return}
 if(k==='advice'&&a==='join'){spend(10);S.peace+=1;if(bad)S.heat=Math.max(0,S.heat-1);res(sc.g==='imam'?'🕌 The Imam':'⛪ The Pastor',bad?'"The street will take everything from you, my son. Come back to the right path."':'"Pray, study, and be patient. Success is not rushed."',pre);return}
 if(k==='nurse'){if(a==='check'){if(money()<500){res('🩺 No money','You cannot afford ₦500.',pre);return}NF.pay('Medical check-up',500);spend(30);res('🩺 Check-up','"You are healthy. Drink more water."',pre);return}
  if(a==='drugs'){if(money()<1200){res('🩺 No money','You cannot afford ₦1,200.',pre);return}NF.pay('Malaria drugs',1200);res('🩺 Done','"Take them after food." Stay well.',pre);return}}
 if(k==='sick'&&a==='help'){if(money()<500){res('🤒 No money','You do not have ₦500.',pre);return}NF.pay('Helped a student',500);S.peace+=2;res('🤒 You helped','"God bless you." <small>(Peace +2)</small>',pre);return}
 if(k==='newfriend'){if(a==='hi'){var f2=newContact();res('👋 New friend','You said hi. <b>'+f2.name+'</b> ('+f2.lvl+'L '+f2.dept+') gave you their number. They will chat with you on the phone.',pre);return}}
 if(k==='football'){if(a==='play'){S.card=false;C.hideCard();z.snooze=20;if(NF.openGame)NF.openGame('football');return}
  if(a==='watch'){spend(20);res('⚽ Great match','You watched for a while. The red team won 3-2.',pre);z.snooze=8;return}}
 S.card=false;C.hideCard()}
S.sceneAct=function(z,a){if(!ensure())return;sceneDo(z||S.cur,a,'L:sc:')};
S.outAct=function(a){if(!ensure())return;sceneDo(S.cur,a,'S:')};

/* =============== FRIENDS ON THE PHONE =============== */
NF.chatEnv=function(c){var l=L(),n=null;if(C)for(var i=0;i<C.npcs.length;i++)if(C.npcs[i].c===c)n=C.npcs[i];
 return {day:l?l.day%7:0,min:l?Math.floor(l.min)%1440:600,classes:l&&l.todays?l.todays():[],friendLoc:n&&n.at?n.at:null}};
function findNPC(c){for(var i=0;i<C.npcs.length;i++)if(C.npcs[i].c===c)return C.npcs[i];return null}
S.chatAct=function(c,act){if(!ensure()||!act)return;
 if(act.type==='meet'){var n=findNPC(c);if(!n){var m=me(),a=Math.random()*6.28;n=C.spawn({name:c.name,lvl:c.lvl,dept:c.dept,mood:c.mood,f:false,x:m.x+Math.cos(a)*120,z:m.z+Math.sin(a)*120,wait:0,friend:true,num:c.num,c:c})}
  var d=NF.destOf?NF.destOf(act.place):null;if(!d)return;n.crew=false;n.follow=false;n.at=null;n.gone=false;n.inside=null;n.goal={x:d.x,z:d.z};n.onGoal=null;
  var dist=Math.hypot(d.x-n.x,d.z-n.z),mins=Math.max(4,act.delay||10);n.gs=Math.max(2.8,Math.min(14,dist/(mins/1.5)));
  n.onGoal=function(nn){nn.at=act.place;nn.gs=0;var t=NF.typeOfPlace?NF.typeOfPlace(act.place):null;
   if(t&&t!=='hall'){nn.gone=true;nn.inside=act.place;nn.p.g.visible=false}else{nn.wait=99999}
   if(NF.phone&&NF.phone.addIncoming)NF.phone.addIncoming(c,'I\'m at the '+act.place+' now. Where are you?');snd('pop')}}}

/* =============== INSIDE BUILDINGS: friends who are waiting ================ */
S.onEnter=function(I,b,t){if(!ensure())return;I.dyn=[];I.dynM=[];var k=0;
 C.npcs.forEach(function(n){if(n.inside===b.name&&n.c&&I.fslots&&k<I.fslots.length){var sl=I.fslots[k++],P=C.makePerson(n.look||C.randLook(false));P.g.position.set(sl.x,0,sl.z);P.g.rotation.y=Math.PI;I.g.add(P.g);I.dynM.push(P.g);I.dyn.push({k:'friend',id:'f'+n.name,f:0,x:sl.x,z:sl.z,r:2.4,fn:n})}})}
S.onLeave=function(I){if(!I||!I.dynM)return;I.dynM.forEach(function(g){I.g.remove(g)});I.dynM=[];I.dyn=[]};
S.friendCard=function(z){var n=z.fn;if(!n)return null;S.card=true;S.cur={sc:{kind:'friend'},fn:n};var bad=isBad();
 return '<div class="nm">'+esc(n.name)+' ✅ <small>is waiting here</small></div><div class="sub">'+n.lvl+' Level · '+esc(n.dept)+'</div><div class="sub" style="font-size:13px;opacity:.95;margin-bottom:8px">"You came! What\'s the plan?"</div><div class="row">'+btn('ftalk','💬 Chat on phone','go','L:sc:')+btn('fhang','🍛 Hang out · 30 min','','L:sc:')+(bad&&!n.crew?btn('frec','😈 Join me to attack','danger','L:sc:'):'')+(n.crew?'<button disabled>😈 In my crew</button>':'')+btn('ok','Leave','','L:sc:')+'</div>'};
var sceneDo0=sceneDo;
sceneDo=function(z,a,pre){if(z&&z.sc&&z.sc.kind==='friend'||z&&z.fn){var n=(z&&z.fn)||(S.cur&&S.cur.fn);if(a==='ftalk'){C.hideCard();S.card=false;if(NF.phone&&NF.phone.show){NF.phone.show();if(n&&n.c)NF.phone.openChat(n.c)}return}
  if(a==='fhang'){spend(30);S.rep+=0;res('🍛 Hung out','You and '+n.name+' chatted and laughed for a while.',pre);return}
  if(a==='frec'){var cr=S.crew.length;recruit(n);if(n.crew){n.inside=null;n.gone=false;n.p.g.visible=true;var m=me(),I=L()&&L().cur?L().cur.I:null;res('😈 '+n.name+' is in',n.name+' will follow you outside. Find your target.',pre)}else{res(n.name,n.say.replace(/"/g,''),pre)}return}
  S.card=false;C.hideCard();return}
 return sceneDo0(z,a,pre)};
S.sceneAct=function(z,a){if(!ensure())return;sceneDo(z||S.cur,a,'L:sc:')};
S.outAct=function(a){if(!ensure())return;sceneDo(S.cur,a,'S:')};

/* =============== OUTDOOR SCENES + FOOTBALL PITCH =============== */
function nudge(x,z){var o={x:x,z:z};C.resolve(o,.8);return o}
function mkOut(kind,x,z,n,g,r){var o=nudge(x,z);x=o.x;z=o.z;for(var j=0;j<n;j++){var a=j/n*6.28,px=x+Math.cos(a)*(n>1?1.2:0),pz=z+Math.sin(a)*(n>1?1.2:0),P=C.makePerson(C.randLook(Math.random()<.5));P.g.position.set(px,0,pz);P.g.rotation.y=Math.atan2(x-px,z-pz);if(n===1)P.g.rotation.y=Math.PI;if(kind==='gang'){S.dress(P);S.gear(P,'stick')}C.scene.add(P.g);C.addCircle(px,pz,.55)}
  var lb=({eat:'🍛',drink:'🍺 Drinking',gang:'😈 The boys',study:'📚 Study group',gist:'🗣 Gist',newfriend:'👋 New face',hustle:'💼 '+((HUS[g]||{}).t||'Hustle')})[kind]||kind;C.label(lb,x,2.7,z,.42);
 S.out.push({out:true,x:x,z:z,r:r||3.2,snooze:0,sc:{kind:kind,g:g,cat:'out'}})}
function buildOutdoor(){
 /* Campus Market */
 mkOut('hustle',-165,150,1,'water');mkOut('drink',-143,172,3);mkOut('gang',-187,172,3);mkOut('gist',-143,150,2);mkOut('newfriend',-165,172,1);
 /* Campus Park */
 mkOut('study',-70,165,2);mkOut('drink',-40,165,3);mkOut('gang',-55,186,3);mkOut('newfriend',-55,146,1);
 /* Sports complex: football match on the pitch */
 var cx=-165,cz=59;S.pitch={cx:cx,cz:cz,hw:35,hd:22,pl:[],ball:null,bv:{x:0,z:0}};
 for(var i=0;i<8;i++){var P=C.makePerson(C.randLook(false));P.g.position.set(cx+rnd(-25,25),0,cz+rnd(-14,14));C.scene.add(P.g);S.pitch.pl.push({p:P,x:P.g.position.x,z:P.g.position.z,h:0,sp:0,side:i%2,cd:0})}
 var bl=new T.Mesh(new T.SphereGeometry(.28,10,8),C.mat(0xffffff));bl.position.set(cx,.28,cz);C.scene.add(bl);S.pitch.ball=bl;S.pitch.bx=cx;S.pitch.bz=cz;
 C.label('⚽ Match in progress',cx,5,cz-26,.9);
 S.out.push({out:true,pitch:true,x:cx,z:cz+4,r:46,snooze:0,sc:{kind:'football'}});
 mkOut('hustle',cx+39,cz+30,1,'pitch')}
function updPitch(dt){var P=S.pitch;if(!P)return;var m=me();if(Math.hypot(m.x-P.cx,m.z-P.cz)>150)return;
 var b=P.ball,bx=P.bx,bz=P.bz;bx+=P.bv.x*dt;bz+=P.bv.z*dt;P.bv.x*=Math.pow(.4,dt);P.bv.z*=Math.pow(.4,dt);
 if(bx<P.cx-P.hw){bx=P.cx-P.hw;P.bv.x=Math.abs(P.bv.x)}if(bx>P.cx+P.hw){bx=P.cx+P.hw;P.bv.x=-Math.abs(P.bv.x)}if(bz<P.cz-P.hd+4){bz=P.cz-P.hd+4;P.bv.z=Math.abs(P.bv.z)}if(bz>P.cz+P.hd+4){bz=P.cz+P.hd+4;P.bv.z=-Math.abs(P.bv.z)}
 P.bx=bx;P.bz=bz;b.position.set(bx,.28,bz);
 P.pl.forEach(function(q){q.cd-=dt;var dx=bx-q.x,dz=bz-q.z,d=Math.hypot(dx,dz)||1;var v=d>1.2?3.8:0;q.h+=(function(a){while(a>Math.PI)a-=6.283;while(a<-Math.PI)a+=6.283;return a})(Math.atan2(dx,dz)-q.h)*Math.min(1,dt*8);q.sp+=(v-q.sp)*Math.min(1,dt*5);
  q.x+=Math.sin(q.h)*q.sp*dt;q.z+=Math.cos(q.h)*q.sp*dt;q.x=Math.max(P.cx-P.hw,Math.min(P.cx+P.hw,q.x));q.z=Math.max(P.cz-P.hd+4,Math.min(P.cz+P.hd+4,q.z));
  if(d<1.4&&q.cd<=0){q.cd=.9;var tx=(q.side?-1:1)*P.hw-(q.x-P.cx),tz=rnd(-6,6)+P.cz+4-q.z,dd=Math.hypot(tx,tz)||1,pw=rnd(8,13);P.bv.x=tx/dd*pw;P.bv.z=tz/dd*pw}
  q.p.g.position.set(q.x,0,q.z);q.p.g.rotation.y=q.h;q.p.anim(q.sp,dt)})}

/* =============== PER-FRAME =============== */
var sorryTimerT=0;
S.busy=function(){return S.card};
NF.streetTick=function(dt){if(!ensure()||!C.started())return;
 if(!S.init){S.init=true;try{buildOutdoor()}catch(e){if(window.console)console.log('street outdoor',e)}if(isBad()){S.rep=Math.max(S.rep,3);S.dress(me().p);S.gear(me().p,S.weapon)}}
 if(S.jail){jailTick(dt);return}
 var m=me(),l=L(),inside=!!(l&&l.cur);
 /* police */
 if(S.wanted){
  if(inside){S.hide+=dt;if(S.hide>=5){escape('✅ The police lost you. You slipped away.')}updWanted()}
  else{S.hide=0;var far=true,tgtList=[m].concat(crewNear());
   S.cops.forEach(function(c){var tg=m,td=Math.hypot(m.x-c.x,m.z-c.z);crewNear().forEach(function(q){var dq=Math.hypot(q.x-c.x,q.z-c.z);if(dq<td-6){tg=q;td=dq}});
    var dx=tg.x-c.x,dz=tg.z-c.z,d=Math.hypot(dx,dz)||1,rid=m.riding&&tg===m;c.h+=(function(a){while(a>Math.PI)a-=6.283;while(a<-Math.PI)a+=6.283;return a})(Math.atan2(dx,dz)-c.h)*Math.min(1,dt*8);c.sp+=(c.v-c.sp)*Math.min(1,dt*3);
    c.x+=Math.sin(c.h)*c.sp*dt;c.z+=Math.cos(c.h)*c.sp*dt;C.resolve(c,.4);c.p.g.position.set(c.x,0,c.z);c.p.g.rotation.y=c.h;c.p.anim(c.sp,dt);
    if(d<1.7&&!rid){if(tg===m)busted();else{tg.crew=false;tg.follow=false;tg.gone=true;tg.p.g.visible=false;tg.arrested=true;S.crew=S.crew.filter(function(z){return z!==tg});if(tg.c&&tg.c.mem)tg.c.mem.angry=1;toast('🚓 '+tg.name+' was arrested!')}}
    if(Math.hypot(m.x-c.x,m.z-c.z)<90)far=false});
   S.away=far?S.away+dt:0;if(S.away>6)escape('✅ You ran far enough. The police gave up.')}}
 /* weapon swing and gangster reputation */
 [me()].concat(C.npcs.filter(function(n){return n.swT>0})).forEach(function(n){if(n.swT>0){n.swT-=dt;var u=n.swG?1:Math.sin(Math.max(0,.5-n.swT)*Math.PI*4);if(n.p&&n.p.arms)n.p.arms[1].sh.rotation.x=n.swG?-1.5:-1.2-1.6*Math.abs(u)}});
 if(isBad()&&!inside){S.repT=(S.repT||0)-dt;if(S.repT<=0){S.repT=7+Math.random()*7;var bn=null,bd=14;C.npcs.forEach(function(n){var d=Math.hypot(n.x-m.x,n.z-m.z);if(!n.gone&&!n.crew&&d<bd){bd=d;bn=n}});if(bn)C.bubble(bn,pick(S.rep>=6?['Na him be that gangster o!','Abeg, avoid that guy.','Respect, boss!']:['See that guy with stick...','Hmm, he looks dangerous.','Let us pass this side.']),3000)}}
 /* tipsy wears off */
 if(S.tipsy>0)S.tipsy-=dt*1.5;
 /* sorry timers (people who insulted you may apologise later) */
 C.npcs.forEach(function(n){if(n.snoozeT>0){n.snoozeT-=dt;if(n.snoozeT<=0)n.snooze=0}
  if(n.sorryT>0&&!n.gone){n.sorryT-=dt;if(n.sorryT<=0){n.sorryT=0;if(Math.hypot(n.x-m.x,n.z-m.z)<30){n.stage='sorry';n.say=pick(SORRY);n.mood='lively';n.eng=10;C.bubble(n,n.say.replace(/"/g,''),4500);toast('🙂 '+n.name+' wants to apologise')}}}});
 updPitch(dt);
 /* outdoor scene cards */
 if(!inside&&!S.over){
  if(S.card&&S.cur&&S.cur.out){if(Math.hypot(m.x-S.cur.x,m.z-S.cur.z)>(S.cur.r||3.2)+4){S.card=false;S.cur=null;C.hideCard()}}
  else if(!S.card&&!C.cardBusy()&&!m.riding){var best=null,bd=1e9;S.out.forEach(function(o){if(o.snooze>0){o.snooze-=dt;return}var d=Math.hypot(m.x-o.x,m.z-o.z);if(d<(o.r||3.2)&&d<bd){bd=d;best=o}});
   if(best){S.cur=best;S.card=true;var h=sceneHTML(best,true);if(h)C.showCard(h,true);else S.card=false}}}
 else if(inside&&S.card&&S.cur&&S.cur.out){S.card=false;S.cur=null}
 else if(!inside&&S.card&&!S.cur){/* e.g. busted card: stays until OK */}
 if(S.card&&inside&&!(l.cur&&S.cur))S.card=!!S.cur&&false;
 updWanted()};
/* the busted card and other global cards use the S: prefix */
S.outActRoute=function(a){if(a==='skipjail'){release();return}if(a==='jwork'){if(S.jail&&!(S.jail.work>0)&&!(S.jail.down>0)){S.jail.work=10;jailCard('Breaking stones for the warden…')}return}if(a==='ok'){S.card=false;S.cur=null;C.hideCard();return}S.outAct(a)};

/* =============== PHONE APPS: HUSTLE + PROFILE =============== */
function here(id){var H=HUS[id],l=L(),m=me();if(!H)return false;if(l&&l.cur)return l.cur.b.name===H.place;var pl=null;for(var i=0;i<C.places.length;i++)if(C.places[i].name===H.place)pl=C.places[i];if(!pl)return false;return Math.abs(m.x-pl.x)<pl.w/2+8&&Math.abs(m.z-pl.z)<pl.d/2+8}
S.hustleApp=function(){if(!ensure())return;var P=NF.phone;if(!P||!P.showApp)return;P.app='hu';
 var h='<div class="wa"><div class="wahead"><b style="font-size:18px">💼 Hustle</b></div><div class="walist" style="padding:8px 10px">';
 Object.keys(HUS).forEach(function(id){var H=HUS[id];if(H.gang&&!S.joined)return;var ok=here(id);h+='<div class="wrow" style="display:block"><b>'+H.t+'</b><span style="display:block;opacity:.8;font-size:12px">📍 '+H.place+' · ₦'+H.pay.toLocaleString('en-NG')+' · '+Math.round(H.min/60*10)/10+' h'+(H.need?' · Knowledge '+H.need+'+':'')+(H.risk?' · ⚠ risky':'')+'</span><button class="qk" data-h="'+id+'" style="margin-top:6px">'+(ok?'Work now':'📍 Go there')+'</button></div>'});
 h+='<div class="wanone" style="padding:10px;font-size:12px">Tip: study in the library to raise Knowledge for better-paying jobs.</div></div></div>';P.showApp(h);
 Array.prototype.forEach.call(document.querySelectorAll('#ph-app [data-h]'),function(b){b.onclick=function(){var id=b.getAttribute('data-h');if(here(id)){P.hide();S.cur={out:!(L()&&L().cur),sc:{kind:'hustle',g:id}};doHustle(id)}else{var l=L();if(l&&l.cur){if(NF.toast)NF.toast('You are inside a building. Go outside first.');return}P.hide();if(NF.goTo)NF.goTo(HUS[id].place)}}})};
S.profileApp=function(){if(!ensure())return;var P=NF.phone;if(!P||!P.showApp)return;P.app='pf';var l=L(),pr=NF.profile||{};
 var rows=[['Life path',isBad()?'😈 Gangster life':'😇 Good student'],['School',pr.short||'—'],['Respect',S.rep],['Knowledge',S.know],['Peace',S.peace],['Prison beatings',S.beaten||0],['Heat (police interest)',S.heat],['Crew',S.crew.length+'/3'],['Hustles done',S.jobs+' (₦'+S.earned.toLocaleString('en-NG')+')'],['Fines paid','₦'+S.fines.toLocaleString('en-NG')],['Classes attended / missed',(l?l.attended:0)+' / '+(l?l.missed:0)],['Wanted',S.wanted?'Yes, run!':'No']];
 P.showApp('<div class="wa"><div class="wahead"><b style="font-size:18px">🧑🏾 Profile</b></div><div class="walist" style="padding:8px 10px">'+rows.map(function(r){return '<div class="wrow" style="display:flex;justify-content:space-between"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>'}).join('')+'<div class="wanone" style="padding:10px;font-size:12px">These numbers are tracked now. Exams and results that use them come later.</div></div></div>')};
})();
