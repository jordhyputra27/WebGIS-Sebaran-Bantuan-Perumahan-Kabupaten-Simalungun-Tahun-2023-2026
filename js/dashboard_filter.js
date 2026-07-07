/* =========================================================
   Filter Dashboard WebGIS - Tahun Bantuan & Jenis Bantuan
   Membuat dropdown filter bekerja untuk peta, statistik, dan grafik.
   ========================================================= */
(function(){
  'use strict';

  const TOTAL_DESA = 413;
  const TOTAL_KECAMATAN = 32;

  function getEl(id){ return document.getElementById(id); }

  function normalizeJenis(value){
    return String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/BPSP/ig, 'BSPS')
      .replace(/APBD\s*Kabupaten/ig, 'APBD Kab')
      .replace(/APBD\s*Kab\.?/ig, 'APBD Kab')
      .replace(/APBD\s*Provinsi/ig, 'APBD Prov')
      .replace(/APBD\s*Prov\.?/ig, 'APBD Prov')
      .replace(/^APBD Kab$/i, 'APBD Kabupaten')
      .replace(/^APBD Prov$/i, 'APBD Provinsi')
      .replace(/^BSPS$/i, 'BSPS');
  }

  function splitValues(value){
    return String(value || '')
      .split(',')
      .map(function(v){ return v.trim(); })
      .filter(Boolean)
      .filter(function(v){ return v !== '-' && v.toLowerCase() !== 'null'; });
  }

  function getJenisList(row){
    return splitValues(row && row.Jenis_Bantuan)
      .map(normalizeJenis)
      .filter(function(v){ return v && v.toLowerCase() !== 'belum pernah'; });
  }

  function getYearList(row){
    return splitValues(row && row.Tahun_bantuan)
      .filter(function(v){ return /^20\d{2}$/.test(v); });
  }

  function getSelectedFilters(){
    const yearEl = getEl('filterTahun');
    const jenisEl = getEl('filterJenis');
    return {
      tahun: yearEl ? yearEl.value : 'all',
      jenis: jenisEl ? normalizeJenis(jenisEl.value) : 'all'
    };
  }

  function hasBantuan(row){
    return Number(row && row.Jumlah_Bantuan || 0) > 0;
  }

  function rowMatches(row, filters){
    if (!row || !hasBantuan(row)) return false;
    const years = getYearList(row);
    const jenis = getJenisList(row);
    const yearOk = filters.tahun === 'all' || years.indexOf(filters.tahun) !== -1;
    const jenisOk = filters.jenis === 'all' || jenis.indexOf(filters.jenis) !== -1;
    return yearOk && jenisOk;
  }

  function matchingContribution(row, filters){
    if (!rowMatches(row, filters)) return 0;
    const years = getYearList(row);
    const jenis = getJenisList(row);

    if (filters.tahun === 'all' && filters.jenis === 'all') {
      return Number(row.Jumlah_Bantuan || 0);
    }
    if (filters.tahun !== 'all' && filters.jenis !== 'all') {
      return 1;
    }
    if (filters.tahun !== 'all') {
      return years.indexOf(filters.tahun) !== -1 ? 1 : 0;
    }
    if (filters.jenis !== 'all') {
      return jenis.filter(function(j){ return j === filters.jenis; }).length || 1;
    }
    return 0;
  }

  function getRawData(){
    return (typeof dataDashboardAsli !== 'undefined' && dataDashboardAsli.rawDesa)
      ? dataDashboardAsli.rawDesa.filter(function(d){ return d && d.Desa_Kelurahan; })
      : [];
  }

  function setText(id, value){
    const el = getEl(id);
    if (el) el.textContent = value;
  }

  function getFilteredRows(filters){
    return getRawData().filter(function(row){ return rowMatches(row, filters); });
  }

  function updateStatisticFiltered(){
    const filters = getSelectedFilters();
    const rows = getFilteredRows(filters);
    const desaSet = new Set();
    const kecSet = new Set();
    const bantuanPerDesa = {};

    rows.forEach(function(row){
      const desa = row.Desa_Kelurahan;
      const kec = row.Kecamatan;
      const contribution = matchingContribution(row, filters);
      if (desa) desaSet.add(desa);
      if (kec) kecSet.add(kec);
      if (desa) bantuanPerDesa[desa] = (bantuanPerDesa[desa] || 0) + contribution;
    });

    let totalBantuan = 0;
    let sekali = 0;
    let multi = 0;
    Object.keys(bantuanPerDesa).forEach(function(desa){
      const n = bantuanPerDesa[desa];
      totalBantuan += n;
      if (n === 1) sekali++;
      if (n > 1) multi++;
    });

    setText('desaPenerimaTotal', desaSet.size + ' / ' + TOTAL_DESA);
    setText('desaPersen', ((desaSet.size / TOTAL_DESA) * 100).toFixed(1) + '% cakupan desa');
    setText('kecamatanPenerimaTotal', kecSet.size + ' / ' + TOTAL_KECAMATAN);
    setText('kecamatanPersen', ((kecSet.size / TOTAL_KECAMATAN) * 100).toFixed(1) + '% cakupan kecamatan');
    setText('totalBantuan', totalBantuan);
    setText('sekaliBantuan', sekali);
    setText('multiBantuan', multi);
  }

  function aggregateKecamatan(rows, filters){
    const perKec = {};
    rows.forEach(function(row){
      const kec = row.Kecamatan || '-';
      const contribution = matchingContribution(row, filters);
      perKec[kec] = (perKec[kec] || 0) + contribution;
    });
    return Object.entries(perKec)
      .sort(function(a,b){ return b[1] - a[1] || a[0].localeCompare(b[0]); })
      .slice(0, 7);
  }

  function aggregateJenis(rows, filters){
    const result = {'BSPS':0, 'APBD Provinsi':0, 'APBD Kabupaten':0};
    rows.forEach(function(row){
      const years = getYearList(row);
      const yearOk = filters.tahun === 'all' || years.indexOf(filters.tahun) !== -1;
      if (!yearOk) return;

      getJenisList(row).forEach(function(jenis){
        if (filters.jenis !== 'all' && jenis !== filters.jenis) return;
        if (result[jenis] !== undefined) result[jenis] += 1;
      });
    });
    return result;
  }

  function aggregateTahun(rows, filters){
    const result = {'2023':0, '2024':0, '2025':0, '2026':0};
    rows.forEach(function(row){
      const jenis = getJenisList(row);
      const jenisOk = filters.jenis === 'all' || jenis.indexOf(filters.jenis) !== -1;
      if (!jenisOk) return;

      getYearList(row).forEach(function(year){
        if (filters.tahun !== 'all' && year !== filters.tahun) return;
        if (result[year] !== undefined) result[year] += 1;
      });
    });
    return result;
  }

  function updateChart(canvasId, chartType, labels, values, labelText){
    const canvas = getEl(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    let chart = Chart.getChart(canvas);
    if (!chart) return;

    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    if (labelText) chart.data.datasets[0].label = labelText;
    chart.update();
  }

  function updateChartsFiltered(){
    const filters = getSelectedFilters();
    const rows = getFilteredRows(filters);

    const kecAgg = aggregateKecamatan(rows, filters);
    updateChart(
      'chartKecamatan',
      'bar',
      kecAgg.map(function(x){ return x[0]; }),
      kecAgg.map(function(x){ return x[1]; }),
      'Jumlah Bantuan'
    );

    const jenisAgg = aggregateJenis(rows, filters);
    const jenisLabels = ['BSPS', 'APBD Provinsi', 'APBD Kabupaten'];
    updateChart(
      'chartJenis',
      'doughnut',
      jenisLabels,
      jenisLabels.map(function(label){ return jenisAgg[label] || 0; }),
      'Jenis Bantuan'
    );

    const tahunAgg = aggregateTahun(rows, filters);
    const tahunLabels = ['2023', '2024', '2025', '2026'].filter(function(year){
      return filters.tahun === 'all' || year === filters.tahun;
    });
    updateChart(
      'chartTahun',
      'line',
      tahunLabels,
      tahunLabels.map(function(year){ return tahunAgg[year] || 0; }),
      'Jumlah Desa Penerima'
    );
  }

  function getFeatureRow(feature){
    return feature && feature.properties ? feature.properties : null;
  }

  function mutedStyle(){
    return {
      opacity: 0.10,
      color: 'rgba(100,100,100,0.12)',
      weight: 0.6,
      fill: true,
      fillOpacity: 0.04,
      fillColor: 'rgba(255,255,255,0.04)'
    };
  }

  const thematicLayerConfig = [
    {key:'Informasi Wilayah', layer:'layer_InformasiWilayah_12', style:'style_InformasiWilayah_12_0'},
    {key:'APBD Kabupaten', layer:'layer_APBDKabupaten_11', style:'style_APBDKabupaten_11_0'},
    {key:'APBD Provinsi', layer:'layer_APBDProvinsi_10', style:'style_APBDProvinsi_10_0'},
    {key:'BSPS', layer:'layer_BSPS_9', style:'style_BSPS_9_0'},
    {key:'2023', layer:'layer_Tahun2023_8', style:'style_Tahun2023_8_0'},
    {key:'2024', layer:'layer_Tahun2024_7', style:'style_Tahun2024_7_0'},
    {key:'2025', layer:'layer_Tahun2025_6', style:'style_Tahun2025_6_0'},
    {key:'2026', layer:'layer_Tahun2026_5', style:'style_Tahun2026_5_0'}
  ];

  function getGlobalLayer(name){
    return typeof window[name] !== 'undefined' ? window[name] : null;
  }

  function resetQgisLayerStyle(config){
    const layerGroup = getGlobalLayer(config.layer);
    const styleFn = typeof window[config.style] === 'function' ? window[config.style] : null;
    if (!layerGroup || !layerGroup.eachLayer) return;

    layerGroup.eachLayer(function(layer){
      if (styleFn && layer.setStyle) layer.setStyle(styleFn(layer.feature));
      layer.options.interactive = true;
      if (layer._path) layer._path.style.pointerEvents = 'auto';
    });
  }

  function removeAllThematicLayers(){
    if (typeof window.map === 'undefined') return;
    thematicLayerConfig.forEach(function(config){
      const layer = getGlobalLayer(config.layer);
      if (layer && window.map.hasLayer(layer)) window.map.removeLayer(layer);
    });
  }

  function getSelectedMapLayerConfigs(filters){
    // Filter peta menggunakan layer asli hasil qgis2web agar warna dan legend
    // sama dengan pilihan pada menu Switch Layer.
    if (filters.tahun === 'all' && filters.jenis === 'all') {
      return thematicLayerConfig.filter(function(config){ return config.key === 'Informasi Wilayah'; });
    }

    const selected = [];
    if (filters.tahun !== 'all') {
      selected.push(filters.tahun);
    }
    if (filters.jenis !== 'all') {
      selected.push(filters.jenis);
    }

    return thematicLayerConfig.filter(function(config){
      return selected.indexOf(config.key) !== -1;
    });
  }

  function applyMapFilter(){
    const filters = getSelectedFilters();
    if (typeof window.map === 'undefined') return;

    thematicLayerConfig.forEach(resetQgisLayerStyle);
    removeAllThematicLayers();

    getSelectedMapLayerConfigs(filters).forEach(function(config){
      const layer = getGlobalLayer(config.layer);
      if (layer && !window.map.hasLayer(layer)) window.map.addLayer(layer);
    });

    window.map.closePopup();
    setTimeout(function(){ window.map.invalidateSize(); }, 80);
  }

  function updateInfoPanel(){
    const filters = getSelectedFilters();
    const rows = getFilteredRows(filters);
    const info = getEl('infoDesa');
    const title = getEl('infoTitle');
    if (!info || !title) return;

    title.textContent = 'Informasi Filter';
    const tahunText = filters.tahun === 'all' ? 'Semua Tahun' : filters.tahun;
    const jenisText = filters.jenis === 'all' ? 'Semua Jenis Bantuan' : filters.jenis;
    const desa = new Set(rows.map(function(r){ return r.Desa_Kelurahan; }).filter(Boolean)).size;
    const kec = new Set(rows.map(function(r){ return r.Kecamatan; }).filter(Boolean)).size;

    info.innerHTML =
      '<div class="info-row"><span>Tahun Bantuan</span><strong>' + tahunText + '</strong></div>' +
      '<div class="info-row"><span>Jenis Bantuan</span><strong>' + jenisText + '</strong></div>' +
      '<div class="info-row"><span>Desa Sesuai Filter</span><strong>' + desa + ' Desa</strong></div>' +
      '<div class="info-row"><span>Kecamatan Sesuai Filter</span><strong>' + kec + ' Kecamatan</strong></div>';
  }

  function syncLayerControlCheckboxes(){
    // Batas Kecamatan tidak dipaksa aktif saat filter berjalan.
    // Jika pengguna mematikannya dari Switch Layer, pilihan tersebut tetap dihormati,
    // sehingga layer desa hasil filter bisa diklik langsung untuk melihat informasi desa.
    return;
  }

  function applyDashboardFilter(){
    syncLayerControlCheckboxes();
    updateStatisticFiltered();
    updateChartsFiltered();
    applyMapFilter();
    updateInfoPanel();
  }

  function resetDashboardFiltered(){
    const tahun = getEl('filterTahun');
    const jenis = getEl('filterJenis');
    if (tahun) tahun.value = 'all';
    if (jenis) jenis.value = 'all';
    applyDashboardFilter();
  }

  function attachListeners(){
    const tahun = getEl('filterTahun');
    const jenis = getEl('filterJenis');
    if (tahun) tahun.addEventListener('change', applyDashboardFilter);
    if (jenis) jenis.addEventListener('change', applyDashboardFilter);
  }

  window.updateStatistic = updateStatisticFiltered;
  window.updateCharts = updateChartsFiltered;
  window.applyDashboardFilter = applyDashboardFilter;
  window.resetDashboard = resetDashboardFiltered;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachListeners);
  } else {
    attachListeners();
  }

  window.addEventListener('load', function(){
    setTimeout(applyDashboardFilter, 1700);
  });
})();
