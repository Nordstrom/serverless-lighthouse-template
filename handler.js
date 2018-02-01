// https://github.com/GoogleChrome/lighthouse
const lighthouse = require('lighthouse')
// https://github.com/dbader/node-datadog-metrics
const metrics = require('datadog-metrics')

module.exports.audit = (event, context, callback, chrome) => {

  // event = {
  //   "target": "https://shop.nordstrom.com",
  //   "mobile": false
  // }
  console.log(event)

  // Flags for launching lighhouse
  // ref: https://github.com/GoogleChrome/lighthouse/blob/HEAD/docs/configuration.md
  const flags = {
    disableDeviceEmulation: !event.mobile || true,
    disableCpuThrottling: true,
    disableNetworkThrottling: true
  }

  // Initialize datadog metrics collection
  // ref: https://github.com/dbader/node-datadog-metrics#initialization
  metrics.init({
    host: 'host',
    prefix: 'prefix.',
    flushIntervalSeconds: 0,
    apiKey: process.env.DATADOG_API_KEY,
    appKey: process.env.DATADOG_APP_KEY,
    defaultTags: [ `audit-target:${event.target}` ]
  })

  // Attach lighthouse to chrome and run an audit.
  // ref: https://github.com/GoogleChrome/lighthouse/blob/master/docs/readme.md#using-programmatically
  lighthouse(event.target, flags).then(function(results) {
    // Increment the lighthouse counter
    metrics.increment('lighthouse.invoke')

    // Get total page load time metric
    // push metric to datadog, ref: https://github.com/dbader/node-datadog-metrics#gauges
    metrics.gauge("total", results.timing.total)

    // Get the Lighthouse score for the website
    // ref: https://developers.google.com/web/tools/lighthouse/scoring
    metrics.gauge("score", results.score)

    // Parse report blob to extract performance metrics
    results.reportCategories.filter(function(v){
      return v["id"] == "performance"
    })[0].audits.filter(function(v){
      return v["group"] == "perf-metric"
    }).forEach(function(chunk){

      // Push each metric to datadog
      metrics.gauge(chunk.id, chunk.result.rawValue)

    })
    return results
  })
  .then(() => {
    // Flush metrics to Datadog
    // ref: https://github.com/dbader/node-datadog-metrics#flushing
    console.log('flushing metrics')
    return metrics.flush()
  })
  .then(() => callback())
  .catch(callback)
}
