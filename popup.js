const productive = ["leetcode.com", "github.com", "stackoverflow.com"];
const unproductive = ["youtube.com", "facebook.com", "instagram.com"];
const list = document.getElementById("siteList");

function formatTime(ms) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

// 🟢 Load today's data
chrome.storage.local.get([getTodayKey()], (res) => {
  const todayData = res[getTodayKey()] || {};
  const entries = Object.entries(todayData).sort((a, b) => b[1] - a[1]);

  list.innerHTML = "";

  let prodMs = 0,
    unprodMs = 0,
    neutralMs = 0;

  if (entries.length === 0) {
    list.innerHTML = "<li>No activity recorded yet.</li>";
    return;
  }

  entries.forEach(([site, ms]) => {
    const li = document.createElement("li");

    const cleanSite = site.replace(/^www\./, ""); // normalize
    let category = "⚪ Neutral";

    if (productive.includes(cleanSite)) {
      prodMs += ms;
      category = "✅ Productive";
    } else if (unproductive.includes(cleanSite)) {
      unprodMs += ms;
      category = "❌ Unproductive";
    } else {
      neutralMs += ms;
    }

    li.innerHTML = `<strong>${site}</strong>: ${formatTime(ms)} - <em>${category}</em>`;
    list.appendChild(li);
  });

  // 🟠 Draw productivity pie chart
  new Chart(document.getElementById("productivityChart"), {
    type: "pie",
    data: {
      labels: ["Productive", "Unproductive", "Neutral"],
      datasets: [{
        data: [prodMs, unprodMs, neutralMs],
        backgroundColor: ["#4CAF50", "#F44336", "#9E9E9E"]
      }]
    }
  });
});

// 🔵 Last 7 Days Weekly Chart
(async () => {
  const now = new Date();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  chrome.storage.local.get(last7, (res) => {
    const labels = [];
    const prodSeries = [];
    const unprodSeries = [];

    last7.forEach((key) => {
      const dayData = res[key] || {};
      let prod = 0, unprod = 0;

      for (const [site, ms] of Object.entries(dayData)) {
        const cleanSite = site.replace(/^www\./, "");
        if (productive.includes(cleanSite)) prod += ms;
        else if (unproductive.includes(cleanSite)) unprod += ms;
      }

      labels.push(key.slice(5)); // show MM-DD
      prodSeries.push((prod / 60000).toFixed(1)); // mins
      unprodSeries.push((unprod / 60000).toFixed(1));
    });

    new Chart(document.getElementById("weeklyChart"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Productive (min)",
            data: prodSeries,
            backgroundColor: "#4CAF50"
          },
          {
            label: "Unproductive (min)",
            data: unprodSeries,
            backgroundColor: "#F44336"
          }
        ]
      }
    });
  });
})();
