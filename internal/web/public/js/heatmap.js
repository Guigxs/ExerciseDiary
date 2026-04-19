
function lowerData(heat) {
    var ldata = [];
    let arrayLength = heat.length;
    for (let i = 0 ; i < arrayLength; i++) {
        let val = heat[i];
        ldata.push({
            x: val.X,
            y: val.Y,
            d: val.D,
            v: val.V
        });
    }
    // console.log('LDATA =', ldata);
    return ldata;
};

function makeChart(heat, hcolor, sets) {
    let ldata = lowerData(heat);
    var ctx = document.getElementById('matrix-chart').getContext('2d');
    window.myMatrix = new Chart(ctx, {
        type: 'matrix',
        data: {
            datasets: [{
                label: 'Heatmap',
                data: ldata,
                backgroundColor(context) {
                    const value = context.dataset.data[context.dataIndex].v;
                    const alpha = value / 7;
                    return Chart.helpers.color(hcolor).alpha(alpha).rgbString();
                },
                borderColor(context) {
                    const value = context.dataset.data[context.dataIndex].v;
                    const alpha = 0.5;
                    return Chart.helpers.color('grey').alpha(alpha).rgbString();
                },
                borderWidth: 1,
                hoverBackgroundColor: 'lightgrey',
                hoverBorderColor: 'grey',
                width({ chart }) {
                    const w = chart.chartArea ? chart.chartArea.width  : chart.width;
                    const h = chart.chartArea ? chart.chartArea.height : chart.height;
                    return Math.max(8, Math.min(Math.floor(w / 54) - 1, Math.floor(h / 7) - 1));
                },
                height({ chart }) {
                    const w = chart.chartArea ? chart.chartArea.width  : chart.width;
                    const h = chart.chartArea ? chart.chartArea.height : chart.height;
                    return Math.max(8, Math.min(Math.floor(w / 54) - 1, Math.floor(h / 7) - 1));
                }
            }]
        },
        options: {
            onClick: (e) => {
                const res = window.myMatrix.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                let clickDate = res[0].element.$context.raw.d;
                // console.log('CLICK DATE =', clickDate);
                
                setFormContent(sets, clickDate); // index.js
            },
            plugins: {
                legend: false,
                tooltip: {
                    callbacks: {
                        title() {
                            return '';
                        },
                        label(context) {
                            const v = context.dataset.data[context.dataIndex];
                            return [v.v, v.d];
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'category',
                    offset: true,
                    reverse: false,
                    ticks: {
                        display: false
                    },
                    border: {
                        display: false
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    type: 'category',
                    labels: ['Mo', 'Tu', 'We','Th','Fr','Sa','Su'],
                    reverse: false,
                    ticks: {
                        stepSize: 1,
                        display: true
                    },
                    border: {
                        display: false
                    },
                    grid: {
                        display: false
                    }
                },
            }
        }
    });
};    