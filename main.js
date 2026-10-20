(()=>{const rm=matchMedia('(prefers-reduced-motion: reduce)');
const els=document.querySelectorAll('.reveal');
if(rm.matches||!('IntersectionObserver'in window))els.forEach(e=>e.classList.add('on'));
else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}}),{threshold:.15});els.forEach(e=>io.observe(e))}
const c=document.getElementById('sea'),x=c.getContext('2d');let W,H,D,b=[],raf=0;
function size(){D=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;c.width=W*D;c.height=H*D;x.setTransform(D,0,0,D,0,0)}
function mk(y){return{x:Math.random()*W,y:y??Math.random()*H,r:1+Math.random()*4,s:.15+Math.random()*.45,p:Math.random()*6.28,g:Math.random()<.18}}
function init(){size();b=Array.from({length:Math.round(Math.min(70,W/18))},()=>mk())}
function draw(t){x.clearRect(0,0,W,H);for(const o of b){
 if(!rm.matches){o.y-=o.s;o.x+=Math.sin(t/1800+o.p)*.25;if(o.y<-10)Object.assign(o,mk(H+10))}
 x.beginPath();x.arc(o.x,o.y,o.r,0,6.283);
 if(o.g){x.fillStyle='rgba(214,165,72,.55)';x.shadowColor='#D6A548';x.shadowBlur=8;x.fill();x.shadowBlur=0}
 else{x.strokeStyle='rgba(244,241,234,.45)';x.lineWidth=.8;x.stroke()}}
 if(!rm.matches)raf=requestAnimationFrame(draw)}
init();draw(0);addEventListener('resize',()=>{init();if(rm.matches)draw(0)});
rm.addEventListener?.('change',()=>{cancelAnimationFrame(raf);draw(0)});
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);if(!document.hidden&&!rm.matches)raf=requestAnimationFrame(draw)});
})();
