import * as M from './engine.mjs';
const N=(p,k,def)=>{const raw=p[k]??def;if(String(raw).trim()==='')throw Error('Falta el camp '+k);const n=Number(String(raw).replace(',','.'));if(!Number.isFinite(n))throw Error('Valor num\u00e8ric inv\u00e0lid al camp '+k);return n;};
const list=s=>String(s).trim().split(/[\s;]+/).filter(Boolean).map(x=>Number(x.replace(',','.')));
const frac=x=>{if(!Number.isFinite(x))return String(x);for(let d=1;d<=500;d++){let n=Math.round(x*d);if(Math.abs(x-n/d)<1e-11)return d===1?String(n):`${n}/${d}`;}return '\u2248 '+M.fmt(x);};
export function solve(tool,p){
  if(tool==='calculus'){
    const ast=M.parse(p.f),trace=[],d=M.derivative(ast,trace),dd=M.derivative(d),a=N(p,'a',1);
    let primitive=null,primitiveError=null,primTrace=[];
    try{primitive=M.primitive(ast,primTrace);}catch(e){primitiveError=e.message;}
    let point=null,pointError=null;try{const y=M.value(ast,a),slope=M.value(d,a);point={a,y,slope,intercept:y-slope*a,normal:slope===0?null:-1/slope};}catch(e){pointError=e.message;}
    let critical=null;try{const r=M.rational(d);critical=M.roots(r.p).filter(x=>Number.isFinite(M.safeValue(ast,x))&&Number.isFinite(M.safeValue(d,x))).map(x=>({x,y:M.value(ast,x),dd:M.safeValue(dd,x)}));}catch{}
    let integral=null,integralError=null;
    try{const l=N(p,'lo',0),r=N(p,'hi',1);integral=M.integrate(ast,l,r,p.area==='geometric');if(primitive&&p.area!=='geometric'){integral.antiderivativeDifference=M.value(primitive,r)-M.value(primitive,l);}}catch(e){integralError=e.message;}
    return{tool,ast,d,dd,trace:[...new Set(trace)],primitive,primTrace,primitiveError,point,pointError,critical,integral,integralError};
  }
  if(tool==='equation'){
    const ast=M.parse(p.f);if(p.mode==='bisect'){return{tool,mode:'bisect',...M.bisect(ast,N(p,'lo'),N(p,'hi'))};}
    const coeff=M.poly(ast),n=coeff.length-1;
    if(n===0)return{tool,mode:'polynomial',degree:0,identity:coeff[0]===0,roots:[],steps:[coeff[0]===0?'0=0: identitat; tots els reals del domini original.':'Constant no nul\u00b7la: cap soluci\u00f3.']};
    let steps=[],complex=null,rs=M.roots(coeff);
    if(n===1)steps=['Equaci\u00f3 lineal: ax+b=0, amb a diferent de zero.','x=-b/a = '+frac(rs[0])];
    if(n===2){const[c,b,a]=coeff,D=b*b-4*a*c;steps=['a='+a+', b='+b+', c='+c,'Discriminant b\u00b2-4ac='+M.fmt(D),'Aplicar (-b \u00b1 \u221aD)/(2a) si D\u22650.'];if(D<0)complex={real:-b/(2*a),imaginary:Math.sqrt(-D)/Math.abs(2*a)};}
    if(n>2)steps=['Polinomi de grau '+n+'.','A\u00efllament num\u00e8ric recursiu amb punts cr\u00edtics i bisecci\u00f3. Arrels gaireb\u00e9 m\u00faltiples poden ser sensibles a la toler\u00e0ncia.'];
    return{tool,mode:'polynomial',degree:n,roots:rs.map(x=>({x,fraction:n<=2?frac(x):null,residual:Math.abs(M.value(ast,x))})),complex,steps};
  }
  if(tool==='limit'){
    const ast=M.parse(p.f),point=p.point==='inf'?Infinity:p.point==='-inf'?-Infinity:N(p,'point');let result=null,error=null;
    try{result=M.limit(ast,point);}catch(e){error=e.message;}
    let table=[];for(let k=1;k<=6;k++){let h=10**(-k);let l=Number.isFinite(point)?point-h:(point>0?1:-1)*10**k,r=Number.isFinite(point)?point+h:l;table.push({h,leftX:l,left:M.safeValue(ast,l),rightX:r,right:M.safeValue(ast,r)});}
    return{tool,result,error,table,point};
  }
  if(tool==='system')return{tool,...M.gauss(M.matrix(p.A))};
  if(tool==='parameters')return{tool,...M.parametric(p.A,N(p,'m',0))};
  if(tool==='matrix'){
    const A=M.matrix(p.A),operation=p.operation||'multiply';let result,steps=[];
    if(operation==='multiply'){let B=M.matrix(p.B);result=M.multiply(A,B);steps=['Dimensions: '+A.length+'\u00d7'+A[0].length+' per '+B.length+'\u00d7'+B[0].length+'.','Cada entrada \u00e9s la suma dels productes d\u2019una fila d\u2019A per una columna de B.'];}
    if(operation==='determinant'){result=M.determinant(A);steps=['Determinant calculat per desenvolupament de menors.','Zero o valor molt proper a zero: comprova singularitat amb rang i l\u2019escala de les dades.'];}
    if(operation==='inverse'){result=M.inverse(A);steps=['Resoldre AX=I, columna a columna.','Comprovaci\u00f3 A\u00b7A\u207b\u00b9:',JSON.stringify(M.multiply(A,result))];}
    if(operation==='transpose'){result=A[0].map((_,j)=>A.map(r=>r[j]));steps=['Intercanviar files i columnes.'];}
    if(operation==='add'){const B=M.matrix(p.B);if(A.length!==B.length||A[0].length!==B[0].length)throw Error('La suma exigeix les mateixes dimensions.');result=A.map((r,i)=>r.map((x,j)=>x+B[i][j]));steps=['Sumar entrada a entrada.'];}
    return{tool,result,operation,steps};
  }
  if(tool==='bayes')return{tool,...M.bayes(list(p.prior),list(p.likelihood))};
  if(tool==='binomial'){
    let n=N(p,'n'),q=N(p,'p'),lo=N(p,'lo'),hi=N(p,'hi'),r=M.binomial(n,q,lo,hi);let approx=null;
    if(q>0&&q<1){const continuity=p.correction==='yes',lower=lo===0?-Infinity:lo-(continuity?.5:0),upper=hi===n?Infinity:hi+(continuity?.5:0);approx=M.normal(n*q,Math.sqrt(n*q*(1-q)),lower,upper);approx.reliable=n*q>=10&&n*(1-q)>=10;}
    return{tool,n,p:q,lo,hi,...r,approx,continuity:p.correction==='yes'};
  }
  if(tool==='normal'){
    const bound=k=>p[k]==='inf'?Infinity:p[k]==='-inf'?-Infinity:N(p,k);
    return{tool,...M.normal(N(p,'mu'),N(p,'sigma'),bound('lo'),bound('hi'))};
  }
  if(tool==='confidence')return{tool,...M.confidence(p.kind,N(p,'center'),N(p,'spread',1),N(p,'n'),N(p,'level'))};
  if(tool==='statistics'){
    let rows=String(p.data).trim().split(/[;\n]+/).filter(r=>r.trim()).map(list);
    if(p.mode==='paired'){if(rows.some(r=>r.length!==2))throw Error('Cada fila ha de tenir exactament x i y, separats per un espai.');return{tool,...M.statistics(rows.map(r=>r[0]),rows.map(r=>r[1]))};}
    return{tool,...M.statistics(rows.flat())};
  }
  if(tool==='geometry')return{tool,...M.geometry(list(p.P),list(p.Q),list(p.R),list(p.plane))};
  if(tool==='finance')return{tool,...M.finance(N(p,'capital'),N(p,'rate'),N(p,'n'))};
  throw Error('Eina desconeguda.');
}
