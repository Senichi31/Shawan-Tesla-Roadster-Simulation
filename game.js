'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const roadsterImage=new Image();roadsterImage.src='assets/roadster-body.svg?v=29';
const wheelImage=new Image();wheelImage.src='assets/roadster-wheel.svg?v=29';
const undersideImage=new Image();undersideImage.src='assets/roadster-underside.svg?v=29';
// Soft, transparent vapor texture; no solid cones or hard-edged smoke discs.
const vaporTexture=document.createElement('canvas');vaporTexture.width=vaporTexture.height=64;
const vaporCtx=vaporTexture.getContext('2d'),vaporGradient=vaporCtx.createRadialGradient(32,32,0,32,32,32);
vaporGradient.addColorStop(0,'#f1faffd0');vaporGradient.addColorStop(.2,'#dceef7a0');vaporGradient.addColorStop(.55,'#9fbdce50');vaporGradient.addColorStop(1,'#a9c9db00');vaporCtx.fillStyle=vaporGradient;vaporCtx.fillRect(0,0,64,64);
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
function placeOnTrack(){car.roll=0;car.rollActive=false;const p=pathAt(car.s);car.angle=p.angle;
 const position=offset=>{car.x=p.x+offset*Math.sin(p.angle);car.y=p.y-offset*Math.cos(p.angle);};
 position(17);
 // A long, rigid body also needs clearance where the straight upper road meets the curve.
 if(bodyEntersScaffold(flightBody())){let low=17,high=65;for(let i=0;i<9;i++){const middle=(low+high)/2;position(middle);if(bodyEntersScaffold(flightBody()))low=middle;else high=middle;}position(high+.03);}
}
const ceilingRing=pathAt(ceilingStart+70);
// One closed obstacle: road face, scaffold roof/rear/end cap, and stage floor.
// The opaque collision boundary blocks the whole scaffold footprint, including its open-looking bays.
const scaffoldTop=arc.at(-1).y-10,scaffoldBack=rampStart+rx+72;
const scaffoldBoundary=[{x:ceilingLeft,y:scaffoldTop},{x:scaffoldBack,y:scaffoldTop},{x:scaffoldBack,y:B},{x:rampStart,y:B},...arc.slice(1)];
const scaffoldEdges=[
 {a:scaffoldBoundary[0],b:scaffoldBoundary[1]},
 {a:scaffoldBoundary[1],b:scaffoldBoundary[2]},
 {a:arc.at(-1),b:scaffoldBoundary[0]}
];
const flightRoads=[{a:{x:L,y:B},b:{x:R,y:B}},...arc.slice(1).map((b,i)=>({a:arc[i],b})),...scaffoldEdges];
const bodyOutline=[[-74,-16],[-42,-18],[-12,-26],[26,-23],[61,-11],[74,-2],[74,10],[58,17],[-63,17],[-74,8]];
function convexHull(points){
 const sorted=points.sort((a,b)=>a.x-b.x||a.y-b.y),cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 const lower=[],upper=[];for(const p of sorted){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=1e-8)lower.pop();lower.push(p);}
 for(const p of [...sorted].reverse()){while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=1e-8)upper.pop();upper.push(p);}return [...lower.slice(0,-1),...upper.slice(0,-1)];
}
function flightBody(){const c=Math.cos(car.angle),s=Math.sin(car.angle),roll=car.roll||0,vertical=Math.cos(roll),width=36*Math.abs(Math.sin(roll));
 const points=bodyOutline.flatMap(([x,y])=>{x*=car.facing;return (width>1e-6?[-width,width]:[0]).map(offset=>{const projectedY=y*vertical+offset;return {x:car.x+x*c-projectedY*s,y:car.y+x*s+projectedY*c};});});
 return width>1e-6?convexHull(points):points;
}
function beginAutoRoll(){
 if(Math.cos(car.angle)>=0)return;
 // Equivalent starting pose: retain the nose direction while rolling around the long axis.
 car.angle+=Math.PI;car.facing*=-1;car.roll=-Math.PI;car.rollElapsed=0;car.rollActive=true;car.rollAxisAngle=car.angle;
}
function updateAutoRoll(dt){
 if(!car.rollActive)return;car.rollElapsed+=dt;const t=Math.min(1,car.rollElapsed/1.05),smooth=t*t*(3-2*t);car.roll=-Math.PI*(1-smooth);
 if(t===1){car.roll=0;car.rollActive=false;}
}
function bodyEntersScaffold(body){
 if(Math.max(...body.map(p=>p.x))<ceilingLeft||Math.min(...body.map(p=>p.x))>scaffoldBack)return false;
 const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 for(const point of body){let inside=false,onEdge=false;
  for(let i=0,j=scaffoldBoundary.length-1;i<scaffoldBoundary.length;j=i++){
   const a=scaffoldBoundary[j],b=scaffoldBoundary[i],dx=b.x-a.x,dy=b.y-a.y;
   const u=Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/(dx*dx+dy*dy)));
   if(Math.hypot(point.x-a.x-u*dx,point.y-a.y-u*dy)<.03)onEdge=true;
   if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
  }if(inside&&!onEdge)return true;
 }
 for(let i=0;i<body.length;i++)for(let j=0;j<scaffoldBoundary.length;j++){
  const a=body[i],b=body[(i+1)%body.length],c=scaffoldBoundary[j],d=scaffoldBoundary[(j+1)%scaffoldBoundary.length];
  if(cross(a,b,c)*cross(a,b,d)<-1e-7&&cross(c,d,a)*cross(c,d,b)<-1e-7)return true;
 }
 return false;
}
function roadOutline(road){const {a,b}=road,dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),nx=-dy/len*6,ny=dx/len*6;return [{x:a.x+nx,y:a.y+ny},{x:b.x+nx,y:b.y+ny},{x:b.x-nx,y:b.y-ny},{x:a.x-nx,y:a.y-ny}];}
const flightRoadShapes=flightRoads.map(roadOutline);
function polygonContact(a,b){let depth=Infinity,normal=null;
 for(const polygon of [a,b])for(let i=0;i<polygon.length;i++){
  const p=polygon[i],q=polygon[(i+1)%polygon.length],len=Math.hypot(q.x-p.x,q.y-p.y),nx=-(q.y-p.y)/len,ny=(q.x-p.x)/len;
  let amin=Infinity,amax=-Infinity,bmin=Infinity,bmax=-Infinity;
  for(const p of a){const d=p.x*nx+p.y*ny;amin=Math.min(amin,d);amax=Math.max(amax,d);}
  for(const p of b){const d=p.x*nx+p.y*ny;bmin=Math.min(bmin,d);bmax=Math.max(bmax,d);}
  if(amax<=bmin||bmax<=amin)return null;
  const positive=bmax-amin,negative=amax-bmin,d=Math.min(positive,negative);
  if(d<depth){depth=d;const sign=positive<negative?1:-1;normal={x:nx*sign,y:ny*sign};}
 }
 return {...normal,depth};
}
function resolveFlightContacts(){
 const contacts=[];
 for(let pass=0;pass<6;pass++){
  let corrected=false;
  for(let index=0;index<flightRoadShapes.length;index++){
   const road=flightRoadShapes[index],body=flightBody();
   const minX=Math.min(...body.map(p=>p.x)),maxX=Math.max(...body.map(p=>p.x)),minY=Math.min(...body.map(p=>p.y)),maxY=Math.max(...body.map(p=>p.y));
   if(Math.max(...road.map(p=>p.x))<minX||Math.min(...road.map(p=>p.x))>maxX||Math.max(...road.map(p=>p.y))<minY||Math.min(...road.map(p=>p.y))>maxY)continue;
   const hit=polygonContact(body,road);if(!hit)continue;
   contacts.push({index,nx:hit.x,ny:hit.y});
   car.x+=hit.x*(hit.depth+.02);car.y+=hit.y*(hit.depth+.02);
   const inward=car.vx*hit.x+car.vy*hit.y;if(inward<0){car.vx-=inward*hit.x;car.vy-=inward*hit.y;}
   corrected=true;
  }
  if(!corrected)break;
 }
 return contacts;
}
// Keep the automatic roll continuous while clearing the lip; contact still blocks penetration.
function landOnRoad(contacts){
 if(car.rollActive&&car.launched)return false;
 for(const hit of contacts){
  if(hit.index===0&&hit.ny<-.5){car.surface=car.x<=rampStart?'track':'ground';car.s=car.x;car.speed=car.vx;car.vy=0;car.angle=0;car.launched=false;if(car.surface==='track')placeOnTrack();return true;}
  if(hit.index>0&&hit.index<arc.length){
   const a=arc[hit.index-1],b=arc[hit.index],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
   // Only the inner driving face can reattach; steel roof/rear contacts remain ordinary supports.
   if(hit.nx*dy/len-hit.ny*dx/len<.5)continue;
   const u=Math.max(0,Math.min(1,((car.x-a.x)*dx+(car.y-a.y)*dy)/(len*len)));
   car.s=a.s+u*len;car.speed=(car.vx*dx+car.vy*dy)/len;car.surface='track';car.launched=false;placeOnTrack();return true;
  }
 }
 return false;
}
function moveFlight(dt,targetAngle,turnRate=5,allowLanding=false){
 const turn=(targetAngle-car.angle)*Math.min(1,dt*turnRate);
 // Short linear and angular steps prevent boosted motion and rotation tunnelling through the road.
 const steps=Math.max(1,Math.ceil(Math.hypot(car.vx,car.vy)*dt/3),Math.ceil(Math.abs(turn)/.025));
 for(let step=0;step<steps;step++){car.x+=car.vx*dt/steps;car.y+=car.vy*dt/steps;car.angle+=turn/steps;const contacts=resolveFlightContacts();if(allowLanding&&landOnRoad(contacts))break;}
}
const keys=new Set(),rings=[{x:340,y:480},{x:780,y:480},{x:1055,y:365},{x:1040,y:230},{x:ceilingRing.x+17*Math.sin(ceilingAngle),y:ceilingRing.y-17*Math.cos(ceilingAngle)}];
const magnet=true; // Surface adhesion is always available; no manual toggle.
let car,flight=false,paused=false,score=0,last=0,time=0,toastUntil=6,particles=[],vaporEmission=0;
function reset(){car={x:500,y:B-17,vx:0,vy:0,angle:0,facing:1,roll:0,rollActive:false,rollElapsed:0,rollAxisAngle:0,surface:'track',wheelRotation:0,wheelVelocity:0,speed:0,s:500,launched:false};score=0;rings.forEach(r=>r.hit=false);particles=[];vaporEmission=0;flight=false;paused=false;keys.clear();toastUntil=time+6;document.querySelector('#toast').textContent='← / A drives left. → / D drives right. Space brakes. F flies.';sync();}
function sync(){document.querySelector('#magnet').classList.toggle('active',!flight);document.querySelector('#flight').classList.toggle('active',flight);document.querySelector('#mode').textContent=flight?'● FLIGHT MODE':magnet?(car.surface==='track'&&Math.cos(car.angle)<-.9?'● INVERTED / AIR GRIP':'● AIR GRIP'):'● GROUND DRIVE';document.querySelector('#status').textContent=flight?'THRUSTERS ENGAGED':magnet?(car.surface==='track'?'AUTO GRIP / GRAVITY OFF':'AIR GRIP READY / OFF TRACK'):'GRIP SYSTEM READY';document.querySelector('#pause').textContent=paused?'▶':'Ⅱ';}
function toggleFlight(){flight=!flight;if(flight){car.surface=null;car.vy=Math.min(car.vy,-95);}sync();}
document.querySelector('#reset').onclick=reset;document.querySelector('#flight').onclick=toggleFlight;document.querySelector('#pause').onclick=()=>{paused=!paused;keys.clear();sync();};
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();const k=e.key.toLowerCase();if(!e.repeat){if(k==='f')toggleFlight();if(k==='r')reset();if(k==='p'||k==='escape'){paused=!paused;sync();}}keys.add(k);});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
function update(dt){time+=dt;const right=keys.has('d')||keys.has('arrowright'),left=keys.has('a')||keys.has('arrowleft'),up=keys.has('w')||keys.has('arrowup'),down=keys.has('s')||keys.has('arrowdown'),boost=keys.has('shift'),power=boost?820:420,brake=keys.has(' ');
const oldX=car.x,oldDistance=car.s,oldSurface=car.surface;
updateAutoRoll(dt);
if(flight){car.surface=null;car.vx+=(Number(right)-Number(left))*power*dt;car.vy+=(Number(down)-Number(up))*power*dt;car.vx*=Math.exp(-.7*dt);car.vy*=Math.exp(-.7*dt);moveFlight(dt,car.rollActive?car.rollAxisAngle:(car.vx/650)*.18);}
else if(car.surface==='track'){
 const angle=pathAt(car.s).angle,drive=Number(right||up)-Number(left||down);
 car.speed+=((brake?0:drive)*(boost?1270:880))*dt;
 // Air grip cancels gravity; releasing input keeps inertia. Only Space brakes.
 if(brake){car.speed*=Math.exp(-10*dt);if(Math.abs(car.speed)<2)car.speed=0;}
 if(!drive&&Math.abs(car.speed)<.4)car.speed=0;
 car.speed*=Math.exp(-(drive?.48:2.4)*dt);car.speed=Math.max(-650,Math.min(950,car.speed));car.s=Math.max(L+55,car.s+car.speed*dt);
 if(car.s<=L+55)car.speed=Math.max(0,car.speed);
 placeOnTrack();car.vx=car.speed*Math.cos(car.angle);car.vy=car.speed*Math.sin(car.angle);
 if(car.s>=trackEnd){const overshoot=car.s-trackEnd;car.x+=overshoot*Math.cos(car.angle);car.y+=overshoot*Math.sin(car.angle);car.surface=null;car.launched=true;beginAutoRoll();toastUntil=time+5;document.querySelector('#toast').textContent='AUTO ROLL / Rolling upright. Press F to engage flight.';}
}else if(car.surface==='ground'){
 car.vx+=(Number(right||up)-Number(left||down))*(boost?1150:760)*dt;car.vx*=Math.exp(-((right||up||left||down)?.48:2.4)*dt);if(!right&&!up&&!left&&!down&&Math.abs(car.vx)<.4)car.vx=0;car.angle=0;car.vy=0;moveFlight(dt,0);
 if(car.x<rampStart){car.surface='track';car.s=car.x;car.speed=car.vx;}
}else{
 car.vx+=(Number(right)-Number(left))*power*.25*dt;car.vy+=420*dt;
 moveFlight(dt,car.rollActive?car.rollAxisAngle:0,1.5,true);
}
if(car.x<L+55){car.x=L+55;car.vx=Math.max(0,car.vx);}if(car.x>R-55){car.x=R-55;car.vx=Math.min(0,car.vx);}
if(car.y<35){car.y=35;car.vy=Math.max(0,car.vy);}if(car.y>B-17&&car.surface!=='track'){car.y=B-17;car.vy=0;if(!flight){car.angle=0;car.surface=car.x<=rampStart?'track':'ground';car.s=car.x;car.speed=car.vx;}}
// Recheck after arena clamps, so a screen-edge correction cannot force the body into steelwork.
if(car.surface!=='track')resolveFlightContacts();
// Rolling angle follows signed distance along the surface, including the ceiling.
if(oldSurface==='track'&&car.surface==='track'){car.wheelVelocity=(car.s-oldDistance)/dt/wheelRadius||0;}
else if(oldSurface==='ground'&&car.surface==='ground'){car.wheelVelocity=(car.x-oldX)/dt/wheelRadius||0;}
else {car.wheelVelocity*=Math.exp(-1.5*dt);}
car.wheelRotation+=car.wheelVelocity*dt;
// Turn the body to follow signed travel along the road, including reversed wall driving.
const headingSpeed=(car.surface==='track'?car.speed:car.vx);
if(!car.rollActive&&Math.abs(headingSpeed)>2){const facing=headingSpeed<0?-1:1;if(car.facing!==facing){car.facing=facing;if(car.surface==='track')placeOnTrack();else resolveFlightContacts();}}
for(const r of rings)if(!r.hit&&Math.hypot(car.x-r.x,car.y-r.y)<45){r.hit=true;score++;toastUntil=time+4;document.querySelector('#toast').textContent=score===5?'All checkpoints cleared. The sky is yours. R to run again.':`Checkpoint ${score} / 5 collected. Keep exploring.`;for(let i=0;i<22;i++)particles.push({x:r.x,y:r.y,vx:(Math.random()-.5)*240,vy:(Math.random()-.5)*240,life:1});}
if(flight){
 vaporEmission+=dt*50;
 const nearGround=Math.max(0,Math.min(1,1-(B-car.y-17)/90));
 const c=Math.cos(car.angle),s=Math.sin(car.angle),vertical=Math.cos(car.roll||0),lateral=Math.sin(car.roll||0);
 const project=(x,y,z=0)=>{x*=car.facing;const py=y*vertical+z*lateral;return {x:car.x+x*c-py*s,y:car.y+x*s+py*c};};
 const emit=(point,dx,dy,tail=false)=>{const life=tail?.4+Math.random()*.2:.38+Math.random()*.24,speed=tail?220+Math.random()*60:270+Math.random()*60;
  particles.push({x:point.x+(Math.random()-.5)*2,y:point.y+(Math.random()-.5)*2,vx:dx*speed+car.vx*.25+(Math.random()-.5)*(tail?8:20),vy:dy*speed+car.vy*.15+(Math.random()-.5)*(tail?24:8),life,maxLife:life,age:0,gas:true,tail,radius:tail?1.8:2.2,growth:tail?11:16,groundFactor:nearGround,seed:Math.random()*100,spread:false});};
 while(vaporEmission>=1){vaporEmission--;for(const x of [-43,42])for(const z of [-8,8])emit(project(x,12,z),-s*vertical,c*vertical);emit(project(-69,0),-c*car.facing,-s*car.facing,true);}
}
particles.forEach(p=>{
 p.life-=dt;
 if(p.gas){p.age+=dt;p.radius+=p.growth*dt;const drag=Math.exp(-(p.spread?1.1:.35)*dt);p.vx=p.vx*drag+Math.sin(time*9+p.seed+p.age*7)*10*dt;p.vy=p.vy*drag+Math.cos(time*8+p.seed)*5*dt;
  p.x+=p.vx*dt;p.y+=p.vy*dt;
  if(!p.spread&&!p.tail&&p.groundFactor>0&&flight&&B-car.y-17<90&&p.y>=B-7&&p.vy>0){p.spread=true;p.y=B-7;p.vx+=(Math.random()<.5?-1:1)*(30+Math.random()*40);p.vy=-6-Math.random()*10;p.radius=Math.max(8,p.radius);p.growth=12;p.life=Math.max(.3,p.life);p.maxLife=Math.max(p.maxLife,p.age+p.life);}
   if(!p.spread&&p.y>=B-7)p.life=0;
 }else{p.x+=p.vx*dt;p.y+=p.vy*dt;}
});particles=particles.filter(p=>p.life>0);sync();document.querySelector('#speed').textContent=String(Math.round(Math.hypot(car.vx,car.vy)*.36)).padStart(3,'0');document.querySelector('#score').textContent=`0${score} / 05`;document.querySelector('#toast').style.opacity=time<toastUntil?'1':'0';}
function line(x,y,x2,y2,color,width=1){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function draw(){const dpr=devicePixelRatio||1,cw=canvas.clientWidth,ch=canvas.clientHeight;if(canvas.width!==cw*dpr||canvas.height!==ch*dpr){canvas.width=cw*dpr;canvas.height=ch*dpr;}ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.fillStyle='#030609';ctx.fillRect(0,0,W,H);
const glow=ctx.createRadialGradient(1000,400,15,1000,400,600);glow.addColorStop(0,'#14202a');glow.addColorStop(1,'#030609');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
// Dark demonstration stage with ground lights and an exposed curved steel truss.
ctx.fillStyle='#0c1117';ctx.fillRect(0,B,W,H-B);line(L,B,R,B,'#89939d',2);
for(let x=100;x<1350;x+=45){ctx.fillStyle='#c1dbeb';ctx.shadowColor='#addefb';ctx.shadowBlur=8;ctx.fillRect(x,B+5,3,2);}ctx.shadowBlur=0;
line(L,B+14,R,B+14,'#f34b40',2);line(L,B+19,R,B+19,'#f34b402a',3);
// Grounded rectangular scaffold behind the ramp, as in the reference stage.
// Clip the steelwork to the region outside the driving face so no brace crosses the road.
// The top beam meets the outer edge of the ceiling endpoint instead of cutting below it.
const frameTop=scaffoldTop,frameBack=scaffoldBack;
ctx.save();ctx.beginPath();ctx.moveTo(ceilingLeft,frameTop);ctx.lineTo(frameBack,frameTop);ctx.lineTo(frameBack,B);ctx.lineTo(rampStart,B);
for(const p of arc.slice(1))ctx.lineTo(p.x,p.y);
ctx.closePath();ctx.clip();
const beam=(x,y,x2,y2,width=2.6)=>{line(x,y,x2,y2,'#71808c',width);line(x-1,y,x2-1,y2,'#c3cdd533',.8);};
const columns=[];for(let x=ceilingLeft;x<frameBack;x+=65)columns.push(x);columns.push(frameBack);
// Trim only the excess height, retaining uprights and braces right up to the endpoint.
const supportTop=frameTop;
const levels=[supportTop,B-2*ry];for(let y=B-2*ry+60;y<B;y+=60)levels.push(y);levels.push(B);
// Uprights stay vertical; cross members and X braces form rectangular bays.
for(const x of columns)beam(x,supportTop,x,B,3);
for(const y of levels)beam(ceilingLeft,y,frameBack,y,2.8);
for(let i=0;i<columns.length-1;i++)for(let j=0;j<levels.length-1;j++){
 const x=columns[i],x2=columns[i+1],y=levels[j],y2=levels[j+1];
 beam(x+3,y+3,x2-3,y2-3,1.6);beam(x2-3,y+3,x+3,y2-3,1.6);
}
beam(frameBack,supportTop,frameBack,B,4);beam(ceilingLeft,supportTop,frameBack,supportTop,4);ctx.restore();
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
for(const p of particles){
 if(p.gas){const fade=Math.min(1,p.age/.045)*Math.min(1,p.life/.55);ctx.globalAlpha=fade*(p.tail?.22:p.spread?.12*p.groundFactor:.3);const rx=p.radius*(p.spread?2:1),ry=p.radius*(p.spread?.48:1.35);ctx.drawImage(vaporTexture,p.x-rx,p.y-ry,rx*2,ry*2);}
 else{ctx.globalAlpha=Math.min(1,p.life);ctx.fillStyle='#ffd69a';ctx.fillRect(p.x,p.y,3,3);}
}ctx.globalAlpha=1;
ctx.save();ctx.globalAlpha=Math.max(.07,.3-(B-car.y)/1800);ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(car.x,B+2,72+(B-car.y)*.1,5,0,0,Math.PI*2);ctx.fill();ctx.restore();
ctx.save();ctx.translate(car.x,car.y);ctx.rotate(car.angle);ctx.scale(car.facing,1);
const rollCos=Math.cos(car.roll||0),rollUnderside=Math.abs(Math.sin(car.roll||0));
ctx.save();ctx.scale(1,Math.abs(rollCos)<.015?.015:rollCos);
if(magnet&&car.surface==='track'){ctx.strokeStyle='#69e4ee99';ctx.beginPath();ctx.ellipse(0,17,62,5,0,0,Math.PI*2);ctx.stroke();for(const x of [-42,0,42]){line(x,6,x,15,'#8ae5f0aa',1.5);line(x,15,x-3,11,'#8ae5f0aa',1.5);line(x,15,x+3,11,'#8ae5f0aa',1.5);}}
// Detailed silver Roadster study based on the supplied video close-ups.
if(roadsterImage.complete&&roadsterImage.naturalWidth){ctx.drawImage(roadsterImage,-80,-26,160,42.67);
 if(wheelImage.complete&&wheelImage.naturalWidth){for(const [x,y] of [[-50.4,2],[46.1333,1.6]]){ctx.save();ctx.translate(x,y);ctx.rotate(car.wheelRotation*car.facing*(rollCos<0?-1:1));ctx.drawImage(wheelImage,-13.3333,-13.3333,26.6667,26.6667);ctx.restore();}}
}else{ctx.fillStyle='#b7ccd5';ctx.fillRect(-60,-12,120,24);}
ctx.restore();
// Roll in the opposite direction to expose the underside between the two side views.
if(rollUnderside>.01&&undersideImage.complete&&undersideImage.naturalWidth){ctx.globalAlpha=rollUnderside;ctx.drawImage(undersideImage,-80,-38*rollUnderside,160,76*rollUnderside);ctx.globalAlpha=1;}
ctx.restore();
if(paused){ctx.fillStyle='#080d17bb';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 36px Arial';ctx.fillText('PAUSED',W/2,H/2);ctx.font='14px Arial';ctx.fillStyle='#acb7c9';ctx.fillText('Press P or click ▶ to continue',W/2,H/2+34);ctx.textAlign='left';}}
function frame(ts){const dt=Math.min((ts-last)/1000||0,.033);last=ts;if(!paused)update(dt);draw();requestAnimationFrame(frame);}reset();requestAnimationFrame(frame);
// Read-only telemetry for automated smoke checks and development tools.
window.roadsterState=()=>({x:car.x,y:car.y,vx:car.vx,vy:car.vy,surface:car.surface,launched:car.launched,angle:car.angle,distance:car.s,ceilingStart,trackEnd,facing:car.facing,roll:car.roll,rollActive:car.rollActive,rollElapsed:car.rollElapsed,undersideVisible:Math.abs(Math.sin(car.roll||0)),noseAngle:car.angle+(car.facing<0?Math.PI:0),wheelRotation:car.wheelRotation,wheelVelocity:car.wheelVelocity,inverted:car.surface==='track'&&Math.cos(car.angle)<-.9,magnet,flight,paused,score});
