import{S as v,C as n,P as c,W as l,e as u,D as x,V as m,f as d,M as y}from"./three.module-B3sf-EN6.js";const r=new v;r.background=new n(327688);const e=new c(45,window.innerWidth/window.innerHeight,.1,1e3);e.position.set(0,5,10);e.lookAt(0,0,3);const o=new l({antialias:!0});o.setSize(window.innerWidth,window.innerHeight);document.body.appendChild(o.domElement);const p=`
  uniform float time;
  uniform float uPulseTime;
  uniform float uNoiseScale;
  uniform float uWaveHeight;
  uniform float uPulseAmplitude;
  uniform vec2 uPulseCenter;
  
  varying float vHeight;
  
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
  
  void main() {
    vec3 pos = position;
    
    vec3 noiseCoord = vec3(pos.x * uNoiseScale, pos.y * uNoiseScale, time);
    float noise = snoise(noiseCoord);
    
    vec2 pulsePos = vec2(pos.x, pos.y) - uPulseCenter;
    float distanceFromCenter = length(pulsePos);
    float pulse = sin(distanceFromCenter * 5.0 - uPulseTime * 3.0) * uPulseAmplitude;
    
    float height = noise * uWaveHeight + pulse;
    pos.z = height;
    
    vHeight = height;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`,f=`
  varying float vHeight;
  uniform vec3 uPeakColor;
  uniform vec3 uTroughColor;
  uniform float uColorIntensity;
  
  void main() {
    float normalizedHeight = (vHeight + 1.0) * 0.5;
    
    vec3 color = mix(uTroughColor, uPeakColor, normalizedHeight);
    
    color *= uColorIntensity;
    
    gl_FragColor = vec4(color, 1.0);
  }
`,t=new u({uniforms:{time:{value:0},uPulseTime:{value:0},uNoiseScale:{value:.5},uWaveHeight:{value:1},uPulseAmplitude:{value:.3},uPulseCenter:{value:new m(0,0)},uPeakColor:{value:new n(65535)},uTroughColor:{value:new n(2228326)},uColorIntensity:{value:1.5}},vertexShader:p,fragmentShader:f,wireframe:!0,transparent:!0,side:x}),h=new d(20,15,100,100),s=new y(h,t);r.add(s);s.rotateX(Math.PI/2);let i=0,a=0;function w(){i+=.005,a+=.01,t.uniforms.time.value=i,t.uniforms.uPulseTime.value=a,t.uniforms.uWaveHeight.value=1+Math.sin(i*.5)*.3,o.render(r,e)}o.setAnimationLoop(w);window.addEventListener("resize",()=>{e.aspect=window.innerWidth/window.innerHeight,e.updateProjectionMatrix(),o.setSize(window.innerWidth,window.innerHeight)});
