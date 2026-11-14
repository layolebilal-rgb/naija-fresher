/* Naija Fresher 3D - in-game phone (frontend): home screen, WhatsApp, Contacts, Wallet.
   Loaded BEFORE game.js. Talks to the game through the shared object window.NF. */
(function(){
var NF=window.NF=window.NF||{};
function $(i){return document.getElementById(i)}
function pick(a){return a[(Math.random()*a.length)|0]}
function hhmm(){var d=new Date();return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
var P=NF.phone={contacts:[],open:false,app:'home',cur:null};
try{P.contacts=JSON.parse(localStorage.getItem('nf_contacts_v2')||'[]')}catch(e){P.contacts=[]}
function save(){try{localStorage.setItem('nf_contacts_v2',JSON.stringify(P.contacts))}catch(e){}}
P.save=save;
function unread(){return P.contacts.reduce(function(a,c){return a+(c.unread||0)},0)}
function badge(){var n=unread(),b=$('phbadge');if(b){b.textContent=n;b.style.display=n>0?'inline-block':'none'}
 var w=document.querySelector('#ph .app[data-app=wa] .bd');if(w){w.textContent=n;w.style.display=n>0?'block':'none'}}
/* ---- bot (practice only, real players come at launch) ---- */
function botReply(c,t){t=t.toLowerCase();
 if(/\b(hi|hello|hey|yo|good (morning|afternoon|evening))\b/.test(t))return pick(['Heyy! 😄 How far?','Hello o! I was just about to text you.','Hi! Wetin dey happen?']);
 if(/(how are you|how you|how body|how far|wetin dey)/.test(t))return pick(['I dey o, just dey rush for class. You?','Body dey inside cloth 😂 you?','Doing fine, just tired from lectures.']);
 if(/(dept|department|course|study|faculty|level)/.test(t))return 'I\'m in '+c.dept+' ('+c.lvl+'L). You?';
 if(/(meet|library|hangout|hang out|come|see you|where)/.test(t))return 'Okay! Let\'s meet at '+pick(['the Library','the Cafeteria','Campus Market','the Park','the Faculty gate'])+' later 😄';
 if(/(thank|thanks)/.test(t))return pick(['No wahala!','You\'re welcome 😊','Anytime!']);
 if(/(bye|later|gtg|goodnight|good night)/.test(t))return pick(['Alright, take care! 👋','Okay o, talk later!','Bye bye 😊']);
 if(/(food|hungry|eat|rice|bread)/.test(t))return pick(['Abeg, I\'m hungry too. Let\'s go to the cafeteria!','Rice and stew? I\'m in 😂']);
 if(/(class|lecture|test|exam|read|assignment)/.test(t))return pick(['Exams are no joke o. Have you started reading?','That assignment is wahala 😩','Don\'t be late, the lecturer locks the door!']);
 if(/(love|miss|cute)/.test(t))return pick(['Aww 😊 you\'re sweet.','Hehe 😄 careful o!']);
 return pick(['😂 Really?','Hmm, tell me more.','Haha, true!','Okay o 👍','I hear you.','Wow! 😮']);}
var INC=['Where are you now?','Abeg, are you coming to class today?','Did you read for the test?','Let\'s meet at the cafeteria 😄','Long time! How far?','Check this out 😂'];
/* ---- contacts ---- */
P.add=function(n){if(n.c)return n.c;var c={name:n.name,lvl:n.lvl,dept:n.dept,num:n.num||null,friend:!!n.friend,mood:n.mood,msgs:[],unread:0};P.contacts.push(c);n.c=c;save();
 setTimeout(function(){addIncoming(c,'Hey! It\'s '+c.name+' 😊 Nice meeting you on campus.',true)},5000);return c};
function addIncoming(c,text,quiet){var m={me:false,t:text,time:hhmm()};c.msgs.push(m);save();
 if(P.open&&P.app==='chat'&&P.cur===c){addBubble(m)}else{c.unread=(c.unread||0)+1;badge();if(NF.toast&&!quiet)NF.toast('💬 '+c.name+': '+text);else if(NF.toast)NF.toast('💬 New message from '+c.name);if(P.open&&P.app==='wa')renderWA()}}
setInterval(function(){if(P.contacts.length&&Math.random()<.7)addIncoming(pick(P.contacts),pick(INC))},70000);
/* ---- DOM ---- */
var root=document.createElement('div');root.id='ph';
root.innerHTML='<div class="phframe"><div class="phstatus"><span class="phtime">'+hhmm()+'</span><span>📶 🔋</span></div><div class="phscreen"><div id="ph-home"></div><div id="ph-app" hidden></div></div><div class="phbar"><button id="ph-back" aria-label="Back">◀</button><button id="ph-homebtn" aria-label="Home">●</button><button id="ph-close" aria-label="Close phone">✕</button></div></div>';
document.body.appendChild(root);
var APPS=[['wa','💬','WhatsApp','#25d366'],['ct','👥','Contacts','#3b82f6'],['rd','🚖','Rides','#f59e0b'],['tt','📅','Timetable','#8b5cf6'],['ck','⏰','Clock','#64748b'],['gm','🎮','Games','#ef4444'],['cm','📚','Comics','#ec4899'],['fl','✈️','Flights','#0ea5e9'],['bk','🏦','Bank','#6366f1'],['mp','🗺️','Maps','#10b981']];
function renderHome(){P.app='home';P.cur=null;$('ph-app').hidden=true;$('ph-app').innerHTML='';var h=$('ph-home');h.hidden=false;
 h.innerHTML=APPS.map(function(a){return '<button class="app" data-app="'+a[0]+'"><i style="background:'+a[3]+'">'+a[1]+'</i>'+a[2]+(a[0]==='wa'?'<span class="bd" style="display:none"></span>':'')+'</button>'}).join('');
 badge();Array.prototype.forEach.call(h.querySelectorAll('.app'),function(b){b.onclick=function(){openApp(b.getAttribute('data-app'))}})}
function showApp(html){P.cur=null;$('ph-home').hidden=true;var a=$('ph-app');a.hidden=false;a.innerHTML=html}
function openApp(k){
 if(k==='wa')renderWA();else if(k==='ct')renderContacts();else if(k==='bk')renderBank();else if(k==='gm')renderGames();else if(k==='tt')renderTT();else if(k==='ck')renderClock();else if(k==='cm'){NF.openGame('comics')}else if(k==='fl')renderFlights();else if(k==='rd')renderRides();
 else if(k==='mp'){P.hide();if(NF.openMap)NF.openMap()}
 else if(NF.toast)NF.toast('Coming soon')}
function renderWA(){P.app='wa';var h='<div class="wa"><div class="wahead"><b style="font-size:18px">WhatsApp</b></div><div class="walist">';
 if(!P.contacts.length)h+='<div class="wanone">No chats yet.<br>Walk up to someone on campus, say hi and ask for their number.</div>';
 P.contacts.slice().reverse().forEach(function(c){var l=c.msgs[c.msgs.length-1];h+='<div class="wrow" data-i="'+P.contacts.indexOf(c)+'"><div class="av">'+esc(c.name[0])+'</div><div class="wm1"><b>'+esc(c.name)+(c.friend?' ✅':'')+'</b><span>'+(l?esc((l.me?'You: ':'')+l.t):'Say hi 👋')+'</span></div>'+(c.unread?'<em class="ub">'+c.unread+'</em>':'')+'</div>'});
 showApp(h+'</div></div>');Array.prototype.forEach.call($('ph-app').querySelectorAll('.wrow'),function(e){e.onclick=function(){openChat(P.contacts[+e.getAttribute('data-i')])}})}
function near(el){return el.scrollHeight-el.scrollTop-el.clientHeight<90}
function toBottom(){var m=$('wamsgs');if(m)m.scrollTop=m.scrollHeight}
function addBubble(m){var box=$('wamsgs');if(!box)return;var was=near(box),d=document.createElement('div');d.className='wmsg '+(m.me?'me':'them');d.innerHTML=esc(m.t)+'<small>'+(m.time||'')+(m.me?' ✓✓':'')+'</small>';box.appendChild(d);if(was||m.me)toBottom()}
function setSt(t){var e=$('wast');if(e)e.textContent=t}
function openChat(c){P.app='chat';P.cur=c;c.unread=0;save();badge();
 if(!c.msgs.length)c.msgs.push({me:false,t:'Hey! It\'s '+c.name+' 😊',time:hhmm()});
 showApp('<div class="wa"><div class="wahead"><button class="wb" id="wabk">←</button><div class="av">'+esc(c.name[0])+'</div><div class="wm1"><b>'+esc(c.name)+'</b><span id="wast">online</span></div></div><div class="wamsgs" id="wamsgs"></div><div class="waqk">'+['Hi 👋','How far?','Which department?','Let\'s meet at the library','Thanks!','Bye'].map(function(q){return '<button class="qk">'+q+'</button>'}).join('')+'</div><div class="wainp"><input id="wain" type="text" placeholder="Message" enterkeyhint="send" autocomplete="off" autocapitalize="sentences"><button id="wasend" aria-label="Send">➤</button></div></div>');
 P.cur=c;c.msgs.forEach(addBubble);toBottom();
 $('wabk').onclick=renderWA;var inp=$('wain');
 function send(t){t=(t||'').trim();if(!t)return;var m={me:true,t:t,time:hhmm()};c.msgs.push(m);addBubble(m);inp.value='';save();
  setTimeout(function(){if(P.cur===c&&P.app==='chat')setSt('typing…')},450);
  setTimeout(function(){var r={me:false,t:botReply(c,t),time:hhmm()};c.msgs.push(r);save();if(P.open&&P.cur===c&&P.app==='chat'){addBubble(r);setSt('online')}else{c.unread=(c.unread||0)+1;badge()}},1300+Math.random()*1300)}
 $('wasend').onclick=function(){send(inp.value);inp.focus()};
 inp.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();send(inp.value)}};
 Array.prototype.forEach.call(document.querySelectorAll('#ph .qk'),function(b){b.onclick=function(){send(b.textContent)}});
 inp.addEventListener('focus',function(){[60,250,500].forEach(function(t){setTimeout(function(){fit();toBottom()},t)})})}
P.openChat=function(c){P.show();openChat(c)};
function renderContacts(){P.app='ct';var h='<div class="wa"><div class="wahead"><b style="font-size:18px">Contacts</b></div><div class="walist">';
 if(!P.contacts.length)h+='<div class="wanone">No contacts yet.</div>';
 P.contacts.forEach(function(c,i){h+='<div class="wrow" data-i="'+i+'"><div class="av">'+esc(c.name[0])+'</div><div class="wm1"><b>'+esc(c.name)+(c.friend?' ✅':'')+'</b><span>'+(c.num?'📞 '+esc(c.num):'No number')+' · '+c.lvl+'L '+esc(c.dept)+'</span></div></div>'});
 showApp(h+'</div></div>');Array.prototype.forEach.call($('ph-app').querySelectorAll('.wrow'),function(e){e.onclick=function(){openChat(P.contacts[+e.getAttribute('data-i')])}})}
function renderTT(){P.app='tt';var Lf=NF.life,h='<div class="wa"><div class="wahead"><b style="font-size:18px">📅 Timetable</b></div><div class="walist"><div class="rdh">'+esc(NF.clockText?NF.clockText():'')+' · classes today</div>';
 (Lf?Lf.timetable():[]).forEach(function(c){var col={attended:'#16a34a',missed:'#ef4444',now:'#f59e0b',upcoming:'#475569'}[c.status]||'#475569',lb={attended:'Attended ✅',missed:'Missed ❌',now:'Now',upcoming:'Upcoming'}[c.status];
  h+='<div class="wrow"><div class="wm1"><b>'+esc(c.code)+' · '+esc(c.name)+'</b><span>'+c.s+' – '+c.e+' · '+esc(c.place)+' · '+esc(c.lec)+'</span></div><em class="ub" style="background:'+col+'">'+lb+'</em></div>'});
 showApp(h+'<div class="wanone">Lecturers lock the door 15 minutes after class starts. Be early.</div></div></div>')}
function renderClock(){P.app='ck';var Lf=NF.life;if(!Lf)return;showApp('<div class="wa"><div class="wahead"><b style="font-size:18px">⏰ Clock</b></div><div class="walist"><div class="bal">'+esc(NF.clockText())+'<b>Alarm '+Lf.hm(Lf.alarm)+'</b></div><div style="display:flex;gap:8px;margin:0 12px"><button class="rdbtn" style="margin:6px 0" data-d="-30">−30</button><button class="rdbtn" style="margin:6px 0" data-d="-5">−5</button><button class="rdbtn" style="margin:6px 0" data-d="5">+5</button><button class="rdbtn" style="margin:6px 0" data-d="30">+30</button></div><div class="wanone">The alarm rings when you are asleep. Sleep on your bed to skip time.</div></div></div>');
 bindRows('button[data-d]',function(e){Lf.setAlarm(Lf.alarm+parseInt(e.getAttribute('data-d'),10));renderClock()})}
function renderGames(){P.app='gm';var h='<div class="wa"><div class="wahead"><b style="font-size:18px">🎮 Games</b></div><div class="walist">';
 (NF.games||[]).forEach(function(g){if(g.id==='comics')return;h+='<div class="wrow gmr" data-g="'+g.id+'"><div class="av" style="font-size:20px">'+g.e+'</div><div class="wm1"><b>'+esc(g.n)+'</b><span>'+esc(g.d)+'</span></div></div>'});
 showApp(h+'</div></div>');bindRows('.gmr',function(e){NF.openGame(e.getAttribute('data-g'))})}
function naira(n){return '₦'+Number(n).toLocaleString('en-NG')}
function renderBank(){P.app='bk';var m=NF.getMoney?NF.getMoney():0,h='<div class="wa"><div class="wahead"><b style="font-size:18px">🏦 Bank</b></div><div class="walist"><div class="bal">Student account<b>'+naira(m)+'</b></div><div class="rdh">Recent activity</div>';
 var tx=(NF.txns||[]).slice().reverse();if(!tx.length)h+='<div class="wanone">No transactions yet.</div>';
 tx.forEach(function(t){h+='<div class="wrow"><div class="wm1"><b>'+esc(t.t)+'</b><span>'+t.time+(t.bal!=null?' · Balance '+naira(t.bal):'')+'</span></div><em class="ub" style="background:'+(t.amt<0?'#ef4444':'#16a34a')+'">'+(t.amt<0?'-':'+')+naira(Math.abs(t.amt))+'</em></div>'});
 showApp(h+'</div></div>')}
function renderFlights(){P.app='fl';var at=NF.atAirport&&NF.atAirport(),h='<div class="wa"><div class="wahead"><b style="font-size:18px">✈️ Flights</b></div><div class="walist"><div class="rdh">You are in: '+esc(NF.city||'Home campus')+'</div>';
 if(!at){h+='<div class="wanone">You must be at the airport to board.<br>Order a ride to <b>Airport Terminal</b>.</div><button class="rdbtn" id="flride">🚖 Ride to the airport</button>'}
 else{var l=NF.flights.slice();if(NF.city!=='Home campus')l.unshift(null);
  l.forEach(function(f,i){var idx=f?NF.flights.indexOf(f):-1;if(f&&f.city===NF.city)return;h+='<div class="wrow flr" data-i="'+idx+'"><div class="av">🛫</div><div class="wm1"><b>'+(f?esc(f.city):'Back home')+'</b><span>'+(f?esc(f.uni):'Your own campus')+'</span></div><em class="ub" style="background:#0ea5e9">'+naira(f?f.fare:8000)+'</em></div>'})}
 showApp(h+'</div></div>');var rb=$('flride');if(rb)rb.onclick=function(){renderRideKinds('Airport Terminal')};
 bindRows('.flr',function(e){renderFlightPay(+e.getAttribute('data-i'))})}
function renderFlightPay(i){P.app='fl2';var f=i<0?{city:'Home campus',uni:'Your own campus',fare:8000}:NF.flights[i],m=NF.getMoney();
 showApp('<div class="wa"><div class="wahead"><b style="font-size:16px">Book flight</b></div><div class="walist"><div class="bal">Flight to '+esc(f.city)+'<b>'+naira(f.fare)+'</b>'+esc(f.uni)+'<br>Bank balance: '+naira(m)+'</div><div class="rdmsg" id="rdmsg"></div><button class="rdbtn" id="rdpay">🏦 Pay '+naira(f.fare)+' and fly</button></div></div>');
 $('rdpay').onclick=function(){var r=NF.bookFlight(i);if(r.ok)P.hide();else $('rdmsg').textContent=r.msg}}
var RS={name:null};
function bindRows(sel,fn){Array.prototype.forEach.call($('ph-app').querySelectorAll(sel),function(e){e.onclick=function(){fn(e)}})}
function renderRides(){P.app='rd';var l=NF.ridePlaces?NF.ridePlaces():[];var h='<div class="wa"><div class="wahead"><b style="font-size:18px">🚖 Rides</b></div><div class="walist"><div class="rdh">Where to? (nearest first)</div>';
 l.forEach(function(p){h+='<div class="wrow rdp" data-n="'+esc(p.name)+'"><div class="av">📍</div><div class="wm1"><b>'+esc(p.name)+'</b><span>'+p.dist+' m away</span></div></div>'});
 showApp(h+'</div></div>');bindRows('.rdp',function(e){renderRideKinds(e.getAttribute('data-n'))})}
function renderRideKinds(name){P.app='rd2';RS.name=name;var h='<div class="wa"><div class="wahead"><b style="font-size:16px">To '+esc(name)+'</b></div><div class="walist"><div class="rdh">Choose a ride</div>';
 ['Keke','Bus','Bike'].forEach(function(k){var q=NF.rideQuote(name,k),ic={Keke:'🛺',Bus:'🚌',Bike:'🏍️'}[k];if(q)h+='<div class="wrow rdk" data-k="'+k+'"><div class="av">'+ic+'</div><div class="wm1"><b>'+k+'</b><span>about '+q.secs+' sec · '+q.len+' m</span></div><em class="ub" style="background:#25d366;color:#06281a">'+naira(q.fare)+'</em></div>'});
 showApp(h+'</div></div>');bindRows('.rdk',function(e){renderRidePay(name,e.getAttribute('data-k'))})}
function renderRidePay(name,k){P.app='rd3';var q=NF.rideQuote(name,k),m=NF.getMoney();
 showApp('<div class="wa"><div class="wahead"><b style="font-size:16px">Pay with Bank</b></div><div class="walist"><div class="bal">'+k+' to '+esc(name)+'<b>'+naira(q.fare)+'</b>Bank balance: '+naira(m)+'</div><div class="rdmsg" id="rdmsg"></div><button class="rdbtn" id="rdpay">🏦 Pay '+naira(q.fare)+' and ride</button></div></div>');
 $('rdpay').onclick=function(){var r=NF.orderRide(name,k);if(r.ok)P.hide();else $('rdmsg').textContent=r.msg}}
/* ---- open / close / keyboard fit ---- */
function fit(){if(!P.open)return;var vv=window.visualViewport,H=vv?vv.height:innerHeight,kb=vv?Math.max(0,innerHeight-vv.height-vv.offsetTop):0;
 root.style.setProperty('--phh',Math.max(200,Math.min(640,H-14))+'px');root.style.bottom='calc('+(6+kb)+'px + env(safe-area-inset-bottom,0px))';root.classList.toggle('tight',H<430)}
if(window.visualViewport){visualViewport.addEventListener('resize',function(){fit();toBottom()});visualViewport.addEventListener('scroll',fit)}
addEventListener('resize',function(){fit();toBottom()});
P.show=function(){if(P.open)return;P.open=true;root.classList.add('on');renderHome();fit();requestAnimationFrame(function(){root.classList.add('show')});if(NF.onPhone)NF.onPhone(true)};
P.hide=function(){if(!P.open)return;P.open=false;root.classList.remove('show');try{if(document.activeElement)document.activeElement.blur()}catch(e){}setTimeout(function(){if(!P.open)root.classList.remove('on')},230);if(NF.onPhone)NF.onPhone(false)};
P.toggle=function(){P.open?P.hide():P.show()};
$('ph-close').onclick=P.hide;$('ph-homebtn').onclick=renderHome;
$('ph-back').onclick=function(){if(P.app==='chat')renderWA();else if(P.app==='fl2')renderFlights();else if(P.app==='rd3')renderRideKinds(RS.name);else if(P.app==='rd2')renderRides();else if(P.app==='home')P.hide();else renderHome()};
var bp=$('bphone');if(bp)bp.addEventListener('click',P.toggle);
setInterval(function(){var e=root.querySelector('.phtime');if(e)e.textContent=hhmm()},20000);
badge();
})();
