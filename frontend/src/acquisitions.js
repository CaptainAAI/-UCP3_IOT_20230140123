import Chart from 'chart.js/auto';

(async function () {
  try {
    const response = await fetch('http://localhost:3000/api/sensor-data');
    if (!response.ok) throw new Error("Network response was not ok");

    const jsonData = await response.json();
    if (!jsonData.success) throw new Error("Failed to load data: " + jsonData.message);

    const data = jsonData.data;
    const status = document.getElementById('status');
    const chartGrid = document.getElementById('chartGrid');

    if (!Array.isArray(data) || data.length === 0) {
      status.innerHTML = '<div class="error">Belum ada data di tabel sensor_data.</div>';
      return;
    }

    const groupedBySensor = data.reduce((accumulator, item) => {
      const sensorId = String(item.sensor_id);
      if (!accumulator[sensorId]) {
        accumulator[sensorId] = [];
      }
      accumulator[sensorId].push(item);
      return accumulator;
    }, {});

    const sensorIds = Object.keys(groupedBySensor).sort();
    const sensorsToCompare = sensorIds.slice(0, 2);

    if (sensorsToCompare.length < 2) {
      status.innerHTML = '<div class="error">Minimal perlu 2 sensor_id untuk perbandingan.</div>';
      return;
    }

    status.textContent = `Membandingkan sensor ${sensorsToCompare.join(' vs ')} pada temperature, humidity, dan pressure.`;
    chartGrid.innerHTML = '';

    const metrics = [
      {
        key: 'temperature',
        label: 'Temperature',
        colors: ['rgba(220, 38, 38, 1)', 'rgba(37, 99, 235, 1)'],
      },
      {
        key: 'humidity',
        label: 'Humidity',
        colors: ['rgba(5, 150, 105, 1)', 'rgba(245, 158, 11, 1)'],
      },
      {
        key: 'pressure',
        label: 'Pressure',
        colors: ['rgba(139, 92, 246, 1)', 'rgba(249, 115, 22, 1)'],
      },
    ];

    const sortedSensorData = sensorsToCompare.map((sensorId) => {
      const items = groupedBySensor[sensorId]
        .slice()
        .sort((left, right) => new Date(left.timestamp) - new Date(right.timestamp));

      return { sensorId, items };
    });

    metrics.forEach((metric) => {
      const card = document.createElement('article');
      card.className = 'chart-card';

      const title = document.createElement('h2');
      title.textContent = `${metric.label} Comparison`;

      const description = document.createElement('p');
      description.textContent = `Perbandingan nilai ${metric.label.toLowerCase()} untuk sensor ${sensorsToCompare.join(' dan ')}`;

      const chartWrap = document.createElement('div');
      chartWrap.className = 'chart-wrap';

      const canvas = document.createElement('canvas');
      chartWrap.appendChild(canvas);

      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(chartWrap);
      chartGrid.appendChild(card);

      const allLabels = Array.from(
        new Set(
          sortedSensorData.flatMap(({ items }) => items.map((item) => item.timestamp))
        )
      ).sort((left, right) => new Date(left) - new Date(right));

      new Chart(canvas, {
        type: 'line',
        data: {
          labels: allLabels,
          datasets: sortedSensorData.map(({ sensorId, items }, index) => {
            const pointMap = new Map(items.map((item) => [item.timestamp, item[metric.key]]));
            const borderColor = metric.colors[index % metric.colors.length];

            return {
              label: `Sensor ${sensorId}`,
              data: allLabels.map((timestamp) => pointMap.has(timestamp) ? pointMap.get(timestamp) : null),
              borderColor,
              backgroundColor: borderColor,
              tension: 0.35,
              spanGaps: true,
              pointRadius: 3,
              pointHoverRadius: 5,
              borderWidth: 2,
              order: index,
            };
          })
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            y: {
              beginAtZero: false,
            },
          },
        }
      });
    });
  } catch (err) {
    console.error("Error:", err);
    const status = document.getElementById('status');
    if (status) {
      status.innerHTML = '<div class="error">Gagal memuat data sensor. Pastikan backend dan MySQL berjalan.</div>';
    }
  }
})();