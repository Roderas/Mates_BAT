/* Mates Batx Docent - local, dependency-free mathematical engine.
 * No eval / Function. All expressions use a bounded, whitelisted AST.
 * Numerical routines expose their assumptions; this is not a universal CAS.
 */
export const VERSION = '2.0.0';
const MAX = 240;
export const num = v => ({t:'n',v});
export const variable = {t:'v'};
const fn = (f,a) => ({t:'f',f,a});
const op = (o,a,b) => ({t:'o',o,a,b});
const isN = (a,v) => a.t==='n' && (v===undefined || a.v===v);
export const fmt = x => !Number.isFinite(x)?String(x): Math.abs(x)<1e-14?'0': Number(x.toPrecision(10)).toString();
export function parse(source) {
  if (typeof source!=='string' || source.length>400) throw Error('Expressi\u00f3 buida o massa llarga (m\u00e0xim 400 car\u00e0cters).');
  let s=source.trim().toLowerCase().replace(/\u2212/g,'-').replace(/[\u00d7\u00b7]/g,'*').replace(/\u03c0/g,'pi').replace(/(\d),(?=\d)/g,'$1.');
  let ts=[],i=0;
  while(i<s.length){
    if(/\s/.test(s[i])){i++;continue;}
    let m=s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/);
    if(m){let v=Number(m[0]);if(!Number.isFinite(v))throw Error('Nombre no finit.');ts.push({k:'n',v});i+=m[0].length;continue;}
    m=s.slice(i).match(/^[a-z]+/);
    if(m){ts.push({k:'id',v:m[0]});i+=m[0].length;continue;}
    if('+-*/^()'.includes(s[i])){ts.push({k:s[i++]});continue;}
    throw Error('S\u00edmbol no adm\u00e8s: '+s[i]);
  }
  if(!ts.length || ts.length>MAX)throw Error('Expressi\u00f3 buida o massa complexa.');
  const names=['sin','cos','tan','asin','acos','atan','exp','ln','log','sqrt','abs'];
  let p=0,nodes=0;
  const peek=()=>ts[p]?.k;
  function expr(min=0){
    if(++nodes>MAX)throw Error('Massa nodes en l\u2019expressi\u00f3.');
    let t=ts[p++],a;
    if(!t)throw Error('Expressi\u00f3 incompleta.');
    if(t.k==='n')a=num(t.v);
    else if(t.k==='+' || t.k==='-'){a=expr(25);if(t.k==='-')a=op('*',num(-1),a);}
    else if(t.k==='('){a=expr();if(peek()!==')')throw Error('Falta un par\u00e8ntesi de tancament.');p++;}
    else if(t.k==='id'){
      if(t.v==='x')a=variable;
      else if(t.v==='pi')a=num(Math.PI);
      else if(t.v==='e')a=num(Math.E);
      else if(names.includes(t.v)){
        if(peek()!=='(')throw Error('Escriu '+t.v+'(...) amb par\u00e8ntesis.');p++;let arg=expr();
        if(peek()!==')')throw Error('Falta tancar '+t.v+'(...).');p++;a=fn(t.v==='log'?'ln':t.v,arg);
      }else throw Error('Nom no adm\u00e8s: '+t.v+'. Variable admesa: x.');
    }else throw Error('Operand inesperat.');
    while(p<ts.length){
      let k=peek(),implicit=k==='('||k==='n'||k==='id',o=implicit?'*':k;
      let bp=o==='+'||o==='-'?10:o==='*'||o==='/'?20:o==='^'?30:-1;
      if(bp<min)break;
      if(!implicit)p++;
      let b=expr(o==='^'?bp:bp+1);a=op(o,a,b);
    }
    return a;
  }
  const a=expr();if(p!==ts.length)throw Error('Par\u00e8ntesi o s\u00edmbol sobrant.');
  // Fold only purely numeric operations, retaining every variable-dependent domain restriction.
  function fold(a){if(a.t==='o'){const u=fold(a.a),v=fold(a.b),node=op(a.o,u,v);if(u.t==='n'&&v.t==='n'){try{return num(value(node));}catch{}}return node;}if(a.t==='f')return fn(a.f,fold(a.a));return a;}
  return fold(a);
}
export function value(a,x=0){
  let r;
  if(a.t==='n')return a.v;
  if(a.t==='v'){if(!Number.isFinite(x))throw Error('x ha de ser finit.');return x;}
  if(a.t==='o'){
    const u=value(a.a,x),v=value(a.b,x);
    if(a.o==='+')r=u+v;else if(a.o==='-')r=u-v;else if(a.o==='*')r=u*v;
    else if(a.o==='/'){if(v===0)throw Error('Divisi\u00f3 per zero.');r=u/v;}
    else {if(u===0&&v<=0)throw Error('Pot\u00e8ncia no definida en aquest punt.');r=Math.pow(u,v);}
  }else{
    const u=value(a.a,x);
    if(a.f==='ln'){if(u<=0)throw Error('El logaritme requereix un argument positiu.');r=Math.log(u);}
    else if(a.f==='tan'){if(Math.abs(Math.cos(u))<1e-13)throw Error('La tangent no est\u00e0 definida.');r=Math.tan(u);}
    else r=Math[a.f](u);
  }
  if(!Number.isFinite(r))throw Error('Valor no real, no finit o fora de rang.');return r;
}
export function safeValue(a,x){try{return value(a,x);}catch{return NaN;}}
export function simplify(a){
  if(a.t==='n'||a.t==='v')return a;
  if(a.t==='f')return fn(a.f,simplify(a.a));
  let l=simplify(a.a),r=simplify(a.b),o=a.o;
  if(isN(l)&&isN(r)){try{return num(value(op(o,l,r)));}catch{}}
  if(o==='+'&&isN(l,0))return r;if((o==='+'||o==='-')&&isN(r,0))return l;
  if(o==='*'&&(isN(l,0)||isN(r,0)))return num(0);
  if(o==='*'&&isN(l,1))return r;if(o==='*'&&isN(r,1))return l;
  if(o==='/'&&isN(r,1))return l;
  if(o==='^'&&isN(r,1))return l;
  if(o==='^'&&isN(r,0))return num(1);
  return op(o,l,r);
}
export function text(a){
  if(a.t==='n')return fmt(a.v);if(a.t==='v')return 'x';
  if(a.t==='f')return a.f+'('+text(a.a)+')';
  return '('+text(a.a)+' '+a.o+' '+text(a.b)+')';
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mathML(a){
  function m(a){
    if(a.t==='n')return '<mn>'+esc(fmt(a.v))+'</mn>';
    if(a.t==='v')return '<mi>x</mi>';
    if(a.t==='f')return a.f==='sqrt'?'<msqrt>'+m(a.a)+'</msqrt>':'<mrow><mi>'+a.f+'</mi><mo>(</mo>'+m(a.a)+'<mo>)</mo></mrow>';
    if(a.o==='/')return '<mfrac>'+m(a.a)+m(a.b)+'</mfrac>';
    if(a.o==='^')return '<msup><mrow><mo>(</mo>'+m(a.a)+'<mo>)</mo></mrow>'+m(a.b)+'</msup>';
    return '<mrow><mo>(</mo>'+m(a.a)+'<mo>'+({'+':'+','-':'\u2212','*':'\u00b7'}[a.o])+'</mo>'+m(a.b)+'<mo>)</mo></mrow>';
  }
  return '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" aria-label="'+esc(text(a))+'">'+m(a)+'</math>';
}
export function derivative(a,trace=[]){
  let d;
  if(a.t==='n')return num(0);if(a.t==='v')return num(1);
  if(a.t==='o'){
    const u=a.a,v=a.b,du=derivative(u,trace),dv=derivative(v,trace);
    if(a.o==='+'||a.o==='-'){trace.push('Linealitat: es deriven els termes separadament.');d=op(a.o,du,dv);}
    if(a.o==='*'){trace.push('Producte: (u v)\u2032 = u\u2032v + uv\u2032.');d=op('+',op('*',du,v),op('*',u,dv));}
    if(a.o==='/'){trace.push('Quocient: (u/v)\u2032 = (u\u2032v - uv\u2032)/v\u00b2, amb v diferent de zero.');d=op('/',op('-',op('*',du,v),op('*',u,dv)),op('^',v,num(2)));}
    if(a.o==='^'){
      if(v.t==='n'){trace.push('Pot\u00e8ncia i cadena: (u^n)\u2032 = n u^(n-1) u\u2032.');d=op('*',op('*',v,op('^',u,num(v.v-1))),du);}
      else{trace.push('Pot\u00e8ncia variable: u^v [v\u2032 ln(u) + v u\u2032/u], en intervals on u>0.');d=op('*',a,op('+',op('*',dv,fn('ln',u)),op('*',v,op('/',du,u))));}
    }
  }else{
    const u=a.a,du=derivative(u,trace);
    const base={sin:()=>fn('cos',u),cos:()=>op('*',num(-1),fn('sin',u)),tan:()=>op('/',num(1),op('^',fn('cos',u),num(2))),exp:()=>fn('exp',u),ln:()=>op('/',num(1),u),sqrt:()=>op('/',num(1),op('*',num(2),fn('sqrt',u))),abs:()=>op('/',u,fn('abs',u)),asin:()=>op('/',num(1),fn('sqrt',op('-',num(1),op('^',u,num(2))))),acos:()=>op('/',num(-1),fn('sqrt',op('-',num(1),op('^',u,num(2))))),atan:()=>op('/',num(1),op('+',num(1),op('^',u,num(2))))};
    trace.push('Regla de la cadena per a '+a.f+': derivada exterior multiplicada per la derivada interior.');
    d=op('*',base[a.f](),du);
  }
  return simplify(d);
}
export function trim(p){p=p.slice();while(p.length>1&&p[p.length-1]===0)p.pop();return p;}
export const padd=(a,b,sign=1)=>trim(Array.from({length:Math.max(a.length,b.length)},(_,i)=>(a[i]||0)+sign*(b[i]||0)));
export function pmul(a,b){if(a.length+b.length>25)throw Error('Grau polin\u00f2mic massa alt (m\u00e0xim 23).');let p=Array(a.length+b.length-1).fill(0);a.forEach((v,i)=>b.forEach((w,j)=>p[i+j]+=v*w));return trim(p);}
export function poly(a){
  if(a.t==='n')return [a.v];if(a.t==='v')return [0,1];
  if(a.t!=='o')throw Error('No \u00e9s un polinomi adm\u00e8s.');
  let p=poly(a.a),q=poly(a.b);
  if(a.o==='+')return padd(p,q);if(a.o==='-')return padd(p,q,-1);if(a.o==='*')return pmul(p,q);
  if(a.o==='/'&&q.length===1&&q[0]!==0)return trim(p.map(x=>x/q[0]));
  if(a.o==='^'&&q.length===1&&Number.isInteger(q[0])&&q[0]>=0&&q[0]<=20){let r=[1];for(let i=0;i<q[0];i++)r=pmul(r,p);return r;}
  throw Error('No \u00e9s un polinomi de grau adm\u00e8s.');
}
export const peval=(p,x)=>p.reduceRight((a,c)=>a*x+c,0);
export const pdiff=p=>p.length<=1?[0]:p.slice(1).map((c,i)=>c*(i+1));
export function ptext(p){return trim(p).map((c,i)=>c===0?'':(i===0?fmt(c):fmt(c)+'*x'+(i>1?'^'+i:''))).filter(Boolean).reverse().join(' + ').replace(/\+ -/g,'- ')||'0';}
export function rational(a){
  try{return {p:poly(a),q:[1]};}catch{}
  if(a.t!=='o')throw Error('Nom\u00e9s s\u2019admeten funcions racionals en aquest c\u00e0lcul.');
  let u=rational(a.a),v=rational(a.b);
  if(a.o==='+')return{p:padd(pmul(u.p,v.q),pmul(v.p,u.q)),q:pmul(u.q,v.q)};
  if(a.o==='-')return{p:padd(pmul(u.p,v.q),pmul(v.p,u.q),-1),q:pmul(u.q,v.q)};
  if(a.o==='*')return{p:pmul(u.p,v.p),q:pmul(u.q,v.q)};
  if(a.o==='/')return{p:pmul(u.p,v.q),q:pmul(u.q,v.p)};
  if(a.o==='^'&&a.b.t==='n'&&Number.isInteger(a.b.v)&&Math.abs(a.b.v)<=10){let p=[1],q=[1];for(let i=0;i<Math.abs(a.b.v);i++){p=pmul(p,u.p);q=pmul(q,u.q);}return a.b.v>=0?{p,q}:{p:q,q:p};}
  throw Error('Funci\u00f3 racional no admesa.');
}
export function roots(coeff){
  if(!Array.isArray(coeff)||!coeff.length||coeff.some(x=>!Number.isFinite(x)))throw Error('Coeficients no finits.');
  const scale0=Math.max(...coeff.map(Math.abs));const p=trim(scale0?coeff.map(x=>x/scale0):coeff);let n=p.length-1;
  if(n<1)return[];if(n>12)throw Error('Arrels num\u00e8riques: grau m\u00e0xim 12.');
  if(n===1)return[-p[0]/p[1]];
  if(n===2){const[c,b,a]=p,D=b*b-4*a*c;if(D<0)return[];if(D===0)return[-b/(2*a)];const q=-0.5*(b+(b>=0?1:-1)*Math.sqrt(D));return[q/a,c/q].sort((x,y)=>x-y);}
  const B=1+Math.max(...p.slice(0,-1).map(x=>Math.abs(x/p[n])));
  if(!Number.isFinite(B)||B>1e10)throw Error('Escala del polinomi massa gran. Reescala les dades.');
  const crit=roots(pdiff(p)).filter(x=>x>-B&&x<B),pts=[-B,...crit,B],out=[];
  const scale=x=>Math.max(1,p.reduce((s,c,i)=>s+Math.abs(c)*Math.pow(Math.abs(x),i),0));
  for(let c of crit)if(Math.abs(peval(p,c))<1e-10*scale(c))out.push(c);
  for(let i=1;i<pts.length;i++){
    let l=pts[i-1],r=pts[i],fl=peval(p,l),fr=peval(p,r);
    if(fl*fr>=0)continue;
    for(let j=0;j<100;j++){let m=(l+r)/2,fm=peval(p,m);if(Math.abs(r-l)<1e-12*Math.max(1,Math.abs(m)))break;if(fl*fm<=0){r=m;fr=fm;}else{l=m;fl=fm;}}
    out.push((l+r)/2);
  }
  return out.sort((a,b)=>a-b).filter((v,i,a)=>!i||Math.abs(v-a[i-1])>1e-7*Math.max(1,Math.abs(v)));
}
export function primitive(a,trace=[]){
  try{const p=poly(a),q=[0,...p.map((c,i)=>c/(i+1))];trace.push('Polinomi: cada a\u2096 x^k dona a\u2096 x^(k+1)/(k+1). Afegeix una constant C.');return parse(ptext(q));}catch{}
  if(a.t==='o'&&(a.o==='+'||a.o==='-'))return simplify(op(a.o,primitive(a.a,trace),primitive(a.b,trace)));
  if(a.t==='o'&&a.o==='*'){
    if(a.a.t==='n')return simplify(op('*',a.a,primitive(a.b,trace)));
    if(a.b.t==='n')return simplify(op('*',a.b,primitive(a.a,trace)));
  }
  if(a.t==='o'&&a.o==='/'&&a.b.t==='n'&&a.b.v!==0)return simplify(op('/',primitive(a.a,trace),a.b));
  function affine(u){const p=poly(u);if(p.length!==2||p[1]===0)throw Error('La composici\u00f3 no \u00e9s af\u00ed.');return p[1];}
  let u,n,c;
  if(a.t==='o'&&a.o==='^'&&a.b.t==='n'){u=a.a;n=a.b.v;c=affine(u);trace.push('Substituci\u00f3 af\u00ed u = '+text(u)+': es divideix per u\u2032 = '+fmt(c)+'.');return n===-1?op('/',fn('ln',fn('abs',u)),num(c)):op('/',op('^',u,num(n+1)),num(c*(n+1)));}
  if(a.t==='o'&&a.o==='/'&&a.a.t==='n'){u=a.b;c=affine(u);trace.push('Integral de k/u amb u af\u00ed: (k/u\u2032) ln|u|.');return op('*',num(a.a.v/c),fn('ln',fn('abs',u)));}
  if(a.t==='f'){
    u=a.a;c=affine(u);trace.push('Primitiva elemental amb canvi af\u00ed i factor 1/u\u2032.');
    if(a.f==='exp')return op('/',fn('exp',u),num(c));
    if(a.f==='sin')return op('/',op('*',num(-1),fn('cos',u)),num(c));
    if(a.f==='cos')return op('/',fn('sin',u),num(c));
    if(a.f==='sqrt')return op('/',op('^',u,num(1.5)),num(1.5*c));
  }
  throw Error('Primitiva simb\u00f2lica no implementada per a aquesta expressi\u00f3. S\u2019admeten polinomis, sumes, factors constants, pot\u00e8ncies afins, 1/(ax+b), exp/sin/cos/sqrt d\u2019una funci\u00f3 af\u00ed. Usa la integral definida num\u00e8rica en un interval continu.');
}
export function singularities(a,l=-100,r=100){
  let out=[];
  function trigZeros(u,offset){let p;try{p=poly(u);}catch{return;}if(p.length!==2||p[1]===0)return;let lo=(p[1]*l+p[0]-offset)/Math.PI,hi=(p[1]*r+p[0]-offset)/Math.PI;if(lo>hi)[lo,hi]=[hi,lo];const first=Math.ceil(lo-1e-12),last=Math.floor(hi+1e-12);if(last-first>10000)throw Error('Interval amb massa singularitats trigonom\u00e8triques.');for(let k=first;k<=last;k++)out.push((offset+k*Math.PI-p[0])/p[1]);}
  function z(u){
    try{out.push(...roots(poly(u)));return;}catch{}
    if(u.t==='o'&&u.o==='*'){z(u.a);z(u.b);}
    if(u.t==='o'&&u.o==='^'&&u.b.t==='n'&&u.b.v>0)z(u.a);
    if(u.t==='f'){
      if(u.f==='sin'||u.f==='tan')trigZeros(u.a,0);
      if(u.f==='cos')trigZeros(u.a,Math.PI/2);
      if(u.f==='abs'||u.f==='sqrt')z(u.a);
      if(u.f==='ln')z(op('-',u.a,num(1)));
    }
  }
  function walk(a){
    if(a.t==='o'){if(a.o==='/')z(a.b);if(a.o==='^'&&a.b.t==='n'&&a.b.v<0)z(a.a);walk(a.a);walk(a.b);}
    if(a.t==='f'){if(a.f==='ln')z(a.a);if(a.f==='tan')trigZeros(a.a,Math.PI/2);walk(a.a);}
  }walk(a);return out;
}
export function checkInterval(a,l,r){
  if(!Number.isFinite(l)||!Number.isFinite(r)||l>=r)throw Error('Cal un interval finit amb a < b.');
  const bad=singularities(a,l,r).filter(x=>x>=l-1e-10&&x<=r+1e-10);
  if(bad.length)throw Error('L\u2019interval cont\u00e9 un punt singular o excl\u00f2s: x \u2248 '+bad.map(fmt).join(', ')+'. Separa els intervals; no es calculen integrals impr\u00f2pies.');
  for(let i=0;i<=1024;i++)value(a,l+(r-l)*i/1024);
}
export function integrate(a,l,r,absolute=false){
  if(l===r){value(a,l);return{value:0,error:0,steps:['L\u00edmits iguals: integral nul\u00b7la.'],method:'Interval nul'};}
  const sign=l<r?1:-1;if(sign<0)[l,r]=[r,l];checkInterval(a,l,r);
  const f=x=>absolute?Math.abs(value(a,x)):value(a,x);
  function simpson(n){let s=f(l)+f(r),h=(r-l)/n;for(let i=1;i<n;i++)s+=(i%2?4:2)*f(l+i*h);return s*h/3;}
  let prev=simpson(256),v=prev,err=Infinity,n=512;
  for(;n<=32768;n*=2){v=simpson(n);err=Math.abs(v-prev)/15;if(err<1e-8*Math.max(1,Math.abs(v)))break;prev=v;}
  if(!Number.isFinite(v))throw Error('Integral fora de rang.');
  return{value:absolute?v:sign*v,error:err,method:'Simpson compost, n='+Math.min(n,32768),converged:n<=32768,steps:['Comprovar domini i continu\u00eftat a ['+l+', '+r+'].','Aproximar amb subdivisions parelles i refinar.','Difer\u00e8ncia entre refinaments / 15 \u2248 '+fmt(err)+'. No \u00e9s una cota rigorosa; oscil\u00b7lacions o singularitats no detectades poden invalidar-la.']};
}
export function limit(a,point,side='both'){
  const{p,q}=rational(a);if(q.every(c=>c===0))throw Error('Denominador id\u00e8nticament nul.');
  if(!Number.isFinite(point)){
    const deg=p.length-q.length,c=p.at(-1)/q.at(-1),sgn=point<0&&Math.abs(deg)%2?-1:1;
    return{left:deg<0?0:deg===0?c:Math.sign(c*sgn)*Infinity,right:deg<0?0:deg===0?c:Math.sign(c*sgn)*Infinity,steps:['Comparar graus del numerador i denominador.','Difer\u00e8ncia de graus: '+deg+'; quocient de coeficients dominants: '+fmt(c)+'.']};
  }
  function order(p){let k=0;const isZero=v=>Math.abs(peval(v,point))<=32*Number.EPSILON*v.reduce((s,c,i)=>s+Math.abs(c)*Math.abs(point)**i,0);while(p.length>1&&isZero(p)){p=pdiff(p);k++;}return{k,c:peval(p,point)};}
  const P=order(p),Q=order(q),d=P.k-Q.k,ratio=P.c/Q.c;
  let right=p.every(x=>x===0)?0:d>0?0:d===0?ratio:Math.sign(ratio)*Infinity;
  let left=d<0&&Math.abs(d)%2?-right:right;
  return{left,right,exists:left===right,steps:['Comparar ordres d\u2019anul\u00b7laci\u00f3: numerador '+P.k+', denominador '+Q.k+'.','Analitzar el signe a esquerra i dreta; denominador nul no significa autom\u00e0ticament as\u00edmptota.'],warning:'Coeficients en coma flotant i toler\u00e0ncia relativa 32\u00b7epsilon. Per a cancel\u00b7lacions gaireb\u00e9 nul\u00b7les, confirma el c\u00e0lcul exacte a m\u00e0.'};
}
export function bisect(a,l,r){
  checkInterval(a,l,r);let fl=value(a,l),fr=value(a,r),steps=[];
  if(fl===0)return{root:l,residual:0,steps:['L\u2019extrem esquerre \u00e9s una arrel.']};
  if(fr===0)return{root:r,residual:0,steps:['L\u2019extrem dret \u00e9s una arrel.']};
  if(fl*fr>0)throw Error('Els extrems no tenen signes oposats. Aix\u00f2 no demostra que no hi hagi arrels.');
  let m;
  for(let i=0;i<90;i++){m=(l+r)/2;let fm=value(a,m);if(i<7)steps.push('['+fmt(l)+', '+fmt(r)+']: punt mitj\u00e0 '+fmt(m)+', f = '+fmt(fm));if(Math.abs(fm)<1e-11)break;if(fl*fm<0)r=m;else{l=m;fl=fm;}if(Math.abs(r-l)<1e-12)break;}
  const residual=Math.abs(value(a,m));if(residual>1e-5)throw Error('El residu no \u00e9s petit: possible discontinu\u00eftat. No s\u2019accepta com a arrel.');
  return{root:m,residual,steps};
}
export function matrix(src){
  const rows=String(src).trim().split(/[;\n]+/).filter(x=>x.trim()).map(x=>x.trim().split(/\s+/).map(v=>Number(v.replace(',','.'))));
  if(!rows.length||rows.length>6||!rows[0].length||rows[0].length>7||rows.some(r=>r.length!==rows[0].length||r.some(x=>!Number.isFinite(x))))throw Error('Matriu inv\u00e0lida. Separa nombres amb espais i files amb punt i coma. M\u00e0xim 6 \u00d7 7.');return rows;
}
export function gauss(A,nvars=A[0]?.length-1){
  if(!Array.isArray(A)||!A.length||!Number.isInteger(nvars)||nvars<1||nvars>6||A.length>6||A.some(row=>!Array.isArray(row)||row.length!==nvars+1||row.some(x=>!Number.isFinite(x))))throw Error('Matriu ampliada num\u00e8rica inv\u00e0lida.');
  let a=A.map(r=>r.slice()),m=a.length,n=a[0].length,r=0,piv=[],steps=[];
  const tol=1e-10;
  // Normalize each equation by its own coefficient scale, not by the RHS.
  a.forEach((row,i)=>{const scale=Math.max(...row.slice(0,nvars).map(Math.abs));if(scale>0&&scale!==1){a[i]=row.map(x=>x/scale);steps.push({label:'Reescalar F'+(i+1)+' dividint per '+fmt(scale),matrix:a.map(x=>x.slice())});}});
  if(a.flat().some(x=>!Number.isFinite(x)))throw Error('Escala no representable. Reescala manualment el sistema.');
  for(let c=0;c<nvars&&r<m;c++){
    let k=r;for(let j=r+1;j<m;j++)if(Math.abs(a[j][c])>Math.abs(a[k][c]))k=j;
    if(Math.abs(a[k][c])<=tol)continue;
    if(k!==r){[a[k],a[r]]=[a[r],a[k]];steps.push({label:'Intercanviar F'+(r+1)+' i F'+(k+1),matrix:a.map(x=>x.slice())});}
    let v=a[r][c];for(let j=0;j<n;j++)a[r][j]/=v;
    steps.push({label:'Dividir F'+(r+1)+' per '+fmt(v),matrix:a.map(x=>x.slice())});
    for(let k=0;k<m;k++)if(k!==r){let f=a[k][c];if(f!==0){for(let j=0;j<n;j++)a[k][j]-=f*a[r][j];steps.push({label:'F'+(k+1)+' \u2190 F'+(k+1)+' - ('+fmt(f)+') F'+(r+1),matrix:a.map(x=>x.slice())});}}
    piv.push(c);r++;
  }
  a=a.map(row=>row.map(x=>Math.abs(x)<1e-12?0:x));
  const inconsistent=a.some(row=>row.slice(0,nvars).every(x=>Math.abs(x)<=tol)&&Math.abs(row[nvars])>tol);
  const free=Array.from({length:nvars},(_,i)=>i).filter(i=>!piv.includes(i));
  let particular=Array(nvars).fill(0);piv.forEach((c,i)=>particular[c]=a[i][nvars]);
  let basis=free.map(c=>{let b=Array(nvars).fill(0);b[c]=1;piv.forEach((j,i)=>b[j]=-a[i][c]);return b;});
  return{rref:a,rank:piv.length,augRank:piv.length+(inconsistent?1:0),kind:inconsistent?'SI':free.length?'SCI':'SCD',particular,basis,free,steps,tolerance:tol};
}
export function determinant(A){
  const n=A.length;if(A.some(r=>r.length!==n))throw Error('El determinant requereix una matriu quadrada.');
  if(n===1)return A[0][0];let d=0;for(let j=0;j<n;j++)d+=(j%2?-1:1)*A[0][j]*determinant(A.slice(1).map(r=>r.filter((_,i)=>i!==j)));return d;
}
export function multiply(A,B){if(A[0].length!==B.length)throw Error('Dimensions incompatibles per al producte A\u00b7B.');return A.map(r=>B[0].map((_,j)=>r.reduce((s,v,k)=>s+v*B[k][j],0)));}
export function inverse(A){let n=A.length;if(A.some(r=>r.length!==n))throw Error('Cal una matriu quadrada.');let cols=[];for(let j=0;j<n;j++){let r=gauss(A.map((row,i)=>[...row,i===j?1:0]));if(r.kind!=='SCD')throw Error('No es pot invertir amb aquesta toler\u00e0ncia.');cols.push(r.particular);}return A.map((_,i)=>cols.map(c=>c[i]));}
export function parametric(src,paramValue=0){
  const rows=String(src).trim().split(/[;\n]+/).filter(x=>x.trim()).map(x=>x.trim().split(/\s+/).map(v=>parse(v.replace(/m/g,'x'))));
  const n=rows.length;if(n<2||n>3||rows.some(r=>r.length!==n+1))throw Error('Sistema param\u00e8tric: 2 \u00d7 3 o 3 \u00d7 4, coeficients polin\u00f2mics en m sense espais interns.');
  const P=rows.map(r=>r.map(poly));
  function det(A){if(A.length===1)return A[0][0];let d=[0];for(let j=0;j<A.length;j++)d=padd(d,pmul(A[0][j],det(A.slice(1).map(r=>r.filter((_,k)=>k!==j)))),j%2?-1:1);return d;}
  const dp=det(P.map(r=>r.slice(0,n)));let exceptions=dp.every(x=>x===0)?null:roots(dp);
  return{det:ptext(dp).replace(/x/g,'m'),exceptions,special:(exceptions||[]).map(m=>({m,...gauss(rows.map(r=>r.map(a=>value(a,m))))})),at:{m:paramValue,...gauss(rows.map(r=>r.map(a=>value(a,paramValue))))},warning:exceptions===null?'Determinant id\u00e8nticament nul: no s\u2019ha fet una discussi\u00f3 general de rangs amb par\u00e0metre. Nom\u00e9s es classifica el valor concret.':'Fora dels zeros del determinant: SCD. Les arrels excepcionals i els rangs es calculen amb toler\u00e0ncia num\u00e8rica; verifica valors gaireb\u00e9 singulars.'};
}
const checkP=p=>{if(!Number.isFinite(p)||p<0||p>1)throw Error('Les probabilitats han d\u2019estar entre 0 i 1.');};
export function bayes(prior,likelihood){if(prior.length!==likelihood.length||!prior.length)throw Error('Falten probabilitats.');[...prior,...likelihood].forEach(checkP);if(Math.abs(prior.reduce((s,x)=>s+x,0)-1)>1e-8)throw Error('Les probabilitats inicials han de sumar 1.');let joint=prior.map((p,i)=>p*likelihood[i]),evidence=joint.reduce((s,x)=>s+x,0);if(evidence===0)throw Error('L\u2019evid\u00e8ncia t\u00e9 probabilitat zero: Bayes no est\u00e0 definit.');return{joint,evidence,posterior:joint.map(x=>x/evidence)};}
export function binomial(n,p,lo,hi){
  checkP(p);if(!Number.isInteger(n)||n<1||n>10000)throw Error('n enter entre 1 i 10000.');
  if(!Number.isInteger(lo)||!Number.isInteger(hi)||lo<0||hi>n||lo>hi)throw Error('Cal 0 \u2264 k inicial \u2264 k final \u2264 n, enters.');
  if(p===0||p===1){const k=p===0?0:n;return{probability:lo<=k&&hi>=k?1:0,mean:n*p,sd:0};}
  const mode=Math.floor((n+1)*p),weights=Array(n+1).fill(0);weights[mode]=1;
  for(let k=mode;k>0;k--)weights[k-1]=weights[k]*k/(n-k+1)*(1-p)/p;
  for(let k=mode;k<n;k++)weights[k+1]=weights[k]*(n-k)/(k+1)*p/(1-p);
  const total=weights.reduce((s,x)=>s+x,0),part=weights.slice(lo,hi+1).reduce((s,x)=>s+x,0);
  return{probability:part/total,mean:n*p,sd:Math.sqrt(n*p*(1-p)),method:'Suma de masses binomials amb recurr\u00e8ncia estable des de la moda (coma flotant).'};
}
export function normalCDF(z){
  if(z===Infinity)return 1;if(z===-Infinity)return 0;if(!Number.isFinite(z))throw Error('Valor z inv\u00e0lid.');
  const x=Math.abs(z),t=1/(1+0.2316419*x),d=0.3989422804014327*Math.exp(-x*x/2),q=d*t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));return z>=0?1-q:q;
}
export function invNormal(p){if(!(p>0&&p<1))throw Error('Quantil amb probabilitat entre 0 i 1.');let l=-10,r=10;for(let i=0;i<80;i++){let m=(l+r)/2;if(normalCDF(m)<p)l=m;else r=m;}return(l+r)/2;}
export function normal(mu,sigma,l,r){if(!Number.isFinite(mu)||!(sigma>0)||!Number.isFinite(sigma)||l>r||Number.isNaN(l)||Number.isNaN(r))throw Error('Normal: mitjana finita, desviaci\u00f3 positiva i l\u00edmits ordenats.');let zl=(l-mu)/sigma,zr=(r-mu)/sigma;return{zl,zr,probability:normalCDF(zr)-normalCDF(zl)};}
export function confidence(kind,center,spread,n,level=.95){
  if(!['known','sample','proportion'].includes(kind))throw Error('Tipus d’interval desconegut.');
  if(!Number.isInteger(n)||n<2||n>1e9||!(level>.5&&level<.9999)||!Number.isFinite(center))throw Error('Mida mostral o nivell de confian\u00e7a inv\u00e0lid.');
  let se,warning='Mostra aleat\u00f2ria i observacions independents. La confian\u00e7a descriu la cobertura del procediment, no una probabilitat posterior del par\u00e0metre.';
  if(kind==='proportion'){checkP(center);if(n*center<10||n*(1-center)<10)throw Error('Aproximaci\u00f3 de Wald no fiable: calen almenys 10 \u00e8xits i 10 fracassos.');se=Math.sqrt(center*(1-center)/n);}
  else{if(!(spread>0)||!Number.isFinite(spread))throw Error('Desviaci\u00f3 t\u00edpica positiva.');se=spread/Math.sqrt(n);if(kind==='sample'&&n<30)throw Error('Amb sigma desconeguda i mostra petita cal t de Student, no implementada.');if(kind==='known')warning+=' Amb mostra petita s\u2019assumeix poblaci\u00f3 normal.';else warning+=' Sigma desconeguda: aproximaci\u00f3 normal per a mostra gran, no interval t.';}
  const z=invNormal((1+level)/2),margin=z*se;return{z,se,margin,lo:center-margin,hi:center+margin,warning};
}
export function statistics(xs,ys=null){
  if(!Array.isArray(xs)||xs.length<2||xs.length>2000||xs.some(x=>!Number.isFinite(x)))throw Error('Calen entre 2 i 2000 dades num\u00e8riques.');
  const n=xs.length,mean=xs.reduce((s,x)=>s+x,0)/n,ss=xs.reduce((s,x)=>s+(x-mean)**2,0),sorted=xs.slice().sort((a,b)=>a-b),median=n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2;
  let out={n,mean,median,min:sorted[0],max:sorted.at(-1),sdPopulation:Math.sqrt(ss/n),sdSample:Math.sqrt(ss/(n-1))};
  if(ys){if(ys.length!==n||ys.some(y=>!Number.isFinite(y)))throw Error('Cada x necessita una y num\u00e8rica.');let my=ys.reduce((s,y)=>s+y,0)/n,sy=ys.reduce((s,y)=>s+(y-my)**2,0),sxy=xs.reduce((s,x,i)=>s+(x-mean)*(ys[i]-my),0);if(ss===0||sy===0)throw Error('La correlaci\u00f3 no est\u00e0 definida quan una variable \u00e9s constant.');out={...out,meanY:my,slope:sxy/ss,intercept:my-sxy/ss*mean,r:sxy/Math.sqrt(ss*sy)};}
  return out;
}
export const dot=(u,v)=>u.reduce((s,x,i)=>s+x*v[i],0);
export const cross=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
export const norm=u=>Math.hypot(...u);
export const sub=(u,v)=>u.map((x,i)=>x-v[i]);
export function geometry(P,Q,R,plane){
  if([P,Q,R].some(v=>v.length!==3||v.some(x=>!Number.isFinite(x)))||plane.length!==4||plane.some(x=>!Number.isFinite(x)))throw Error('Punts de tres coordenades; pla de quatre coeficients.');
  let u=sub(Q,P),v=sub(R,P),w=cross(u,v),n=plane.slice(0,3),nn=dot(n,n);if(nn===0)throw Error('El vector normal no pot ser nul.');
  const signed=(dot(n,P)+plane[3])/Math.sqrt(nn),foot=P.map((x,i)=>x-(dot(n,P)+plane[3])*n[i]/nn);
  return{u,v,cross:w,area:norm(w)/2,planeThrough:norm(w)>1e-12?[...w,-dot(w,P)]:null,distance:Math.abs(signed),projection:foot,angle:norm(u)&&norm(v)?Math.acos(Math.max(-1,Math.min(1,dot(u,v)/(norm(u)*norm(v)))))*180/Math.PI:null};
}
export function finance(capital,rate,n){if(!(capital>0)||!Number.isFinite(capital)||!Number.isFinite(rate)||rate<0||!Number.isInteger(n)||n<1||n>1200)throw Error('Capital positiu, tipus no negatiu per per\u00edode i n enter (1..1200).');const payment=rate===0?capital/n:capital*rate/(-Math.expm1(-n*Math.log1p(rate)));const result={payment,total:payment*n,interest:payment*n-capital,capitalized:capital*Math.pow(1+rate,n)};if(Object.values(result).some(x=>!Number.isFinite(x)))throw Error('Resultat fora de rang. Redueix l’escala o els períodes.');return result;}
