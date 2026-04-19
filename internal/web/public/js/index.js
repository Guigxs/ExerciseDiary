var id = 0;
var today = null;

function formatDate(dateStr, fmt) {
    if (!dateStr || dateStr.length < 10) return dateStr;
    const y = dateStr.substring(0, 4);
    const m = dateStr.substring(5, 7);
    const d = dateStr.substring(8, 10);
    if (fmt === 'MM/DD/YYYY') return m + '/' + d + '/' + y;
    if (fmt === 'YYYY-MM-DD') return y + '-' + m + '-' + d;
    return d + '/' + m + '/' + y; // default DD/MM/YYYY
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
    for (let s = 0; s < numSets; s++) {
        id = id + 1;
        let wId = 'w' + id;
        let rId = 'r' + id;
        let html_to_insert = `<div class="ex-card" id="${id}">
  <div class="ex-card-header">
    <span class="ex-card-title">${name}</span>
    <input name="name" type="hidden" value="${name}">
    <button class="btn btn-del-row" type="button" title="Remove" onclick="delExercise(${id})">
      <i class="bi bi-x-lg"></i>
    </button>
  </div>
  <div class="ex-card-controls">
    <div class="ex-card-field">
      <span class="ex-card-label">Weight</span>
      <div class="d-flex align-items-center gap-1">
        <button class="btn btn-adj" type="button" onclick="stepValue('${wId}',-1)">−</button>
        <input id="${wId}" name="weight" type="number" step="any" min="0" class="form-control form-control-sm text-center adj-val" value="${weight}">
        <button class="btn btn-adj" type="button" onclick="stepValue('${wId}',1)">+</button>
      </div>
    </div>
    <div class="ex-card-field">
      <span class="ex-card-label">Reps</span>
      <div class="d-flex align-items-center gap-1">
        <button class="btn btn-adj" type="button" onclick="stepValue('${rId}',-1)">−</button>
        <input id="${rId}" name="reps" type="number" step="1" min="0" class="form-control form-control-sm text-center adj-val" value="${reps}">
        <button class="btn btn-adj" type="button" onclick="stepValue('${rId}',1)">+</button>
      </div>
    </div>
  </div>
</div>`;
        document.getElementById('todayEx').insertAdjacentHTML('beforeend', html_to_insert);
    }
};

function setFormContent(sets, date) {
    window.sessionStorage.setItem("today", date);
    document.getElementById('todayEx').innerHTML = "";
    document.getElementById("formDate").value = date;
    document.getElementById("realDate").value = date;

    if (sets) {
        let len = sets.length;
        for (let i = 0 ; i < len; i++) {
            if (sets[i].Date == date) {
                addExercise(sets[i].Name, sets[i].Weight, sets[i].Reps, 1);
            }
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

function goToToday(sets) {
    let t = new Date().toJSON().slice(0, 10);
    setFormContent(sets, t);
};

function delExercise(exID) {
    document.getElementById(exID).remove();
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
        let len = exs.length;
        for (let i = 0 ; i < len; i++) {
            if (exs[i].Group == gr) {
                addExercise(exs[i].Name, exs[i].Weight, exs[i].Reps, exs[i].Sets);
            }
        }
    }
}