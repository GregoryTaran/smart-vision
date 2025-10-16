const menuToggle=document.getElementById('menuToggle');
const sidebar=document.getElementById('sidebar');
const overlay=document.getElementById('overlay');
const logo=document.getElementById('logo');
if(logo){logo.addEventListener('click',()=>window.location.href='/index.html');}
if(menuToggle&&sidebar&&overlay){
  menuToggle.addEventListener('click',()=>{sidebar.classList.remove('hidden');overlay.classList.add('active');});
  overlay.addEventListener('click',()=>{sidebar.classList.add('hidden');overlay.classList.remove('active');});
  window.addEventListener('message',e=>{if(e.data==='closeSidebar'){sidebar.classList.add('hidden');overlay.classList.remove('active');}});
  let startX=0,endX=0;
  sidebar.addEventListener('touchstart',e=>startX=e.changedTouches[0].screenX,{passive:true});
  sidebar.addEventListener('touchend',e=>{endX=e.changedTouches[0].screenX;if(endX-startX<-50){sidebar.classList.add('hidden');overlay.classList.remove('active');}},{passive:true});
}