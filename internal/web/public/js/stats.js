var sChart = null;
var gChartReps = null;
var gChartWeight = null;
var sOffset = 0;

// Global state set by initStats
var gSets = null, gHcolor = '', gDateFmt = 'DD/MM/YYYY', gStep = 10, gExs = null;

const CHART_COLORS = [
    '#4dc9f6', '#f67019', '#f53794', '#537bc4',
    '#acc236', '#166a8f', '#00a950', '#8549ba', '#e8c61a'
];

function initStats(sets, hcolor, step, dateFmt, exs) {
    gSets = sets; gHcolor = hcolor; gStep = step; gDateFmt = dateFmt; gExs = exs;
    setStatsPage(sets, hcolor, 0, step, dateFmt);
}

function formatDate(dateStr, fmt) {
    if (!dateStr || dateStr.length < 10) return dateStr;
    const y = dateStr.substring(0, 4);
    const m = dateStr.substring(5, 7);
    const d = dateStr.substring(8, 10);
    if (fmt === 'MM/DD/YYYY') return m + '/' + d + '/' + y;
    if (fmt === 'YYYY-MM-DD') return y + '-' + m + '-' + d;
    return d + '/' + m + '/' + y;
}

function addSet(i, date, reps, weight, dateFmt) {
    let displayDate = formatDate(date, dateFmt);
    let html_code = '<tr><td style="opacity: 45%;">'+i+'.</td><td>'+displayDate+'</td><td>'+reps+'</td><td>'+weight+'</td></tr>';
    document.getElementById('stats-table').insertAdjacentHTML('beforeend', html_code);
}

// Aggregate entries by date: sum reps, average weight
function aggregateByDate(slice) {
    let map = {};
    let order = [];
    for (let i = 0; i < slice.length; i++) {
        let date = slice[i].Date;
        let reps = slice[i].Reps;
        let w = parseFloat(slice[i].Weight);
        if (!map[date]) {
            map[date] = { reps: 0, weightSum: 0, count: 0 };
            order.push(date);
        }
        map[date].reps += reps;
        map[date].weightSum += w;
        map[date].count += 1;
    }
    let dates = [], reps = [], ws = [];
    for (let i = 0; i < order.length; i++) {
        let d = order[i];
        dates.push(d);
        reps.push(map[d].reps);
        ws.push(parseFloat((map[d].weightSum / map[d].count).toFixed(4)));
    }
    return { dates, reps, ws };
}

function destroyGroupCharts() {
    if (gChartReps)   { gChartReps.destroy();   gChartReps = null; }
    if (gChartWeight) { gChartWeight.destroy(); gChartWeight = null; }
}

// ── Exercise mode ────────────────────────────────────────────────────────────

function setStatsPage(sets, hcolor, off, step, dateFmt) {
    destroyGroupCharts();

    let start = 0, end = 0;
    let exs = [];

    let ex = document.getElementById("ex-value").value;
    for (let i = 0; i < sets.length; i++) {
        if (sets[i].Name === ex) exs.push(sets[i]);
    }

    sOffset = sOffset + off;
    if (sOffset < 0) sOffset = 0;

    let arrayLength = exs.length;
    let move = step + sOffset * step;

    if (arrayLength > move) {
        start = arrayLength - move;
        end = start + step;
    } else {
        sOffset = sOffset - 1;
        if (arrayLength > step) {
            end = step;
        } else {
            end = arrayLength;
        }
    }

    document.getElementById('stats-table').innerHTML = "";

    let pageSlice = exs.slice(start, end);

    for (let i = 0; i < pageSlice.length; i++) {
        addSet(start + i + 1, pageSlice[i].Date, pageSlice[i].Reps, pageSlice[i].Weight, dateFmt);
    }

    let agg = aggregateByDate(pageSlice);
    let chartDates = agg.dates.map(function(d) { return formatDate(d, dateFmt); });

    statsChart('stats-reps', chartDates, agg.reps, hcolor, true);
    weightChart('stats-weight', chartDates, agg.ws, hcolor, true);
}

function statsChart(id, dates, ws, wcolor, xticks) {
    const ctx = document.getElementById(id);
    if (sChart) { sChart.clear(); sChart.destroy(); }
    sChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{ data: ws, borderColor: wcolor, borderWidth: 1 }]
        },
        options: {
            scales: {
                x: { ticks: { display: xticks } },
                y: { beginAtZero: false }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// ── Mode toggle ──────────────────────────────────────────────────────────────

function setStatsMode(mode) {
    let exWrap = document.getElementById('sel-ex-wrap');
    let grWrap = document.getElementById('sel-gr-wrap');
    let exBtn  = document.getElementById('mode-ex-btn');
    let grBtn  = document.getElementById('mode-gr-btn');
    let tableWrap = document.getElementById('stats-table-wrap');
    let paging    = document.getElementById('stats-pagination');

    if (mode === 'exercise') {
        exWrap.style.display = '';
        grWrap.style.display = 'none';
        exBtn.className = 'btn btn-primary btn-sm';
        grBtn.className = 'btn btn-outline-primary btn-sm';
        tableWrap.style.display = '';
        paging.style.display = '';
        sOffset = 0;
        setStatsPage(gSets, gHcolor, 0, gStep, gDateFmt);
    } else {
        exWrap.style.display = 'none';
        grWrap.style.display = '';
        grBtn.className = 'btn btn-primary btn-sm';
        exBtn.className = 'btn btn-outline-primary btn-sm';
        tableWrap.style.display = 'none';
        paging.style.display = 'none';
        renderGroupStats();
    }
}

// ── Group mode ───────────────────────────────────────────────────────────────

function renderGroupStats() {
    if (!gSets || !gExs) return;

    let grName = document.getElementById('gr-value').value;

    // Find exercises belonging to this group
    let exNames = [];
    for (let i = 0; i < gExs.length; i++) {
        if (gExs[i].Group === grName) exNames.push(gExs[i].Name);
    }

    // Collect sets per exercise, aggregate by date
    let allDates = new Set();
    let exData = {};

    for (let i = 0; i < exNames.length; i++) {
        let exName = exNames[i];
        exData[exName] = {};
        for (let j = 0; j < gSets.length; j++) {
            if (gSets[j].Name === exName) {
                let d = gSets[j].Date;
                allDates.add(d);
                if (!exData[exName][d]) exData[exName][d] = { reps: 0, weightSum: 0, count: 0 };
                exData[exName][d].reps += gSets[j].Reps;
                exData[exName][d].weightSum += parseFloat(gSets[j].Weight);
                exData[exName][d].count += 1;
            }
        }
    }

    let sortedDates = Array.from(allDates).sort();
    let chartLabels = sortedDates.map(function(d) { return formatDate(d, gDateFmt); });

    let repsDatasets = [];
    let weightDatasets = [];

    for (let i = 0; i < exNames.length; i++) {
        let exName = exNames[i];
        let color = CHART_COLORS[i % CHART_COLORS.length];
        let repsArr = [], weightArr = [];
        for (let j = 0; j < sortedDates.length; j++) {
            let d = sortedDates[j];
            if (exData[exName][d]) {
                repsArr.push(exData[exName][d].reps);
                weightArr.push(parseFloat((exData[exName][d].weightSum / exData[exName][d].count).toFixed(4)));
            } else {
                repsArr.push(null);
                weightArr.push(null);
            }
        }
        repsDatasets.push({
            label: exName, data: repsArr,
            backgroundColor: color + '99', borderColor: color, borderWidth: 1
        });
        weightDatasets.push({
            label: exName, data: weightArr,
            borderColor: color, borderWidth: 2, tension: 0.1, fill: false
        });
    }

    // Destroy exercise-mode charts before drawing group charts
    if (sChart)  { sChart.destroy();  sChart = null; }
    if (wChart)  { wChart.destroy();  wChart = null; }
    destroyGroupCharts();

    let showLegend = exNames.length > 1;

    gChartReps = new Chart(document.getElementById('stats-reps'), {
        type: 'bar',
        data: { labels: chartLabels, datasets: repsDatasets },
        options: {
            scales: { x: { ticks: { display: true } }, y: { beginAtZero: false } },
            plugins: { legend: { display: showLegend } }
        }
    });

    gChartWeight = new Chart(document.getElementById('stats-weight'), {
        type: 'line',
        data: { labels: chartLabels, datasets: weightDatasets },
        options: {
            scales: { x: { ticks: { display: true } }, y: { beginAtZero: false } },
            plugins: { legend: { display: showLegend } }
        }
    });
}
