/* sound.js — FRONTEND. All game sound, made live in the browser (no audio files needed).
   Footsteps, jump/land, doors, cash alerts, class bell, alarm, wind/birds/crowd, engines, plane rumble.
   Browsers only allow sound after the first tap, so it switches on by itself at your first touch. */
(function(){
var NF=window.NF=window.NF||{};
var S=NF.snd={on:true,ready:false};
try{if(localStorage.getItem('nf_snd')==='0')S.on=false}catch(e){}
var AC=null,mg=null,nb=null,amb={},eng=null,lfo=null,lastStep=-1,tBird=3,tHorn=25,tMurmur=4,volK=1;

function init(){
 if(AC){if(AC.state==='suspended')AC.resume();return}
 try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null;return}
 mg=AC.createGain();mg.gain.value=S.on?0.9:0;mg.connect(AC.destination);
 var n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0),last=0;
 for(var i=0;i<n;i++){var w=Math.random()*2-1;last=(last+.04*w)/1.04;d[i]=last*9}   /* soft (brown-ish) noise */
 nb=b;
 function loop(freq,type,q){var s=AC.createBufferSource();s.buffer=nb;s.loop=true;var f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q||.7;var g=AC.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(mg);s.start();return {g:g,f:f}}
 amb.wind=loop(380,'lowpass');amb.crowd=loop(650,'bandpass',.9);amb.room=loop(160,'lowpass');amb.fly=loop(700,'lowpass');
 var o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain(),am=AC.createGain();
 o.type='sawtooth';o.frequency.value=70;f.type='lowpass';f.frequency.value=380;g.gain.value=0;am.gain.value=1;
 o.connect(f);f.connect(am);am.connect(g);g.connect(mg);o.start();
 lfo=AC.createOscillator();var lg=AC.createGain();lfo.frequency.value=14;lg.gain.value=.0;lfo.connect(lg);lg.connect(am.gain);lfo.start();
 eng={o:o,f:f,g:g,am:am,lg:lg};
 S.ready=true}
['pointerdown','touchend','keydown','click'].forEach(function(ev){window.addEventListener(ev,init,{capture:true,passive:true})});

function env(g,t,a,v,dur){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t+a);g.gain.exponentialRampToValueAtTime(.0001,t+dur)}
function tone(f1,f2,dur,vol,type,delay){if(!AC||!S.on)return;var t=AC.currentTime+(delay||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f1,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
 env(g,t,.012,vol,dur);o.connect(g);g.connect(mg);o.start(t);o.stop(t+dur+.05)}
function puff(freq,q,dur,vol,type,delay,sweep){if(!AC||!S.on)return;var t=AC.currentTime+(delay||0),s=AC.createBufferSource();s.buffer=nb;var f=AC.createBiquadFilter();f.type=type||'bandpass';f.frequency.setValueAtTime(freq,t);if(sweep)f.frequency.exponentialRampToValueAtTime(sweep,t+dur);f.Q.value=q||1;
 var g=AC.createGain();env(g,t,.008,vol,dur);s.connect(f);f.connect(g);g.connect(mg);s.start(t,Math.random()*1.5);s.stop(t+dur+.05)}

var SFX={
 step:function(v,ind){puff(ind?1500:420,1.1,.09,.5*v,'bandpass');puff(ind?260:150,.8,.08,.35*v,'lowpass')},
 jump:function(){tone(260,640,.16,.16,'sine');puff(900,1,.1,.08,'bandpass')},
 land:function(){puff(160,.8,.14,.55,'lowpass');tone(110,60,.12,.15,'sine')},
 click:function(){tone(1100,900,.04,.05,'square')},
 ding:function(){tone(988,988,.22,.15,'sine');tone(1319,1319,.35,.15,'sine',.1)},
 debit:function(){tone(660,660,.18,.13,'sine');tone(494,494,.3,.13,'sine',.1)},
 door:function(){puff(500,1,.35,.28,'bandpass',0,160);tone(90,55,.2,.2,'sine',.05);tone(120,80,.14,.12,'sine',.3)},
 stairs:function(){for(var i=0;i<6;i++)puff(i%2?420:320,1,.07,.3,'bandpass',i*.15)},
 sit:function(){puff(220,.8,.18,.4,'lowpass');tone(80,50,.14,.1,'sine')},
 bell:function(){for(var i=0;i<3;i++){tone(880,880,1.1,.16,'sine',i*.7);tone(1760,1760,.8,.06,'sine',i*.7);tone(660,660,1.2,.07,'sine',i*.7)}},
 alarm:function(){for(var r=0;r<3;r++)[0,.28,.56,.84].forEach(function(d){tone(1100,1100,.18,.16,'square',r*1.4+d)})},
 good:function(){[523,659,784,1047].forEach(function(f,i){tone(f,f,.25,.12,'triangle',i*.1)})},
 bad:function(){tone(180,110,.5,.16,'sawtooth');tone(160,95,.5,.12,'sawtooth',.18)},
 pop:function(){tone(700,1000,.07,.08,'sine')},
 horn:function(){tone(400,400,.22,.05,'square');tone(480,480,.22,.04,'square',.02)},
 bird:function(){var b=1800+Math.random()*1800,n=2+((Math.random()*3)|0);for(var i=0;i<n;i++)tone(b,b*(1.3+Math.random()*.4),.07,.035,'sine',i*.1)},
 whoosh:function(){puff(300,.6,.9,.3,'bandpass',0,1800)}
};
S.play=function(n,v){if(!AC||!S.on||!SFX[n])return;try{SFX[n](v==null?1:v)}catch(e){}};
S.toggle=function(){S.on=!S.on;if(mg)mg.gain.value=S.on?.9:0;try{localStorage.setItem('nf_snd',S.on?'1':'0')}catch(e){}label();if(S.on){init();S.play('pop')}return S.on};
function label(){var b=document.getElementById('bsnd');if(b)b.textContent=S.on?'🔊':'🔇'}

function ramp(p,v,dt,sp){p.g.gain.value+=(v-p.g.gain.value)*Math.min(1,dt*(sp||2))}
/* called every frame by the game loop */
S.frame=function(dt,s){
 if(!AC||!S.ready)return;
 var out=!s.inside&&!s.flt&&!s.riding,hall=s.inside==='hall',host=s.inside==='hostel';
 ramp(amb.wind,out?.075:(s.riding?.05:0),dt);
 ramp(amb.crowd,out?.025:(hall?.05:0),dt);
 ramp(amb.room,s.inside?.05:0,dt);
 ramp(amb.fly,s.flt?.2:0,dt,1);
 /* engine: bus / keke / bike while riding, deep rumble in a plane */
 var ef=0,ev=0,sput=0;
 if(s.flt){ef=62;ev=.11}
 else if(s.riding){var k=s.riding;ef=k==='Bus'?52:(k==='Bike'?118:84);ev=k==='Bus'?.1:.075;sput=k==='Keke'?.5:(k==='Bike'?.2:0)}
 eng.o.frequency.value+=(ef-eng.o.frequency.value)*Math.min(1,dt*3);
 eng.f.frequency.value=s.flt?220:420;
 eng.g.gain.value+=(ev-eng.g.gain.value)*Math.min(1,dt*3);
 eng.lg.gain.value=sput*.5;lfo.frequency.value=s.riding==='Bike'?26:14;
 /* footsteps follow the legs */
 if(!s.riding&&!s.flt&&!s.air&&!s.sit&&s.speed>.7){var st=Math.floor(s.ph/Math.PI);if(st!==lastStep){lastStep=st;SFX.step(Math.min(1.2,.5+s.speed*.12),!!s.inside)}}
 else lastStep=Math.floor((s.ph||0)/Math.PI);
 /* little life outside: birds and a far horn */
 if(out){tBird-=dt;if(tBird<=0){tBird=2.5+Math.random()*6;SFX.bird()}tHorn-=dt;if(tHorn<=0){tHorn=18+Math.random()*35;SFX.horn()}}
 if(hall){tMurmur-=dt}
};
document.addEventListener('click',function(e){var t=e.target;if(t&&t.closest&&t.closest('button')&&t.id!=='bsnd')S.play('click')},true);
document.addEventListener('DOMContentLoaded',function(){label()});
setTimeout(label,300);
})();
