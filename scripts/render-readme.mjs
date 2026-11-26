import {Resvg} from '@resvg/resvg-js';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'assets/readme');mkdirSync(out,{recursive:true});
const teal='#124C49', green='#74B93E', ink='#17233B', muted='#59647A', line='#DAE4DC';
const regular=path.join(root,'assets/fonts/InstrumentSans-Regular.ttf');
const bold=path.join(root,'assets/fonts/InstrumentSans-Bold.ttf');
const mono=path.join(root,'assets/fonts/DMMono-Regular.ttf');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=(x,y,s,size=28,fill=ink,weight=400)=>`<text x="${x}" y="${y}" font-family="Instrument Sans" font-size="${size}" font-weight="${weight}" fill="${fill}">${escape(s)}</text>`;
const label=(x,y,s,fill=muted)=>`<text x="${x}" y="${y}" font-family="DM Mono" font-size="18" fill="${fill}" letter-spacing="1">${escape(s)}</text>`;
const asset=(name,x,y,w,h)=>`<image x="${x}" y="${y}" width="${w}" height="${h}" href="data:image/svg+xml;base64,${readFileSync(path.join(root,'assets/brand',name)).toString('base64')}"/>`;
function render(name,w,h,body){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#F8FAF6"/>${body}</svg>`;
 const font={fontFiles:[regular,bold,mono],loadSystemFonts:false,defaultFontFamily:'Instrument Sans'};
 writeFileSync(path.join(out,name+'.png'),new Resvg(svg,{font}).render().asPng());
 writeFileSync(path.join(out,name+'-mobile.png'),new Resvg(svg,{font,fitTo:{mode:'width',value:390}}).render().asPng());
}
let hero=asset('monogram.svg',68,56,66,66)+asset('wordmark.svg',150,67,355,52);
hero+=`<rect x="1190" y="66" width="340" height="46" rx="23" fill="#E8F1E2"/>`+text(1220,97,'A PLUGIN FOR CODEX',20,teal,700);
hero+=text(68,245,'Choose AI models',96,teal,700)+text(68,355,'for the work you do.',96,ink,700);
hero+=text(72,426,'Industry benchmarks. Measured cost. Inference time.',32,muted);
hero+=`<line x1="72" y1="488" x2="1528" y2="488" stroke="${line}" stroke-width="2"/>`;
const pillars=[['01','Model','evaluations'],['02','Enterprise','recommendations'],['03','Industry','differences'],['04','New model','assessments']];
pillars.forEach(([n,a,b],i)=>{let x=72+i*370;hero+=label(x,541,n,teal)+`<rect x="${x}" y="562" width="30" height="5" fill="${green}"/>`+text(x,618,a,31,ink,700)+text(x,659,b,31,ink,700);});
hero+=label(72,744,'ENTERPRISEANALYSIS.AI')+text(1178,744,'Ask in plain language.',23,teal);
render('hero',1600,800,hero);

let prompts=asset('monogram.svg',64,48,48,48)+text(130,84,'One plugin. Four ways to choose.',46,teal,700);
prompts+=text(64,142,'Start with a question you would actually ask.',26,muted);
const cards=[
 ['MODEL EVALUATION','Which model performs better?','Compare scores, cost and inference time.'],
 ['ENTERPRISE RECOMMENDATION','What should our AI support use?','Shortlist models for a workload and budget.'],
 ['INDUSTRY DIFFERENCES','Finance or retail: same choice?','Check performance in each industry.'],
 ['NEW MODEL ASSESSMENT','Is the new release worth trying?','Inspect available results and evaluation status.']
];
cards.forEach(([tag,q,a],i)=>{const y=188+i*170;prompts+=`<rect x="64" y="${y}" width="1272" height="148" rx="16" fill="white" stroke="${line}"/><rect x="64" y="${y+18}" width="5" height="112" rx="2" fill="${green}"/>`+label(92,y+33,tag,teal)+text(92,y+79,q,35,ink,700)+text(92,y+117,a,24,muted);});
prompts+=text(66,919,'Same-index evidence · exact model configurations · visible evaluation status',24,teal);
prompts+=label(66,964,'EXAMPLE PROMPTS / CAPABILITY OVERVIEW');
render('prompts',1400,1008,prompts);
writeFileSync(path.join(root,'assets/brand/monogram.png'),new Resvg(readFileSync(path.join(root,'assets/brand/monogram.svg'))).render().asPng());
console.log('Rendered hero, prompt overview, mobile previews and original brand mark PNG.');
