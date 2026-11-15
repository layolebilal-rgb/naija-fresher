/* Naija Fresher 3D - game world (frontend). Needs three.js r128 loaded first. */
(function(){
var errEl=document.getElementById('err');
function showErr(m){errEl.style.display='block';errEl.textContent+=m+'\n'}
window.addEventListener('error',function(e){showErr('Error: '+e.message+(e.lineno?' (line '+e.lineno+')':''))});
if(typeof THREE==='undefined'){document.getElementById('loadmsg').textContent='Could not load the 3D engine. Check your internet and reload.';showErr('THREE not loaded');return}
document.getElementById('loadmsg').textContent='Choose your character to start';
var T=THREE;
function rnd(a,b){return a+Math.random()*(b-a)}
function pick(a){return a[(Math.random()*a.length)|0]}
function angDiff(a,b){var d=(b-a)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d}
function mat(c){return new T.MeshLambertMaterial({color:c})}
/* ---------- renderer / scene ---------- */
var renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
document.body.insertBefore(renderer.domElement,document.body.firstChild);
var scene=new T.Scene();scene.background=new T.Color(0x9fd3ff);scene.fog=new T.Fog(0xcfe8ff,90,420);
var cam=new T.PerspectiveCamera(55,innerWidth/innerHeight,.3,900);
scene.add(new T.HemisphereLight(0xffffff,0x6a8a5a,.85));
var sun=new T.DirectionalLight(0xfff2d6,.75);sun.position.set(40,70,30);sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);var sc=sun.shadow.camera;sc.left=-28;sc.right=28;sc.top=28;sc.bottom=-28;sc.near=1;sc.far=200;
scene.add(sun);scene.add(sun.target);
/* ---------- ground & roads (no overlapping pieces: no flicker) ---------- */
var ground=new T.Mesh(new T.PlaneGeometry(2200,2200),mat(0x83c872));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
var XS=[-220,-110,0,110,220],ZS=[-220,-110,0,110,220],RW=12,LIM=246,AMAX=830,INT=null;
function roadTex(){var c=document.createElement('canvas');c.width=128;c.height=128;var g=c.getContext('2d');
 g.fillStyle='#4b4e5a';g.fillRect(0,0,128,128);g.fillStyle='#c9ccd6';g.fillRect(0,0,128,4);g.fillRect(0,124,128,4);
 g.fillStyle='#f5f5f5';g.fillRect(0,61,64,6);
 var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t}
var RT=roadTex();
var roadMat=function(t){var m=new T.MeshLambertMaterial(t?{map:t}:{color:0x4b4e5a});m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-2;return m};
function roadSeg(x1,z1,x2,z2){var len=Math.hypot(x2-x1,z2-z1),t=RT.clone();t.needsUpdate=true;t.repeat.set(len/8,1);
 var g=new T.PlaneGeometry(len,RW);g.rotateX(-Math.PI/2);var m=new T.Mesh(g,roadMat(t));m.rotation.y=-Math.atan2(z2-z1,x2-x1);m.position.set((x1+x2)/2,.05,(z1+z2)/2);m.receiveShadow=true;scene.add(m)}
ZS.forEach(function(z){for(var i=0;i<4;i++)roadSeg(XS[i]+6,z,XS[i+1]-6,z)});
XS.forEach(function(x){for(var i=0;i<4;i++)roadSeg(x,ZS[i]+6,x,ZS[i+1]-6)});
XS.forEach(function(x){ZS.forEach(function(z){var g=new T.PlaneGeometry(RW,RW);g.rotateX(-Math.PI/2);var m=new T.Mesh(g,roadMat(null));m.position.set(x,.05,z);m.receiveShadow=true;scene.add(m)})});
function onRoad(x,z,m){m=m||0;for(var i=0;i<5;i++){if(Math.abs(x-XS[i])<6+m&&Math.abs(z)<226+m)return true;if(Math.abs(z-ZS[i])<6+m&&Math.abs(x)<226+m)return true}return false}
/* boundary hedge */
[[0,-252,520,1],[0,252,520,1],[-252,0,1,520],[252,-136,1,248],[252,136,1,248]].forEach(function(f){var m=new T.Mesh(new T.BoxGeometry(f[2]>2?f[2]:2.5,3,f[3]>2?f[3]:2.5),mat(0x2f7d3a));m.position.set(f[0],1.5,f[1]);scene.add(m)});
/* ---------- buildings ---------- */
var boxes=[],circles=[],places=[];
function winTex(){var c=document.createElement('canvas');c.width=64;c.height=64;var g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,64,64);
 g.fillStyle='#8fb8dc';g.fillRect(10,12,44,26);g.fillStyle='#d9e6f2';g.fillRect(10,12,44,4);g.fillStyle='#00000018';g.fillRect(0,56,64,8);
 var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;return t}
var WT=winTex();
function label(txt,x,y,z,sz){var c=document.createElement('canvas');c.width=512;c.height=96;var g=c.getContext('2d');g.font='bold 52px system-ui,sans-serif';g.textAlign='center';
 g.fillStyle='rgba(16,36,58,.85)';var w=Math.min(500,g.measureText(txt).width+40);g.fillRect(256-w/2,10,w,76);g.fillStyle='#fff';g.fillText(txt,256,68);
 var s=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false}));s.scale.set(sz*5.3,sz,1);s.position.set(x,y,z);s.userData.b=sz;LB.push(s);scene.add(s);return s}
/* place tags: shrink when near, fade when close or when they sit over the joystick */
var LB=[],_lv=new T.Vector3();
function updLabels(){var W=window.innerWidth,H=window.innerHeight,jr=$('joy').getBoundingClientRect(),cp=cam.position,jok=jr.width>0;
 for(var i=LB.length-1;i>=0;i--){var s=LB[i];if(!s.parent){LB.splice(i,1);continue}
  var d=cp.distanceTo(s.position),far=s.position.x>2500,k=far?.3:(.16+.14*Math.min(1,d/90)),b=s.userData.b;
  s.scale.set(b*5.3*k,b*k,1);var op=far?1:Math.max(0,Math.min(1,(d-5)/9));
  _lv.copy(s.position).project(cam);if(jok&&_lv.z<1){var sx=(_lv.x*.5+.5)*W,sy=(-_lv.y*.5+.5)*H;if(sx>jr.left-60&&sx<jr.right+60&&sy>jr.top-60&&sy<jr.bottom+60)op*=.1}
  if(s.material.opacity!==op)s.material.opacity=op}}
var BC=[0xf2b8a6,0xf6d2a0,0xcfd8e8,0xe7dcc0,0xf0e1b5,0xd9c8e8,0xffd9a0,0xbfe3d0,0xffffff,0xd0e8f0],RC=[0x7b6b8d,0x4a5a8a,0x6a5a4a,0x3b6b4a,0x5a4a7a,0xb05a3a,0x2a6a5a,0x35507a],bi=0;
function building(name,x,z,w,d,h){
 var col=BC[bi%BC.length],roof=RC[(bi*3)%RC.length];bi++;
 var mk=function(rx,ry){var t=WT.clone();t.needsUpdate=true;t.repeat.set(rx,ry);return new T.MeshLambertMaterial({map:t,color:col})};
 var side=mk(Math.max(1,Math.round(d/3.4)),Math.max(1,Math.round(h/3.6))),front=mk(Math.max(1,Math.round(w/3.4)),Math.max(1,Math.round(h/3.6)));
 var rm=mat(roof);
 var b=new T.Mesh(new T.BoxGeometry(w,h,d),[side,side,rm,rm,front,front]);b.position.set(x,h/2,z);b.castShadow=true;b.receiveShadow=true;scene.add(b);
 var r=new T.Mesh(new T.BoxGeometry(w+1,.7,d+1),rm);r.position.set(x,h+.35,z);r.castShadow=true;scene.add(r);
 var door=new T.Mesh(new T.BoxGeometry(2.6,3.2,.3),mat(0x4a2e1a));door.position.set(x,1.6,z+d/2+.1);scene.add(door);
 label(name,x,h+3.4,z,2.4);label('🚪 '+name,x,4.3,z+d/2+.7,.5);
 boxes.push({x0:x-w/2-.3,x1:x+w/2+.3,z0:z-d/2-.3,z1:z+d/2+.3,name:name,cx:x,cz:z+d/2+3,w:w,d:d});places.push({name:name,x:x,z:z,w:w,d:d})}
var TPL={A:[[0,0,56,38]],B:[[-20,-22,46,28],[20,24,46,28]],C:[[-26,-26,34,28],[26,-26,34,28],[-26,26,34,28],[26,26,34,28]]};
var BLK=[
 [-165,-165,'A',['Faculty of Engineering']],[-55,-165,'B',['Faculty of Law','Faculty of Arts']],[55,-165,'A',['Main Library']],[165,-165,'B',['Senate Building','Admin Block']],
 [-165,-55,'C',['Hostel A','Hostel B','Hostel C','Hostel D']],[-55,-55,'A',['Faculty of Social Science']],[55,-55,'B',['Central Mosque','Chapel']],[165,-55,'B',['Cafeteria','Bookshop']],
 [-165,55,'sports',['Sports Complex']],[-55,55,'A',['Faculty of Science']],[55,55,'B',['Lecture Theatre 1','Lecture Theatre 2']],[165,55,'B',['Medical Centre','Campus Bank']],
 [-165,165,'market',['Campus Market']],[-55,165,'park',['Campus Park']],[55,165,'C',['Female Hostel E','Female Hostel F','Female Hostel G','Female Hostel H']],[165,165,'B',['Computer Science','Faculty of Education']]];
var PITCH=null,POND=null;
BLK.forEach(function(b){var cx=b[0],cz=b[1],t=b[2],nm=b[3];
 if(TPL[t]){TPL[t].forEach(function(o,i){var n=nm[i],h=/Hostel/.test(n)?13:/Library|Faculty/.test(n)?15:/Mosque|Chapel/.test(n)?11:/Cafeteria|Bookshop|Bank|Centre/.test(n)?8:10;building(n,cx+o[0],cz+o[1],o[2],o[3],h)})}
 else if(t==='sports'){var pg=new T.PlaneGeometry(70,44);pg.rotateX(-Math.PI/2);var pm=new T.Mesh(pg,mat(0x3da35d));pm.position.set(cx,.06,cz+4);pm.receiveShadow=true;scene.add(pm);
  var ln=new T.Mesh(new T.BoxGeometry(.4,.02,44),mat(0xffffff));ln.position.set(cx,.08,cz+4);scene.add(ln);
  [-1,1].forEach(function(s){var gp=new T.Mesh(new T.BoxGeometry(.3,2.4,7.3),mat(0xffffff));gp.position.set(cx+s*35,1.2,cz+4);scene.add(gp);boxes.push({x0:cx+s*35-.4,x1:cx+s*35+.4,z0:cz+4-3.8,z1:cz+4+3.8})});
  var st=new T.Mesh(new T.BoxGeometry(60,5,6),mat(0x9aa4b8));st.position.set(cx,2.5,cz-30);st.castShadow=true;scene.add(st);
  boxes.push({x0:cx-30.3,x1:cx+30.3,z0:cz-33.3,z1:cz-26.7,name:'Sports Complex',cx:cx,cz:cz+30,w:60,d:6});places.push({name:'Sports Complex',x:cx,z:cz,w:70,d:70});label('Sports Complex',cx,9,cz-30,2.4);PITCH={x0:cx-36,x1:cx+36,z0:cz-18,z1:cz+26}}
 else if(t==='park'){var cg=new T.CircleGeometry(11,24);cg.rotateX(-Math.PI/2);var pn=new T.Mesh(cg,mat(0x4aa8e8));pn.position.set(cx,.06,cz);scene.add(pn);circles.push([cx,cz,11.5]);POND={x:cx,z:cz,r:14};label('Campus Park',cx,7,cz-14,2.4);places.push({name:'Campus Park',x:cx,z:cz,w:80,d:80})}
 else if(t==='market'){for(var i=0;i<4;i++)for(var j=0;j<3;j++){var sx=cx-33+i*22,sz=cz-26+j*22,cc=[0xe74c3c,0xf1c40f,0x2ecc71,0x3498db,0xe67e22,0x9b59b6][(i*3+j)%6];
   var sb=new T.Mesh(new T.BoxGeometry(10,2.6,7),mat(0xc9b08a));sb.position.set(sx,1.3,sz);sb.castShadow=true;scene.add(sb);var cp=new T.Mesh(new T.BoxGeometry(12,.4,9),mat(cc));cp.position.set(sx,3.1,sz);cp.castShadow=true;scene.add(cp);
   boxes.push({x0:sx-5.6,x1:sx+5.6,z0:sz-4.1,z1:sz+4.1,name:'Campus Market',cx:sx,cz:sz+6,w:10,d:7})}
  label('Campus Market',cx,8,cz,2.4);places.push({name:'Campus Market',x:cx,z:cz,w:80,d:80})}});
function inBox(x,z,m){for(var i=0;i<boxes.length;i++){var b=boxes[i];if(x>b.x0-m&&x<b.x1+m&&z>b.z0-m&&z<b.z1+m)return b}return null}
function inPitchPond(x,z,m){if(PITCH&&x>PITCH.x0-m&&x<PITCH.x1+m&&z>PITCH.z0-m&&z<PITCH.z1+m)return true;if(POND&&Math.hypot(x-POND.x,z-POND.z)<POND.r+m)return true;return false}
/* ---------- trees & lamps (instanced, solid) ---------- */
var TR=[];for(var i=0;i<3000&&TR.length<420;i++){var x=rnd(-240,240),z=rnd(-240,240);if(onRoad(x,z,6)||inBox(x,z,5)||inPitchPond(x,z,3))continue;TR.push([x,z,rnd(.8,1.5),Math.random()<.5])}
for(var pk=0;pk<26;pk++){var ax=-55+rnd(-40,40),az=165+rnd(-40,40);if(!inPitchPond(ax,az,3))TR.push([ax,az,rnd(.9,1.4),Math.random()<.5])}
TR.forEach(function(t){circles.push([t[0],t[1],.6*t[2]+.1])});
var trunk=new T.InstancedMesh(new T.CylinderGeometry(.25,.35,5,6),mat(0x7a5a3a),TR.length),crown=new T.InstancedMesh(new T.SphereGeometry(2.2,8,6),mat(0x3f9b4a),TR.length),dm=new T.Object3D();
TR.forEach(function(t,i){var s=t[2];dm.position.set(t[0],2.5*s,t[1]);dm.scale.set(s,s,s);dm.rotation.set(0,0,0);dm.updateMatrix();trunk.setMatrixAt(i,dm.matrix);
 dm.position.set(t[0],5.6*s,t[1]);dm.scale.set(s*(t[3]?1.3:1),s*(t[3]?.55:1),s*(t[3]?1.3:1));dm.updateMatrix();crown.setMatrixAt(i,dm.matrix)});
trunk.castShadow=true;crown.castShadow=true;scene.add(trunk);scene.add(crown);
var LP=[];ZS.forEach(function(z){for(var k=-210;k<=210;k+=35){var x=k+17;if(!inBox(x,z+8,2))LP.push([x,z+8])}});XS.forEach(function(x){for(var k=-210;k<=210;k+=35){var z=k+17;if(!inBox(x+8,z,2))LP.push([x+8,z])}});
var pole=new T.InstancedMesh(new T.CylinderGeometry(.12,.15,7,6),mat(0x3a3f4a),LP.length),lampH=new T.InstancedMesh(new T.SphereGeometry(.45,8,6),new T.MeshBasicMaterial({color:0xfff0b0}),LP.length);
LP.forEach(function(p,i){circles.push([p[0],p[1],.35]);dm.position.set(p[0],3.5,p[1]);dm.scale.set(1,1,1);dm.updateMatrix();pole.setMatrixAt(i,dm.matrix);dm.position.set(p[0],7.2,p[1]);dm.updateMatrix();lampH.setMatrixAt(i,dm.matrix)});
scene.add(pole);scene.add(lampH);
/* ---------- person rig ---------- */
var SKINS=[0x3b2417,0x5a3a22,0x7a4e2e,0x8d5a3b,0xa9714a],TOPS=[0xe74c3c,0x3498db,0x2ecc71,0xf1c40f,0xffffff,0x9b59b6,0xff7f50,0x1abc9c,0xe84393],BOTS=[0x1f2a44,0x2d3436,0x4a5568,0x6c5ce7,0x0a3d62,0x2f3640],SHOES=[0xffffff,0xd63031,0x222222,0x2d98da],HAIRS=[0x111111,0x1a1008,0x2a1a10];
function randLook(f){return {f:f,skin:pick(SKINS),top:pick(TOPS),bottom:pick(BOTS),shoe:pick(SHOES),hair:pick(HAIRS),
 hairStyle:f?pick(['long','puffs','afro','short','hijab']):pick(['short','short','afro','bald']),hijab:pick([0xc0392b,0x16a085,0x8e44ad,0xf39c12]),shorts:Math.random()<.2,bag:Math.random()<.4?pick([0x2c3e50,0xe67e22,0x16a085]):0}}
function limb(r1,r2,h,m){var g=new T.CylinderGeometry(r1,r2,h,10);g.translate(0,-h/2,0);var me=new T.Mesh(g,m);me.castShadow=true;return me}
function makePerson(o){
 var root=new T.Group(),hips=new T.Group();hips.position.y=.95;root.add(hips);
 var mS=mat(o.skin),mT=mat(o.top),mB=mat(o.bottom),mSh=mat(o.shoe),mH=mat(o.hair),W=o.f?.9:1,HP=o.f?1.1:1;
 var pel=new T.Mesh(new T.CylinderGeometry(.17*W*HP,.16*HP,.2,12),mB);pel.position.y=-.04;pel.castShadow=true;hips.add(pel);
 var legs=[],arms=[];
 [-1,1].forEach(function(s){var th=new T.Group();th.position.set(s*.095*HP,0,0);hips.add(th);th.add(limb(.09,.07,.46,mB));
  var kn=new T.Group();kn.position.y=-.46;th.add(kn);kn.add(limb(.065,.05,.44,o.shorts?mS:mB));
  var ft=new T.Mesh(new T.BoxGeometry(.1,.07,.27),mSh);ft.position.set(0,-.46,.06);ft.castShadow=true;kn.add(ft);legs.push({th:th,kn:kn})});
 var sp=new T.Group();hips.add(sp);
 var tg=new T.CylinderGeometry(.19*W,.15*(o.f?.95:1),.56,12);tg.translate(0,.28,0);var torso=new T.Mesh(tg,mT);torso.scale.z=.62;torso.castShadow=true;sp.add(torso);
 [-1,1].forEach(function(s){var sh=new T.Group();sh.position.set(s*.225*W,.5,0);sp.add(sh);
  sh.add(limb(.05,.042,.3,mS));var sl=limb(.062,.056,.14,mT);sh.add(sl);
  var el=new T.Group();el.position.y=-.3;sh.add(el);el.add(limb(.042,.034,.27,mS));
  var hd=new T.Mesh(new T.SphereGeometry(.04,8,6),mS);hd.position.y=-.29;el.add(hd);arms.push({sh:sh,el:el})});
 var nk=new T.Mesh(new T.CylinderGeometry(.05,.055,.1,8),mS);nk.position.y=.58;sp.add(nk);
 var head=new T.Group();head.position.y=.64;sp.add(head);
 var hm=new T.Mesh(new T.SphereGeometry(.115,16,12),mS);hm.scale.y=1.1;hm.position.y=.13;hm.castShadow=true;head.add(hm);
 [-1,1].forEach(function(s){var e=new T.Mesh(new T.SphereGeometry(.014,6,6),mat(0x140c08));e.position.set(s*.04,.15,.105);head.add(e);
  var br=new T.Mesh(new T.BoxGeometry(.05,.009,.01),mH);br.position.set(s*.04,.178,.108);head.add(br);
  var ea=new T.Mesh(new T.SphereGeometry(.024,6,6),mS);ea.position.set(s*.113,.13,0);head.add(ea)});
 var nose=new T.Mesh(new T.SphereGeometry(.02,6,6),mat(new T.Color(o.skin).multiplyScalar(.85).getHex()));nose.position.set(0,.125,.118);head.add(nose);
 var mouth=new T.Mesh(new T.BoxGeometry(.05,.008,.01),mat(o.f?0xb0384a:0x5a2020));mouth.position.set(0,.07,.108);head.add(mouth);
 var hs=o.hairStyle;
 if(hs==='hijab'){var hj=mat(o.hijab);var c=new T.Mesh(new T.SphereGeometry(.135,14,10),hj);c.scale.set(1,1.15,1.08);c.position.set(0,.13,-.005);head.add(c);
  var fc=new T.Mesh(new T.SphereGeometry(.1,12,10),mS);fc.scale.set(.95,1.05,.5);fc.position.set(0,.12,.075);head.add(fc);
  var dr=new T.Mesh(new T.CylinderGeometry(.12,.2,.28,12),hj);dr.position.set(0,.0,-.02);head.add(dr)}
 else if(hs!=='bald'){
  if(hs==='afro'){var af=new T.Mesh(new T.SphereGeometry(.17,12,10),mH);af.scale.y=.95;af.position.set(0,.17,-.01);head.add(af)}
  else{var cap=new T.Mesh(new T.SphereGeometry(.123,14,10,0,Math.PI*2,0,Math.PI*.52),mH);cap.scale.y=1.1;cap.position.set(0,.135,-.005);cap.rotation.x=-.28;head.add(cap)}
  if(hs==='puffs')[-1,1].forEach(function(s){var p=new T.Mesh(new T.SphereGeometry(.06,8,8),mH);p.position.set(s*.1,.24,-.02);head.add(p)});
  if(hs==='long'){var lg=new T.Mesh(new T.SphereGeometry(.12,10,8),mH);lg.scale.set(1,1.7,.7);lg.position.set(0,.02,-.075);head.add(lg)}}
 if(o.bag){var bg=new T.Mesh(new T.BoxGeometry(.3,.38,.14),mat(o.bag));bg.position.set(0,.3,-.14);bg.castShadow=true;sp.add(bg)}
 var pm=new T.Mesh(new T.BoxGeometry(.07,.13,.012),mat(0x111111));pm.position.set(0,-.3,.05);pm.visible=false;arms[1].el.add(pm);var ps=new T.Mesh(new T.BoxGeometry(.055,.1,.014),new T.MeshBasicMaterial({color:0x9fd3ff}));ps.position.set(0,0,.003);pm.add(ps);
 var P={g:root,hips:hips,sp:sp,head:head,legs:legs,arms:arms,ph:Math.random()*6,t:0,pk:0,usingPhone:false};
 P.anim=function(speed,dt){P.t+=dt;var stride=1.25+.18*speed;P.ph+=dt*Math.PI*2*speed/stride;
  var s=Math.min(1,speed/4),w=Math.min(1,speed/1.5),A=(.42+.32*s)*w,ph=P.ph,sn=Math.sin(ph),cs=Math.cos(ph);
  legs[0].th.rotation.x=-A*sn;legs[1].th.rotation.x=A*sn;
  legs[0].kn.rotation.x=w*(.1+(.3+.7*s)*Math.max(0,cs));legs[1].kn.rotation.x=w*(.1+(.3+.7*s)*Math.max(0,-cs));
  var Aa=(.38+.4*s)*w,el=-(.12+.5*s)*w-.08;
  arms[0].sh.rotation.x=Aa*sn;arms[1].sh.rotation.x=-Aa*sn;arms[0].sh.rotation.z=-.06;arms[1].sh.rotation.z=.06;arms[0].el.rotation.x=el;arms[1].el.rotation.x=el;
  hips.position.y=.95-.86*(1-Math.cos(A*Math.abs(sn)))+.012*w;
  sp.rotation.x=.03+.13*s*w;sp.rotation.y=-.12*w*sn;sp.rotation.z=.025*w*sn;sp.scale.y=1+.012*Math.sin(P.t*2.2)*(1-w);
  head.rotation.x=-sp.rotation.x*.7;head.rotation.y=-sp.rotation.y*.6;
  P.pk+=((P.usingPhone?1:0)-P.pk)*Math.min(1,dt*8);var k=P.pk;if(k>.01){arms[1].sh.rotation.x+=(-1.05-arms[1].sh.rotation.x)*k;arms[1].sh.rotation.z+=(.12-arms[1].sh.rotation.z)*k;arms[1].el.rotation.x+=(-1.55-arms[1].el.rotation.x)*k;head.rotation.x+=.38*k;pm.visible=true}else pm.visible=false};
 return P}
function seatPose(P){P.hips.position.y=.6;P.sp.rotation.x=.08;P.legs.forEach(function(l){l.th.rotation.x=-1.45;l.kn.rotation.x=1.5});P.arms.forEach(function(a){a.sh.rotation.x=-.9;a.el.rotation.x=-.8})}
/* ---------- state ---------- */
var me=null,npcs=[],vehicles=[],keys={},J={x:0,y:0},mode='follow',sprint=false,started=false,money=18500,friends=[],sel=null,selV=null,blockedT=0;
var camYaw=Math.PI,camPitch=.42,camDist=6.5,camT=new T.Vector3(),freeT=new T.Vector3(0,0,0),lastDrag=0;
var $=function(i){return document.getElementById(i)};
function toast(t){var e=$('toast');e.textContent=t;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(function(){e.style.display='none'},2600)}
var NF=window.NF=window.NF||{};NF.toast=toast;NF.getMoney=function(){return money};NF.txns=[];NF.openMap=function(){if(mode!=='free')bfree.click()};
function boxF(x,z,m,fl){for(var i=0;i<boxes.length;i++){var b=boxes[i];if(b.f!=null&&b.f!==fl)continue;if(x>b.x0-m&&x<b.x1+m&&z>b.z0-m&&z<b.z1+m)return b}return null}
function resolve(p,r){
 var b=boxF(p.x,p.z,r,(p.y||0)>2?1:0);if(b){var dl=p.x-(b.x0-r),dr=(b.x1+r)-p.x,dt=p.z-(b.z0-r),db=(b.z1+r)-p.z,m=Math.min(dl,dr,dt,db);
  if(m===dl)p.x=b.x0-r;else if(m===dr)p.x=b.x1+r;else if(m===dt)p.z=b.z0-r;else p.z=b.z1+r}
 for(var i=0;i<circles.length;i++){var c=circles[i],dx=p.x-c[0],dz=p.z-c[1];if(Math.abs(dx)>6+c[2]||Math.abs(dz)>6+c[2])continue;var d=Math.hypot(dx,dz),R=c[2]+r;if(d<R){if(d<.001){dx=1;dz=0;d=1}p.x=c[0]+dx/d*R;p.z=c[1]+dz/d*R}}
 if(INT){p.x=Math.max(INT.x0,Math.min(INT.x1,p.x));p.z=Math.max(INT.z0,Math.min(INT.z1,p.z));return}
 if(p.x>LIM&&p.x<LIM+12&&Math.abs(p.z)>11)p.x=(p.x<LIM+6)?LIM:LIM+12;
 if(p.x>LIM+12){p.x=Math.min(AMAX,p.x);p.z=Math.max(-232,Math.min(232,p.z))}else{p.x=Math.max(-LIM,p.x);p.z=Math.max(-LIM,Math.min(LIM,p.z))}}
function pushOutVeh(p,r,v){var c=Math.cos(v.ry),s=Math.sin(v.ry),dx=p.x-v.x,dz=p.z-v.z,lx=dx*c-dz*s,lz=dx*s+dz*c,hx=v.hw+r,hz=v.len/2+r;
 if(Math.abs(lx)<hx&&Math.abs(lz)<hz){var px=hx-Math.abs(lx),pz=hz-Math.abs(lz);if(px<pz)lx=(lx<0?-1:1)*hx;else lz=(lz<0?-1:1)*hz;p.x=v.x+lx*c+lz*s;p.z=v.z-lx*s+lz*c}}
/* main gate: two pillars, a beam and a sign (the gap between them is the road to the airport) */
[-12.6,12.6].forEach(function(gz){abox0(1.8,7,1.8,0x8a7a66,252,3.5,gz);boxes.push({x0:251,x1:253,z0:gz-1,z1:gz+1})});abox0(1.8,.9,27,0x8a7a66,252,7.2,0);label('Main Gate · Airport this way',252,9.4,0,1.1);places.push({name:'Main Gate',x:246,z:0,w:16,d:16,go:{x:240,z:4}});
function abox0(w,h,d,c,x,y,z){var m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;scene.add(m);return m}
/* ---------- AIRPORT (east of campus, through the gate on the z=0 road) ---------- */
function abox(w,h,d,c,x,y,z,par){var m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;(par||scene).add(m);return m}
function aplane(x,z,y,w,h){var m=new T.Mesh(new T.PlaneGeometry(w,h),mat(0x6b6f7a));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);m.receiveShadow=true;scene.add(m);return m}
roadSeg(226,0,452,0);
var plz=aplane(440,-17,.03,130,18);plz.material=mat(0xbfc3cc);
aplane(470,-120,.02,200,112).material=mat(0x8d919b);
aplane(580,-195,.02,520,40).material=mat(0x3b3e47);
for(var rx=330;rx<820;rx+=26)abox(12,.03,.8,0xffffff,rx,.06,-195);
abox(520,.03,.5,0xf5c518,570,.05,-170);
building('Airport Terminal',440,-45,112,38,16);
var twr=new T.Mesh(new T.CylinderGeometry(3,4,34,14),mat(0xdfe3ea));twr.position.set(360,17,-45);twr.castShadow=true;scene.add(twr);abox(10,5,10,0x2b4a63,360,36,-45);abox(11,.8,11,0xdfe3ea,360,39,-45);boxes.push({x0:355,x1:365,z0:-50,z1:-40,name:'Control Tower'});
label('✈ Naija International Airport',440,23,-45,3);
function makePlane(tailC){var g=new T.Group();function add(m){g.add(m);return m}
 var fus=new T.Mesh(new T.CylinderGeometry(1.9,1.9,28,16),mat(0xf4f6fa));fus.rotation.z=Math.PI/2;fus.castShadow=true;add(fus);
 var nose=new T.Mesh(new T.SphereGeometry(1.9,16,12),mat(0xf4f6fa));nose.scale.set(2.3,1,1);nose.position.x=14;add(nose);
 var tail=new T.Mesh(new T.CylinderGeometry(.55,1.9,11,16),mat(0xf4f6fa));tail.rotation.z=Math.PI/2;tail.position.x=-19.5;tail.castShadow=true;add(tail);
 [[1,-.45],[-1,.45]].forEach(function(s){var w=new T.Mesh(new T.BoxGeometry(6,.35,17),mat(0xdde2ea));w.position.set(-.5,-.7,s[0]*9.8);w.rotation.y=s[1];w.castShadow=true;add(w);
  var en=new T.Mesh(new T.CylinderGeometry(.85,.85,3.4,12),mat(0x8a909c));en.rotation.z=Math.PI/2;en.position.set(1.6,-1.9,s[0]*6.5);add(en);
  var st=new T.Mesh(new T.BoxGeometry(2.6,.25,4.2),mat(0xdde2ea));st.position.set(-23,1,s[0]*2.7);st.rotation.y=s[1]*.5;add(st);
  add(abox(26,.5,.08,tailC,0,-.2,s[0]*1.93,g)).position.x=1;add(abox(22,.45,.08,0x24405a,2,.7,s[0]*1.9,g))});
 var fin=new T.Mesh(new T.BoxGeometry(5.5,6.2,.4),mat(tailC));fin.position.set(-22,4.6,0);fin.rotation.z=.28;fin.castShadow=true;add(fin);
 [[10,0],[-3,2.2],[-3,-2.2]].forEach(function(p){var w=new T.Mesh(new T.CylinderGeometry(.5,.5,.4,10),mat(0x222222));w.rotation.x=Math.PI/2;w.position.set(p[0],-2.3,p[1]);add(w);abox(.2,1.1,.2,0x999999,p[0],-1.7,p[1],g)});
 g.position.y=2.45;var o=new T.Group();o.add(g);o.userData.body=g;return o}
var PARK=[[430,-92,0x0a8f3c],[510,-96,0xd4a017]];
PARK.forEach(function(p,i){var pl=makePlane(p[2]);pl.position.set(p[0],0,p[1]);pl.rotation.y=i?0.12:-0.1;scene.add(pl);boxes.push({x0:p[0]-20,x1:p[0]+20,z0:p[1]-3,z1:p[1]+3,name:'Aircraft'});places.push({name:'Parked aircraft '+(i+1),x:p[0],z:p[1],w:80,d:40});places.pop()});
var jet=makePlane(0x0a8f3c);scene.add(jet);var jp={ph:0,t:0,x:335,y:0,v:0,yaw:0,pitch:0};
function setJet(){jet.position.set(jp.x,jp.y,-195);jet.rotation.set(0,jp.yaw,jp.pitch*0+0);jet.userData.body.rotation.z=jp.pitch}
function updAir(dt){var p=jp;if(flt){jet.visible=false;p.ph=3;p.t=0;return}p.t+=dt;
 if(p.ph===0){p.x=335;p.y=0;p.v=0;p.pitch=0;p.yaw=Math.max(0,Math.PI*(1-p.t/8));if(p.t>16){p.ph=1;p.t=0;p.yaw=0}}
 else if(p.ph===1){p.v+=3.2*dt;p.x+=p.v*dt;if(p.x>640){p.ph=2;p.t=0}}
 else if(p.ph===2){p.v=Math.min(70,p.v+4*dt);p.pitch+=(.22-p.pitch)*Math.min(1,dt*1.2);p.x+=p.v*Math.cos(p.pitch)*dt;p.y+=p.v*Math.sin(p.pitch)*dt;if(p.x>1700){p.ph=3;p.t=0;jet.visible=false}}
 else if(p.ph===3){if(p.t>25){p.ph=4;p.t=0;p.x=1700;p.y=105;p.yaw=Math.PI;p.v=55;p.pitch=-.12;jet.visible=true}}
 else if(p.ph===4){p.x-=p.v*dt;p.y=Math.max(0,105*(p.x-720)/980);p.pitch=p.y>6?-.12:(p.y>0?.04:0);if(p.x<=720){p.ph=5;p.t=0;p.y=0;p.pitch=0}}
 else if(p.ph===5){p.v=Math.max(0,p.v-4*dt);p.x-=p.v*dt;if(p.v<=0){p.ph=0;p.t=0}}
 setJet()}
NF.atAirport=function(){return me&&me.x>LIM+12&&Math.abs(me.x-440)<260};

/* ---------- 3D flight with inside / outside view ---------- */
var flt=null;
var FWP=[[335,0,-195],[640,0,-195],[900,70,-195],[1050,130,-330],[900,170,-560],[500,180,-650],[0,170,-600],[-300,150,-450],[-350,110,-250],[-250,70,-195],[330,0,-195],[700,0,-195]];
function crp(a,b2,c,d,t){var t2=t*t,t3=t2*t,o=[];for(var i=0;i<3;i++)o.push(.5*((2*b2[i])+(-a[i]+c[i])*t+(2*a[i]-5*b2[i]+4*c[i]-d[i])*t2+(-a[i]+3*b2[i]-3*c[i]+d[i])*t3));o[1]=Math.max(0,o[1]);return o}
function buildFlightTable(){var tab=[],n=FWP.length,s=0,prev=null;for(var i=0;i<n-1;i++){var p0=FWP[Math.max(i-1,0)],p1=FWP[i],p2=FWP[i+1],p3=FWP[Math.min(i+2,n-1)];for(var k=0;k<24;k++){var q=crp(p0,p1,p2,p3,k/24);if(prev)s+=Math.hypot(q[0]-prev[0],q[1]-prev[1],q[2]-prev[2]);tab.push({x:q[0],y:q[1],z:q[2],s:s});prev=q}}
 var l=FWP[n-1];s+=Math.hypot(l[0]-prev[0],l[1]-prev[1],l[2]-prev[2]);tab.push({x:l[0],y:l[1],z:l[2],s:s});return tab}
function fAt(tab,s){var lo=0,hi=tab.length-1;while(hi-lo>1){var m=(lo+hi)>>1;if(tab[m].s<s)lo=m;else hi=m}var a=tab[lo],b2=tab[hi],f=(s-a.s)/Math.max(.001,b2.s-a.s);return {x:a.x+(b2.x-a.x)*f,y:a.y+(b2.y-a.y)*f,z:a.z+(b2.z-a.z)*f}}
var fUI=null,fAnnT=0;
function myOpts(f){var lk=NF.look||{};return {f:f,skin:lk.skin||0x6b4226,top:lk.top||0x1e90ff,bottom:lk.bottom||0x1f2a44,shoe:lk.shoe||0xffffff,hair:lk.hair||0x111111,hairStyle:lk.hairStyle||(f?'puffs':'short'),hijab:lk.hijab||0xc0392b,shorts:!!lk.shorts,bag:lk.bag===undefined?0x2c3e50:lk.bag}}
/* cabin: seats, windows, passengers and you, all built inside the plane body so they move with it */
function buildCabin(pl,f){var g=pl.userData.body,V=function(m){m.castShadow=false;return m};
 for(var i=0;i<3;i++){var c=g.children[i];if(c&&c.material){c.material=c.material.clone();c.material.side=T.DoubleSide}}
 function bx2(w,h,d,col,x,y,z){var m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(col));m.position.set(x,y,z);g.add(m);return m}
 bx2(27,.12,3.3,0x4a5568,-2,-.9,0);bx2(26,.02,.5,0x8a2a2a,-2,-.83,0);
 var RX=[],seats=[];for(var r=0;r<10;r++){var x=-9+r*1.8;RX.push(x);[-1.45,-.9,.9,1.45].forEach(function(z){bx2(.5,.14,.5,0x2d4f8f,x,-.45,z);bx2(.1,.8,.5,0x2d4f8f,x-.3,-.05,z);seats.push({x:x,z:z})});
  [-1,1].forEach(function(sd){var w=new T.Mesh(new T.BoxGeometry(.4,.28,.04),new T.MeshBasicMaterial({color:0x8fd0ff}));w.position.set(x,.15,sd*1.82);g.add(w)})}
 var sg=new T.Mesh(new T.BoxGeometry(.5,.14,.04),new T.MeshBasicMaterial({color:0x7CFC00}));sg.position.set(-4.2,1.12,0);g.add(sg);
 var mine=seats.filter(function(s){return Math.abs(s.x+3.6)<.01&&s.z===-1.45})[0];
 seats.forEach(function(s){if(s===mine||Math.random()<.45)return;var P=makePerson(randLook(Math.random()<.5));P.g.position.set(s.x,-.9,s.z);P.g.rotation.y=Math.PI/2;seatPose(P);g.add(P.g)});
 var mp=makePerson(myOpts(f));mp.g.position.set(mine.x,-.9,mine.z);mp.g.rotation.y=Math.PI/2;seatPose(mp);g.add(mp.g);
 var cr=makePerson({f:true,skin:0x5a3a22,top:0x7b1e2b,bottom:0x7b1e2b,shoe:0x111111,hair:0x111111,hairStyle:'puffs',hijab:0,shorts:false,bag:0});cr.g.position.set(8.8,-.9,.1);cr.g.rotation.y=-Math.PI/2;g.add(cr.g);
 return {mine:mine,crew:cr}}
var ANN=function(city,dur,td,tAir){return [[1.2,'Good day ladies and gentlemen. Welcome aboard Naija Air flight to '+city+'.'],[5.2,'Please fasten your seat belts, put your seats upright and stow your tray tables. We are preparing for take off.',1],[10.4,'Cabin crew, take your seats for take off.'],[tAir+3,'We are now airborne. Please keep your seat belts fastened until the sign goes off.'],[tAir+22,'The captain has switched off the fasten seat belt sign. You may now relax. Refreshments will be served shortly.',1],[tAir+48,'Ladies and gentlemen, we are cruising at thirty five thousand feet. The weather in '+city+' is clear.'],[dur-td-36,'We have started our descent into '+city+'. Please return to your seats and fasten your seat belts.',1],[dur-td-2,'Cabin crew, prepare for landing.'],[dur-td+3,'Welcome to '+city+'. For your safety, remain seated until the aircraft comes to a complete stop. Thank you for flying Naija Air.',1]]};
function speak(t){try{var ss=window.speechSynthesis;if(!ss||!window.SpeechSynthesisUtterance||(NF.snd&&NF.snd.on===false))return;var u=new SpeechSynthesisUtterance(t),vs=ss.getVoices()||[],v=vs.filter(function(x){return /^en/i.test(x.lang)})[0];if(v)u.voice=v;u.lang=v?v.lang:'en-GB';u.rate=.95;u.pitch=1.05;u.volume=1;ss.cancel();ss.resume();setTimeout(function(){try{ss.speak(u)}catch(e){}},80)}catch(e){}}
function primeVoice(){try{var ss=window.speechSynthesis;if(!ss)return;ss.getVoices();var u=new SpeechSynthesisUtterance(' ');u.volume=0;ss.speak(u)}catch(e){}}
function say(t){var el=$('fann');if(el){el.textContent='🔊 '+t;el.style.opacity=1;fAnnT=7}if(NF.snd)NF.snd.play('ding');speak(t)}
function startFlight(f){primeVoice();fadeEl.style.opacity=1;rideV=true;
 setTimeout(function(){var pl=makePlane(0x0a8f3c);scene.add(pl);me.p.g.visible=false;me.tag.visible=false;hideCard();sel=null;selV=null;var tab=buildFlightTable(),cab=buildCabin(pl,!!me.f);
  var L=tab[tab.length-1].s,v=50,tr=11,t3=21,Sr=v*tr/2,Sd=370,td=2*Sd/v,tAir=t3+(Sr>0?(150/v):0),dur=t3+(L-Sd-Sr)/v+td;
  flt={pl:pl,tab:tab,L:L,t:0,dur:dur,v:v,tr:tr,t3:t3,Sr:Sr,Sd:Sd,td:td,view:'out',yaw:0,pit:0,bank:0,f:f,cx:null,cab:cab,ann:ANN(f.city,dur,td,tAir),ai:0,lastS:0};
  fUI=document.createElement('div');fUI.innerHTML='<div id="cabin" style="position:fixed;inset:0;z-index:62;pointer-events:none;display:none"><div style="position:absolute;left:50%;top:46%;width:min(68vw,560px);height:min(54vh,380px);transform:translate(-50%,-50%);border-radius:90px;box-shadow:0 0 0 200vmax #262d3d,inset 0 0 0 9px #cfd4de"></div><div style="position:absolute;left:0;right:0;bottom:0;height:16vh;background:linear-gradient(transparent,#1a2030)"></div></div><div id="fann" style="position:fixed;left:50%;top:calc(64px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:66;max-width:min(88vw,520px);background:#10243aE6;color:#fff;font:600 13px system-ui;padding:8px 12px;border-radius:12px;opacity:0;transition:opacity .4s;pointer-events:none;text-align:center"></div><div style="position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:66;display:flex;gap:8px"><button id="fview" style="border:0;border-radius:14px;padding:12px 16px;font:800 14px system-ui;background:#fff;color:#111">👁 View: Outside</button><button id="fskip" style="border:0;border-radius:14px;padding:12px 16px;font:800 14px system-ui;background:#2d3550;color:#fff">⏩ Skip to landing</button></div>';
  document.body.appendChild(fUI);
  var VN={out:'Outside',cab:'Cabin (you)',win:'Window'};
  $('fview').onclick=function(){flt.view=flt.view==='out'?'cab':(flt.view==='cab'?'win':'out');$('fview').textContent='👁 View: '+VN[flt.view];$('cabin').style.display=flt.view==='win'?'block':'none';flt.cx=null};
  $('fskip').onclick=function(){if(flt)flt.t=flt.dur};primeVoice();
  fadeEl.style.opacity=0;toast('✈️ Boarding flight to '+f.city+'. You are seated. Tap View to change camera.')},450)}
function endFlight(){var F=flt;flt=null;fadeEl.style.opacity=1;try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}
 setTimeout(function(){scene.remove(F.pl);if(fUI){fUI.remove();fUI=null}me.x=440;me.z=-10;resolve(me,.35);me.p.g.visible=true;me.tag.visible=true;me.sp=0;me.p.g.position.set(me.x,me.y||0,me.z);camT.set(me.x,1.4,me.z);rideV=null;NF.city=F.f.city;fadeEl.style.opacity=0;
  toast('🛬 Welcome to '+F.f.city+'!'+(F.f.city==='Home campus'?'':' ('+F.f.uni+' map is coming soon — you landed at the airport)'))},500)}
function sm(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)}
function flightCam(dt){var F=flt;if(F.ending)return;F.t=Math.min(F.dur,F.t+dt);var t=F.t,s,ph,shake=0;
 /* ground: turn around on the spot, engines spool, long roll, lift off; then cruise; then slow descent, landing roll and braking */
 if(t<6){s=0;ph='taxi';shake=.25}else if(t<10){s=0;ph='spool';shake=.6+(t-6)*.1}
 else if(t<F.t3){var q=(t-10)/F.tr;s=F.Sr*q*q;ph='roll';shake=.4+q*.8}
 else{var sc=F.Sr+F.v*(t-F.t3),sd0=F.L-F.Sd;if(sc<sd0){s=sc;ph='air'}else{var tau=Math.max(0,t-(F.t3+(sd0-F.Sr)/F.v));s=Math.min(F.L,sd0+F.v*tau-.5*(F.v/F.td)*tau*tau);ph='land'}}
 var p=fAt(F.tab,s),q2=fAt(F.tab,Math.min(F.L,s+60)),onGround=p.y<1.5;if(ph==='land'||ph==='roll')shake=onGround?Math.max(0,Math.min(1,(F.L-s)/F.Sd))*.7:0;if(ph==='air'||!onGround&&ph!=='roll')shake=0;
 var th0=Math.atan2(-(q2.z-p.z),q2.x-p.x)||0;if(!F.init){F.yaw=th0;F.init=1}
 var turn=t<6?(1-sm(t/6))*Math.PI:0;
 var d0=angDiff(F.yaw,th0),k=Math.min(1,dt*1.6),nyaw=F.yaw+d0*k;var rate=angDiff(F.yaw,nyaw)/Math.max(dt,.001);F.yaw=nyaw;
 var pit=Math.atan2(q2.y-p.y,Math.hypot(q2.x-p.x,q2.z-p.z)||1);F.pit+=(pit-F.pit)*Math.min(1,dt*1.3);
 F.bank+=((-rate*1.4)-F.bank)*Math.min(1,dt*1.5);F.bank=Math.max(-.4,Math.min(.4,F.bank));
 var th=F.yaw+turn,sh=shake*.012,w=F.t*37;
 F.pl.position.set(p.x,p.y,p.z);F.pl.rotation.y=th;var bd=F.pl.userData.body;bd.rotation.z=F.pit+Math.sin(w*1.3)*sh*.6;bd.rotation.x=(onGround?0:F.bank)+Math.sin(w)*sh;bd.position.y=2.45+Math.abs(Math.sin(w*.9))*shake*.03;
 F.pl.updateMatrixWorld(true);
 /* announcements and bell */
 while(F.ai<F.ann.length&&t>=F.ann[F.ai][0]){var a=F.ann[F.ai++];say(a[1]);if(a[2]&&NF.snd)NF.snd.play('ding')}
 if(fAnnT>0){fAnnT-=dt;if(fAnnT<=0){var el=$('fann');if(el)el.style.opacity=0}}
 var fx=Math.cos(th),fz=-Math.sin(th),rx=Math.sin(th),rz=Math.cos(th);
 if(F.view==='out'){var tx=p.x-fx*38,ty=Math.max(4,p.y+10),tz=p.z-fz*38;if(!F.cx){F.cx=[tx,ty,tz]}var kk=Math.min(1,dt*3);F.cx[0]+=(tx-F.cx[0])*kk;F.cx[1]+=(ty-F.cx[1])*kk;F.cx[2]+=(tz-F.cx[2])*kk;cam.up.set(0,1,0);cam.position.set(F.cx[0],F.cx[1],F.cx[2]);cam.lookAt(p.x+fx*8,p.y+2.5,p.z+fz*8)}
 else if(F.view==='cab'){var a1=new T.Vector3(-6.4,.7,.55),a2=new T.Vector3(-3.0,-.1,-1.2),wq=new T.Quaternion();bd.getWorldQuaternion(wq);cam.up.set(0,1,0).applyQuaternion(wq);bd.localToWorld(a1);bd.localToWorld(a2);cam.position.copy(a1);cam.lookAt(a2);F.cx=null}
 else{F.cx=null;cam.up.set(0,1,0);var cx=p.x+rx*1.15-fx*2,cy=p.y+3.2,cz=p.z+rz*1.15-fz*2;cam.position.set(cx,cy,cz);cam.lookAt(cx+rx*22+fx*5,cy-4.5-F.bank*6,cz+rz*22+fz*5)}
 camT.set(p.x,0,p.z);
 if(t>=F.dur&&!F.ending){F.ending=true;cam.up.set(0,1,0);endFlight()}}
NF.city='Home campus';
NF.flights=[{city:'Ibadan',uni:'University of Ibadan (UI)',fare:9000},{city:'Lagos',uni:'University of Lagos (UNILAG)',fare:8000},{city:'Ile-Ife',uni:'Obafemi Awolowo University (OAU)',fare:9500},{city:'Nsukka',uni:'University of Nigeria, Nsukka (UNN)',fare:12500},{city:'Port Harcourt',uni:'University of Port Harcourt (UNIPORT)',fare:13000},{city:'Zaria',uni:'Ahmadu Bello University (ABU)',fare:14000},{city:'Kano',uni:'Bayero University Kano (BUK)',fare:14500}];
NF.bookFlight=function(i){var f=i<0?{city:'Home campus',uni:'Your own campus',fare:NF.city==='Home campus'?0:8000}:NF.flights[i];if(!f)return {ok:false,msg:'Flight not found'};
 if(!NF.atAirport())return {ok:false,msg:'Go to the airport first'};if(NF.lifeBusy&&NF.lifeBusy())return {ok:false,msg:'You are inside a building. Go outside first.'};if(me.riding||rideV)return {ok:false,msg:'Finish your ride first'};
 if(!NF.pay('Flight to '+f.city,f.fare))return {ok:false,msg:'🏦 Insufficient funds. You need ₦'+f.fare.toLocaleString('en-NG')+' but have ₦'+money.toLocaleString('en-NG')};
 startFlight(f);
 return {ok:true}};
/* ---------- people ---------- */
var NAMES=['Chidi','Aisha','Tunde','Ngozi','Ibrahim','Bisi','Emeka','Fatima','Segun','Zainab','Obinna','Hauwa','Kelechi','Amina','Femi','Ada','Yusuf','Chioma','Dayo','Maryam','Tolu','Halima','Uche','Sade'],DEPTS=['Psychology','Law','Computer Science','Medicine','Economics','Sociology','Political Science','Mass Communication','Engineering','Accounting'];
var HI_L=['Heyy! How far? 😄','Hello! How you dey?','Good day o! Nice to meet you 😊','Hey, fresher! Wetin dey happen? 😄','Oya, what\'s up? 👋','Hello! I was just thinking of saying hi 😄'],
 HI_A=['Hello. How you doing… why do you stop me?','Yes? Abeg, I\'m in a hurry. Wetin you want?','Hmm. Do I know you? Why you dey block my way?','Hello. Make it quick o, I dey go class.','Yes? Talk fast.'],
 NUM_NO=['What do you need my number for?! 😠','Number? For what? Abeg, leave me alone.','Ehn? Who gave you the liver to ask for my number? 😤','I don\'t give my number to strangers. Move!'],
 FR_NO=['Friends? With you? Abeg. 😒','I don\'t even know you. Go and sit down.','Hmm, no. Not today.'];
function bubble(n,text,ms,angry){if(n.bub){n.p.g.remove(n.bub);n.bub=null}var c=document.createElement('canvas');c.width=512;c.height=110;var g=c.getContext('2d');g.font='bold 38px system-ui,sans-serif';g.textAlign='center';
 var w=Math.min(504,g.measureText(text).width+44);g.fillStyle=angry?'#ffd9d9':'#fff';g.fillRect(256-w/2,8,w,70);g.beginPath();g.moveTo(244,78);g.lineTo(256,100);g.lineTo(268,78);g.fill();g.fillStyle=angry?'#a00018':'#111';g.fillText(text,256,56,w-20);
 var s=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),transparent:true,depthTest:false}));s.scale.set(3.8,.82,1);s.position.set(0,2.5,0);n.p.g.add(s);n.bub=s;clearTimeout(n.bt);n.bt=setTimeout(function(){if(n.bub===s){n.p.g.remove(s);n.bub=null}},ms||3200)}
function pavePoint(){if(Math.random()<.5){var x=pick(XS)+pick([-1,1])*rnd(7,9),z=rnd(-225,225);return [x,z]}var z2=pick(ZS)+pick([-1,1])*rnd(7,9),x2=rnd(-225,225);return [x2,z2]}
var NF_spawn=null;var npcCount=0;function makeNPC(){var f=Math.random()<.5,l=randLook(f),P=makePerson(l),pt=pavePoint();
 var n={p:P,x:pt[0],z:pt[1],h:rnd(0,6.28),sp:0,v:rnd(1.1,1.7),tx:pt[0],tz:pt[1],wait:rnd(0,3),stuck:0,name:pick(NAMES),lvl:pick([100,200,300,400]),dept:pick(DEPTS),hi:false,friend:false,num:null,eng:0,near:true,mood:(npcCount++%10<7)?'lively':'aggressive',c:null,look:l};
 resolve(n,.4);P.g.position.set(n.x,0,n.z);scene.add(P.g);npcs.push(n);return n}
NF_spawn=function(o){var f=!!o.f,l=o.look||randLook(f),P=makePerson(l),n={p:P,x:o.x,z:o.z,h:rnd(0,6.28),sp:0,v:rnd(1.1,1.7),tx:o.x,tz:o.z,wait:o.wait==null?99999:o.wait,stuck:0,name:o.name,lvl:o.lvl,dept:o.dept,hi:true,friend:!!o.friend,num:o.num||null,eng:0,near:true,mood:o.mood||'lively',c:o.c||null,look:l};resolve(n,.4);P.g.position.set(n.x,0,n.z);scene.add(P.g);npcs.push(n);return n};
function newTarget(n){for(var i=0;i<20;i++){var p=Math.random()<.75?pavePoint():[rnd(-230,230),rnd(-230,230)];if(!inBox(p[0],p[1],2.5)&&!inPitchPond(p[0],p[1],1)&&Math.abs(p[0])<240&&Math.abs(p[1])<240){n.tx=p[0];n.tz=p[1];return}}}
function updNPC(n,dt){
 if(n.gone){n.p.g.visible=false;return}
 if(n.down>0){n.down-=dt;n.sp=0;n.p.g.position.set(n.x,.22,n.z);n.p.g.rotation.x=-1.5;n.p.g.rotation.y=n.h;n.p.anim(0,dt);if(n.down<=0){n.p.g.rotation.x=0;n.p.g.position.y=0;if(n.onUp)n.onUp(n)}return}
 var d0=me?Math.hypot(n.x-me.x,n.z-me.z):0,near=d0<140;if(near!==n.near){n.near=near;n.p.g.visible=near}
 if(n.eng>0){n.eng-=dt;n.sp+=(0-n.sp)*Math.min(1,dt*10);if(me)n.h+=angDiff(n.h,Math.atan2(me.x-n.x,me.z-n.z))*Math.min(1,dt*6)}
 else if(n.follow&&me){var fdx=me.x-n.x,fdz=me.z-n.z,fd=Math.hypot(fdx,fdz);if(fd>3.2){n.h+=angDiff(n.h,Math.atan2(fdx,fdz))*Math.min(1,dt*8);n.sp+=(Math.min(fd*1.3,NF.crewSpeed?NF.crewSpeed():4.2)-n.sp)*Math.min(1,dt*4)}else n.sp+=(0-n.sp)*Math.min(1,dt*8)}
 else if(n.goal){var gdx=n.goal.x-n.x,gdz=n.goal.z-n.z,gd=Math.hypot(gdx,gdz);if(gd<1.8){n.goal=null;n.sp=0;if(n.onGoal)n.onGoal(n)}else{n.h+=angDiff(n.h,Math.atan2(gdx,gdz))*Math.min(1,dt*6);n.sp+=((n.gs?n.gs:(gd>30?7:2.6))-n.sp)*Math.min(1,dt*3)}}
 else if(n.wait>0){n.wait-=dt;n.sp+=(0-n.sp)*Math.min(1,dt*8)}
 else{var dx=n.tx-n.x,dz=n.tz-n.z,d=Math.hypot(dx,dz);if(d<1.2){n.wait=rnd(1,5);newTarget(n)}else{var th=Math.atan2(dx,dz);n.h+=angDiff(n.h,th)*Math.min(1,dt*5);n.sp+=(n.v-n.sp)*Math.min(1,dt*3)}}
 var ox=n.x,oz=n.z;n.x+=Math.sin(n.h)*n.sp*dt;n.z+=Math.cos(n.h)*n.sp*dt;
 if(!near){n.x=Math.max(-LIM,Math.min(LIM,n.x));n.z=Math.max(-LIM,Math.min(LIM,n.z));return}
 for(var i=0;i<npcs.length;i++){var o=npcs[i];if(o===n||!o.near)continue;var ex=n.x-o.x,ez=n.z-o.z;if(Math.abs(ex)>1.5||Math.abs(ez)>1.5)continue;var e=Math.hypot(ex,ez);if(e<1.4&&e>.001){var f=(1.4-e)*.5;n.x+=ex/e*f;n.z+=ez/e*f}}
 if(me&&!me.riding){var ex2=n.x-me.x,ez2=n.z-me.z,e2=Math.hypot(ex2,ez2);if(e2<1.4&&e2>.001){var f2=(1.4-e2)*.6;n.x+=ex2/e2*f2;n.z+=ez2/e2*f2}}
 resolve(n,.4);if(Math.hypot(n.x-ox,n.z-oz)<.2*dt&&n.wait<=0&&n.eng<=0){n.stuck+=dt;if(n.stuck>1.5){newTarget(n);n.stuck=0}}else n.stuck=0;
 n.p.g.position.set(n.x,0,n.z);n.p.g.rotation.y=n.h;n.p.anim(n.sp,dt)}
/* ---------- vehicles ---------- */
function wheel(r,w){var m=new T.Mesh(new T.CylinderGeometry(r,r,w,12),mat(0x1b1b1b));m.rotation.z=Math.PI/2;m.castShadow=true;return m}
function bx(w,h,d,c,x,y,z){var m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;return m}
function makeKeke(){var g=new T.Group();g.add(bx(1.3,.8,2,0xf5c400,0,.7,.1));g.add(bx(1.4,.08,1.9,0x1e8e3e,0,1.9,.2));
 [[-.62,.9],[.62,.9],[-.62,-.6],[.62,-.6]].forEach(function(p){g.add(bx(.06,1,.06,0x222222,p[0],1.35,p[1]))});
 g.add(bx(1.2,.5,.9,0x222222,0,1.0,-.45));g.add(bx(1.2,.5,.05,0x9fd3ff,0,1.2,.95));
 var f=wheel(.3,.15);f.position.set(0,.3,1.05);g.add(f);var a=wheel(.3,.15),b=wheel(.3,.15);a.position.set(-.65,.3,-.5);b.position.set(.65,.3,-.5);g.add(a);g.add(b);return {g:g,sp:7,len:2.8,hw:.8,kind:'Keke',fare:100,ico:'🛺'}}
function makeBus(){var g=new T.Group();g.add(bx(2.4,2.2,7,0xf7b500,0,1.5,0));g.add(bx(2.42,.35,7.02,0x1e5fa8,0,1.0,0));g.add(bx(2.44,.7,6,0x2b3a4a,0,2.05,0));g.add(bx(2.2,.1,6.8,0xe0a000,0,2.65,0));
 [[-1.2,2.2],[1.2,2.2],[-1.2,-2.2],[1.2,-2.2]].forEach(function(p){var w=wheel(.5,.3);w.position.set(p[0],.5,p[1]);g.add(w)});return {g:g,sp:6,len:7.2,hw:1.3,kind:'Bus',fare:70,ico:'🚌'}}
function makeBike(){var g=new T.Group();var w1=wheel(.35,.1),w2=wheel(.35,.1);w1.position.set(0,.35,.75);w2.position.set(0,.35,-.75);g.add(w1);g.add(w2);
 g.add(bx(.14,.14,1.5,0xc0392b,0,.75,0));g.add(bx(.3,.12,.7,0x222222,0,.95,-.2));
 var r=makePerson(randLook(false));r.g.scale.set(.9,.9,.9);r.g.position.set(0,-.02,-.2);r.hips.position.y=.82;r.sp.rotation.x=.25;r.legs.forEach(function(l){l.th.rotation.x=-1.1;l.kn.rotation.x=1.2});r.arms.forEach(function(a){a.sh.rotation.x=-1.0;a.el.rotation.x=-.2});g.add(r.g);return {g:g,sp:11,len:2.2,hw:.6,kind:'Bike',fare:150,ico:'🏍️'}}
function loopPos(v,s0){var A=v.a+v.lane,R=7,L=A-R,seg=2*L,q=Math.PI*R/2,per=4*seg+4*q,s=((s0%per)+per)%per;
 function at(s){if(s<seg)return [-L+s,-A];s-=seg;if(s<q){var t=s/R;return [L+Math.sin(t)*R,-L-Math.cos(t)*R]}s-=q;
  if(s<seg)return [A,-L+s];s-=seg;if(s<q){var t2=s/R;return [L+Math.cos(t2)*R,L+Math.sin(t2)*R]}s-=q;
  if(s<seg)return [L-s,A];s-=seg;if(s<q){var t3=s/R;return [-L-Math.sin(t3)*R,L+Math.cos(t3)*R]}s-=q;
  if(s<seg)return [-A,L-s];s-=seg;var t4=s/R;return [-L-Math.cos(t4)*R,-L-Math.sin(t4)*R]}
 var p=at(s),p2=at(s+.5);return {x:p[0],z:p[1],h:Math.atan2(p2[0]-p[0],p2[1]-p[1])}}
function spawnVehicles(){var mk=[makeKeke,makeBus,makeKeke,makeBike,makeKeke,makeBus,makeBike,makeKeke,makeBike];
 [220,110].forEach(function(a){mk.forEach(function(f,i){var v=f();v.dir=(i%2?1:-1);v.lane=(i%2?-3:3);v.a=a;v.s=rnd(0,4000);v.k=1;v.x=0;v.z=0;v.ry=0;v.vis=true;scene.add(v.g);vehicles.push(v)})})}
function updVeh(v,dt){
 var riding=me&&me.riding===v,dd=1e9;
 if(me&&!me.riding){dd=Math.hypot(v.x-me.x,v.z-me.z)}
 var tgt=riding?1:Math.max(0,Math.min(1,(dd-5)/9));v.k+=(tgt-v.k)*Math.min(1,dt*3);
 v.s+=v.dir*v.sp*v.k*dt;var p=loopPos(v,v.s);v.x=p.x;v.z=p.z;v.ry=p.h+(v.dir>0?0:Math.PI);
 var cd=me?Math.hypot(v.x-camT.x,v.z-camT.z):0,vis=cd<260;if(vis!==v.vis){v.vis=vis;v.g.visible=vis}
 v.g.position.set(v.x,0,v.z);v.g.rotation.y=v.ry}
/* ---------- player ---------- */
function startGame(f){if(NF.setLook)NF.setLook(f);
 me={x:-100,z:-60,h:Math.PI/2,sp:0,riding:null,as:0,jy:0,jv:0,air:false,seated:false,f:f};
 var lk=NF.look||{};me.p=makePerson({f:f,skin:lk.skin||0x6b4226,top:lk.top||0x1e90ff,bottom:lk.bottom||0x1f2a44,shoe:lk.shoe||0xffffff,hair:lk.hair||0x111111,hairStyle:lk.hairStyle||(f?'puffs':'short'),hijab:lk.hijab||0xc0392b,shorts:!!lk.shorts,bag:lk.bag===undefined?0x2c3e50:lk.bag});
 if(NF.profile&&NF.profile.short)$('title').innerHTML='Naija <b>Fresher</b> · '+NF.profile.short;
 resolve(me,.35);me.p.g.position.set(me.x,me.y||0,me.z);scene.add(me.p.g);me.tag=new T.Mesh(new T.ConeGeometry(.15,.32,4),new T.MeshBasicMaterial({color:0xffd24a}));me.tag.rotation.x=Math.PI;scene.add(me.tag);me.jy=0;me.jv=0;me.air=false;
 camT.set(me.x,1.4,me.z);updMoney();for(var i=0;i<40;i++)makeNPC();spawnVehicles();drawMiniBase();if(NF.life&&NF.life.begin)setTimeout(function(){NF.life.begin(f)},300);
 $('start').style.display='none';started=true;last=performance.now();setTimeout(function(){$('hint').style.opacity=0},7000)}
NF.startGame=function(f){try{startGame(f)}catch(e){showErr('Start failed: '+e.message+' '+(e.stack||'').split('\n')[1])}};
/* ---------- meeting people & rides ---------- */
function updMoney(){$('money').textContent=(NF.clockText?NF.clockText()+' · ':'')+'₦'+money.toLocaleString('en-NG')+' · 👥 '+friends.length+' friend'+(friends.length===1?'':'s')+' · 📞 '+NF.phone.contacts.length}
function showCard(html,mid){var c=$('card');c.innerHTML=html;c.className=mid?'mid':'';c.style.display='block'}
function hideCard(){$('card').style.display='none'}
function npcCard(n){var so=NF.street&&NF.street.cardHTML?NF.street.cardHTML(n):null;if(so){showCard(so);return}var ang=n.hi&&n.mood==='aggressive',em=!n.hi?'':(n.mood==='aggressive'?' 😠':' 😄');
 showCard('<div class="nm">'+n.name+(n.friend?' ✅':'')+em+'</div><div class="sub">'+n.lvl+' Level · '+n.dept+(n.num?' · 📞 '+n.num:'')+'</div><div class="row"><button data-a="hi">👋 Say hi</button><button data-a="fr" class="go">🤝 Be friends</button><button data-a="num">📱 Get number</button>'+(n.c?'<button data-a="chat">💬 Chat</button>':'')+'</div>')}
function vehCard(v){if(v.ride)showCard('<div class="nm">'+v.ico+' To '+v.ride.name+'</div><div class="sub">Paid by bank. Sit back and enjoy the ride.</div><div class="row"><button data-a="skip" class="go">⏩ Skip to arrival</button><button data-a="off">⬇️ Get off here</button></div>');
 else if(me.riding)showCard('<div class="nm">'+v.ico+' Riding '+v.kind+'</div><div class="sub">Sit back, or get off when you reach your place.</div><div class="row"><button data-a="off" class="go">⬇️ Get off</button></div>');
 else showCard('<div class="nm">'+v.ico+' '+v.kind+' stopping for you</div><div class="sub">Fare ₦'+v.fare+' · paid from your bank when you hop on</div><div class="row"><button data-a="ride" class="go">Hop on · ₦'+v.fare+'</button></div>')}
/* ---------- bank payments + phone rides ---------- */
function hhmm2(){var d=new Date();return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
NF.addMoney=function(n,label){money+=n;if(NF.snd)NF.snd.play('ding');NF.txns.push({t:label||'Credit',amt:n,time:hhmm2(),bal:money});updMoney();toast('🏦 Credit alert: +₦'+n.toLocaleString('en-NG')+' · Balance ₦'+money.toLocaleString('en-NG'))};
NF.pay=function(label,amt){if(money<amt)return false;money-=amt;if(NF.snd)NF.snd.play('debit');NF.txns.push({t:label,amt:-amt,time:hhmm2(),bal:money});updMoney();toast('🏦 Debit alert: ₦'+amt.toLocaleString('en-NG')+' · Balance ₦'+money.toLocaleString('en-NG'));return true};
var RK={Keke:{mult:1,sp:9,mk:makeKeke,ico:'🛺'},Bus:{mult:.7,sp:7,mk:makeBus,ico:'🚌'},Bike:{mult:1.15,sp:12,mk:makeBike,ico:'🏍️'}};
function nearIdx(arr,v){var b=0;for(var i=1;i<arr.length;i++)if(Math.abs(arr[i]-v)<Math.abs(arr[b]-v))b=i;return b}
function cl220(v){return Math.max(-220,Math.min(220,v))}
function snapRoad(x,z){var i=nearIdx(XS,x),j=nearIdx(ZS,z);return Math.abs(x-XS[i])<=Math.abs(z-ZS[j])?{x:XS[i],z:cl220(z),vert:true}:{x:cl220(x),z:ZS[j],vert:false}}
function planRoute(S,D){var a=S.vert?{x:S.x,z:ZS[nearIdx(ZS,S.z)]}:{x:XS[nearIdx(XS,S.x)],z:S.z};
 var b=D.vert?{x:D.x,z:ZS[nearIdx(ZS,D.z)]}:{x:XS[nearIdx(XS,D.x)],z:D.z};
 var raw=[S,a,{x:b.x,z:a.z},b,D],pts=[raw[0]];for(var i=1;i<raw.length;i++){var p=pts[pts.length-1];if(Math.hypot(raw[i].x-p.x,raw[i].z-p.z)>.5)pts.push(raw[i])}return pts}
function rideInfo(name,kind){var pl=null;for(var i=0;i<places.length;i++)if(places[i].name===name)pl=places[i];if(!pl||!RK[kind])return null;
 var S=snapRoad(me.x,me.z),air=pl.x>LIM,D=air?{x:220,z:0,vert:false}:snapRoad(pl.x,pl.z),pts=planRoute(S,D),len=0;if(air)pts.push({x:440,z:0});for(var k=1;k<pts.length;k++)len+=Math.hypot(pts[k].x-pts[k-1].x,pts[k].z-pts[k-1].z);
 var r=RK[kind],drop=air?{x:440,z:-10}:D.vert?{x:D.x+(pl.x>=D.x?9.5:-9.5),z:D.z}:{x:D.x,z:D.z+(pl.z>=D.z?9.5:-9.5)};
 return {pl:pl,pts:pts,len:len,drop:drop,fare:Math.max(50,Math.round((50+len*.45)*r.mult/10)*10),secs:Math.max(5,Math.round(len/r.sp))}}
NF.places=places;
NF.ridePlaces=function(){return places.map(function(p){return {name:p.name,dist:Math.round(Math.hypot(me.x-p.x,me.z-p.z))}}).sort(function(a,b){return a.dist-b.dist})};
NF.rideQuote=function(name,kind){var q=rideInfo(name,kind);return q?{fare:q.fare,secs:q.secs,len:Math.round(q.len)}:null};
var fadeEl=document.createElement('div');fadeEl.style.cssText='position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .35s;z-index:60';document.body.appendChild(fadeEl);
var rideV=null;
NF.orderRide=function(name,kind){if(NF.lifeBusy&&NF.lifeBusy())return {ok:false,msg:'You are inside a building. Go outside first, then order a ride.'};if(me.riding||rideV)return {ok:false,msg:'Finish your current ride first'};var q=rideInfo(name,kind);if(!q)return {ok:false,msg:'Place not found'};
 if(!NF.pay('Ride · '+kind+' to '+name,q.fare))return {ok:false,msg:'🏦 Insufficient funds. You need ₦'+q.fare.toLocaleString('en-NG')+' but have ₦'+money.toLocaleString('en-NG')};
 rideV=true;fadeEl.style.opacity=1;
 setTimeout(function(){var v=RK[kind].mk();v.sp=RK[kind].sp;v.ride={pts:q.pts,i:1,drop:q.drop,name:name};v.x=q.pts[0].x;v.z=q.pts[0].z;var n=q.pts[1]||q.pts[0];v.ry=Math.atan2(n.x-v.x,n.z-v.z);v.k=1;v.vv=0;scene.add(v.g);v.g.position.set(v.x,0,v.z);v.g.rotation.y=v.ry;
  rideV=v;me.riding=v;me.p.g.visible=false;me.tag.visible=false;sel=null;selV=v;vehCard(v);camT.set(v.x,1.4,v.z);fadeEl.style.opacity=0;toast(v.ico+' Your '+kind.toLowerCase()+' is here. Heading to '+name)},450);
 return {ok:true}};
function updRide(dt){var v=rideV;if(!v||v===true||!v.ride)return;var R=v.ride,t=R.pts[R.i];if(!t){endRide(true);return}
 var dx=t.x-v.x,dz=t.z-v.z,d=Math.hypot(dx,dz);v.vv+=(v.sp-v.vv)*Math.min(1,dt*1.5);var st=v.vv*dt;
 if(d<=st+.01){v.x=t.x;v.z=t.z;R.i++;if(R.i>=R.pts.length)endRide(true)}else{v.x+=dx/d*st;v.z+=dz/d*st;v.ry+=angDiff(v.ry,Math.atan2(dx,dz))*Math.min(1,dt*6)}
 v.g.position.set(v.x,0,v.z);v.g.rotation.y=v.ry}
function endRide(arrived){var v=rideV;if(!v||v===true||v.ending)return;v.ending=true;fadeEl.style.opacity=1;
 setTimeout(function(){if(arrived){me.x=v.ride.drop.x;me.z=v.ride.drop.z}else{me.x=v.x+Math.cos(v.ry)*3.2;me.z=v.z-Math.sin(v.ry)*3.2}
  scene.remove(v.g);rideV=null;me.riding=null;resolve(me,.35);me.p.g.visible=true;me.tag.visible=true;me.sp=0;me.p.g.position.set(me.x,me.y||0,me.z);selV=null;sel=null;hideCard();camT.set(me.x,1.4,me.z);fadeEl.style.opacity=0;
  toast(arrived?'📍 You have arrived at '+v.ride.name:'You got off the '+v.kind.toLowerCase())},400)}

NF.updMoney=updMoney;
NF.core={T:T,scene:scene,mat:mat,label:label,makePerson:makePerson,randLook:randLook,places:places,
 me:function(){return me},getBoxes:function(){return boxes},setBoxes:function(b){boxes=b},setInt:function(i){INT=i},
 yaw:function(){return camYaw},cam:function(y,p,d){if(y!=null)camYaw=y;if(p!=null)camPitch=p;if(d!=null)camDist=d},snapCam:function(){camT.set(me.x,1.4+(me.y||0),me.z)},
 fade:function(mid,done){fadeEl.style.opacity=1;setTimeout(function(){if(mid)mid();fadeEl.style.opacity=0;setTimeout(function(){if(done)done()},380)},420)},
 showCard:showCard,hideCard:hideCard,seatPose:seatPose,npcs:npcs,bubble:bubble,spawn:function(o){return NF_spawn(o)},addCircle:function(x,z,r){circles.push([x,z,r])},isOutdoorBoxes:function(){return boxes},travelling:function(){return !!(me&&me.riding)||!!flt||!!rideV},cardBusy:function(){return !!(sel||selV)||!!me.riding||!!flt||!!rideV||!!(NF.street&&NF.street.busy&&NF.street.busy())},clearSel:function(){sel=null;selV=null},started:function(){return started},resolve:resolve,toast:toast};
/* contacts, phone and chat live in js/phone.js (NF.phone) */

$('card').addEventListener('click',function(e){var a=e.target.getAttribute&&e.target.getAttribute('data-a');if(!a)return;
 if(a.indexOf('L:')===0){if(NF.lifeAct)NF.lifeAct(a.slice(2));return}
 if(a.indexOf('S:')===0){if(NF.street)NF.street.outActRoute(a.slice(2));return}
 if(sel&&NF.street&&NF.street.act&&NF.street.act(sel,a)){return}
 if(sel){var n=sel,ag=n.mood==='aggressive';n.eng=7;
  if(a==='hi'){n.hi=true;bubble(n,pick(ag?HI_A:HI_L),3800,ag)}
  else if(a==='fr'){if(n.friend)bubble(n,'We are already friends! 😄');else if(ag)bubble(n,pick(FR_NO),3500,true);else{n.friend=true;NF.phone.add(n).friend=true;NF.phone.save();friends.push(n);bubble(n,'Yes! We are friends now 🤝');toast('🤝 '+n.name+' is now your friend');updMoney()}}
  else if(a==='num'){if(n.num)bubble(n,'You already have my number 😄');else if(ag)bubble(n,pick(NUM_NO),3800,true);else{n.num='0'+pick(['801','803','805','810','812','903','906'])+(1000000+((Math.random()*8999999)|0));NF.phone.add(n).num=n.num;NF.phone.save();bubble(n,'Sure! Save it: '+n.num+' 😊');toast('📱 '+n.name+' saved in Contacts')}}
  else if(a==='chat'){if(n.c)NF.phone.openChat(n.c)}
  sel=null;npcCard(n);sel=n}
 else if(selV||me.riding){var v=me.riding||selV;if(v.ride){if(a==='skip')endRide(true);else if(a==='off')endRide(false);return}
  if(a==='ride'){if(!NF.pay(v.kind+' fare',v.fare)){toast('🏦 Insufficient funds');return}me.riding=v;me.p.g.visible=false;me.tag.visible=false;toast(v.ico+' You are on the '+v.kind.toLowerCase()+' — tap Get off any time');vehCard(v);return}
  else if(a==='off'){var side=3.2;me.x=v.x+Math.cos(v.ry)*side;me.z=v.z-Math.sin(v.ry)*side;me.riding=null;resolve(me,.35);me.p.g.visible=true;me.tag.visible=true;me.sp=0;selV=null;hideCard()}}});
/* ---------- minimap ---------- */
var mini=$('mini'),mg=mini.getContext('2d'),mbase=null,MS=224/520;
function mx(x){return (x+260)*MS}
function drawMiniBase(){mbase=document.createElement('canvas');mbase.width=224;mbase.height=224;var g=mbase.getContext('2d');g.fillStyle='#7bbf6a';g.fillRect(0,0,224,224);g.fillStyle='#6a6e7c';
 XS.forEach(function(x){g.fillRect(mx(x-6),mx(-226),12*MS,452*MS)});ZS.forEach(function(z){g.fillRect(mx(-226),mx(z-6),452*MS,12*MS)});
 g.fillStyle='#e9c98a';boxes.forEach(function(b){g.fillRect(mx(b.x0),mx(b.z0),(b.x1-b.x0)*MS,(b.z1-b.z0)*MS)});
 if(POND){g.fillStyle='#4aa8e8';g.beginPath();g.arc(mx(POND.x),mx(POND.z),11*MS,0,6.3);g.fill()}if(PITCH){g.fillStyle='#3da35d';g.fillRect(mx(PITCH.x0),mx(PITCH.z0),72*MS,44*MS)}}
function drawMini(){if(!mbase)return;mg.drawImage(mbase,0,0);npcs.forEach(function(n){if(n.friend){mg.fillStyle='#22d3ee';mg.beginPath();mg.arc(mx(n.x),mx(n.z),3,0,6.3);mg.fill()}});
 mg.fillStyle='#ffd24a';mg.strokeStyle='#000';mg.lineWidth=2;mg.beginPath();mg.arc(mx(me.x),mx(me.z),5,0,6.3);mg.fill();mg.stroke()}
/* ---------- input ---------- */
var joy=$('joy'),knob=$('knob'),jid=null;
function jset(e){var r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,m=Math.hypot(dx,dy),R=r.width/2-8;if(m>R){dx*=R/m;dy*=R/m}
 knob.style.transform='translate('+dx+'px,'+dy+'px)';var jx=dx/R,jy=-dy/R,mm=Math.hypot(jx,jy);if(mm<.12){jx=0;jy=0}J.x=jx;J.y=jy}
joy.addEventListener('pointerdown',function(e){jid=e.pointerId;joy.setPointerCapture(e.pointerId);jset(e);e.preventDefault()});
joy.addEventListener('pointermove',function(e){if(e.pointerId===jid)jset(e)});
function jend(e){if(e.pointerId===jid){jid=null;J.x=0;J.y=0;knob.style.transform='translate(0,0)'}}
joy.addEventListener('pointerup',jend);joy.addEventListener('pointercancel',jend);
window.addEventListener('keydown',function(e){keys[e.key.toLowerCase()]=1});window.addEventListener('keyup',function(e){keys[e.key.toLowerCase()]=0});
var cv=renderer.domElement,ptr={},pd0=0;
function clampDist(){camDist=mode==='follow'?Math.max(2.5,Math.min(22,camDist)):Math.max(10,Math.min(480,camDist))}
cv.addEventListener('pointerdown',function(e){ptr[e.pointerId]={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId);var ks=Object.keys(ptr);if(ks.length===2)pd0=Math.hypot(ptr[ks[0]].x-ptr[ks[1]].x,ptr[ks[0]].y-ptr[ks[1]].y)});
cv.addEventListener('pointermove',function(e){var p=ptr[e.pointerId];if(!p)return;var ks=Object.keys(ptr),dx=e.clientX-p.x,dy=e.clientY-p.y;
 if(ks.length===1){lastDrag=performance.now();
  if(mode==='follow'){camYaw-=dx*.006;camPitch=Math.max(.08,Math.min(1.3,camPitch+dy*.004))}
  else{var k=camDist*.0022,sy=Math.sin(camYaw),cy=Math.cos(camYaw);freeT.x=Math.max(-LIM,Math.min(AMAX,freeT.x+(-dx*cy-dy*sy)*k));freeT.z=Math.max(-LIM,Math.min(LIM,freeT.z+(dx*sy-dy*cy)*k))}}
 else if(ks.length===2){var a=ptr[ks[0]],b=ptr[ks[1]];p.x=e.clientX;p.y=e.clientY;var d=Math.hypot(a.x-b.x,a.y-b.y);if(pd0>0)camDist*=pd0/d;pd0=d;clampDist()}
 p.x=e.clientX;p.y=e.clientY});
function pend(e){delete ptr[e.pointerId];pd0=0}cv.addEventListener('pointerup',pend);cv.addEventListener('pointercancel',pend);
cv.addEventListener('wheel',function(e){camDist*=e.deltaY>0?1.1:.9;clampDist()},{passive:true});
function jumpNow(){if(!me||!started||me.riding||me.seated||flt||me.air||mode==='free'||(NF.menuOpen&&NF.menuOpen()))return;me.air=true;me.jv=6.6;me.jy=.001;if(NF.snd)NF.snd.play('jump')}
NF.jump=jumpNow;$('bjump').addEventListener('pointerdown',function(e){e.preventDefault();jumpNow()});
window.addEventListener('keydown',function(e){if(e.key===' ')e.preventDefault()});
if($('bsnd'))$('bsnd').addEventListener('click',function(){if(NF.snd)NF.snd.toggle()});
var bfree=$('bfree'),bs=$('bsprint');
bfree.addEventListener('click',function(){if(!started)return;mode=mode==='follow'?'free':'follow';bfree.classList.toggle('on',mode==='free');bfree.textContent=mode==='free'?'👤 Follow me':'🧭 Free map';
 if(mode==='free'){freeT.set(me.x,0,me.z);camDist=140;camPitch=1.0}else{camDist=6.5;camPitch=.42}joy.style.opacity=mode==='free'?.3:1});
var runSpeed=9;function spTxt(){bs.classList.toggle('on',sprint);bs.textContent=sprint?'🏃 Run '+runSpeed:'🚶 Walk'}
bs.addEventListener('click',function(){sprint=!sprint;spTxt()});
$('bslow').addEventListener('click',function(){runSpeed=Math.max(4,runSpeed-1);sprint=true;spTxt()});
$('bfast').addEventListener('click',function(){runSpeed=Math.min(14,runSpeed+1);sprint=true;spTxt()});
addEventListener('resize',function(){renderer.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()});
/* ---------- loop ---------- */
var rk=0,last=performance.now(),fpsA=60,fpsT=0,frames=0,lowT=0,qual=2,placeEl=$('place'),fpsEl=$('fps'),miniT=0,cardT=0,TEX=56/1024;
function loop(now){requestAnimationFrame(loop);var dt=Math.min(.05,(now-last)/1000);last=now;if(!started){renderer.render(scene,cam);return}
 var jx=J.x,jy=J.y;if(keys.w||keys.arrowup)jy=1;if(keys.s||keys.arrowdown)jy=-1;if(keys.a||keys.arrowleft)jx=-1;if(keys.d||keys.arrowright)jx=1;
 if(keys[' '])jumpNow();var m=Math.min(1,Math.hypot(jx,jy));var phoneOpen=!!(NF.phone&&NF.phone.open);if(mode==='free'||me.riding||me.seated||phoneOpen||flt||(NF.menuOpen&&NF.menuOpen())||(NF.street&&NF.street.frozen))m=0;me.p.usingPhone=phoneOpen&&!me.riding;
 if(me.riding){me.x=me.riding.x;me.z=me.riding.z;me.p.g.position.set(me.x,me.y||0,me.z);me.sp=0}
 else if(me.seated){me.p.g.position.set(me.x,me.y||0,me.z);me.p.g.rotation.y=me.h;me.p.anim(0,dt);seatPose(me.p);me.tag.position.set(me.x,(me.y||0)+1.75+Math.sin(now/220)*.05,me.z)}
 else{
  var vmax=sprint?runSpeed:3.4,tsp=m*vmax;me.sp+=(tsp-me.sp)*Math.min(1,dt*(tsp>me.sp?5:9));
  if(m>.05){var sy=Math.sin(camYaw),cy=Math.cos(camYaw),dx=-sy*jy+cy*jx,dz=-cy*jy-sy*jx,th=Math.atan2(dx,dz);me.h+=angDiff(me.h,th)*Math.min(1,dt*9);
   if(mode==='follow'&&jy>.5&&Math.abs(jx)<.4&&performance.now()-lastDrag>1200)camYaw+=angDiff(camYaw,me.h+Math.PI)*Math.min(1,dt*.7)}
  var ox=me.x,oz=me.z;me.x+=Math.sin(me.h)*me.sp*dt;me.z+=Math.cos(me.h)*me.sp*dt;
  for(var i=0;i<npcs.length;i++){var n=npcs[i];if(!n.near)continue;var ex=me.x-n.x,ez=me.z-n.z;if(Math.abs(ex)>1.2||Math.abs(ez)>1.2)continue;var e=Math.hypot(ex,ez);if(e<.8&&e>.001){me.x+=ex/e*(.8-e)*.5;me.z+=ez/e*(.8-e)*.5}}
  for(var vi=0;vi<vehicles.length;vi++){var vv=vehicles[vi];if(Math.abs(vv.x-me.x)<8&&Math.abs(vv.z-me.z)<8)pushOutVeh(me,.35,vv)}
  resolve(me,.35);
  var moved=Math.hypot(me.x-ox,me.z-oz)/Math.max(dt,.001),blocked=me.sp>1&&moved<me.sp*.4;
  me.as+=((blocked?Math.max(moved,me.sp*.6):moved)-me.as)*Math.min(1,dt*12);
  if(me.air){me.jv-=22*dt;me.jy+=me.jv*dt;if(me.jy<=0){me.jy=0;me.jv=0;me.air=false;if(NF.snd)NF.snd.play('land')}}
  me.p.g.position.set(me.x,(me.y||0)+me.jy,me.z);me.p.g.rotation.y=me.h;me.p.anim(me.air?Math.max(me.as,1.2):me.as,dt);me.tag.position.set(me.x,(me.y||0)+me.jy+2.2+Math.sin(now/220)*.06,me.z)}
 if(NF.snd)NF.snd.frame(dt,{speed:me.as,ph:me.p.ph,riding:me.riding?(me.riding.kind||'Keke'):null,flt:!!flt,inside:(NF.life&&NF.life.cur)?NF.life.cur.type:null,air:me.air,sit:me.seated});
 for(var j=0;j<npcs.length;j++)updNPC(npcs[j],dt);for(var k=0;k<vehicles.length;k++)updVeh(vehicles[k],dt);updRide(dt);updAir(dt);
 if(flt){flightCam(dt)}else{var tx,ty,tz;if(mode==='follow'){tx=me.x;ty=1.4+(me.y||0)+(me.jy||0)*.5;tz=me.z}else{tx=freeT.x;ty=0;tz=freeT.z}
 var lk=Math.min(1,dt*8);camT.x+=(tx-camT.x)*lk;camT.y+=(ty-camT.y)*lk;camT.z+=(tz-camT.z)*lk;
 rk+=((me.riding&&mode==='follow'?1:0)-rk)*Math.min(1,dt*3);var cD=camDist*(1-rk)+(me.riding?2.6+(me.riding.len||4)*.6:5)*rk,cPt=camPitch*(1-rk)+.3*rk;scene.fog.near=90*(1-rk)+16*rk;scene.fog.far=420*(1-rk)+110*rk;
 var cp=Math.cos(cPt);cam.position.set(camT.x+Math.sin(camYaw)*cp*cD,camT.y+Math.sin(cPt)*cD+(mode==='follow'?.3:0),camT.z+Math.cos(camYaw)*cp*cD);
 if(cam.position.y<.6)cam.position.y=.6;cam.lookAt(camT)}
 var sx=Math.round(camT.x/TEX)*TEX,sz=Math.round(camT.z/TEX)*TEX;sun.position.set(sx+40,70,sz+30);sun.target.position.set(sx,0,sz);sun.target.updateMatrixWorld();
 updLabels();cardT-=dt;if(NF.lifeTick)NF.lifeTick(dt);if(NF.streetTick)NF.streetTick(dt);if(cardT<=0&&!flt&&!(NF.lifeBusy&&NF.lifeBusy())){cardT=.15;
  if(me.riding){if(selV!==me.riding||!$('card').innerHTML||sel){selV=me.riding;sel=null;vehCard(me.riding)}}
  else{var bn=null,bd=3.4;for(var q=0;q<npcs.length;q++){var nn=npcs[q];if(!nn.near||nn.gone||nn.down>0)continue;var dd=Math.hypot(nn.x-me.x,nn.z-me.z);if(dd<bd){bd=dd;bn=nn}}
   var bv=null,bvd=7;if(!bn)for(var w=0;w<vehicles.length;w++){var v2=vehicles[w],d2=Math.hypot(v2.x-me.x,v2.z-me.z);if(d2<bvd&&v2.k<.35){bvd=d2;bv=v2}}
   if(bn){if(sel!==bn){sel=bn;selV=null;npcCard(bn)}}else if(bv){if(selV!==bv){selV=bv;sel=null;vehCard(bv)}}else if(sel||selV){sel=null;selV=null;hideCard()}}
  var nb=null;for(var q2=0;q2<places.length;q2++){var b=places[q2];if(Math.abs(me.x-b.x)<b.w/2+10&&Math.abs(me.z-b.z)<b.d/2+10){nb=b;break}}
  if(nb){placeEl.style.display='block';placeEl.textContent='📍 '+nb.name}else placeEl.style.display='none'}
 miniT-=dt;if(miniT<=0){miniT=.25;drawMini()}
 renderer.render(scene,cam);
 frames++;fpsT+=dt;if(fpsT>1){fpsA=frames/fpsT;frames=0;fpsT=0;fpsEl.textContent=Math.round(fpsA)+' fps';
  if(fpsA<30&&qual>0){lowT++;if(lowT>=2){qual--;lowT=0;if(qual===1){renderer.shadowMap.enabled=false;scene.traverse(function(o){if(o.material){o.material.needsUpdate=true}})}else{renderer.setPixelRatio(1);renderer.setSize(innerWidth,innerHeight)}}}else lowT=0}}
requestAnimationFrame(loop);
window.__t3={me:function(){return me},npcs:npcs,veh:vehicles,sel:function(){return sel},tp:function(x,z){me.x=x;me.z=z}};
})();
