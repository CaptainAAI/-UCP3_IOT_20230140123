import Chart from 'chart.js/auto';

(async function () {
  try {
    // Ubah URL ini ke endpoint Node.js (bukan localhost/api/select.php)
    const response = await fetch("http://localhost:3000/api/select");
    if (!response.ok) throw new Error("Network response was not ok");

    const jsonData = await response.json();
    if (!jsonData.success) throw new Error("Failed to load data: " + jsonData.message);

    const data = jsonData.data;

    new Chart(document.getElementById("acquisitions"), {
      type: "line",
      data: {
        labels: data.map((item, index) => index + 1),
        datasets: [
          {
            label: "Temperature",
            data: data.map(item => item.Temperature),
            borderColor: "red",
            backgroundColor: "rgba(255, 0, 0, 0.2)",
          },
          {
            label: "Humidity",
            data: data.map(item => item.Humidity),
            borderColor: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.2)",
          }
        ]
      }
    });
  } catch (err) {
    console.error("Error:", err);
  }
})();