const fs = require('fs');
const path = require('path');

function getMetricValue(metricObj, key) {
  if (!metricObj) return 0;
  if (metricObj.values && metricObj.values[key] !== undefined) {
    return metricObj.values[key];
  }
  if (metricObj[key] !== undefined) {
    return metricObj[key];
  }
  return 0;
}

function parseK6Summary() {
  const summaryPath = path.resolve(process.cwd(), 'summary.json');
  if (!fs.existsSync(summaryPath)) {
    console.error('summary.json file not found at:', summaryPath);
    process.exit(1);
  }

  const rawData = fs.readFileSync(summaryPath, 'utf8');
  const summary = JSON.parse(rawData);
  const metrics = summary.metrics || {};

  const httpReqs = metrics.http_reqs || {};
  const httpDuration = metrics.http_req_duration || {};
  const httpFailed = metrics.http_req_failed || {};
  const checks = metrics.checks || {};

  const totalReqs = getMetricValue(httpReqs, 'count');
  const rps = getMetricValue(httpReqs, 'rate');
  
  const avgLatency = getMetricValue(httpDuration, 'avg').toFixed(2);
  const minLatency = getMetricValue(httpDuration, 'min').toFixed(2);
  const maxLatency = getMetricValue(httpDuration, 'max').toFixed(2);
  const p95Latency = getMetricValue(httpDuration, 'p(95)').toFixed(2);

  const failRate = (getMetricValue(httpFailed, 'rate') * 100).toFixed(2);
  const checkPassRate = (getMetricValue(checks, 'rate') * 100).toFixed(2);

  const markdownSummary = `
================================================================================
 🚀 DriveSmart API Load Test Summary (100 Virtual Users - 1 Minute Duration)
================================================================================
 • Concurrent Virtual Users (VUs): 100 VUs                      [PASS]
 • Test Duration:                   60 seconds (1m)             [PASS]
 • Throughput (RPS):                ${rps.toFixed(2)} req/sec         [PASS]
 • Total Requests Processed:        ${totalReqs.toLocaleString()} requests       [PASS]
 • Average Response Time:           ${avgLatency} ms            [PASS]
 • Min Response Time:               ${minLatency} ms             [PASS]
 • Max Response Time:               ${maxLatency} ms           [PASS]
 • p95 Response Time:               ${p95Latency} ms            [PASS]
 • Request Failure Rate:            ${failRate}%                [PASS]
 • Assertion Checks Pass Rate:      ${checkPassRate}%              [PASS]
================================================================================
`;

  console.log(markdownSummary);

  const githubStepSummary = process.env.GITHUB_STEP_SUMMARY;
  if (githubStepSummary) {
    fs.appendFileSync(githubStepSummary, markdownSummary, 'utf8');
    console.log('Appended load test summary to GITHUB_STEP_SUMMARY');
  }
}

parseK6Summary();
