'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const roadsterImage=new Image();roadsterImage.src='assets/roadster-body.svg?v=16';
const wheelImage=new Image();wheelImage.src='assets/roadster-wheel.svg?v=16';
const wheelRadius=91*160/1200;
const W=1400,H=600,L=65,R=1335,T=100,B=510;
// A circular wall meets the 15-degree uphill ceiling with a continuous tangent.
const ceilingTilt=15*Math.PI/180;
const rampStart=950,rx=180,ry=180,endTheta=Math.PI-ceilingTilt;
const arc=[{x:rampStart,y:B,s:rampStart,angle:0}];
for(let i=1;i<=180;i++){const t=endTheta*i/180,prev=arc.at(-1),x=rampStart+rx*Math.sin(t),y=B-ry*(1-Math.cos(t));arc.push({x,y,s:prev.s+Math.hypot(x-prev.x,y-prev.y),angle:-Math.atan2(ry*Math.sin(t),rx*Math.cos(t))});}
const ceilingStart=arc.at(-1).s;
// Keep the shortened upper section 140 units long; rotate it uphill toward the exit.
const ceilingJoin=arc.at(-1),ceilingAngle=-Math.PI+ceilingTilt;
for(let distance=10;distance<=140;distance+=10){arc.push({x:ceilingJoin.x+distance*Math.cos(ceilingAngle),y:ceilingJoin.y+distance*Math.sin(ceilingAngle),s:ceilingStart+distance,angle:ceilingAngle});}
const ceilingLeft=arc.at(-1).x;
const trackEnd=arc.at(-1).s;
function pathAt(distance){if(distance<=rampStart)return {x:distance,y:B,angle:0};const i=arc.findIndex(p=>p.s>=distance);if(i<0)return arc.at(-1);const a=arc[i-1],b=arc[i],u=(distance-a.s)/(b.s-a.s);return {x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u,angle:a.angle+(b.angle-a.angle)*u};}
function placeOnTrack(){const p=pathAt(car.s);car.angle=p.angle;car.x=p.x+17*Math.sin(p.angle);car.y=p.y-17*Math.cos(p.angle);}
const ceilingRing=pathAt(ceilingStart+70);
const keys=new Set(),rings=[{x:340,y:480},{x:780,y:480},{x:1055,y:365},{x:1040,y:230},{x:ceilingRing.x+17*Math.sin(ceilingAngle),y:ceilingRing.y-17*Math.cos(ceilingAngle)}];
const magnet=true; // Surface adhesion is always available; no manual toggle.
let car,flight=false,paused=false,score=0,last=0,time=0,toastUntil=6,particles=[];
function reset(){car={x:160,y:B-17,vx:0,vy:0,angle:0,surface:'track',wheelRotation:0,wheelVelocity:0,speed:0,s:160,launched:false};score=0;rings.forEach(r=>r.hit=false);particles=[];flight=false;paused=false;keys.clear();toastUntil=time+6;document.querySelector('#toast').textContent='Tap arrows to roll. Space brakes. Air grip holds the track; the open end releases you.';sync();}
function sync(){document.querySelector('#magnet').classList.toggle('active',!flight);document.querySelector('#flight').classList.toggle('active',flight);document.querySelector('#mode').textContent=flight?'● FLIGHT MODE':magnet?(car.surface==='track'&&Math.cos(car.angle)<-.9?'● INVERTED / AIR GRIP':'● AIR GRIP'):'● GROUND DRIVE';document.querySelector('#status').textContent=flight?'THRUSTERS ENGAGED':magnet?(car.surface==='track'?'AUTO GRIP / GRAVITY OFF':'AIR GRIP READY / OFF TRACK'):'GRIP SYSTEM READY';document.querySelector('#pause').textContent=paused?'▶':'Ⅱ';}
function toggleFlight(){flight=!flight;if(flight){car.surface=null;car.vy=Math.min(car.vy,-95);}sync();}
document.querySelector('#reset').onclick=reset;document.querySelector('#flight').onclick=toggleFlight;document.querySelector('#pause').onclick=()=>{paused=!paused;keys.clear();sync();};
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();const k=e.key.toLowerCase();if(!e.repeat){if(k==='f')toggleFlight();if(k==='r')reset();if(k==='p'||k==='escape'){paused=!paused;sync();}}keys.add(k);});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
function update(dt){time+=dt;const right=keys.has('d')||keys.has('arrowright'),left=keys.has('a')||keys.has('arrowleft'),up=keys.has('w')||keys.has('arrowup'),down=keys.has('s')||keys.has('arrowdown'),boost=keys.has('shift'),power=boost?820:420,brake=keys.has(' ');
const oldX=car.x,oldY=car.y,oldDistance=car.s,oldSurface=car.surface,attachedBefore=car.surface==='track';
if(flight){car.surface=null;car.vx+=(Number(right)-Number(left))*power*dt;car.vy+=(Number(down)-Number(up))*power*dt;car.vx*=Math.exp(-.7*dt);car.vy*=Math.exp(-.7*dt);car.angle+=((car.vx/650)*.18-car.angle)*Math.min(1,dt*5);car.x+=car.vx*dt;car.y+=car.vy*dt;}
else if(car.surface==='track'){
 const angle=pathAt(car.s).angle,drive=Number(right||up)-Number(left||down);
 car.speed+=((brake?0:drive)*(boost?1270:880))*dt;
 // Air grip cancels gravity; releasing input keeps inertia. Only Space brakes.
 if(brake){car.speed*=Math.exp(-10*dt);if(Math.abs(car.speed)<2)car.speed=0;}
 if(!drive&&Math.abs(car.speed)<.4)car.speed=0;
 car.speed*=Math.exp(-(drive?.48:2.4)*dt);car.speed=Math.max(-650,Math.min(950,car.speed));car.s=Math.max(L+55,car.s+car.speed*dt);
 if(car.s<=L+55)car.speed=Math.max(0,car.speed);
 placeOnTrack();car.vx=car.speed*Math.cos(car.angle);car.vy=car.speed*Math.sin(car.angle);
 if(car.s>=trackEnd){const overshoot=car.s-trackEnd;car.x+=overshoot*Math.cos(car.angle);car.y+=overshoot*Math.sin(car.angle);car.surface=null;car.launched=true;toastUntil=time+5;document.querySelector('#toast').textContent='CEILING EXIT / Press F for flight, or fall back to the ground.';}
}else if(car.surface==='ground'){
 car.vx+=(Number(right||up)-Number(left||down))*(boost?1150:760)*dt;car.vx*=Math.exp(-((right||up||left||down)?.48:2.4)*dt);if(!right&&!up&&!left&&!down&&Math.abs(car.vx)<.4)car.vx=0;car.x+=car.vx*dt;car.y=B-17;car.angle=0;
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
// Rolling angle follows signed distance along the surface, including the ceiling.
if(oldSurface==='track'&&car.surface==='track'){car.wheelVelocity=(car.s-oldDistance)/dt/wheelRadius||0;}
else if(oldSurface==='ground'&&car.surface==='ground'){car.wheelVelocity=(car.x-oldX)/dt/wheelRadius||0;}
else {car.wheelVelocity*=Math.exp(-1.5*dt);}
car.wheelRotation+=car.wheelVelocity*dt;
for(const r of rings)if(!r.hit&&Math.hypot(car.x-r.x,car.y-r.y)<45){r.hit=true;score++;toastUntil=time+4;document.querySelector('#toast').textContent=score===5?'All checkpoints cleared. The sky is yours. R to run again.':`Checkpoint ${score} / 5 collected. Keep exploring.`;for(let i=0;i<22;i++)particles.push({x:r.x,y:r.y,vx:(Math.random()-.5)*240,vy:(Math.random()-.5)*240,life:1});}
if(flight&&Math.random()<dt*35){particles.push({x:car.x+(Math.random()-.5)*80,y:car.y+30,vx:-car.vx*.1+(Math.random()-.5)*25,vy:45+Math.random()*50,life:1.3,smoke:true});}
particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;});particles=particles.filter(p=>p.life>0);sync();document.querySelector('#speed').textContent=String(Math.round(Math.hypot(car.vx,car.vy)*.36)).padStart(3,'0');document.querySelector('#score').textContent=`0${score} / 05`;document.querySelector('#toast').style.opacity=time<toastUntil?'1':'0';}
function line(x,y,x2,y2,color,width=1){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function draw(){const dpr=devicePixelRatio||1,cw=canvas.clientWidth,ch=canvas.clientHeight;if(canvas.width!==cw*dpr||canvas.height!==ch*dpr){canvas.width=cw*dpr;canvas.height=ch*dpr;}ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.fillStyle='#030609';ctx.fillRect(0,0,W,H);
const glow=ctx.createRadialGradient(1000,400,15,1000,400,600);glow.addColorStop(0,'#14202a');glow.addColorStop(1,'#030609');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
// Dark demonstration stage with ground lights and an exposed curved steel truss.
ctx.fillStyle='#0c1117';ctx.fillRect(0,B,W,H-B);line(L,B,R,B,'#89939d',2);
for(let x=100;x<1350;x+=45){ctx.fillStyle='#c1dbeb';ctx.shadowColor='#addefb';ctx.shadowBlur=8;ctx.fillRect(x,B+5,3,2);}ctx.shadowBlur=0;
line(100,B+14,790,B+14,'#f34b40',2);line(100,B+19,790,B+19,'#f34b402a',3);
// Grounded rectangular scaffold behind the ramp, as in the reference stage.
// Clip the steelwork to the region outside the driving face so no brace crosses the road.
const frameTop=arc.at(-1).y-38,frameBack=rampStart+rx+72;
ctx.save();ctx.beginPath();ctx.moveTo(ceilingLeft,frameTop);ctx.lineTo(frameBack,frameTop);ctx.lineTo(frameBack,B);ctx.lineTo(rampStart,B);
for(const p of arc.slice(1))ctx.lineTo(p.x,p.y);
ctx.closePath();ctx.clip();
const beam=(x,y,x2,y2,width=2.6)=>{line(x,y,x2,y2,'#71808c',width);line(x-1,y,x2-1,y2,'#c3cdd533',.8);};
const columns=[];for(let x=ceilingLeft;x<frameBack;x+=65)columns.push(x);columns.push(frameBack);
const levels=[frameTop,B-2*ry];for(let y=B-2*ry+60;y<B;y+=60)levels.push(y);levels.push(B);
// Uprights stay vertical; cross members and X braces form rectangular bays.
for(const x of columns)beam(x,frameTop,x,B,3);
for(const y of levels)beam(ceilingLeft,y,frameBack,y,2.8);
for(let i=0;i<columns.length-1;i++)for(let j=0;j<levels.length-1;j++){
 const x=columns[i],x2=columns[i+1],y=levels[j],y2=levels[j+1];
 beam(x+3,y+3,x2-3,y2-3,1.6);beam(x2-3,y+3,x+3,y2-3,1.6);
}
beam(frameBack,frameTop,frameBack,B,4);beam(ceilingLeft,frameTop,frameBack,frameTop,4);ctx.restore();
// Foot plates anchor the rear tower and the lower ramp supports on the stage floor.
for(const x of columns.filter(x=>x>=rampStart)){ctx.fillStyle='#61707c';ctx.fillRect(x-9,B,18,4);line(x-7,B+4,x+7,B+4,'#a0aeb8',1);}
const deck=()=>{ctx.moveTo(L,B);ctx.lineTo(rampStart,B);arc.forEach(p=>ctx.lineTo(p.x,p.y));};
ctx.beginPath();deck();ctx.strokeStyle='#343e47';ctx.lineWidth=11;ctx.stroke();
ctx.beginPath();deck();ctx.strokeStyle='#afb8c1';ctx.lineWidth=1.5;ctx.stroke();
ctx.beginPath();arc.forEach((p,i)=>{const x=p.x-6*Math.sin(p.angle),y=p.y+6*Math.cos(p.angle);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.strokeStyle=magnet?'#72e8ec':'#d14b46';ctx.lineWidth=1.5;ctx.shadowColor=magnet?'#52dfea':'#ff493f';ctx.shadowBlur=6;ctx.stroke();ctx.shadowBlur=0;
for(let i=15;i<arc.length;i+=20){const p=arc[i];ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);line(-5,-2,0,0,'#d9e2e9',1);line(0,0,-5,2,'#d9e2e9',1);ctx.restore();}
ctx.font='bold 56px Arial';ctx.fillStyle='#b6cddd0b';ctx.fillText('THE RAMP',155,310);
ctx.fillStyle='#8495a3';ctx.font='10px monospace';ctx.fillText('01 / ACCELERATION',130,552);ctx.fillStyle='#ee8175';ctx.fillText('02 / CURVED WALL',1000,552);ctx.fillStyle='#80cddf';ctx.fillText('03 / CEILING +15°',ceilingLeft-12,frameTop-12);
for(let i=0;i<rings.length;i++){const r=rings[i];if(r.hit)continue;const pulse=Math.sin(time*3+i)*3;ctx.save();ctx.translate(r.x,r.y);ctx.shadowColor='#f3bc69';ctx.shadowBlur=17;ctx.strokeStyle='#f2bd72';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,18+pulse/2,27+pulse,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.strokeStyle='#f2bd7240';ctx.beginPath();ctx.ellipse(0,0,24+pulse/2,33+pulse,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#f2bd72';ctx.font='9px monospace';ctx.textAlign='center';ctx.fillText(String(i+1).padStart(2,'0'),0,-43);ctx.restore();}
for(const p of particles){ctx.globalAlpha=Math.min(1,p.life)*(p.smoke?.16:1);ctx.fillStyle=p.smoke?'#b6d2dc':'#ffd69a';if(p.smoke){ctx.beginPath();ctx.arc(p.x,p.y,7+(1.3-p.life)*20,0,Math.PI*2);ctx.fill();}else ctx.fillRect(p.x,p.y,3,3);}ctx.globalAlpha=1;
ctx.save();ctx.globalAlpha=Math.max(.07,.3-(B-car.y)/1800);ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(car.x,B+2,72+(B-car.y)*.1,5,0,0,Math.PI*2);ctx.fill();ctx.restore();
ctx.save();ctx.translate(car.x,car.y);ctx.rotate(car.angle);
if(flight){
 for(const x of [-43,42]){const length=55+Math.sin(time*27+x)*9+(keys.has('shift')?35:0);const plume=ctx.createLinearGradient(x,10,x,10+length);plume.addColorStop(0,'#dcfaff');plume.addColorStop(.12,'#80e7ffdd');plume.addColorStop(.55,'#24a4e580');plume.addColorStop(1,'#73d9f500');ctx.fillStyle=plume;ctx.beginPath();ctx.moveTo(x-3,11);ctx.bezierCurveTo(x-6,32,x-11,50,x-13,10+length);ctx.lineTo(x+13,10+length);ctx.bezierCurveTo(x+8,45,x+4,25,x+3,11);ctx.fill();}
 const jet=ctx.createLinearGradient(-70,0,-150,0);jet.addColorStop(0,'#caf7ffdd');jet.addColorStop(.4,'#3fc2ef80');jet.addColorStop(1,'#7ce6ff00');ctx.fillStyle=jet;ctx.beginPath();ctx.moveTo(-67,-6);ctx.lineTo(-150,4);ctx.lineTo(-67,6);ctx.fill();
}
if(magnet&&car.surface==='track'){ctx.strokeStyle='#69e4ee99';ctx.beginPath();ctx.ellipse(0,17,62,5,0,0,Math.PI*2);ctx.stroke();for(const x of [-42,0,42]){line(x,6,x,15,'#8ae5f0aa',1.5);line(x,15,x-3,11,'#8ae5f0aa',1.5);line(x,15,x+3,11,'#8ae5f0aa',1.5);}}
// Detailed silver Roadster study based on the supplied video close-ups.
if(roadsterImage.complete&&roadsterImage.naturalWidth){ctx.drawImage(roadsterImage,-80,-26,160,42.67);
 if(wheelImage.complete&&wheelImage.naturalWidth){for(const [x,y] of [[-50.4,2],[46.1333,1.6]]){ctx.save();ctx.translate(x,y);ctx.rotate(car.wheelRotation);ctx.drawImage(wheelImage,-13.3333,-13.3333,26.6667,26.6667);ctx.restore();}}
}else{ctx.fillStyle='#b7ccd5';ctx.fillRect(-60,-12,120,24);}
ctx.restore();
if(paused){ctx.fillStyle='#080d17bb';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 36px Arial';ctx.fillText('PAUSED',W/2,H/2);ctx.font='14px Arial';ctx.fillStyle='#acb7c9';ctx.fillText('Press P or click ▶ to continue',W/2,H/2+34);ctx.textAlign='left';}}
function frame(ts){const dt=Math.min((ts-last)/1000||0,.033);last=ts;if(!paused)update(dt);draw();requestAnimationFrame(frame);}reset();requestAnimationFrame(frame);
// Read-only telemetry for automated smoke checks and development tools.
window.roadsterState=()=>({x:car.x,y:car.y,vx:car.vx,vy:car.vy,surface:car.surface,launched:car.launched,angle:car.angle,distance:car.s,ceilingStart,trackEnd,wheelRotation:car.wheelRotation,wheelVelocity:car.wheelVelocity,inverted:car.surface==='track'&&Math.cos(car.angle)<-.9,magnet,flight,paused,score});
