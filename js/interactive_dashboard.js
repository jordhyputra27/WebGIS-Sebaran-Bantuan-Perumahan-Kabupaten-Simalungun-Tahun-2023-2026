document.addEventListener('DOMContentLoaded',function(){
let modal=document.createElement('div');
modal.id='chartModal';
modal.innerHTML=`<div class="modal-chart-box"><button id="closeChart">×</button><h3 id="modalTitle"></h3><div class="modal-chart-area"><canvas id="modalCanvas"></canvas></div></div>`;
document.body.appendChild(modal);
let activeChart=null;

function makeConfig(canvas){
 let original=Chart.getChart(canvas);
 if(!original)return null;
 let data=JSON.parse(JSON.stringify(original.data));
 let type=original.config.type;
 let options={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:'top'}}};

 if(type==='bar'){
   options.indexAxis='y';
   options.scales={x:{beginAtZero:true}};
   options.plugins.legend.display=true;
   // popup kecamatan gunakan data lebih banyak jika tersedia
   if(canvas.id==='chartKecamatan' && typeof dataDashboardAsli!=='undefined'){
      data.labels=dataDashboardAsli.kecamatanAll.labels || data.labels;
      data.datasets[0].data=dataDashboardAsli.kecamatanAll.values || data.datasets[0].data;
      data.datasets[0].label='Jumlah Nagori Penerima';
   }
 }
 return {type:type,data:data,options:options};
}

document.querySelectorAll('.chart-box').forEach(panel=>{
 panel.addEventListener('click',function(){
  let canvas=panel.querySelector('canvas');
  if(!canvas)return;
  let cfg=makeConfig(canvas);
  if(!cfg)return;
  modal.style.display='flex';
  document.getElementById('modalTitle').innerHTML=(panel.querySelector('h3,h4')||{}).innerText || 'Grafik Dashboard';
  if(activeChart)activeChart.destroy();
  activeChart=new Chart(document.getElementById('modalCanvas').getContext('2d'),cfg);
 });
});

document.getElementById('closeChart').onclick=function(){modal.style.display='none';if(activeChart){activeChart.destroy();activeChart=null;}};
});
