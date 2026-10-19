'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const W=1400,H=600,L=65,R=1335,T=100,B=510;
// Arc-length parametrization supports the vertical and backward-curving lip.
const rampStart=950,rx=135,ry=250,endTheta=2.02;
const arc=[{x:rampStart,y:B,s:rampStart,angle:0}];
for(let i=1;i<=180;i++){const t=endTheta*i/180,prev=arc.at(-1),x=rampStart+rx*Math.sin(t),y=B-ry*(1-Math.cos(t));arc.push({x,y,s:prev.s+Math.hypot(x-prev.x,y-prev.y),angle:Math.atan2(-ry*Math.sin(t),rx*Math.cos(t))});}
const trackEnd=arc.at(-1).s;
function pathAt(distance){if(distance<=rampStart)return {x:distance,y:B,angle:0};const i=arc.findIndex(p=>p.s>=distance);if(i<0)return arc.at(-1);const a=arc[i-1],b=arc[i],u=(distance-a.s)/(b.s-a.s);return {x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u,angle:a.angle+(b.angle-a.angle)*u};}
function placeOnTrack(){const p=pathAt(car.s);car.angle=p.angle;car.x=p.x+17*Math.sin(p.angle);car.y=p.y-17*Math.cos(p.angle);}
const keys=new Set(),rings=[{x:340,y:480},{x:780,y:480},{x:1055,y:365},{x:1040,y:230},{x:830,y:170}];
let car,magnet=false,flight=false,paused=false,score=0,last=0,time=0,toastUntil=6,particles=[];
function reset(){car={x:160,y:B-17,vx:0,vy:0,angle:0,surface:'track',speed:0,s:160,launched:false};score=0;rings.forEach(r=>r.hit=false);particles=[];magnet=false;flight=false;paused=false;keys.clear();toastUntil=time+6;document.querySelector('#toast').textContent='THE RAMP / Hold D + Shift. M engages magnetic grip. F activates flight.';sync();}
function sync(){document.querySelector('#magnet').classList.toggle('active',magnet);document.querySelector('#flight').classList.toggle('active',flight);document.querySelector('#mode').textContent=flight?'● FLIGHT MODE':magnet?'● MAGNETIC GRIP':'● GROUND DRIVE';document.querySelector('#status').textContent=flight?'THRUSTERS ENGAGED':magnet?'MAGNETIC SYSTEM ACTIVE':'GRIP SYSTEM READY';document.querySelector('#pause').textContent=paused?'▶':'Ⅱ';}
function toggleMagnet(){magnet=!magnet;if(magnet)flight=false;sync();}
function toggleFlight(){flight=!flight;if(flight){magnet=false;car.surface=null;car.vy=Math.min(car.vy,-95);}sync();}
document.querySelector('#reset').onclick=reset;document.querySelector('#magnet').onclick=toggleMagnet;document.querySelector('#flight').onclick=toggleFlight;document.querySelector('#pause').onclick=()=>{paused=!paused;keys.clear();sync();};
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();const k=e.key.toLowerCase();if(!e.repeat){if(k==='m')toggleMagnet();if(k==='f')toggleFlight();if(k==='r')reset();if(k==='p'||k==='escape'){paused=!paused;sync();}}keys.add(k);});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
function update(dt){time+=dt;const right=keys.has('d')||keys.has('arrowright'),left=keys.has('a')||keys.has('arrowleft'),up=keys.has('w')||keys.has('arrowup'),down=keys.has('s')||keys.has('arrowdown'),boost=keys.has('shift'),power=boost?820:420;
const oldX=car.x,oldY=car.y,attachedBefore=car.surface==='track';
if(flight){car.surface=null;car.vx+=(Number(right)-Number(left))*power*dt;car.vy+=(Number(down)-Number(up))*power*dt;car.vx*=Math.exp(-.7*dt);car.vy*=Math.exp(-.7*dt);car.angle+=((car.vx/650)*.18-car.angle)*Math.min(1,dt*5);car.x+=car.vx*dt;car.y+=car.vy*dt;}
else if(car.surface==='track'){
 const angle=pathAt(car.s).angle,drive=Number(right||up)-Number(left||down);
 car.speed+=(drive*((boost?1150:760)+(magnet?120:0))+420*Math.sin(angle))*dt;
 car.speed*=Math.exp(-.48*dt);car.speed=Math.max(-650,Math.min(950,car.speed));car.s=Math.max(L+55,car.s+car.speed*dt);
 if(car.s<=L+55)car.speed=Math.max(0,car.speed);
 placeOnTrack();car.vx=car.speed*Math.cos(car.angle);car.vy=car.speed*Math.sin(car.angle);
 if(car.s>=trackEnd){car.surface=null;car.launched=true;toastUntil=time+5;document.querySelector('#toast').textContent='LIFTOFF / Press F for thrusters. WASD to fly.';}
}else if(car.surface==='ground'){
 car.vx+=(Number(right||up)-Number(left||down))*(boost?1150:760)*dt;car.vx*=Math.exp(-.48*dt);car.x+=car.vx*dt;car.y=B-17;car.angle=0;
 if(car.x<rampStart){car.surface='track';car.s=car.x;car.speed=car.vx;}
}else{
 car.vx+=(Number(right)-Number(left))*power*.25*dt;car.vy+=420*dt;car.x+=car.vx*dt;car.y+=car.vy*dt;
 car.angle+=(0-car.angle)*Math.min(1,dt*1.5);
}
// Sweep against the inner face of every arc segment, including the overhang.
if(car.surface===null&&!(attachedBefore&&car.launched)){for(let i=1;i<arc.length;i++){
 const a=arc[i-1],b=arc[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),nx=dy/len,ny=-dx/len;
 const before=(oldX-a.x)*nx+(oldY-a.y)*ny-17,after=(car.x-a.x)*nx+(car.y-a.y)*ny-17;
 if(before>0&&after<=0){const t=before/(before-after),hx=oldX+(car.x-oldX)*t,hy=oldY+(car.y-oldY)*t,u=((hx-a.x)*dx+(hy-a.y)*dy)/(len*len);
 if(u>=0&&u<=1){car.x=hx+nx*.1;car.y=hy+ny*.1;if(!flight){car.surface='track';car.s=a.s+u*len;car.speed=(car.vx*dx+car.vy*dy)/len;placeOnTrack();}else{const v=car.vx*nx+car.vy*ny;car.vx-=Math.min(0,v)*nx;car.vy-=Math.min(0,v)*ny;}break;}
 }
}}
if(car.x<L+55){car.x=L+55;car.vx=Math.max(0,car.vx);}if(car.x>R-55){car.x=R-55;car.vx=Math.min(0,car.vx);}
if(car.y<35){car.y=35;car.vy=Math.max(0,car.vy);}if(car.y>B-17&&car.surface!=='track'){car.y=B-17;car.vy=0;if(!flight){car.angle=0;car.surface=car.x<=rampStart?'track':'ground';car.s=car.x;car.speed=car.vx;}}
for(const r of rings)if(!r.hit&&Math.hypot(car.x-r.x,car.y-r.y)<45){r.hit=true;score++;toastUntil=time+4;document.querySelector('#toast').textContent=score===5?'All checkpoints cleared. The sky is yours. R to run again.':`Checkpoint ${score} / 5 collected. Keep exploring.`;for(let i=0;i<22;i++)particles.push({x:r.x,y:r.y,vx:(Math.random()-.5)*240,vy:(Math.random()-.5)*240,life:1});}
particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;});particles=particles.filter(p=>p.life>0);document.querySelector('#speed').textContent=String(Math.round(Math.hypot(car.vx,car.vy)*.36)).padStart(3,'0');document.querySelector('#score').textContent=`0${score} / 05`;document.querySelector('#toast').style.opacity=time<toastUntil?'1':'0';}
function line(x,y,x2,y2,color,width=1){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function draw(){const dpr=devicePixelRatio||1,cw=canvas.clientWidth,ch=canvas.clientHeight;if(canvas.width!==cw*dpr||canvas.height!==ch*dpr){canvas.width=cw*dpr;canvas.height=ch*dpr;}ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.fillStyle='#030609';ctx.fillRect(0,0,W,H);
const glow=ctx.createRadialGradient(1000,400,15,1000,400,600);glow.addColorStop(0,'#14202a');glow.addColorStop(1,'#030609');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
// Dark demonstration stage with ground lights and an exposed curved steel truss.
ctx.fillStyle='#0c1117';ctx.fillRect(0,B,W,H-B);line(L,B,R,B,'#89939d',2);
for(let x=100;x<1350;x+=45){ctx.fillStyle='#c1dbeb';ctx.shadowColor='#addefb';ctx.shadowBlur=8;ctx.fillRect(x,B+5,3,2);}ctx.shadowBlur=0;
line(100,B+14,790,B+14,'#f34b40',2);line(100,B+19,790,B+19,'#f34b402a',3);
const outer=arc.map(p=>({x:p.x-33*Math.sin(p.angle),y:p.y+33*Math.cos(p.angle)}));
for(let i=1;i<arc.length;i+=12){const p=arc[i],o=outer[i],next=outer[Math.min(i+12,arc.length-1)];line(p.x,p.y,o.x,o.y,'#697681',2);line(p.x,p.y,next.x,next.y,'#3d4d5c',1.5);}
ctx.beginPath();outer.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle='#485560';ctx.lineWidth=2;ctx.stroke();
const deck=()=>{ctx.moveTo(L,B);ctx.lineTo(rampStart,B);arc.forEach(p=>ctx.lineTo(p.x,p.y));};
ctx.beginPath();deck();ctx.strokeStyle='#343e47';ctx.lineWidth=11;ctx.stroke();
ctx.beginPath();deck();ctx.strokeStyle='#afb8c1';ctx.lineWidth=1.5;ctx.stroke();
ctx.beginPath();arc.forEach((p,i)=>{const x=p.x-6*Math.sin(p.angle),y=p.y+6*Math.cos(p.angle);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.strokeStyle=magnet?'#72e8ec':'#d14b46';ctx.lineWidth=1.5;ctx.shadowColor=magnet?'#52dfea':'#ff493f';ctx.shadowBlur=6;ctx.stroke();ctx.shadowBlur=0;
for(let i=15;i<arc.length;i+=20){const p=arc[i];ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);line(-5,-2,0,0,'#d9e2e9',1);line(0,0,-5,2,'#d9e2e9',1);ctx.restore();}
ctx.font='bold 56px Arial';ctx.fillStyle='#b6cddd0b';ctx.fillText('THE RAMP',155,285);
ctx.fillStyle='#8495a3';ctx.font='10px monospace';ctx.fillText('01 / ACCELERATION',130,552);ctx.fillStyle='#ee8175';ctx.fillText('02 / VERTICAL ARC',1000,552);ctx.fillStyle='#80cddf';ctx.fillText('03 / THRUSTER FLIGHT',550,355);
for(let i=0;i<rings.length;i++){const r=rings[i];if(r.hit)continue;const pulse=Math.sin(time*3+i)*3;ctx.save();ctx.translate(r.x,r.y);ctx.shadowColor='#f3bc69';ctx.shadowBlur=17;ctx.strokeStyle='#f2bd72';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,18+pulse/2,27+pulse,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.strokeStyle='#f2bd7240';ctx.beginPath();ctx.ellipse(0,0,24+pulse/2,33+pulse,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#f2bd72';ctx.font='9px monospace';ctx.textAlign='center';ctx.fillText(String(i+1).padStart(2,'0'),0,-43);ctx.restore();}
for(const p of particles){ctx.globalAlpha=p.life;ctx.fillStyle='#ffd69a';ctx.fillRect(p.x,p.y,3,3);}ctx.globalAlpha=1;
ctx.save();ctx.translate(car.x,car.y);ctx.rotate(car.angle);if(flight){ctx.fillStyle='#59dce4';ctx.shadowColor='#50e3f3';ctx.shadowBlur=16;for(const x of [-21,20]){ctx.beginPath();ctx.moveTo(x-4,8);ctx.lineTo(x,22+Math.random()*14);ctx.lineTo(x+4,8);ctx.fill();}ctx.beginPath();ctx.moveTo(-45,-1);ctx.lineTo(-95-Math.random()*20,7);ctx.lineTo(-45,10);ctx.fill();ctx.shadowBlur=0;}if(magnet){ctx.strokeStyle='#69e4ee77';ctx.beginPath();ctx.ellipse(0,12,39,7,0,0,Math.PI*2);ctx.stroke();}
// Roadster-inspired silhouette: sculpted nose, black panoramic canopy and large turbine wheels.
ctx.scale(1.35,1.35);
const paint=ctx.createLinearGradient(0,-23,0,9);paint.addColorStop(0,'#f1f6fa');paint.addColorStop(.35,'#a9b9c6');paint.addColorStop(.75,'#657b8d');paint.addColorStop(1,'#253541');
ctx.fillStyle='#080c13';ctx.beginPath();ctx.ellipse(0,12,48,4,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle=paint;ctx.beginPath();ctx.moveTo(-49,0);ctx.bezierCurveTo(-48,-10,-39,-12,-26,-13);ctx.bezierCurveTo(-15,-24,0,-28,15,-21);ctx.lineTo(29,-12);ctx.bezierCurveTo(37,-11,48,-8,51,-3);ctx.lineTo(49,5);ctx.lineTo(36,8);ctx.lineTo(-43,8);ctx.closePath();ctx.fill();
ctx.fillStyle='#081522';ctx.beginPath();ctx.moveTo(-22,-13);ctx.bezierCurveTo(-9,-23,1,-23,12,-19);ctx.lineTo(24,-12);ctx.closePath();ctx.fill();line(-17,-15,6,-20,'#a8d1e5',1);line(3,-21,9,-13,'#344e65',1);
ctx.strokeStyle='#324452';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(7,-10);ctx.lineTo(12,3);ctx.lineTo(-18,4);ctx.lineTo(-23,-9);ctx.stroke();line(-38,-8,39,-5,'#e0e9ef',1);line(-22,7,22,7,'#9aaebb',2);line(-4,-8,2,-8,'#e0edf5',1);
ctx.fillStyle='#14202c';ctx.beginPath();ctx.ellipse(44,3,5,2,-.15,0,Math.PI*2);ctx.fill();line(34,-7,46,-4,'#e4f8ff',2);line(-47,-5,-40,-6,'#ffb09e',2);line(-48,-10,-31,-11,'#384854',2);
for(const x of [-30,31]){ctx.fillStyle='#080a10';ctx.beginPath();ctx.arc(x,6,11,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#303844';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#56616e';ctx.beginPath();ctx.arc(x,6,7.5,0,Math.PI*2);ctx.fill();ctx.save();ctx.translate(x,6);ctx.rotate(car.x*.05);for(let i=0;i<5;i++){ctx.rotate(Math.PI*2/5);line(1,0,6,2,'#c4cdd5',1.5);}ctx.restore();ctx.fillStyle='#181f2a';ctx.beginPath();ctx.arc(x,6,2.5,0,Math.PI*2);ctx.fill();}
ctx.restore();
if(paused){ctx.fillStyle='#080d17bb';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 36px Arial';ctx.fillText('PAUSED',W/2,H/2);ctx.font='14px Arial';ctx.fillStyle='#acb7c9';ctx.fillText('Press P or click ▶ to continue',W/2,H/2+34);ctx.textAlign='left';}}
function frame(ts){const dt=Math.min((ts-last)/1000||0,.033);last=ts;if(!paused)update(dt);draw();requestAnimationFrame(frame);}reset();requestAnimationFrame(frame);
// Read-only telemetry for automated smoke checks and development tools.
window.roadsterState=()=>({x:car.x,y:car.y,vx:car.vx,vy:car.vy,surface:car.surface,launched:car.launched,angle:car.angle,distance:car.s,trackEnd,magnet,flight,paused,score});
