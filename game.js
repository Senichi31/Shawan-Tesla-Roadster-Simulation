'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const W=1400,H=600,L=65,R=1335,T=100,B=510;
const rampStart=620,rampEnd=1000,rampRise=230;
function track(x){if(x>rampEnd)return {y:B,slope:0};const u=Math.max(0,Math.min(1,(x-rampStart)/(rampEnd-rampStart)));return {y:B-rampRise*u*u,slope:x>rampStart&&x<=rampEnd?-2*rampRise*u/(rampEnd-rampStart):0};}
const keys=new Set(),rings=[{x:340,y:480},{x:730,y:465},{x:935,y:320},{x:1100,y:180},{x:1250,y:145}];
let car,magnet=false,flight=false,paused=false,score=0,last=0,time=0,toastUntil=6,particles=[];
function reset(){car={x:160,y:B-12,vx:0,vy:0,angle:0,surface:'track',speed:0,launched:false};score=0;rings.forEach(r=>r.hit=false);particles=[];magnet=false;flight=false;paused=false;keys.clear();toastUntil=time+6;document.querySelector('#toast').textContent='Hold D or ↑ to accelerate up the launch ramp. Shift to boost.';sync();}
function sync(){document.querySelector('#magnet').classList.toggle('active',magnet);document.querySelector('#flight').classList.toggle('active',flight);document.querySelector('#mode').textContent=flight?'● FLIGHT MODE':magnet?'● MAGNETIC GRIP':'● GROUND DRIVE';document.querySelector('#status').textContent=flight?'THRUSTERS ENGAGED':magnet?'MAGNETIC SYSTEM ACTIVE':'GRIP SYSTEM READY';document.querySelector('#pause').textContent=paused?'▶':'Ⅱ';}
function toggleMagnet(){magnet=!magnet;if(magnet)flight=false;sync();}
function toggleFlight(){flight=!flight;if(flight){magnet=false;car.surface=null;car.vy=Math.min(car.vy,-95);}sync();}
document.querySelector('#reset').onclick=reset;document.querySelector('#magnet').onclick=toggleMagnet;document.querySelector('#flight').onclick=toggleFlight;document.querySelector('#pause').onclick=()=>{paused=!paused;keys.clear();sync();};
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();const k=e.key.toLowerCase();if(!e.repeat){if(k==='m')toggleMagnet();if(k==='f')toggleFlight();if(k==='r')reset();if(k==='p'||k==='escape'){paused=!paused;sync();}}keys.add(k);});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
function update(dt){time+=dt;const right=keys.has('d')||keys.has('arrowright'),left=keys.has('a')||keys.has('arrowleft'),up=keys.has('w')||keys.has('arrowup'),down=keys.has('s')||keys.has('arrowdown'),boost=keys.has('shift'),power=boost?820:420;
const oldX=car.x,oldY=car.y;
if(flight){car.surface=null;car.vx+=(Number(right)-Number(left))*power*dt;car.vy+=(Number(down)-Number(up))*power*dt;car.vx*=Math.exp(-.7*dt);car.vy*=Math.exp(-.7*dt);car.angle+=((car.vx/650)*.18-car.angle)*Math.min(1,dt*5);car.x+=car.vx*dt;car.y+=car.vy*dt;}
else if(car.surface==='track'){
 const path=track(car.x),angle=Math.atan(path.slope),drive=Number(right||up)-Number(left||down);
 car.speed+=(drive*((boost?1000:650)+(magnet?90:0))+420*Math.sin(angle))*dt;
 car.speed*=Math.exp(-.48*dt);car.speed=Math.max(-650,Math.min(950,car.speed));
 car.vx=car.speed*Math.cos(angle);car.vy=car.speed*Math.sin(angle);
 car.x+=car.vx*dt;
 if(car.x>rampEnd&&oldX<=rampEnd&&car.speed>0){
  const lip=track(rampEnd),launchAngle=Math.atan(lip.slope);
  car.y=lip.y-17;car.vx=car.speed*Math.cos(launchAngle);car.vy=car.speed*Math.sin(launchAngle);car.angle=launchAngle;car.surface=null;car.launched=true;
  toastUntil=time+4;document.querySelector('#toast').textContent='LIFTOFF! Press F to engage flight. WASD steers in the air.';
 }else{car.x=Math.max(L+50,car.x);const next=track(car.x);car.y=next.y-17;car.angle=Math.atan(next.slope);if(car.x<=L+50)car.speed=Math.max(0,car.speed);}
}else{
 car.vx+=(Number(right)-Number(left))*power*.25*dt;car.vy+=420*dt;car.x+=car.vx*dt;car.y+=car.vy*dt;
 const target=Math.atan2(car.vy,Math.max(60,car.vx));car.angle+=(target-car.angle)*Math.min(1,dt*2);
}
// Sweep against the road from above; the ramp lip remains open for takeoff.
if(car.surface===null){const ground=car.x<=rampEnd?track(car.x):{y:B,slope:0};const oldGround=oldX<=rampEnd?track(oldX):{y:B,slope:0};
 if(oldY+17<=oldGround.y+3&&car.y+17>=ground.y&&car.vy>=ground.slope*car.vx){car.y=ground.y-17;car.vy=0;if(!flight){car.surface='track';car.speed=car.vx/Math.cos(Math.atan(ground.slope));car.angle=Math.atan(ground.slope);}}
}
if(car.x<L+50){car.x=L+50;car.vx=Math.max(0,car.vx);}if(car.x>R-50){car.x=R-50;car.vx=Math.min(0,car.vx);if(car.surface==='track')car.speed=Math.min(0,car.speed);}
if(car.y<T+20){car.y=T+20;car.vy=Math.max(0,car.vy);}if(car.y>B-17){car.y=B-17;car.vy=0;if(!flight){car.surface='track';car.speed=car.vx;}}
for(const r of rings)if(!r.hit&&Math.hypot(car.x-r.x,car.y-r.y)<45){r.hit=true;score++;toastUntil=time+4;document.querySelector('#toast').textContent=score===5?'All checkpoints cleared. The sky is yours. R to run again.':`Checkpoint ${score} / 5 collected. Keep exploring.`;for(let i=0;i<22;i++)particles.push({x:r.x,y:r.y,vx:(Math.random()-.5)*240,vy:(Math.random()-.5)*240,life:1});}
particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;});particles=particles.filter(p=>p.life>0);document.querySelector('#speed').textContent=String(Math.round(Math.hypot(car.vx,car.vy)*.36)).padStart(3,'0');document.querySelector('#score').textContent=`0${score} / 05`;document.querySelector('#toast').style.opacity=time<toastUntil?'1':'0';}
function line(x,y,x2,y2,color,width=1){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function draw(){const dpr=devicePixelRatio||1,cw=canvas.clientWidth,ch=canvas.clientHeight;if(canvas.width!==cw*dpr||canvas.height!==ch*dpr){canvas.width=cw*dpr;canvas.height=ch*dpr;}ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.fillStyle='#141b27';ctx.fillRect(0,0,W,H);
const glow=ctx.createRadialGradient(740,300,30,740,300,700);glow.addColorStop(0,'#253449');glow.addColorStop(1,'#111722');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
for(let x=0;x<W;x+=40)line(x,125,x,H,'#93b0d007');for(let y=150;y<H;y+=40)line(0,y,W,y,'#93b0d007');
ctx.save();ctx.globalAlpha=.18;ctx.fillStyle='#718199';for(let i=0;i<32;i++){const x=(i*137+43)%W,h=25+(i*29)%90;ctx.fillRect(x,B-h,38+(i%3)*12,h);}ctx.restore();
ctx.font='bold 92px Arial';ctx.fillStyle='#c0d1e807';ctx.textAlign='center';ctx.fillText('DEFY THE ORDINARY',W/2,335);ctx.textAlign='left';
// Elevated curved launch track, with exposed steel supports below the deck.
const deck=()=>{ctx.moveTo(L,B);ctx.lineTo(rampStart,B);for(let x=rampStart;x<=rampEnd;x+=4)ctx.lineTo(x,track(x).y);};
ctx.fillStyle='#1b2735';ctx.beginPath();deck();ctx.lineTo(rampEnd,B+22);ctx.lineTo(L,B+22);ctx.closePath();ctx.fill();
for(let x=rampStart+30;x<rampEnd;x+=48){const y=track(x).y;line(x,y+12,x,B+18,'#526577',3);line(x,y+16,Math.min(x+48,rampEnd),B+18,'#34475b',2);}
ctx.beginPath();deck();ctx.strokeStyle='#4f667e';ctx.lineWidth=14;ctx.stroke();
ctx.beginPath();deck();ctx.strokeStyle=magnet?'#72e6e8':'#d8e1ec';ctx.lineWidth=2;ctx.shadowColor=magnet?'#58dce9':'#8fc3ff';ctx.shadowBlur=10;ctx.stroke();ctx.shadowBlur=0;
line(rampEnd+12,B,R,B,'#657b92',3);line(L,B+22,R,B+22,'#344455',2);
for(let x=L+20;x<rampStart-15;x+=48)line(x,B+8,x+22,B+8,'#a8b1bc66',2);
for(let x=675;x<970;x+=66){const p=track(x);ctx.save();ctx.translate(x,p.y-12);ctx.rotate(Math.atan(p.slope));line(-6,-4,0,0,'#ff7560',2);line(0,0,-6,4,'#ff7560',2);ctx.restore();}
ctx.fillStyle='#8797ac';ctx.font='10px monospace';ctx.fillText('01 / ACCELERATION STRAIGHT',L+22,B+49);ctx.fillStyle='#ff8d75';ctx.fillText('02 / CURVED LAUNCH RAMP',650,555);ctx.fillStyle='#96dce9';ctx.fillText('03 / OPEN SKY',1090,245);
line(rampEnd,track(rampEnd).y,rampEnd+80,track(rampEnd).y-97,'#85dce640',1);
for(let i=0;i<rings.length;i++){const r=rings[i];if(r.hit)continue;const pulse=Math.sin(time*3+i)*3;ctx.save();ctx.translate(r.x,r.y);ctx.shadowColor='#f3bc69';ctx.shadowBlur=17;ctx.strokeStyle='#f2bd72';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,18+pulse/2,27+pulse,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.strokeStyle='#f2bd7240';ctx.beginPath();ctx.ellipse(0,0,24+pulse/2,33+pulse,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#f2bd72';ctx.font='9px monospace';ctx.textAlign='center';ctx.fillText(String(i+1).padStart(2,'0'),0,-43);ctx.restore();}
for(const p of particles){ctx.globalAlpha=p.life;ctx.fillStyle='#ffd69a';ctx.fillRect(p.x,p.y,3,3);}ctx.globalAlpha=1;
ctx.save();ctx.translate(car.x,car.y);ctx.rotate(car.angle);if(flight){ctx.fillStyle='#59dce4';ctx.shadowColor='#50e3f3';ctx.shadowBlur=16;for(const x of [-21,20]){ctx.beginPath();ctx.moveTo(x-4,8);ctx.lineTo(x,22+Math.random()*14);ctx.lineTo(x+4,8);ctx.fill();}ctx.shadowBlur=0;}if(magnet){ctx.strokeStyle='#69e4ee77';ctx.beginPath();ctx.ellipse(0,12,39,7,0,0,Math.PI*2);ctx.stroke();}
// Roadster-inspired silhouette: sculpted nose, black panoramic canopy and large turbine wheels.
ctx.scale(1.35,1.35);
const paint=ctx.createLinearGradient(0,-23,0,9);paint.addColorStop(0,'#ff8b77');paint.addColorStop(.35,'#ef392e');paint.addColorStop(.75,'#b71920');paint.addColorStop(1,'#5d101b');
ctx.fillStyle='#080c13';ctx.beginPath();ctx.ellipse(0,12,48,4,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle=paint;ctx.beginPath();ctx.moveTo(-49,0);ctx.bezierCurveTo(-48,-10,-39,-12,-26,-13);ctx.bezierCurveTo(-15,-24,0,-28,15,-21);ctx.lineTo(29,-12);ctx.bezierCurveTo(37,-11,48,-8,51,-3);ctx.lineTo(49,5);ctx.lineTo(36,8);ctx.lineTo(-43,8);ctx.closePath();ctx.fill();
ctx.fillStyle='#081522';ctx.beginPath();ctx.moveTo(-22,-13);ctx.bezierCurveTo(-9,-23,1,-23,12,-19);ctx.lineTo(24,-12);ctx.closePath();ctx.fill();line(-17,-15,6,-20,'#a8d1e5',1);line(3,-21,9,-13,'#344e65',1);
ctx.strokeStyle='#5a111b';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(7,-10);ctx.lineTo(12,3);ctx.lineTo(-18,4);ctx.lineTo(-23,-9);ctx.stroke();line(-38,-8,39,-5,'#ff9e84',1);line(-22,7,22,7,'#ff5c4a',2);line(-4,-8,2,-8,'#e89c91',1);
ctx.fillStyle='#14202c';ctx.beginPath();ctx.ellipse(44,3,5,2,-.15,0,Math.PI*2);ctx.fill();line(34,-7,46,-4,'#e4f8ff',2);line(-47,-5,-40,-6,'#ffb09e',2);line(-48,-10,-31,-11,'#641822',2);
for(const x of [-30,31]){ctx.fillStyle='#080a10';ctx.beginPath();ctx.arc(x,6,11,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#303844';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#56616e';ctx.beginPath();ctx.arc(x,6,7.5,0,Math.PI*2);ctx.fill();ctx.save();ctx.translate(x,6);ctx.rotate(car.x*.05);for(let i=0;i<5;i++){ctx.rotate(Math.PI*2/5);line(1,0,6,2,'#c4cdd5',1.5);}ctx.restore();ctx.fillStyle='#181f2a';ctx.beginPath();ctx.arc(x,6,2.5,0,Math.PI*2);ctx.fill();}
ctx.restore();
if(paused){ctx.fillStyle='#080d17bb';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 36px Arial';ctx.fillText('PAUSED',W/2,H/2);ctx.font='14px Arial';ctx.fillStyle='#acb7c9';ctx.fillText('Press P or click ▶ to continue',W/2,H/2+34);ctx.textAlign='left';}}
function frame(ts){const dt=Math.min((ts-last)/1000||0,.033);last=ts;if(!paused)update(dt);draw();requestAnimationFrame(frame);}reset();requestAnimationFrame(frame);
// Read-only telemetry for automated smoke checks and development tools.
window.roadsterState=()=>({x:car.x,y:car.y,vx:car.vx,vy:car.vy,surface:car.surface,launched:car.launched,angle:car.angle,magnet,flight,paused,score});
