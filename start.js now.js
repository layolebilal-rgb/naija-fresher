/* start.js — FRONTEND. The start of the game, before the campus opens:
   boy/girl → look → university → faculty → department → courses → timetable.
   It fills NF.profile and NF.look, then calls NF.startGame(). */
(function(){
var NF=window.NF=window.NF||{};
var root=document.getElementById('start');if(!root)return;
function $(i){return document.getElementById(i)}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function hx(n){return '#'+('000000'+n.toString(16)).slice(-6)}

/* ---------- data ---------- */
var TIERS={A:'Highly rated',B:'Well rated',C:'Lower rated'};
var UNIS=[
 {n:'Babcock University',s:'Babcock',t:'A',f:['School of Computing','School of Management Sciences','School of Education and Humanities','Benjamin S. Carson College of Health and Medical Sciences','Law']},
 {n:'Afe Babalola University, Ado-Ekiti (ABUAD)',s:'ABUAD',t:'A',f:['College of Engineering','College of Sciences','College of Social and Management Sciences','College of Medicine and Health Sciences','Agriculture','Law']},
 {n:"Redeemer's University",s:'Redeemer\'s',t:'A',f:['Natural Sciences','Management and Social Sciences','Engineering','Basic Medical Sciences','Humanities']},
 {n:'Federal University of Technology, Minna (FUTMINNA)',s:'FUTMINNA',t:'A',f:['SIPET (Infrastructure and Process Engineering)','SEET (Electrical Engineering)','SICT (Information and Communication Tech)','SET (Environmental Technology)']},
 {n:'University of Abuja (UNIABUJA)',s:'UNIABUJA',t:'B',f:['Science','Engineering','Management and Social Sciences','College of Health Sciences','Agriculture','Arts','Law']},
 {n:'Ladoke Akintola University of Technology (LAUTECH)',s:'LAUTECH',t:'B',f:['Engineering and Technology','Pure and Applied Sciences','Computing and Informatics','Environmental Sciences','Agricultural Sciences']},
 {n:'Federal University of Technology, Owerri (FUTO)',s:'FUTO',t:'B',f:['SEET (Engineering)','SICT (Information and Comm Tech)','Physical and Biological Sciences','SOES (Environmental Sciences)']},
 {n:'University of Uyo (UNIUYO)',s:'UNIUYO',t:'B',f:['Engineering','Physical and Biological Sciences','Business Administration and Social Sciences','College of Health Sciences','Agriculture','Arts']},
 {n:'Usmanu Danfodiyo University, Sokoto (UDUS)',s:'UDUS',t:'B',f:['Physical and Chemical Sciences','Biological Sciences','Management and Social Sciences','College of Health Sciences','Agriculture','Law']},
 {n:'Federal University of Agriculture, Abeokuta (FUNAAB)',s:'FUNAAB',t:'B',f:['COLPLANT (Plant Science)','COLANIM (Animal Science)','COLENG (Engineering)','Physical and Biological Sciences','Veterinary Medicine']},
 {n:'Kwara State University (KWASU)',s:'KWASU',t:'C',f:['Engineering and Technology','Pure and Applied Sciences','Management and Social Sciences','Agriculture','Law']},
 {n:'Rivers State University (RSU)',s:'RSU',t:'C',f:['Engineering','Management and Social Sciences','Science','College of Medical Sciences','Agriculture','Law']},
 {n:'University of Maiduguri (UNIMAID)',s:'UNIMAID',t:'C',f:['Engineering','Physical and Life Sciences','Social and Management Sciences','College of Medical Sciences','Agriculture','Arts','Pharmacy']},
 {n:'Abubakar Tafawa Balewa University (ATBU)',s:'ATBU',t:'C',f:['Engineering and Engineering Technology','Science','Environmental Technology','Agriculture and Agricultural Technology']}];
var DEPT_RULES=[
 [/Law/,['Law']],[/Pharmacy/,['Pharmacy']],[/Veterinary/,['Veterinary Medicine']],
 [/Health|Medical|Medicine/,['Medicine and Surgery','Nursing Science','Medical Laboratory Science','Anatomy']],
 [/Computing|Computer|Informatics|Information and Comm|SICT/,['Computer Science','Software Engineering','Cyber Security','Information Technology']],
 [/Environmental|SET |SOES/,['Architecture','Estate Management','Urban and Regional Planning','Surveying and Geoinformatics']],
 [/Agri|Plant|Animal/,['Crop Science','Animal Science','Agricultural Economics','Soil Science']],
 [/Engineering|Technology|SIPET|SEET|COLENG|Infrastructure/,['Civil Engineering','Electrical Engineering','Mechanical Engineering','Chemical Engineering']],
 [/Education/,['Guidance and Counselling','Educational Management','Science Education','Early Childhood Education']],
 [/Arts|Humanities/,['English and Literary Studies','History and International Studies','Linguistics','Philosophy']],
 [/(Management|Business).*Social|Social.*(Management|Business)/,['Psychology','Economics','Accounting','Business Administration','Political Science','Sociology']],
 [/Social/,['Psychology','Political Science','Sociology','Economics']],
 [/Management|Business|Administration/,['Accounting','Business Administration','Banking and Finance','Marketing']],
 [/Science/,['Biochemistry','Microbiology','Chemistry','Physics','Mathematics','Biology']]];
var CODES={'Psychology':'PSY','Political Science':'POL','Sociology':'SOC','Economics':'ECO','Accounting':'ACC','Business Administration':'BUS','Banking and Finance':'BFN','Marketing':'MKT','Computer Science':'CSC','Software Engineering':'SEN','Cyber Security':'CYB','Information Technology':'IFT','Civil Engineering':'CVE','Electrical Engineering':'EEE','Mechanical Engineering':'MEE','Chemical Engineering':'CHE','Law':'LAW','Medicine and Surgery':'MED','Nursing Science':'NSC','Medical Laboratory Science':'MLS','Anatomy':'ANA','Biochemistry':'BCH','Microbiology':'MCB','Chemistry':'CHM','Physics':'PHY','Mathematics':'MTH','Biology':'BIO','Crop Science':'CRS','Animal Science':'ANS','Agricultural Economics':'AEC','Soil Science':'SSC','Veterinary Medicine':'VET','Architecture':'ARC','Estate Management':'ESM','Urban and Regional Planning':'URP','Surveying and Geoinformatics':'SVG','English and Literary Studies':'ENG','History and International Studies':'HIS','Linguistics':'LIN','Philosophy':'PHL','Guidance and Counselling':'GCE','Educational Management':'EDM','Science Education':'SED','Early Childhood Education':'ECE','Pharmacy':'PHM'};
var VENUES=[[/Law/,'Faculty of Law'],[/Social|Management|Business|Administration/,'Faculty of Social Science'],[/Pharmacy|Health|Medical|Medicine|Science|Natural|Physical|Biological|Life|Agri|Plant|Animal|Veterinary/,'Faculty of Science'],[/Computing|Computer|Informatics|Information|SICT/,'Computer Science'],[/Engineering|Technology|Environmental|SIPET|SEET|SOES|SET |COLENG|Infrastructure/,'Faculty of Engineering'],[/Education/,'Faculty of Education'],[/Arts|Humanities/,'Faculty of Arts']];
var LECS=['Dr. Adeyemi','Mrs. Okafor','Prof. Bello','Dr. Eze','Mr. Danjuma','Dr. Ibrahim','Mrs. Afolabi','Dr. Nwosu'];
function deptsOf(f){for(var i=0;i<DEPT_RULES.length;i++)if(DEPT_RULES[i][0].test(f))return DEPT_RULES[i][1];return ['General Studies']}
function venueOf(f){for(var i=0;i<VENUES.length;i++)if(VENUES[i][0].test(f))return VENUES[i][1];return 'Lecture Theatre 1'}
function codeOf(d){return CODES[d]||d.replace(/[^A-Za-z]/g,'').slice(0,3).toUpperCase()}
function coursesOf(d,fac){var c=codeOf(d),v=venueOf(fac);
 var names=d==='Psychology'?['Introduction to Psychology','Social Psychology I','Psychology of Learning']:['Introduction to '+d,'Principles of '+d,d+' in Nigerian Society'];
 var l=[[c+' 101',names[0],v,3],[c+' 103',names[1],v,3],[c+' 105',names[2],v,3],['GNS 101','Use of English','Lecture Theatre 2',2],['GNS 103','Nigerian Peoples and Culture','Lecture Theatre 1',2],['GST 105','Basic Computer Skills','Lecture Theatre 2',1]];
 return l.map(function(x,i){return {code:x[0],name:x[1],place:x[2],n:x[3],lec:LECS[(i+(d.length||0))%LECS.length]}})}
function seedRnd(str){var h=2166136261;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return function(){h+=0x6D2B79F5;var t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
var SLOTS=[480,600,720,840,960];
function buildTT(courses,seed){var rnd=seedRnd(seed),cells=[];for(var d=0;d<5;d++)for(var s=0;s<5;s++)cells.push([d,s]);
 var order=cells.slice(1).sort(function(){return rnd()-.5}),used={'0,0':1},out=[],byDay={};
 var sessions=[];courses.forEach(function(c){for(var k=0;k<c.n;k++)sessions.push(c)});
 var first=sessions.shift();out.push({day:0,code:first.code,name:first.name,place:first.place,lec:first.lec,s:SLOTS[0],e:SLOTS[0]+120});byDay[first.code]={0:1};
 sessions.forEach(function(c){for(var i=0;i<order.length;i++){var cl=order[i],key=cl[0]+','+cl[1];if(used[key])continue;if((byDay[c.code]||{})[cl[0]])continue;used[key]=1;(byDay[c.code]=byDay[c.code]||{})[cl[0]]=1;out.push({day:cl[0],code:c.code,name:c.name,place:c.place,lec:c.lec,s:SLOTS[cl[1]],e:SLOTS[cl[1]]+120});return}});
 out.sort(function(a,b){return a.day-b.day||a.s-b.s});return out}
NF.buildTT=buildTT;

/* ---------- state ---------- */
var S={f:false,look:null};
var LOOK_BOY={skin:0x6b4226,hair:0x111111,hairStyle:'short',hijab:0xc0392b,top:0x3498db,bottom:0x1f2a44,shoe:0xffffff,bag:0x2c3e50,shorts:false};
var LOOK_GIRL={skin:0x7a4e2e,hair:0x111111,hairStyle:'puffs',hijab:0xc0392b,top:0xff7f50,bottom:0x2d3436,shoe:0xffffff,bag:0,shorts:false};
function screen(html){root.style.display='flex';root.innerHTML='<div class="fl">'+html+'</div>'}
function step(n,t){return '<div class="fl-step">Step '+n+' of 5 · '+t+'</div>'}
function btn(id,t,cls){return '<button class="fl-btn '+(cls||'')+'" id="'+id+'">'+t+'</button>'}
function on(id,fn){var e=$(id);if(e)e.onclick=fn}

/* ---------- screens ---------- */
function title(){var saved=null;try{saved=JSON.parse(localStorage.getItem('nf_profile')||'null')}catch(e){}
 screen('<h1>Naija <b>Fresher</b></h1><p class="fl-p">Your life as a Nigerian university student, from the first day in your hostel to the lecture hall.</p>'+btn('go','New game','go')+(saved&&saved.uni?btn('cont','Continue as '+esc(saved.short)+' · '+esc(saved.dept),''):'')+'<p class="fl-small">First you create your student, choose your university, faculty and department, and register your courses. Then your first day begins in your hostel room.</p>');
 on('go',gender);on('cont',function(){NF.profile=saved;NF.look=saved.look;begin()})}
function gender(){screen(step(1,'Who are you?')+'<h2>Boy or girl?</h2>'+btn('b','👦 Boy')+btn('g','👧 Girl'));
 on('b',function(){S.f=false;S.look=JSON.parse(JSON.stringify(LOOK_BOY));creator()});on('g',function(){S.f=true;S.look=JSON.parse(JSON.stringify(LOOK_GIRL));creator()})}
var SKIN=[0x3b2417,0x5a3a22,0x7a4e2e,0x8d5a3b,0xa9714a],HAIRC=[0x111111,0x1a1008,0x2a1a10,0x5a2d12],TOP=[0xe74c3c,0x3498db,0x2ecc71,0xf1c40f,0xffffff,0x9b59b6,0xff7f50,0x1abc9c,0xe84393],BOT=[0x1f2a44,0x2d3436,0x4a5568,0x6c5ce7,0x0a3d62,0x8a6a3c],SHOE=[0xffffff,0xd63031,0x222222,0x2d98da],BAG=[0,0x2c3e50,0xe67e22,0x16a085],HIJ=[0xc0392b,0x16a085,0x8e44ad,0xf39c12];
function sw(arr,key,val){return arr.map(function(c){return '<button class="sw'+(val===c?' on':'')+'" data-k="'+key+'" data-v="'+c+'" style="background:'+(c===0&&key==='bag'?'transparent':hx(c))+'">'+(c===0&&key==='bag'?'✕':'')+'</button>'}).join('')}
function creator(){var L=S.look,hs=S.f?['long','puffs','afro','short','hijab']:['short','afro','bald'];
 screen(step(2,'Your look')+'<div id="prev" class="fl-prev"></div><div class="fl-grp">Skin</div><div class="fl-row">'+sw(SKIN,'skin',L.skin)+'</div><div class="fl-grp">Hair style</div><div class="fl-row">'+hs.map(function(h){return '<button class="chipb'+(L.hairStyle===h?' on':'')+'" data-k="hairStyle" data-v="'+h+'">'+h+'</button>'}).join('')+'</div>'+
  (L.hairStyle==='hijab'?'<div class="fl-grp">Hijab colour</div><div class="fl-row">'+sw(HIJ,'hijab',L.hijab)+'</div>':'<div class="fl-grp">Hair colour</div><div class="fl-row">'+sw(HAIRC,'hair',L.hair)+'</div>')+
  '<div class="fl-grp">Top</div><div class="fl-row">'+sw(TOP,'top',L.top)+'</div><div class="fl-grp">Trousers / skirt</div><div class="fl-row">'+sw(BOT,'bottom',L.bottom)+'</div><div class="fl-grp">Shoes</div><div class="fl-row">'+sw(SHOE,'shoe',L.shoe)+'</div><div class="fl-grp">Bag</div><div class="fl-row">'+sw(BAG,'bag',L.bag)+'</div>'+btn('next','This is me →','go'));
 var pv=$('prev');try{pv.innerHTML=NF.charSvg?NF.charSvg(L,S.f):''}catch(e){pv.textContent=''}
 Array.prototype.forEach.call(root.querySelectorAll('[data-k]'),function(b){b.onclick=function(){var k=b.getAttribute('data-k'),v=b.getAttribute('data-v');L[k]=(k==='hairStyle')?v:parseInt(v,10);var y=root.querySelector('.fl').scrollTop;creator();root.querySelector('.fl').scrollTop=y}});
 on('next',uniPick)}
function uniPick(){screen(step(3,'University')+'<h2>Choose your university</h2><p class="fl-p">You have been admitted. Pick where you want to study.</p>'+UNIS.map(function(u,i){return '<button class="fl-btn" data-i="'+i+'"><b>'+esc(u.n)+'</b></button>'}).join('')+'<p class="fl-small">More universities will be added.</p>');
 Array.prototype.forEach.call(root.querySelectorAll('[data-i]'),function(b){b.onclick=function(){S.uni=UNIS[+b.getAttribute('data-i')];faculty()}})}
function faculty(){screen(step(4,'Faculty')+'<h2>'+esc(S.uni.n)+'</h2><p class="fl-p">Choose your faculty.</p>'+S.uni.f.map(function(f,i){return '<button class="fl-btn" data-i="'+i+'">'+esc(f)+'</button>'}).join('')+btn('bk','← Back to universities'));on('bk',uniPick);
 Array.prototype.forEach.call(root.querySelectorAll('[data-i]'),function(b){b.onclick=function(){S.fac=S.uni.f[+b.getAttribute('data-i')];dept()}})}
function dept(){var ds=deptsOf(S.fac);screen(step(4,'Department')+'<h2>'+esc(S.fac)+'</h2><p class="fl-p">Choose your department.</p>'+ds.map(function(d,i){return '<button class="fl-btn" data-i="'+i+'">'+esc(d)+'</button>'}).join('')+btn('bk','← Back to faculty'));
 Array.prototype.forEach.call(root.querySelectorAll('[data-i]'),function(b){b.onclick=function(){S.dept=ds[+b.getAttribute('data-i')];register()}});on('bk',faculty)}
function register(){var cs=coursesOf(S.dept,S.fac);S.courses=cs;S.tt=buildTT(cs,S.uni.n+S.dept+(S.f?'f':'m'));
 screen(step(5,'Course registration')+'<h2>100 Level · '+esc(S.dept)+'</h2><p class="fl-p">'+esc(S.uni.n)+'<br>'+esc(S.fac)+'</p><div class="fl-grp">Your registered courses</div>'+cs.map(function(c){return '<div class="fl-course"><b>'+esc(c.code)+'</b> '+esc(c.name)+'<span>'+c.n+' class'+(c.n>1?'es':'')+' a week · '+esc(c.lec)+'</span></div>'}).join('')+'<p class="fl-small">'+S.tt.length+' classes a week. Your timetable is in the Timetable app on your phone. Classes start at 8:00 AM, so set your alarm.</p>'+'<div class="fl-grp">Choose your life</div><div class="fl-row"><button class="chipb on" id="pg">😇 Good student</button><button class="chipb" id="pb">😈 Gangster life</button></div><p class="fl-small" id="pdesc"></p>'+btn('reg','Register and start Day 1','go'));
 S.path=S.path||'good';
 function pset(p){S.path=p;$('pg').classList.toggle('on',p==='good');$('pb').classList.toggle('on',p==='bad');$('pdesc').textContent=p==='good'?'Study, make friends, hustle honestly. Bullies may shout at you, but you can walk away or answer back.':'Roll with the boys, fight with a stick or a gun, call your friends to attack together. The police will chase you, and you can be arrested, fined and suspended.'}
 on('pg',function(){pset('good')});on('pb',function(){pset('bad')});pset(S.path);
 on('reg',function(){NF.profile={path:S.path,f:S.f,uni:S.uni.n,short:S.uni.s,tier:S.uni.t,fac:S.fac,dept:S.dept,courses:S.courses,tt:S.tt,look:S.look};NF.look=S.look;try{localStorage.setItem('nf_profile',JSON.stringify(NF.profile))}catch(e){}begin()})}
function begin(){var P=NF.profile;root.style.display='none';root.innerHTML='';if(NF.applyLook)NF.applyLook(P.look,P.f);NF.startGame(P.f)}
NF.flowStart=title;title();
})();
