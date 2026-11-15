/* chat.js — FRONTEND. Friend replies that answer what you actually said.
   This is a rule-based "practice brain" (no internet, no AI service). It understands greetings, questions about you,
   plans to meet, money, food, class, exams, parties, fights, insults and apologies, and remembers a little.
   Real chat with real players comes later with Supabase. Used by phone.js through NF.chat.reply(contact,text,env). */
(function(){
var NF=window.NF=window.NF||{};
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function hash(s){var h=7;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}
var PLACES=[
 [/\b(cafe|cafeteria|canteen|bukka|eat(ing)? place)\b/,'Cafeteria'],[/\blibrary\b/,'Main Library'],[/\b(market|stalls?)\b/,'Campus Market'],[/\bpark\b/,'Campus Park'],
 [/\b(sports|pitch|field|football|stadium)\b/,'Sports Complex'],[/\bmosque\b/,'Central Mosque'],[/\b(chapel|church)\b/,'Chapel'],[/\bbook ?shop\b/,'Bookshop'],
 [/\b(clinic|medical|hospital|sick bay)\b/,'Medical Centre'],[/\bbank\b/,'Campus Bank'],[/\b(gate|main gate)\b/,'Main Gate'],[/\b(lt ?1|lecture theatre 1)\b/,'Lecture Theatre 1'],
 [/\b(lt ?2|lecture theatre 2)\b/,'Lecture Theatre 2'],[/\bsenate\b/,'Senate Building'],[/\badmin\b/,'Admin Block'],[/\b(computer science|csc)\b/,'Computer Science'],
 [/\bsocial science\b/,'Faculty of Social Science'],[/\blaw (faculty|building)|faculty of law\b/,'Faculty of Law'],[/\bengineering\b/,'Faculty of Engineering'],[/\bairport\b/,'Airport Terminal']];
function placeIn(t){for(var i=0;i<PLACES.length;i++)if(PLACES[i][0].test(t))return PLACES[i][1];return null}
function clock(m){m=Math.floor(m)%1440;var h=Math.floor(m/60),mm=m%60,ap=h>=12?'PM':'AM';h=h%12;if(h===0)h=12;return h+':'+('0'+mm).slice(-2)+' '+ap}
/* each friend has a fixed personality and a weekday class pattern built from their name */
function persona(c){if(c._p)return c._p;var h=hash(c.name+c.dept);var p={temper:(c.mood==='aggressive'?60:10)+h%40,party:(h>>3)%100,study:(h>>5)%100,broke:(h>>7)%100,gist:(h>>9)%100,
  slot:[480,600,720,840,960][(h>>11)%5],slot2:[600,720,840,960,1080][(h>>13)%5]};c._p=p;return p}
function inClass(c,env){if(env.day>4)return null;var p=persona(c),m=env.min;if(m>=p.slot&&m<p.slot+120)return p.slot+120;if(m>=p.slot2&&m<p.slot2+120)return p.slot2+120;return null}
function timeWord(t){var m=t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);if(m){var h=+m[1]%12+(m[3]==='pm'?12:0);return h*60+(m[2]?+m[2]:0)}
 var d=t.match(/\bin (\d{1,3}) ?(min|mins|minutes)\b/);if(d)return {rel:+d[1]};if(/\b(now|right now|asap|immediately)\b/.test(t))return {rel:10};if(/\b(later|soon)\b/.test(t))return {rel:60};if(/\bafter (class|lecture)\b/.test(t))return {rel:90};if(/\b(tonight|evening)\b/.test(t))return 1140;return null}
var YES=/^(yes|yeah|yep|yea|ok|okay|sure|alright|fine|deal|i will|i'll come|oya|let'?s go|sounds good|bet)\b/,NO=/^(no|nope|nah|not really|i can'?t|cannot|never)\b/;
var BAD=/\b(idiot|fool|stupid|mumu|ode|dumb|useless|nonsense|bastard|shut up|werey|olodo|mad)\b/;
function nm(c){return c.name}
function reply(c,raw,env){
 env=env||{day:0,min:480,loc:null,classes:[]};var t=(raw||'').toLowerCase().trim(),p=persona(c),mem=c.mem=c.mem||{angry:0,topic:null,q:null,money:0};
 var out=function(text,act){mem.last=text;return {text:text,act:act||null}};
 var cl=inClass(c,env),tw=timeWord(t);
 /* 1. insults and apologies first */
 if(BAD.test(t)){mem.angry=2;mem.q=null;return out(pick(p.temper>55?['Who you dey call that? Watch your mouth before I forget myself.','Ehn? You want trouble? Talk to me well.']:['That was uncalled for. I am not replying until you apologise.','Wow. I thought we were cool. Apologise.']))}
 if(mem.angry>0){if(/\b(sorry|apolog|forgive|my bad|i didn'?t mean)\b/.test(t)){if(Math.random()<.6||p.temper<40){mem.angry=0;return out(pick(['Hmm okay. Don\'t do that again.','Fine, apology accepted. We move.']))}mem.angry=1;return out('I hear you, but I\'m still vexed. Give me time.')}
  return out(mem.angry>1?'I\'m not talking to you till you apologise.':'Still vexed o. Say sorry properly.')}
 /* 2. answer a question I asked before */
 if(mem.q==='where'){var pl=placeIn(t);if(pl){mem.q=null;return meet(pl)}if(NO.test(t)){mem.q=null;return out('Okay, no wahala. Just tell me when you\'re free.')}}
 if(mem.q==='confirm'&&mem.plan){if(YES.test(t)){mem.q=null;var pl2=mem.plan;mem.plan=null;return meet(pl2,true)}if(NO.test(t)){mem.q=null;mem.plan=null;return out('Alright. Another time then.')}}
 if(mem.q==='lend'){if(YES.test(t)||/\b(thank|thanks)\b/.test(t)){mem.q=null;return out('Alright. Pay me back before the weekend o.')}if(NO.test(t)){mem.q=null;return out('Okay. I understand.')}}
 /* 3. greetings and small talk */
 if(/^(hi|hello|hey|yo|hiya|good (morning|afternoon|evening))\b/.test(t)||/\b(how far|wassup|what'?s up|how you dey)\b/.test(t)&&t.length<30){
  if(cl)return out('Hey! I\'m in lecture till '+clock(cl)+', so I\'ll reply short. What\'s up?');
  var h=Math.floor(env.min/60);return out(pick([h<12?'Good morning! You\'re up early. Class today?':h<17?'Hey! How\'s your day going so far?':'Good evening! Long day?','Hello! I was about to text you. Where are you now?','Hey hey. How far with school?']))}
 if(/how (are|r) (you|u)|how (is|\'s) (school|body|life)|how('s| is) your day|you good\??$/.test(t)){
  var mood=cl?'in class, struggling to stay awake':pick(['a bit tired, my lecturer has been heavy','fine, just managing my money','good, I just ate','stressed about assignments']);return out('I\'m '+mood+'. You?')}
 if(/(where (are|r) (you|u)|where you dey|your location)/.test(t)){if(cl)return out('I\'m in class till '+clock(cl)+'.');var l=env.friendLoc;return out(l?'I\'m around '+l+'.':pick(['I\'m around the hostels now.','Just walking around campus. Why?']))}
 if(/(what (are|r) (you|u) doing|wyd|what you dey do|busy\??)/.test(t)){return out(cl?'In class, pretending to listen 😅 free at '+clock(cl)+'.':pick(['Nothing much. Just relaxing. Any plan?','Reading small. What\'s up?','I just came out of lecture. Why?']))}
 if(/(what('s| is) your (name)|who (are|r) you)/.test(t))return out('It\'s '+nm(c)+'. Remember? '+c.lvl+' level '+c.dept+'.');
 if(/(which|what) (course|dept|department|faculty|level)|what do you study|\byour (dept|level)\b/.test(t))return out('I\'m in '+c.dept+', '+c.lvl+' level. And you?');
 /* 4. plans to meet */
 var pl3=placeIn(t),wantMeet=/\b(meet|come|link|see you|hang ?out|join me|let'?s (go|meet|link|chill)|chill|come over|i('m| am) at|pull up|come down)\b/.test(t);
 if(wantMeet||(pl3&&/\b(at|to|in)\b/.test(t)&&/\b(you|u|we|let)\b/.test(t))){
  if(cl&&!(tw&&tw.rel&&tw.rel>=cl-env.min))return out('I\'m in class till '+clock(cl)+'. After that I can meet you'+(pl3?' at '+pl3:'')+'. Is that fine?',null,mem.q='confirm',mem.plan=pl3||null);
  if(!pl3){mem.q='where';return out(pick(['Where exactly? Tell me the place.','Sure. Which place — cafeteria, library, park?']))}
  return meet(pl3)}
 function meet(place,after){
  if(p.temper>85&&Math.random()<.2)return out('I\'m not in the mood to go out now.');
  var delay=(tw&&tw.rel)||(after&&cl?cl-env.min+5:Math.max(8,Math.round(8+Math.random()*12)));
  mem.q=null;return out(pick(['Alright, I\'ll be at the '+place+' in about '+delay+' minutes.','Okay. See you at the '+place+'. Give me '+delay+' minutes.','Bet. '+place+' in '+delay+' mins, don\'t keep me waiting.']),{type:'meet',place:place,delay:delay})}
 /* 5. money */
 if(/\b(lend|borrow|loan|send me|give me|i need)\b.*\b(\d{3,6}|money|cash|naira|airtime|data)\b/.test(t)||/\b(i'?m|i am) (broke|stranded)\b/.test(t)){
  var amt=(t.match(/\b(\d{3,6})\b/)||[])[1];if(p.broke>60)return out('Me? I\'m even broke myself. Allowance hasn\'t come.');
  if(amt&&+amt>3000)return out('₦'+amt+'? That\'s too much. I can do ₦1,000 at most.');mem.q='lend';return out(pick(['I can help small. But you must pay me back. Deal?','Okay, but this is the last time o. When will you pay back?']))}
 if(/\b(i (have|got) money|i\'?ll (pay|buy)|my treat|on me)\b/.test(t)){mem.q='where';return out('Ahh, then let\'s go and eat! Where?')}
 /* 6. food, class, exams, parties, fights */
 if(/\b(food|hungry|eat|rice|jollof|suya|bread|lunch|breakfast|dinner)\b/.test(t)){mem.q='confirm';mem.plan='Cafeteria';return out(pick(['I\'m hungry too. The cafeteria jollof is not bad. Should we go?','Eh, I haven\'t eaten since morning. Cafeteria?']))}
 if(/\b(exam|test|cgpa|gpa|carry ?over|assignment|project|result)\b/.test(t))return out(p.study>55?pick(['I started reading already. Want to join me at the library?','The test is close. I made notes, you can copy.']):pick(['Don\'t even remind me. I haven\'t started reading.','Wahala. I\'ll read tonight. You?']));
 if(/\b(class|lecture|lecturer|attendance|timetable|course|gst|gns)\b/.test(t)){var cls=env.classes&&env.classes[0];return out(cl?'I\'m in one now. Lecturers lock the door after 15 minutes, so don\'t be late.':cls?'You have '+cls.code+' at '+clock(cls.s)+' ('+cls.place+'), right? Don\'t be late, they lock the door.':'No class for me right now. Are you free?')}
 if(/\b(party|club|drink|beer|alcohol|chill|hang|turn up|vibe)\b/.test(t)){if(p.party>55)return out(pick(['Now you\'re talking! Where is it? Count me in.','I\'m ready. Just tell me the time and place.']));return out('I\'ll pass. I have things to do. Maybe next time.')}
 if(/\b(fight|beat|attack|slap|deal with|teach .* lesson|revenge|shank|wound|punish)\b/.test(t)){
  if(p.temper>70){mem.q='where';return out(pick(['You want to deal with somebody? I\'m in. Where do we meet first?','Ehen. Tell me who. We meet at one place first, no noise.']))}
  return out(pick(['No, no. That will get you suspended or arrested. Let it go.','I\'m not doing that. Police will pick all of us. Calm down.']))}
 if(/\b(police|security|arrest|caught|run)\b/.test(t))return out(p.temper>70?'Don\'t worry. We run if they come.':'Careful o. Don\'t get yourself in trouble.');
 if(/\b(hustle|work|gig|side ?hustle|job|make money|earn)\b/.test(t))return out(pick(['There\'s sachet water selling at the market, or serving food at the cafeteria. Check your Hustle app.','Try the cafeteria or bookshop, they always need hands. Pay is small but steady.']));
 if(/\b(love|miss you|cute|beautiful|handsome|date|crush)\b/.test(t)){return out(p.temper>70?'Hmm. Focus on your studies first 😏':pick(['Aww, that\'s sweet. Let\'s see how you behave first 😊','Hehe. Careful o, you\'ll be distracting me in class.']))}
 if(/\b(thank|thanks|tnx|appreciate)\b/.test(t))return out(pick(['You\'re welcome.','No wahala at all.','Anytime. That\'s what friends do.']));
 if(/\b(sorry|my bad)\b/.test(t))return out('No problem. What happened?');
 if(/\b(bye|later|gtg|goodnight|good night|see you)\b/.test(t))return out(env.min>1200||env.min<330?'Goodnight. Sleep well, don\'t miss your 8am.':pick(['Alright. Take care.','Okay, talk later. Don\'t forget what we discussed.']));
 if(/\b(advice|what should i|should i|help me|what do you think)\b/.test(t))return out(pick(['Tell me the full story first, then I can say something useful.','Depends. What are the options?']));
 /* 7. yes / no with no open question */
 if(YES.test(t))return out(mem.last&&/\?$/.test(mem.last)?'Okay good. So when and where?':'Okay. What next?');
 if(NO.test(t))return out('Alright then. What else is going on?');
 /* 8. questions get a direct answer attempt; statements get a relevant follow-up */
 if(/\?$/.test(t)||/^(what|why|how|when|who|where|which|can|do|did|is|are|will)\b/.test(t)){
  var w=t.match(/^(what|why|how|when|who|where|which)/);
  return out(w?pick(['Good question. I honestly don\'t know about that one. What made you ask?','I\'m not sure. Let me think and get back to you. What do you think?']):pick(['Maybe. What is the situation?','Possibly. Why do you ask?']))}
 var nouns=t.replace(/[^a-z ]/g,'').split(' ').filter(function(x){return x.length>4&&!/(about|there|their|really|which|would|should|could|because|something)/.test(x)});
 if(nouns.length)return out(pick(['You mentioned '+nouns[0]+'. What happened with that?','So what\'s the plan with '+nouns[0]+'?','Okay, and how does '+nouns[0]+' affect you?']));
 return out(pick(['I didn\'t get that fully. Say it again?','Meaning what exactly?','Okay. And then?']))}
function incoming(c,env){var p=persona(c),cl=inClass(c,env),h=Math.floor(env.min/60);
 var pool=[];if(h>=7&&h<9)pool.push('Are you up? Don\'t miss your 8am.');if(h>=12&&h<14)pool.push('Lunch time. Cafeteria?');if(h>=17)pool.push('Free now? Let\'s link at the park.');
 if(p.study>55)pool.push('Library tonight? I want to start reading for the test.');if(p.party>60)pool.push('There\'s a small gathering later. You\'re in?');if(p.broke>60)pool.push('Abeg, you have ₦500 to spare? I\'ll pay back.');
 pool.push('Where are you now?','Long time. How is school?');return pick(pool)}
NF.chat={reply:reply,incoming:incoming,placeIn:placeIn,persona:persona};
})();
