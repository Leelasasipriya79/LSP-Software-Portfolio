(function(){
  var root=document.documentElement;
  root.classList.add('js');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* preloader */
  (function(){
    var loader=document.getElementById('loader'),bar=document.getElementById('ldbar'),num=document.getElementById('ldnum');
    var loaded=document.readyState==='complete',shown=0,t0=performance.now(),MIN=reduce?300:1900,done=false;
    window.addEventListener('load',function(){loaded=true;});
    function finish(){
      if(done)return;done=true;
      bar.style.width='100%';num.textContent='100';
      window.scrollTo(0,0);
      loader.classList.add('out');
      root.classList.remove('loading');
      setTimeout(function(){loader.style.display='none';},1000);
    }
    (function tick(){
      if(done)return;
      var el=performance.now()-t0,p=Math.min(el/MIN,1)*100;
      var target=loaded?p:Math.min(p,92);
      shown+=(target-shown)*.15;
      bar.style.width=shown+'%';num.textContent=Math.round(shown);
      if(loaded&&el>=MIN&&shown>98){finish();return;}
      if(el>7000){finish();return;}
      requestAnimationFrame(tick);
    })();
  })();
  
  /* split name into letters */
  var idx=0;
  document.querySelectorAll('[data-split]').forEach(function(el){
    el.dataset.split.split('').forEach(function(c){
      var s=document.createElement('span');
      s.className='ch';s.style.setProperty('--i',idx++);
      s.textContent=c===' '?'\u00A0':c;
      el.appendChild(s);
    });
  });

  /* typed roles */
  var roles=['Python full stack developer','Python and MySQL builder','React.js and REST API integrator'];
  var typed=document.getElementById('typed');
  if(reduce){typed.textContent=roles[0];}
  else{
    var ri=0,ci=0,del=false;
    (function tick(){
      var word=roles[ri];
      typed.textContent=word.slice(0,ci);
      if(!del&&ci<word.length){ci++;setTimeout(tick,70);}
      else if(!del){del=true;setTimeout(tick,1500);}
      else if(ci>0){ci--;setTimeout(tick,35);}
      else{del=false;ri=(ri+1)%roles.length;setTimeout(tick,300);}
    })();
  }

  /* marquee */
  var skills=['HTML','CSS','JavaScript','React.js','Python','SQL','MySQL','REST APIs','Postman','Git','GitHub','CRUD','Responsive design'];
  var track=document.getElementById('track');
  track.innerHTML=skills.concat(skills).map(function(s){return '<span>'+s+'</span>';}).join('');

  /* theme */
  var themeBtn=document.getElementById('theme');
  var colors={};
  function readColors(){
    var cs=getComputedStyle(root);
    ['--violet','--amber','--mint','--line'].forEach(function(k){colors[k]=cs.getPropertyValue(k).trim();});
  }
  var SUN='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>';
  function setTheme(mode){
    root.setAttribute('data-theme',mode);
    themeBtn.innerHTML=mode==='dark'?SUN:MOON;
    themeBtn.setAttribute('aria-label',mode==='dark'?'Switch to light mode':'Switch to night mode');
    readColors();
    if(reduce&&typeof ctx!=='undefined'&&ctx)draw();
  }
  themeBtn.addEventListener('click',function(){
    setTheme(root.getAttribute('data-theme')==='dark'?'light':'dark');
  });
  setTheme('dark');

  /* oscilloscope */
  var c=document.getElementById('scope'),ctx=c.getContext('2d');
  var W=0,H=0,dpr=Math.min(window.devicePixelRatio||1,2);
  var mode='sine',t=0,mx=-1000,tx=-1000,my=0,ty=0;
  function size(){
    var r=c.getBoundingClientRect();W=r.width;H=r.height;
    c.width=W*dpr;c.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    if(reduce)draw();
  }
  function shape(v){
    if(mode==='square')return Math.tanh(5*Math.sin(v));
    if(mode==='triangle')return 2/Math.PI*Math.asin(Math.sin(v));
    return Math.sin(v);
  }
  function rgba(hex,a){
    var h=hex.replace('#','');
    if(h.length===3)h=h.split('').map(function(x){return x+x;}).join('');
    var n=parseInt(h,16);
    return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.lineWidth=1;ctx.strokeStyle=rgba(colors['--line'],.55);
    ctx.beginPath();
    for(var x=0;x<=W;x+=56){ctx.moveTo(x,0);ctx.lineTo(x,H);}
    for(var y=0;y<=H;y+=56){ctx.moveTo(0,y);ctx.lineTo(W,y);}
    ctx.stroke();
    var cy=H*.8,amp=Math.min(H*.09,64);
    var layers=[
      {col:colors['--violet'],a:.95,f:.011,s:1.4,p:0,w:3},
      {col:colors['--amber'],a:.75,f:.016,s:-1.1,p:1.7,w:2.2},
      {col:colors['--mint'],a:.7,f:.007,s:.8,p:3.1,w:2.2}
    ];
    ctx.lineCap='round';ctx.lineJoin='round';
    layers.forEach(function(L,li){
      ctx.beginPath();ctx.lineWidth=L.w;ctx.strokeStyle=rgba(L.col,L.a);
      for(var x=0;x<=W;x+=4){
        var bump=Math.exp(-Math.pow(x-mx,2)/(2*170*170));
        var k=1+1.1*bump;
        var yy=cy+shape(x*L.f+t*L.s+L.p)*amp*k*(1-li*.18);
        if(x===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);
      }
      ctx.stroke();
    });
    /* tracer dot following cursor on main wave */
    if(mx>0){
      var yy2=cy+shape(mx*.011+t*1.4)*amp*(1+1.1);
      ctx.fillStyle=colors['--violet'];
      ctx.beginPath();ctx.arc(mx,yy2,7,0,6.283);ctx.fill();
      ctx.strokeStyle=rgba(colors['--violet'],.3);ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(mx,yy2,14+Math.sin(t*4)*3,0,6.283);ctx.stroke();
    }
  }
  var visible=true;
  new IntersectionObserver(function(e){visible=e[0].isIntersecting;},{threshold:0}).observe(c);
  function loop(){
    if(visible){t+=.02;mx+=(tx-mx)*.12;draw();}
    requestAnimationFrame(loop);
  }
  window.addEventListener('resize',size);
  size();
  if(!reduce){loop();}
  document.querySelectorAll('.seg button').forEach(function(b){
    b.addEventListener('click',function(){
      mode=b.dataset.w;
      document.querySelectorAll('.seg button').forEach(function(o){o.setAttribute('aria-pressed',o===b?'true':'false');});
      if(reduce)draw();
    });
  });

  /* pointer: glow, scope tracking, magnetic buttons, tilt */
  var glow=document.getElementById('glow');
  var fine=window.matchMedia('(pointer: fine)').matches;
  if(fine&&!reduce){
    window.addEventListener('pointermove',function(e){
      glow.style.opacity=1;glow.style.transform='translate('+e.clientX+'px,'+e.clientY+'px)';
      var r=c.getBoundingClientRect();
      if(e.clientY>=r.top&&e.clientY<=r.bottom)tx=e.clientX-r.left;else tx=-1000;
    });
    document.querySelectorAll('.mag').forEach(function(el){
      el.addEventListener('pointermove',function(e){
        var r=el.getBoundingClientRect();
        el.style.transform='translate('+((e.clientX-r.left-r.width/2)*.25)+'px,'+((e.clientY-r.top-r.height/2)*.35)+'px)';
      });
      el.addEventListener('pointerleave',function(){el.style.transform='';});
    });
    document.querySelectorAll('.tilt').forEach(function(el){
      el.addEventListener('pointermove',function(e){
        var r=el.getBoundingClientRect();
        var px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
        el.style.setProperty('--ry',(px*5)+'deg');el.style.setProperty('--rx',(-py*5)+'deg');
      });
      el.addEventListener('pointerleave',function(){el.style.setProperty('--ry','0deg');el.style.setProperty('--rx','0deg');});
    });
  }

  /* reveal + counters + ring */
  function count(el){
    var to=parseFloat(el.dataset.to),dec=parseInt(el.dataset.dec||'0',10);
    if(reduce){el.textContent=to.toFixed(dec);return;}
    var start=null;
    (function step(ts){
      if(!start)start=ts;
      var p=Math.min((ts-start)/1600,1),e=1-Math.pow(1-p,3);
      el.textContent=(to*e).toFixed(dec);
      if(p<1)requestAnimationFrame(step);
    })(performance.now());
  }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting)return;
      var el=en.target;el.classList.add('in');
      el.querySelectorAll('[data-to]').forEach(count);
      io.unobserve(el);
    });
  },{threshold:.15});
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el);});

  var ring=document.getElementById('ring');
  new IntersectionObserver(function(en,ob){
    if(!en[0].isIntersecting)return;
    ring.querySelector('.fg').style.strokeDashoffset=440-440*(8.22/10);
    count(document.getElementById('cgpa'));
    document.getElementById('cgpa').dataset.dec='2';
    ob.disconnect();
  },{threshold:.4}).observe(ring);
  document.getElementById('cgpa').dataset.dec='2';

  /* raanvi screenshot switcher */
  var shotData=[
    {url:'raanvi-nine.vercel.app',href:'https://raanvi-nine.vercel.app/',label:'Open the live landing page'},
    {url:'binary-admin.vercel.app',href:'https://binary-admin.vercel.app/',label:'Open the live admin dashboard'},
    {url:'binary-user.vercel.app',href:'https://binary-user.vercel.app/',label:'Open the live user dashboard'}
  ];
  var shotTabs=[].slice.call(document.querySelectorAll('.tabs button'));
  var shotImgs=[].slice.call(document.querySelectorAll('.view img'));
  var shotUrl=document.getElementById('shoturl'),shotOpen=document.getElementById('shotopen');
  var shotCur=0,shotTimer=null;
  function showShot(i){
    shotCur=i;
    shotTabs.forEach(function(t,k){t.setAttribute('aria-selected',k===i?'true':'false');});
    shotImgs.forEach(function(im,k){im.classList.toggle('on',k===i);});
    shotUrl.textContent=shotData[i].url;shotOpen.href=shotData[i].href;shotOpen.textContent=shotData[i].label;
  }
  function stopShots(){if(shotTimer){clearInterval(shotTimer);shotTimer=null;}}
  shotTabs.forEach(function(t,k){t.addEventListener('click',function(){stopShots();showShot(k);});});
  if(!reduce){
    shotTimer=setInterval(function(){showShot((shotCur+1)%3);},5000);
    var shotBox=document.getElementById('shots');
    shotBox.addEventListener('pointerenter',stopShots);
    shotBox.addEventListener('focusin',stopShots);
  }

  /* scroll progress + timeline fill */
  var prog=document.getElementById('progress'),fill=document.getElementById('fill'),tl=document.getElementById('timeline');
  function onScroll(){
    var max=document.documentElement.scrollHeight-window.innerHeight;
    prog.style.transform='scaleX('+(max>0?window.scrollY/max:0)+')';
    var r=tl.getBoundingClientRect(),vh=window.innerHeight;
    var p=Math.max(0,Math.min(1,(vh*.7-r.top)/r.height));
    fill.style.height='calc('+(p*100)+'% - 12px)';
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* inventory CRUD demo */
  var items=[{id:1,name:'Notebook',qty:42},{id:2,name:'Desk lamp',qty:7},{id:3,name:'USB cable',qty:25}];
  var nextId=4;
  var rowsEl=document.getElementById('rows'),sqlEl=document.getElementById('sql');
  var logLines=[];
  function log(q){
    logLines.push(q);if(logLines.length>5)logLines.shift();
    sqlEl.innerHTML='';
    logLines.forEach(function(l){var d=document.createElement('div');d.textContent=l;sqlEl.appendChild(d);});
  }
  function esc(s){return String(s).replace(/'/g,"''");}
  function render(flashId){
    rowsEl.innerHTML='';
    if(!items.length){
      var e=document.createElement('p');e.className='note';e.style.padding='18px 0';
      e.textContent='No products yet. Add one below to run an INSERT.';rowsEl.appendChild(e);return;
    }
    items.forEach(function(it){
      var row=document.createElement('div');row.className='row'+(it.id===flashId?' flash':'');
      var n=document.createElement('span');n.textContent=it.name;
      if(it.qty<10){var l=document.createElement('span');l.className='low';l.textContent='Low';n.appendChild(l);}
      var q=document.createElement('div');q.className='qty';
      var m=document.createElement('button');m.textContent='\u2212';m.setAttribute('aria-label','Decrease '+it.name);
      var v=document.createElement('span');v.textContent=it.qty;
      var p=document.createElement('button');p.textContent='+';p.setAttribute('aria-label','Increase '+it.name);
      var d=document.createElement('button');d.className='del';d.textContent='\u00D7';d.setAttribute('aria-label','Delete '+it.name);
      m.onclick=function(){if(it.qty>0){it.qty--;log("UPDATE products SET quantity = "+it.qty+" WHERE id = "+it.id+";");render(it.id);}};
      p.onclick=function(){it.qty++;log("UPDATE products SET quantity = "+it.qty+" WHERE id = "+it.id+";");render(it.id);};
      d.onclick=function(){items=items.filter(function(x){return x.id!==it.id;});log("DELETE FROM products WHERE id = "+it.id+";");render();};
      q.append(m,v,p);row.append(n,q,d);rowsEl.appendChild(row);
    });
  }
  document.getElementById('addbtn').onclick=function(){
    var nameEl=document.getElementById('pname'),qtyEl=document.getElementById('pqty');
    var name=nameEl.value.trim(),qty=parseInt(qtyEl.value,10);
    if(!name){nameEl.focus();return;}
    if(isNaN(qty)||qty<0)qty=0;
    var it={id:nextId++,name:name,qty:qty};items.push(it);
    log("INSERT INTO products (name, quantity) VALUES ('"+esc(name)+"', "+qty+");");
    nameEl.value='';qtyEl.value='';render(it.id);
  };
  document.getElementById('pname').addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('addbtn').click();});
  log('SELECT * FROM products;');render();
})();
