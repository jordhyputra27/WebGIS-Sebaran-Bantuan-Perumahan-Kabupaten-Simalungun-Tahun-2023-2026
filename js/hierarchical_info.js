(function(){
const originalStyle = new WeakMap();
let selectedLayer = null;
let hoverLayer = null;

function saveStyle(layer){
 if(layer && !originalStyle.has(layer)){
   originalStyle.set(layer, Object.assign({}, layer.options));
 }
}

function restoreStyle(layer){
 if(layer && layer.setStyle && originalStyle.has(layer)){
   layer.setStyle(originalStyle.get(layer));
 }
}

function clearSelected(){
 if(selectedLayer){
   restoreStyle(selectedLayer);
   selectedLayer=null;
 }
 if(hoverLayer){
   restoreStyle(hoverLayer);
   hoverLayer=null;
 }
}

function applyHover(layer){
 if(layer && layer.setStyle){
   saveStyle(layer);
   layer.setStyle({
     color:'#0066ff',
     weight:2,
     fillColor:'#3388ff',
     fillOpacity:0.35
   });
 }
}

function applySelected(layer){
 clearSelected();
 if(layer && layer.setStyle){
   saveStyle(layer);
   layer.setStyle({
     color:'#004cff',
     weight:3,
     fillColor:'#3388ff',
     fillOpacity:0.45
   });
   selectedLayer=layer;
 }
}

function setInfo(html,title){
 const el=document.getElementById('infoDesa');
 const t=document.getElementById('infoTitle');
 if(el) el.innerHTML=html;
 if(t) t.textContent=title;
}

function row(label,value){
 return `<div class="info-row"><span>${label}</span><strong>${value||'-'}</strong></div>`;
}

function bindSafe(layer, callback){
 if(!layer || !layer.on) return;
 layer.off('mouseover mouseout click');

 layer.on({
   mouseover:function(){
      if(layer!==selectedLayer){
        hoverLayer=layer;
        applyHover(layer);
      }
   },

   mouseout:function(){
      if(layer!==selectedLayer){
        restoreStyle(layer);
        if(hoverLayer===layer) hoverLayer=null;
      }
   },

   click:function(e){
      L.DomEvent.stopPropagation(e);
      clearSelected();
      applySelected(layer);
      callback();
   }
 });
}

function bindDesaLayer(layerGroup){
 if(typeof layerGroup==='undefined' || !layerGroup || !layerGroup.eachLayer) return;
 layerGroup.eachLayer(function(layer){
   bindSafe(layer,function(){
     var p=(layer.feature && layer.feature.properties) ? layer.feature.properties : {};
     if(typeof window.showInfoDesa === 'function'){
       window.showInfoDesa(p);
     }else{
       setInfo(
         row('Desa/Kelurahan',p.Desa_Kelurahan)+
         row('Kecamatan',p.Kecamatan),
         'Informasi Desa'
       );
     }
   });
 });
}

function initHierarchicalInfo(){

 // Seluruh layer tematik desa diberi handler informasi desa.
 // Dengan ini, saat layer Batas Kecamatan dimatikan, klik pada layer hasil filter
 // tetap menampilkan informasi desa/kelurahan yang sesuai.
 bindDesaLayer(typeof layer_InformasiWilayah_12 !== 'undefined' ? layer_InformasiWilayah_12 : null);
 bindDesaLayer(typeof layer_Tahun2023_8 !== 'undefined' ? layer_Tahun2023_8 : null);
 bindDesaLayer(typeof layer_Tahun2024_7 !== 'undefined' ? layer_Tahun2024_7 : null);
 bindDesaLayer(typeof layer_Tahun2025_6 !== 'undefined' ? layer_Tahun2025_6 : null);
 bindDesaLayer(typeof layer_Tahun2026_5 !== 'undefined' ? layer_Tahun2026_5 : null);
 bindDesaLayer(typeof layer_BSPS_9 !== 'undefined' ? layer_BSPS_9 : null);
 bindDesaLayer(typeof layer_APBDProvinsi_10 !== 'undefined' ? layer_APBDProvinsi_10 : null);
 bindDesaLayer(typeof layer_APBDKabupaten_11 !== 'undefined' ? layer_APBDKabupaten_11 : null);

 if(typeof layer_BatasKecamatan_13!=='undefined'){
  layer_BatasKecamatan_13.eachLayer(function(layer){
   bindSafe(layer,function(){
    var p=layer.feature.properties||{};
    var nama=p.WADMKC||'-';
    var desa=0,total=0,penerima=0,jenis={};

    if(typeof json_InformasiWilayah_12!=='undefined'){
      json_InformasiWilayah_12.features.forEach(function(f){
       var d=f.properties||{};
       if(d.Kecamatan===nama){
        desa++;
        total+=Number(d.Jumlah_Bantuan||0);
        if(Number(d.Jumlah_Bantuan||0)>0)penerima++;
        if(d.Jenis_Bantuan && String(d.Jenis_Bantuan).toLowerCase()!=='belum pernah')jenis[d.Jenis_Bantuan]=(jenis[d.Jenis_Bantuan]||0)+1;
       }
      });
    }

    setInfo(
      row('Nama Kecamatan',nama)+
      row('Jumlah Desa',desa+' Desa')+
      row('Desa Penerima',penerima+' Desa')+
      row('Total Bantuan',total+' Kali')+
      row('Jenis Bantuan',Object.keys(jenis).join(', ')||'-'),
      'Informasi Kecamatan'
    );
   });
  });
 }
}

window.addEventListener('load',initHierarchicalInfo);
})();
