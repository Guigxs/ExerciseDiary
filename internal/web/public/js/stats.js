var sChart = null;
var sOffset = 0;

function formatDate(dateStr, fmt) {
    if (!dateStr || dateStr.length < 10) return dateStr;
    const y = dateStr.substring(0, 4);
    const m = dateStr.substring(5, 7);
    const d = dateStr.substring(8, 10);
    if (fmt === 'MM/DD/YYYY') return m + '/' + d + '/' + y;
    if (fmt === 'YYYY-MM-DD') return y + '-' + m + '-' + d;
    return d + '/' + m + '/' + y; // default DD/MM/YYYY
}

function addSet(i, date, reps, weight, dateFmt) {
    let displayDate = formatDate(date, dateFmt);
    html_code = '<tr><td style="opacity: 45%;">'+i+'.</td><td>'+displayDate+'</td><td>'+reps+'</td><td>'+weight+'</td></tr>';
    document.getElementById('stats-table').insertAdjacentHTML('beforeend', html_code);
};

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

function setStatsPage(sets, hcolor, off, step, dateFmt) {
    let start = 0, end = 0;
    let exs = []; 

    let ex = document.getElementById("ex-value").value;
    for (let i = 0; i < sets.length; i++) {
        if (sets[i].Name === ex) {
            exs.push(sets[i]);
        }
    };

    sOffset = sOffset + off;
    if (sOffset<0) {
        sOffset = 0;
    };

    let arrayLength = exs.length;
    let move = step + sOffset*step;

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
    };

    document.getElementById('stats-table').innerHTML = "";

    let pageSlice = exs.slice(start, end);

    // Table: individual rows
    for (let i = 0; i < pageSlice.length; i++) {
        addSet(start + i + 1, pageSlice[i].Date, pageSlice[i].Reps, pageSlice[i].Weight, dateFmt);
    };

    // Charts: aggregate same-day entries
    let agg = aggregateByDate(pageSlice);
    let chartDates = agg.dates.map(function(d) { return formatDate(d, dateFmt); });

    statsChart('stats-reps', chartDates, agg.reps, hcolor, true);
    weightChart('stats-weight', chartDates, agg.ws, hcolor, true);
};

function statsChart(id, dates, ws, wcolor, xticks) {
    
    const ctx = document.getElementById(id);

    if (sChart){
      sChart.clear();
      sChart.destroy();
    };

    sChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [{
          data: ws,
          borderColor: wcolor,
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          x: {
            ticks: {
                display: xticks
            },
          },
          y: {
            beginAtZero: false
          }
        },
        plugins:{
            legend: {
             display: false
            }
        }
      }
    });
};