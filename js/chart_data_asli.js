
let chartKecamatanAsli;
let chartTahunAsli;
let chartJenisAsli;

function loadChartDataAsli(){

if(chartKecamatanAsli) chartKecamatanAsli.destroy();
if(chartTahunAsli) chartTahunAsli.destroy();
if(chartJenisAsli) chartJenisAsli.destroy();

chartKecamatanAsli = new Chart(
document.getElementById("chartKecamatan"),
{
type:"bar",
data:{
labels:dataDashboardAsli.kecamatan.labels,
datasets:[{
label:"Jumlah Nagori Penerima",
data:dataDashboardAsli.kecamatan.values
}]
},
options:{
indexAxis:"y",
maintainAspectRatio:false,
plugins:{
legend:{display:false}
}
}
});

chartJenisAsli = new Chart(
document.getElementById("chartJenis"),
{
type:"doughnut",
data:{
labels:dataDashboardAsli.jenis.labels,
datasets:[{
data:dataDashboardAsli.jenis.values
}]
},
options:{
maintainAspectRatio:false
}
});

chartTahunAsli = new Chart(
document.getElementById("chartTahun"),
{
type:"line",
data:{
labels:dataDashboardAsli.tahun.map(x=>x.tahun),
datasets:[{
label:"Jumlah Desa Penerima",
data:dataDashboardAsli.tahun.map(x=>x.desa),
tension:0.3
}]
},
options:{
maintainAspectRatio:false,
scales:{
y:{
beginAtZero:true
}
}
}
});

}

window.addEventListener("load",()=>{
setTimeout(loadChartDataAsli,1200);
});
