(function () {
    var MOBILE_QUERY = '(max-width: 600px)';
    var mobileMql = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : { matches: false };
    var mobileInitialized = false;

    function isMobile() {
        return !!(mobileMql && mobileMql.matches);
    }

    function refreshCharts() {
        if (typeof window.Chart === 'undefined') return;
        ['chartKecamatan', 'chartJenis', 'chartTahun'].forEach(function (id) {
            var canvas = document.getElementById(id);
            var chart = canvas ? Chart.getChart(canvas) : null;
            if (!chart) return;

            chart.options.responsive = true;
            chart.options.maintainAspectRatio = false;
            chart.options.layout = chart.options.layout || {};
            chart.options.layout.padding = { top: 4, right: 8, bottom: 4, left: 4 };
            chart.options.plugins = chart.options.plugins || {};
            chart.options.plugins.legend = chart.options.plugins.legend || {};

            if (id === 'chartKecamatan') {
                chart.options.plugins.legend.display = false;
                chart.options.scales = chart.options.scales || {};
                chart.options.scales.x = chart.options.scales.x || {};
                chart.options.scales.y = chart.options.scales.y || {};
                chart.options.scales.x.ticks = chart.options.scales.x.ticks || {};
                chart.options.scales.y.ticks = chart.options.scales.y.ticks || {};
                chart.options.scales.x.ticks.font = { size: 10 };
                chart.options.scales.y.ticks.font = { size: 10 };
                chart.options.scales.y.ticks.autoSkip = false;
            }

            if (id === 'chartJenis') {
                chart.options.plugins.legend.display = true;
                chart.options.plugins.legend.position = 'top';
                chart.options.plugins.legend.labels = chart.options.plugins.legend.labels || {};
                chart.options.plugins.legend.labels.boxWidth = 16;
                chart.options.plugins.legend.labels.boxHeight = 8;
                chart.options.plugins.legend.labels.padding = 8;
                chart.options.plugins.legend.labels.font = { size: 11 };
            }

            if (id === 'chartTahun') {
                chart.options.plugins.legend.display = true;
                chart.options.plugins.legend.position = 'top';
                chart.options.plugins.legend.labels = chart.options.plugins.legend.labels || {};
                chart.options.plugins.legend.labels.boxWidth = 18;
                chart.options.plugins.legend.labels.font = { size: 11 };
                chart.options.scales = chart.options.scales || {};
                chart.options.scales.x = chart.options.scales.x || {};
                chart.options.scales.y = chart.options.scales.y || {};
                chart.options.scales.x.ticks = chart.options.scales.x.ticks || {};
                chart.options.scales.y.ticks = chart.options.scales.y.ticks || {};
                chart.options.scales.x.ticks.font = { size: 10 };
                chart.options.scales.y.ticks.font = { size: 10 };
            }

            chart.resize();
            chart.update('none');
        });
    }

    function refreshMapSize() {
        if (window.map && typeof window.map.invalidateSize === 'function') {
            setTimeout(function () { window.map.invalidateSize(); }, 120);
            setTimeout(function () { window.map.invalidateSize(); }, 420);
        }
        setTimeout(refreshCharts, 160);
        setTimeout(refreshCharts, 520);
    }

    function setMobileViewportHeight() {
        var vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', vh + 'px');
        refreshMapSize();
    }

    function setPanelState(panelName, closed) {
        var dashboard = document.getElementById('dashboard');
        if (!dashboard) return;

        if (panelName === 'top') {
            var stat = document.getElementById('stat-card-container');
            var topBtn = document.getElementById('toggleTopPanel');
            if (stat) stat.classList.toggle('stat-hidden', closed);
            dashboard.classList.toggle('top-panel-collapsed', closed);
            if (topBtn) {
                topBtn.innerHTML = closed ? '▼' : '▲';
                topBtn.setAttribute('aria-label', closed ? 'Buka panel statistik' : 'Tutup panel statistik');
            }
        }

        if (panelName === 'bottom') {
            var bottom = document.getElementById('dashboard-bottom');
            var bottomBtn = document.getElementById('toggleBottomPanel');
            if (bottom) bottom.classList.toggle('bottom-hidden', closed);
            dashboard.classList.toggle('bottom-panel-collapsed', closed);
            if (bottomBtn) {
                bottomBtn.innerHTML = closed ? '▲' : '▼';
                bottomBtn.setAttribute('aria-label', closed ? 'Buka panel grafik' : 'Tutup panel grafik');
            }
        }
        refreshMapSize();
    }

    function setFilterState(closed) {
        var dashboard = document.getElementById('dashboard');
        var btn = document.getElementById('toggleFilterPanel');
        if (!dashboard) return;

        dashboard.classList.toggle('filter-panel-collapsed', closed);
        dashboard.classList.toggle('filter-panel-expanded', !closed);

        if (btn) {
            btn.innerHTML = closed ? '☰ Filter Data' : '× Tutup Filter';
            btn.setAttribute('aria-label', closed ? 'Buka filter data' : 'Tutup filter data');
            btn.setAttribute('aria-expanded', closed ? 'false' : 'true');
        }
        refreshMapSize();
    }

    function initMobileDashboard() {
        var dashboard = document.getElementById('dashboard');
        if (!dashboard) return;

        if (isMobile()) {
            dashboard.classList.add('mobile-layout');
            if (!mobileInitialized) {
                setPanelState('top', true);
                setPanelState('bottom', true);
                setFilterState(true);
                mobileInitialized = true;
            }
        } else {
            dashboard.classList.remove('mobile-layout', 'filter-panel-collapsed', 'filter-panel-expanded', 'mobile-pseudo-fullscreen');
            var filterBtn = document.getElementById('toggleFilterPanel');
            if (filterBtn) {
                filterBtn.innerHTML = '☰ Filter Data';
                filterBtn.setAttribute('aria-expanded', 'false');
            }
        }
        setMobileViewportHeight();
    }


    function bindPanelRefreshForMobile() {
        ['toggleBottomPanel', 'toggleTopPanel', 'toggleFilterPanel'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', function () {
                setTimeout(refreshCharts, 180);
                setTimeout(refreshCharts, 520);
                setTimeout(setMobileViewportHeight, 260);
            }, { passive: true });
        });
    }

    function bindFilterToggle() {
        var btn = document.getElementById('toggleFilterPanel');
        var dashboard = document.getElementById('dashboard');
        if (!btn || !dashboard) return;

        btn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (!isMobile()) return;
            var shouldClose = dashboard.classList.contains('filter-panel-expanded');
            setFilterState(shouldClose);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        bindFilterToggle();
        bindPanelRefreshForMobile();
        initMobileDashboard();
        setMobileViewportHeight();
        setTimeout(refreshCharts, 180);
        setTimeout(refreshCharts, 900);
    });

    if (mobileMql && typeof mobileMql.addEventListener === 'function') {
        mobileMql.addEventListener('change', initMobileDashboard);
    } else if (mobileMql && typeof mobileMql.addListener === 'function') {
        mobileMql.addListener(initMobileDashboard);
    }

    window.addEventListener('resize', function () {
        setMobileViewportHeight();
        initMobileDashboard();
    }, { passive: true });

    window.addEventListener('orientationchange', function () {
        setTimeout(function () {
            setMobileViewportHeight();
            initMobileDashboard();
        }, 250);
        setTimeout(function () {
            setMobileViewportHeight();
            initMobileDashboard();
        }, 700);
    }, { passive: true });

    setMobileViewportHeight();
})();


/* FINAL REVISION 11 - mobile chart tuning and empty qgis2web control cleanup */
(function () {
    var MOBILE_QUERY = '(max-width: 600px)';
    function isMobile(){ return window.matchMedia && window.matchMedia(MOBILE_QUERY).matches; }

    function hideEmptyQgisInfoControl(){
        document.querySelectorAll('.leaflet-control.info').forEach(function(el){
            if (!el.textContent || !el.textContent.trim()) {
                el.style.display = 'none';
                el.style.width = '0';
                el.style.height = '0';
                el.style.padding = '0';
                el.style.margin = '0';
            }
        });
    }

    function tuneMobileCharts(){
        if (!isMobile() || typeof window.Chart === 'undefined') return;
        ['chartKecamatan','chartJenis','chartTahun'].forEach(function(id){
            var canvas = document.getElementById(id);
            var chart = canvas ? Chart.getChart(canvas) : null;
            if (!chart) return;
            chart.options.responsive = true;
            chart.options.maintainAspectRatio = false;
            chart.options.layout = chart.options.layout || {};
            chart.options.layout.padding = {top: 2, right: 4, bottom: 6, left: 4};
            chart.options.plugins = chart.options.plugins || {};
            chart.options.plugins.legend = chart.options.plugins.legend || {};
            chart.options.plugins.legend.position = 'top';
            chart.options.plugins.legend.labels = chart.options.plugins.legend.labels || {};
            chart.options.plugins.legend.labels.boxWidth = 18;
            chart.options.plugins.legend.labels.boxHeight = 9;
            chart.options.plugins.legend.labels.padding = 8;
            chart.options.plugins.legend.labels.font = {size: 11};

            if (id === 'chartJenis') {
                chart.options.cutout = '58%';
                chart.options.radius = '78%';
                chart.options.plugins.legend.display = true;
                chart.options.plugins.legend.maxHeight = 74;
            }
            if (id === 'chartKecamatan') {
                chart.options.plugins.legend.display = false;
                chart.options.scales = chart.options.scales || {};
                chart.options.scales.x = chart.options.scales.x || {};
                chart.options.scales.y = chart.options.scales.y || {};
                chart.options.scales.x.ticks = chart.options.scales.x.ticks || {};
                chart.options.scales.y.ticks = chart.options.scales.y.ticks || {};
                chart.options.scales.x.ticks.font = {size: 10};
                chart.options.scales.y.ticks.font = {size: 10};
                chart.options.scales.y.ticks.autoSkip = false;
            }
            if (id === 'chartTahun') {
                chart.options.plugins.legend.display = true;
                chart.options.plugins.legend.maxHeight = 48;
                chart.options.scales = chart.options.scales || {};
                chart.options.scales.x = chart.options.scales.x || {};
                chart.options.scales.y = chart.options.scales.y || {};
                chart.options.scales.x.ticks = chart.options.scales.x.ticks || {};
                chart.options.scales.y.ticks = chart.options.scales.y.ticks || {};
                chart.options.scales.x.ticks.font = {size: 10};
                chart.options.scales.y.ticks.font = {size: 10};
            }
            chart.resize();
            chart.update('none');
        });
    }

    function run(){
        hideEmptyQgisInfoControl();
        tuneMobileCharts();
        if (window.map && typeof window.map.invalidateSize === 'function') {
            setTimeout(function(){ window.map.invalidateSize(); }, 80);
        }
    }

    window.addEventListener('load', function(){ setTimeout(run, 300); setTimeout(run, 1200); });
    window.addEventListener('resize', function(){ setTimeout(run, 160); }, {passive:true});
    window.addEventListener('orientationchange', function(){ setTimeout(run, 400); }, {passive:true});
    document.addEventListener('click', function(e){
        var id = e && e.target && e.target.id;
        if (id === 'toggleTopPanel' || id === 'toggleBottomPanel' || id === 'toggleFilterPanel') {
            setTimeout(run, 180);
            setTimeout(run, 650);
        }
    }, true);
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(run, 200); });
})();
