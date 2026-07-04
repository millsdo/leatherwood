const $ = s => document.querySelector(s);
const fmt = n => n.toLocaleString('en-US',{style:'currency',currency:'USD'});
const INK='#14213D', STAMP='#B3261E', MONEY='#1B6E4A', GOLD='#8a5a00', RULE='#CFCEC3';
Chart.defaults.font.family="'IBM Plex Mono',monospace";
Chart.defaults.color=INK;

/* ---- hero receipt: top 2024+2026-cycle special interests ---- */
(() => {
  const recent = DATA.contributions.filter(c => (c.cycle==='2024'||c.cycle==='2026') && c.bucket==='PAC / Special Interest');
  const agg = {};
  recent.forEach(c => agg[c.name]=(agg[c.name]||0)+c.amt);
  const top = Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,12);
  $('#receipt-lines').innerHTML = top.map(([n,v]) =>
    `<div><span class="nm">${n}</span><span>${fmt(v)}</span></div>`).join('')
    + `<div><span class="nm">&hellip; and ${Object.keys(agg).length - 12} more special interests</span><span></span></div>`;
})();

/* ---- Exhibit A: stacked $ by cycle + PAC share line ---- */
(() => {
  const cy = DATA.cycles;
  const labels = cy.map(c=>c.cycle==='2026' ? ["2025–Q1 '26",'(filed to date)'] : c.cycle);
  new Chart($('#chartCycles'), {
    type:'bar',
    data:{labels, datasets:[
      {label:'PACs & special interests', data:cy.map(c=>c['PAC / Special Interest']), backgroundColor:STAMP},
      {label:'Politicians', data:cy.map(c=>c['Politician']), backgroundColor:GOLD},
      {label:'Individual people', data:cy.map(c=>c['Individual']), backgroundColor:MONEY},
    ]},
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        title:{display:true,text:'Contributions by source, per election cycle',font:{size:15,weight:'700'}},
        tooltip:{callbacks:{label:ctx=>` ${ctx.dataset.label}: ${fmt(ctx.raw)}`}}
      },
      scales:{
        x:{stacked:true,grid:{display:false}},
        y:{stacked:true,ticks:{callback:v=>'$'+(v/1000)+'k'},grid:{color:RULE}}
      }
    }
  });
  const share = cy.map(c => {
    const t=c['PAC / Special Interest']+c['Politician']+c['Individual'];
    return t? +(c['PAC / Special Interest']/t*100).toFixed(1):0;
  });
  new Chart($('#chartShare'), {
    type:'line',
    data:{labels, datasets:[{
      label:'PAC & special interest share of contributions',
      data:share, borderColor:STAMP, backgroundColor:STAMP,
      borderWidth:3, pointRadius:6, pointBackgroundColor:STAMP, tension:0
    }]},
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        title:{display:true,text:'Special interest share: 58% → 74% → 87% → 100% (final point: Jan 2025–Mar 2026 filings)',font:{size:15,weight:'700'}},
        legend:{display:false},
        tooltip:{callbacks:{label:ctx=>` ${ctx.raw}% PAC-funded`}}
      },
      scales:{
        y:{min:0,max:100,ticks:{callback:v=>v+'%'},grid:{color:RULE}},
        x:{grid:{display:false}}
      }
    }
  });
})();

/* ---- Exhibit B: the big geography pie ---- */
new Chart($('#chartGeo'), {
  type:'pie',
  data:{labels:['Outside District 99','Inside District 99','Pre-2023 nameless small gifts'],
    datasets:[{data:[264360.20,11450,4555], backgroundColor:[STAMP,MONEY,'#A8ADA3'], borderColor:'#fff', borderWidth:3}]},
  options:{
    responsive:true, maintainAspectRatio:false,
    plugins:{
      title:{display:false},
      legend:{position:'bottom',labels:{font:{size:13}}},
      tooltip:{callbacks:{label:ctx=>{
        const t=266240.20;
        return ` ${ctx.label}: ${fmt(ctx.raw)} (${(ctx.raw/t*100).toFixed(1)}%)`;}}}
    }
  }
});

/* ---- Exhibit B: top PACs + career doughnut ---- */
(() => {
  const pacs = DATA.donors.filter(d=>d.bucket==='PAC / Special Interest').slice(0,12);
  $('#topPacs').innerHTML = pacs.map(d =>
    `<li><span class="who">${d.name}</span><span class="amt">${fmt(d.total)}</span></li>`).join('');
  new Chart($('#chartSplit'), {
    type:'doughnut',
    data:{labels:['PACs, businesses & special interests','Politicians','Individuals — out of district','Individuals — in District 99','Individuals — unitemized (no address)'],
      datasets:[{data:[205270.20,12450,47190,10900,4555], backgroundColor:[STAMP,GOLD,'#D97C74',MONEY,'#A8ADA3'], borderColor:'#fff'}]},
    options:{
      responsive:true, maintainAspectRatio:false, cutout:'58%',
      plugins:{legend:{position:'bottom'},
        tooltip:{callbacks:{label:ctx=>` ${ctx.label}: ${fmt(ctx.raw)}`}}}
    }
  });
})();

/* ---- Exhibit C: searchable table ---- */
(() => {
  const tbody = $('#tbl tbody');
  const cycles = [...new Set(DATA.contributions.map(c=>c.cycle))].sort();
  cycles.forEach(c => $('#fCycle').insertAdjacentHTML('beforeend',`<option>${c}</option>`));
  let sortK='date', sortDir=1;
  const tagCls = b => b==='PAC / Special Interest'?'pac':(b==='Politician'?'pol':'ppl');
  const parseD = d => { const [m,dd,y]=d.split('/'); return y+m+dd; };

  function render(){
    const q = $('#q').value.trim().toLowerCase();
    const fc = $('#fCycle').value, fb = $('#fBucket').value, fd = $('#fDistrict').value;
    let rows = DATA.contributions.filter(c =>
      (!fc || c.cycle===fc) && (!fb || c.bucket===fb) &&
      (!fd || c.district===fd) &&
      (!q || (c.name+' '+c.city+' '+c.occ+' '+c.emp).toLowerCase().includes(q)));
    rows.sort((a,b)=>{
      let A=a[sortK],B=b[sortK];
      if(sortK==='date'){A=parseD(A);B=parseD(B);}
      return (A>B?1:A<B?-1:0)*sortDir;
    });
    const total = rows.reduce((s,c)=>s+c.amt,0);
    $('#count').textContent = `${rows.length} checks · ${fmt(total)}`;
    tbody.innerHTML = rows.map(c=>`<tr>
      <td class="mono">${c.date}</td>
      <td><strong>${c.name}</strong>${c.occ?`<br><span style="font-size:12px;color:#3E4A6B">${c.occ}${c.emp?' · '+c.emp:''}</span>`:''}</td>
      <td><span class="tag ${tagCls(c.bucket)}">${c.bucket.replace(' / Special Interest','')}</span></td>
      <td>${c.city}${c.state && c.state!=='TN' ? ', <strong>'+c.state+'</strong>':''}${c.district ? `<br><span class="tag ${c.district==='In District'?'ppl':'ood'}">${c.district}</span>`:''}</td>
      <td style="font-size:12.5px">${c.report}</td>
      <td class="num">${fmt(c.amt)}</td></tr>`).join('');
  }
  ['#q','#fCycle','#fBucket','#fDistrict'].forEach(s=>$(s).addEventListener('input',render));
  document.querySelectorAll('#tbl th').forEach(th=>th.addEventListener('click',()=>{
    const k=th.dataset.k; if(!k)return;
    if(sortK===k) sortDir*=-1; else {sortK=k; sortDir = k==='amt'?-1:1;}
    render();
  }));
  sortK='date'; sortDir=-1; render();
})();

/* ---- Exhibit D: ledger + balance chart ---- */
(() => {
  const L = DATA.ledger;
  $('#ledgerTbl tbody').innerHTML = L.map(r=>`<tr>
    <td>${r.report}</td>
    <td class="num" style="color:${MONEY}">${fmt(r.in)}</td>
    <td class="num" style="color:${STAMP}">${r.out?fmt(r.out):'—'}</td>
    <td class="num"><strong>${fmt(r.end)}</strong></td></tr>`).join('')
    + `<tr style="background:#F1F0E9;font-weight:700">
       <td>CAREER TOTALS</td>
       <td class="num" style="color:${MONEY}">${fmt(DATA.meta.career_in)}</td>
       <td class="num" style="color:${STAMP}">${fmt(DATA.meta.career_out)}</td>
       <td class="num">${fmt(DATA.meta.balance)}</td></tr>`;
  new Chart($('#chartBalance'), {
    type:'line',
    data:{labels:L.map(r=>r.report), datasets:[{
      label:'Ending balance', data:L.map(r=>r.end),
      borderColor:INK, backgroundColor:'rgba(20,33,61,.08)', fill:true,
      borderWidth:2.5, pointRadius:3, tension:0, stepped:false
    }]},
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        title:{display:true,text:'Campaign account balance, filing by filing',font:{size:15,weight:'700'}},
        legend:{display:false},
        tooltip:{callbacks:{label:ctx=>` ${fmt(ctx.raw)}`}}
      },
      scales:{
        y:{ticks:{callback:v=>'$'+(v/1000)+'k'},grid:{color:RULE}},
        x:{ticks:{maxRotation:60,font:{size:9}},grid:{display:false}}
      }
    }
  });
})();

/* ---- Exhibit E: the eight people ---- */
(() => {
  const people = [
    {nm:'Wade Lawson',amt:1800,who:'Civil engineer · Memphis',dt:'Jan 6, 2024',d:'Out of District'},
    {nm:'Gerald Lawson',amt:1800,who:'Attorney · Memphis',dt:'Jan 6, 2024',d:'Out of District'},
    {nm:'Glen Bascom',amt:1000,who:'Real estate broker · Arlington',dt:'Jan 6, 2024',d:'In District'},
    {nm:'Bob Wilson',amt:500,who:'Logistics company CEO · Arlington',dt:'Jan 6, 2024',d:'In District'},
    {nm:'Brittany Chandler',amt:500,who:'Co-owner, Medicaid-funded behavioral health company · Collierville',dt:'Aug 28, 2024',d:'Out of District'},
    {nm:'Aaron Tatum',amt:350,who:'Author · Memphis',dt:'2023–2024',d:'Out of District'},
    {nm:'Ed Haley',amt:200,who:'City manager · Millington',dt:'Jan 6, 2024',d:'In District'},
    {nm:'Jina Sanders',amt:150,who:'Home executive · Germantown',dt:'Oct 13, 2024',d:'Out of District'},
  ];
  $('#peopleGrid').innerHTML = people.map(p=>`<div class="person${p.d==='Out of District'?' ood':''}">
    <div class="nm">${p.nm}</div>
    <div class="amt">${fmt(p.amt)}</div>
    <div class="who">${p.who}<br><span class="mono" style="font-size:11.5px">${p.dt}</span></div>
    <span class="tag ${p.d==='In District'?'ppl':'ood'}" style="margin-top:8px;display:inline-block">${p.d}</span>
  </div>`).join('');
})();
