(() => {
  'use strict';
  // Low-resolution color fields, never the artwork pixels. One scheduler for visible surfaces.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.motion-toggle');
  const surfaces = [];
  let userPaused = false;
  let systemReduced = reduced.matches;
  let motionOverride = false;
  let frame = 0;
  let last = 0;
  let elapsed = 0;
  const vertex = 'attribute vec2 a; varying vec2 uv; void main(){uv=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
  const fragment = `
    precision mediump float;
    varying vec2 uv;
    uniform float time;
    uniform float aspect;
    uniform vec3 c1,c2,c3;
    void main(){
      vec2 p = (uv-.5)*vec2(aspect*.65,1.35);
      float t=time*.22;
      // Smooth domain warping makes color ribbons bend and mingle, without moving content.
      for(int i=0;i<3;i++){
        float f=float(i)+1.;
        p += .19*vec2(sin(p.y*2.8+f+t*.62),cos(p.x*2.45-f-t*.49))/f;
      }
      float a=.5+.5*sin(p.x*3.6+p.y*2.1+sin(p.y*3.3-t)*.9+t*.7);
      float b=.5+.5*cos(p.y*3.1-p.x*1.5+sin(p.x*3.5+t)*.8-t*.6);
      vec3 col=mix(c1,c2,smoothstep(.12,.88,a));
      col=mix(col,c3,smoothstep(.28,.86,b)*.82);
      float silk=pow(.5+.5*sin((p.x+p.y)*5.4+t*.45),12.);
      col=mix(col,vec3(1.,.98,.94),silk*.16);
      gl_FragColor=vec4(col,1.);
    }`;
  const palettes = {
    spring: [[.21,.72,.75],[.70,.42,.73],[.98,.79,.39]],
    rust: [[.85,.33,.35],[.96,.65,.27],[.39,.59,.69]],
    gallery: [[.54,.73,.81],[.77,.57,.77],[.97,.80,.59]],
  };

  function compile(gl, type, source) {
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source); gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);return null;}
    return shader;
  }
  document.querySelectorAll('[data-fluid]').forEach(host => {
    const canvas=document.createElement('canvas');
    canvas.className='ambient-canvas';
    canvas.setAttribute('aria-hidden','true');
    const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
    if(!gl) return; // The CSS palette remains as a static fallback.
    const vs=compile(gl,gl.VERTEX_SHADER,vertex),fs=compile(gl,gl.FRAGMENT_SHADER,fragment);
    if(!vs||!fs) return;
    const program=gl.createProgram();
    gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    gl.deleteShader(vs);gl.deleteShader(fs);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
    gl.useProgram(program);
    const buffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const attr=gl.getAttribLocation(program,'a');
    gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
    const palette=palettes[host.dataset.fluid]||palettes.gallery;
    palette.forEach((color,index)=>gl.uniform3fv(gl.getUniformLocation(program,'c'+(index+1)),color));
    const surface={host,canvas,gl,program,time:gl.getUniformLocation(program,'time'),aspect:gl.getUniformLocation(program,'aspect'),visible:false,lost:false};
    host.prepend(canvas);
    surfaces.push(surface);
    const resize=()=>{
      const w=host.clientWidth,h=host.clientHeight;
      const scale=Math.min(.6,680/Math.max(w,1),1000/Math.max(h,1));
      canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.uniform1f(surface.aspect,w/Math.max(h,1));
      draw(surface);
    };
    new ResizeObserver(resize).observe(host);
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();surface.lost=true;canvas.hidden=true;sync();});
    resize();
  });
  function draw(surface){
    if(surface.lost)return;
    surface.gl.uniform1f(surface.time,elapsed);
    surface.gl.drawArrays(surface.gl.TRIANGLES,0,6);
  }
  function isPaused(){return userPaused||(systemReduced&&!motionOverride);}
  function canRun(){return !isPaused()&&!document.hidden&&!document.querySelector('dialog[open]')&&surfaces.some(s=>s.visible&&!s.lost);}
  function tick(now){
    frame=0;
    if(!canRun()){last=0;return;}
    if(!last)last=now;
    if(now-last>=1000/30){
      elapsed+=Math.min((now-last)/1000,.08);
      last=now;
      surfaces.forEach(surface=>{if(surface.visible)draw(surface);});
    }
    frame=requestAnimationFrame(tick);
  }
  function sync(){
    if(frame){cancelAnimationFrame(frame);frame=0;}
    last=0;
    if(canRun())frame=requestAnimationFrame(tick);
    if(toggle){
      toggle.removeAttribute('aria-pressed');
      toggle.hidden=!surfaces.some(surface=>!surface.lost);
      toggle.textContent=isPaused()?'开启流动':'暂停流动';
    }
  }
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{const surface=surfaces.find(s=>s.host===entry.target);surface.visible=entry.isIntersecting;});
    sync();
  });
  surfaces.forEach(surface=>observer.observe(surface.host));
  toggle?.addEventListener('click',()=>{
    const start=isPaused();
    userPaused=!start;
    // An explicit start can override the current system preference, not future changes.
    motionOverride=start;
    sync();
  });
  reduced.addEventListener('change',event=>{systemReduced=event.matches;motionOverride=false;sync();});
  document.addEventListener('visibilitychange',sync);
  const dialog=document.querySelector('dialog');
  if(dialog)new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']});
  sync();
})();
