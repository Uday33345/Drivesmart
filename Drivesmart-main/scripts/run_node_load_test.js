const http = require('http');
const fs = require('fs');
const path = require('path');

const TARGET_URL = process.env.BACKEND_URL || 'http://localhost:5173';
const VUS = 100;
const DURATION_SEC = 60;

async function runLoadTest() {
  console.log(`=======================================================`);
  console.log(` 🚀 Starting DriveSmart Load Test (Node.js Engine)`);
  console.log(` 👥 Virtual Users: ${VUS} | ⏱️ Duration: ${DURATION_SEC}s`);
  console.log(` 🌐 Target URL: ${TARGET_URL}`);
  console.log(`=======================================================\n`);

  const latencies = [];
  let totalRequests = 0;
  let failedRequests = 0;
  const startTime = Date.now();
  const endTime = startTime + (DURATION_SEC * 1000);

  function makeRequest() {
    return new Promise((resolve) => {
      const reqStart = Date.now();
      http.get(TARGET_URL, (res) => {
        const duration = Date.now() - reqStart;
        latencies.push(duration);
        totalRequests++;
        if (res.statusCode >= 400) failedRequests++;
        res.resume();
        resolve();
      }).on('error', (err) => {
        const duration = Date.now() - reqStart;
        latencies.push(duration);
        totalRequests++;
        failedRequests++;
        resolve();
      });
    });
  }

  // Worker loop simulating Virtual User
  async function vuWorker() {
    while (Date.now() < endTime) {
      await makeRequest();
      await new Promise(r => setTimeout(r, 50)); // tiny delay
    }
  }

  // Launch 100 VUs concurrently
  const workers = [];
  for (let i = 0; i < VUS; i++) {
    workers.push(vuWorker());
  }

  await Promise.all(workers);

  const totalTimeSec = (Date.now() - startTime) / 1000;
  latencies.sort((a, b) => a - b);

  const avgLatency = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
  const minLatency = latencies[0] || 0;
  const maxLatency = latencies[latencies.length - 1] || 0;
  const p95Index = Math.floor(latencies.length * 0.95);
  const p95Latency = latencies[p95Index] || maxLatency;
  const rps = totalRequests / totalTimeSec;

  const summaryData = {
    metrics: {
      http_reqs: { count: totalRequests, rate: rps },
      http_req_duration: {
        avg: avgLatency,
        min: minLatency,
        max: maxLatency,
        'p(95)': p95Latency
      },
      http_req_failed: { rate: failedRequests / (totalRequests || 1) },
      checks: { rate: (totalRequests - failedRequests) / (totalRequests || 1) }
    }
  };

  fs.writeFileSync(path.resolve(process.cwd(), 'summary.json'), JSON.stringify(summaryData, null, 2));
  console.log(`Load test completed cleanly! Summary saved to summary.json\n`);

  // Parse and display summary
  require('./parseK6Summary');
}

runLoadTest().catch(console.error);
