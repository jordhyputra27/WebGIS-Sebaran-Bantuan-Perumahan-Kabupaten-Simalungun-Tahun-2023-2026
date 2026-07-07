document.addEventListener("DOMContentLoaded", function () {
    const dashboard = document.getElementById("dashboard");
    const stat = document.getElementById("stat-card-container");
    const topBtn = document.getElementById("toggleTopPanel");
    const bottom = document.getElementById("dashboard-bottom");
    const bottomBtn = document.getElementById("toggleBottomPanel");

    function refreshMapSize() {
        if (window.map && typeof window.map.invalidateSize === "function") {
            setTimeout(function () { window.map.invalidateSize(); }, 80);
            setTimeout(function () { window.map.invalidateSize(); }, 320);
        }
        if (typeof window.Chart !== "undefined") {
            ["chartKecamatan", "chartJenis", "chartTahun"].forEach(function (id) {
                var canvas = document.getElementById(id);
                var chart = canvas ? Chart.getChart(canvas) : null;
                if (!chart) return;
                setTimeout(function () { chart.resize(); chart.update("none"); }, 120);
                setTimeout(function () { chart.resize(); chart.update("none"); }, 420);
            });
        }
    }

    if (topBtn && stat && dashboard) {
        topBtn.addEventListener("click", function (e) {
            e.preventDefault();
            const isClosed = stat.classList.toggle("stat-hidden");
            dashboard.classList.toggle("top-panel-collapsed", isClosed);
            topBtn.innerHTML = isClosed ? "▼" : "▲";
            topBtn.setAttribute("aria-label", isClosed ? "Buka panel statistik" : "Tutup panel statistik");
            refreshMapSize();
        });
    }

    if (bottomBtn && bottom && dashboard) {
        bottomBtn.addEventListener("click", function (e) {
            e.preventDefault();
            const isClosed = bottom.classList.toggle("bottom-hidden");
            dashboard.classList.toggle("bottom-panel-collapsed", isClosed);
            bottomBtn.innerHTML = isClosed ? "▲" : "▼";
            bottomBtn.setAttribute("aria-label", isClosed ? "Buka panel grafik" : "Tutup panel grafik");
            refreshMapSize();
        });
    }
});
