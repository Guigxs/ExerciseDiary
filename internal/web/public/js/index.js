var id = 0;
var today = null;
var gExs = null;

// Consistent group colour palette
const GROUP_COLORS = [
    '#4dc9f6', '#f67019', '#f53794', '#537bc4',
    '#acc236', '#166a8f', '#00a950', '#8549ba'
];

// Build ordered list of unique groups from gExs
function groupOrder() {
    let seen = [];
    if (!gExs) return seen;
    for (let i = 0; i < gExs.length; i++) {
        let g = gExs[i].Group;
        if (g && !seen.includes(g)) seen.push(g);
    }
    return seen;
}

function getGroupColor(name) {
    if (!gExs) return null;
    let grName = '';
    for (let i = 0; i < gExs.length; i++) {
        if (gExs[i].Name === name) { grName = gExs[i].Group; break; }
    }
    if (!grName) return null;
    let order = groupOrder();
    let idx = order.indexOf(grName);
    return idx >= 0 ? GROUP_COLORS[idx % GROUP_COLORS.length] : null;
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

function stepValue(inputId, delta) {
    let el = document.getElementById(inputId);
    let val = parseFloat(el.value) || 0;
    let step = parseFloat(el.step) || 1;
    let newVal = Math.max(0, parseFloat((val + delta * step).toFixed(4)));
    el.value = newVal;
}

function addExercise(name, weight, reps, sets) {
    let numSets = parseInt(sets) || 1;
    let color = getGroupColor(name);
    let borderStyle = color ? 'border-left: 3px solid ' + color + ';' : '';
    for (let s = 0; s < numSets; s++) {
        id = id + 1;
        let wId = 'w' + id;
        let rId = 'r' + id;
        let html_to_insert = '<div class="ex-card" id="' + id + '" style="' + borderStyle + '">'
          + '<div class="ex-card-header">'
          + '<span class="ex-card-title">' + name + '</span>'
          + '<input name="name" type="hidden" value="' + name + '">'
          + '<button class="btn btn-del-row" type="button" title="Remove" onclick="delExercise(' + id + ')">'
          + '<i class="bi bi-x-lg"></i></button></div>'
          + '<div class="ex-card-controls">'
          + '<div class="ex-card-field"><span class="ex-card-label">Weight</span>'
          + '<div class="d-flex align-items-center gap-1">'
          + '<button class="btn btn-adj" type="button" onclick="stepValue(\'' + wId + '\',-1)">−</button>'
          + '<input id="' + wId + '" name="weight" type="number" step="any" min="0" class="form-control form-control-sm text-center adj-val" value="' + weight + '">'
          + '<button class="btn btn-adj" type="button" onclick="stepValue(\'' + wId + '\',1)">+</button>'
          + '</div></div>'
          + '<div class="ex-card-field"><span class="ex-card-label">Reps</span>'
          + '<div class="d-flex align-items-center gap-1">'
          + '<button class="btn btn-adj" type="button" onclick="stepValue(\'' + rId + '\',-1)">−</button>'
          + '<input id="' + rId + '" name="reps" type="number" step="1" min="0" class="form-control form-control-sm text-center adj-val" value="' + reps + '">'
          + '<button class="btn btn-adj" type="button" onclick="stepValue(\'' + rId + '\',1)">+</button>'
          + '</div></div></div></div>';
        document.getElementById('todayEx').insertAdjacentHTML('beforeend', html_to_insert);
    }
};

function setFormContent(sets, date) {
    window.sessionStorage.setItem("today", date);
    document.getElementById('todayEx').innerHTML = "";
    document.getElementById("formDate").value = date;
    document.getElementById("realDate").value = date;

    if (!sets) return;

    // Build name->group map
    let nameToGroup = {};
    let grOrder = groupOrder();
    if (gExs) {
        for (let i = 0; i < gExs.length; i++) {
            nameToGroup[gExs[i].Name] = gExs[i].Group;
        }
    }

    // Collect and group day's exercises
    let byGroup = {};
    let renderOrder = [];
    for (let i = 0; i < sets.length; i++) {
        if (sets[i].Date == date) {
            let gr = nameToGroup[sets[i].Name] || '';
            if (!byGroup[gr]) { byGroup[gr] = []; renderOrder.push(gr); }
            byGroup[gr].push(sets[i]);
        }
    }

    if (renderOrder.length === 0) return;

    let showHeaders = renderOrder.length > 1 || (renderOrder.length === 1 && renderOrder[0] !== '');

    for (let gi = 0; gi < renderOrder.length; gi++) {
        let gr = renderOrder[gi];
        if (showHeaders && gr) {
            let idx = grOrder.indexOf(gr);
            let color = idx >= 0 ? GROUP_COLORS[idx % GROUP_COLORS.length] : '#6c757d';
            document.getElementById('todayEx').insertAdjacentHTML('beforeend',
                '<div class="ex-group-header" style="border-left-color:' + color + '">' + gr + '</div>');
        }
        let grSets = byGroup[gr];
        for (let i = 0; i < grSets.length; i++) {
            addExercise(grSets[i].Name, grSets[i].Weight, grSets[i].Reps, 1);
        }
    }
};

function setFormDate(sets) {
    today = document.getElementById("realDate").value;
    if (!today) {
        today = new Date().toJSON().slice(0, 10);
    }
    setFormContent(sets, today);
};

function delExercise(exID) {
    document.getElementById(exID).remove();
};

function goToToday(sets) {
    let t = new Date().toJSON().slice(0, 10);
    setFormContent(sets, t);
};

function moveDayLeftRight(where, sets) {
    dateStr = document.getElementById("realDate").value;
    let year  = dateStr.substring(0,4);
    let month = dateStr.substring(5,7);
    let day   = dateStr.substring(8,10);
    var date  = new Date(year, month-1, day);
    date.setDate(date.getDate() + parseInt(where));
    let left = date.toLocaleDateString('en-CA');
    setFormContent(sets, left);
};

function addAllGroup(exs, gr) {
    if (exs) {
        for (let i = 0; i < exs.length; i++) {
            if (exs[i].Group == gr) {
                addExercise(exs[i].Name, exs[i].Weight, exs[i].Reps, exs[i].Sets);
            }
        }
    }
};

// Add exactly 1 set per exercise in the group (ignoring default sets count)
function addGroupOnce(exs, gr) {
    if (exs) {
        for (let i = 0; i < exs.length; i++) {
            if (exs[i].Group == gr) {
                addExercise(exs[i].Name, exs[i].Weight, exs[i].Reps, 1);
            }
        }
    }
};

// ── KPI bar ──────────────────────────────────────────────────────────────────

function initKPIs(sets) {
    if (!sets || sets.length === 0) return;

    let todayStr = new Date().toJSON().slice(0, 10);
    let dateSets = {};   // date -> set count
    let exSets   = {};   // exercise name -> total sets

    for (let i = 0; i < sets.length; i++) {
        let d = sets[i].Date;
        dateSets[d] = (dateSets[d] || 0) + 1;
        exSets[sets[i].Name] = (exSets[sets[i].Name] || 0) + 1;
    }

    // Streak: consecutive days going back from today (or yesterday if not trained today)
    let streak = 0;
    let cur = new Date();
    if (!dateSets[todayStr]) cur.setDate(cur.getDate() - 1);
    for (let i = 0; i < 3650; i++) {
        let d = cur.toJSON().slice(0, 10);
        if (dateSets[d]) { streak++; cur.setDate(cur.getDate() - 1); } else break;
    }

    // This week: training days + total sets in last 7 days
    let weekDays = 0, weekSets = 0, todaySets = dateSets[todayStr] || 0;
    for (let i = 0; i < 7; i++) {
        let d = new Date(); d.setDate(d.getDate() - i);
        let ds = d.toJSON().slice(0, 10);
        if (dateSets[ds]) { weekDays++; weekSets += dateSets[ds]; }
    }

    // Last session (relative label)
    let sortedDates = Object.keys(dateSets).sort();
    let lastDate = sortedDates[sortedDates.length - 1];
    let diffDays = Math.round((new Date(todayStr) - new Date(lastDate)) / 86400000);
    let lastLabel = diffDays === 0 ? 'Today ✓'
                  : diffDays === 1 ? 'Yesterday'
                  : diffDays + 'd ago';

    // Top exercise (most sets all-time)
    let topEx = '', topCount = 0;
    for (let ex in exSets) {
        if (exSets[ex] > topCount) { topCount = exSets[ex]; topEx = ex; }
    }

    // Render
    document.getElementById('kpi-streak').textContent   = streak + (streak >= 2 ? ' 🔥' : '');
    document.getElementById('kpi-week').textContent     = weekDays + '/7';
    document.getElementById('kpi-today').textContent    = todaySets;
    document.getElementById('kpi-last').textContent     = lastLabel;
    document.getElementById('kpi-top').textContent      = topEx || '—';
    document.getElementById('kpi-row').style.display    = '';
}

// ── Exercise search ──────────────────────────────────────────────────────────

function filterExercises(q) {
    q = q.trim().toLowerCase();
    document.querySelectorAll('.ex-item').forEach(function(item) {
        let name = (item.getAttribute('data-exname') || '').toLowerCase();
        item.style.display = (!q || name.includes(q)) ? '' : 'none';
    });
    document.querySelectorAll('.accordion-item').forEach(function(acc) {
        if (!q) {
            acc.style.display = '';
            let col = acc.querySelector('.accordion-collapse');
            let btn = acc.querySelector('.accordion-button');
            if (col) col.classList.remove('show');
            if (btn) btn.classList.add('collapsed');
        } else {
            let vis = 0;
            acc.querySelectorAll('.ex-item').forEach(function(it) {
                if (it.style.display !== 'none') vis++;
            });
            acc.style.display = vis ? '' : 'none';
            if (vis) {
                let col = acc.querySelector('.accordion-collapse');
                let btn = acc.querySelector('.accordion-button');
                if (col) col.classList.add('show');
                if (btn) btn.classList.remove('collapsed');
            }
        }
    });
}
