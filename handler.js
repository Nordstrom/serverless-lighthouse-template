// https://github.com/cyrus-and/chrome-remote-interface
const CDP = require('chrome-remote-interface')
// https://github.com/adieuadieu/serverless-chrome
const launchChrome = require('@serverless-chrome/lambda')
// https://github.com/dbader/node-datadog-metrics
const metrics = require('datadog-metrics')

module.export.chromeDevProto = function(event, context, callback) {
  const url = 'https://www.google.com/'

  // Initialize datadog metrics collection
  // ref: https://github.com/dbader/node-datadog-metrics#initialization
  metrics.init({
    host: 'host',
    prefix: 'prefix.',
    flushIntervalSeconds: 0,
    apiKey: process.env.DATADOG_API_KEY,
    appKey: process.env.DATADOG_APP_KEY,
    defaultTags: [
      key: "value",
      target: `${url}`
    ]
  })

  // Set flags for launching Chrome
  // https://peter.sh/experiments/chromium-command-line-switches/
  const chromeFlags = {
    flags: [
      "--window-size=1680x1050",
      "--hide-scrollbars",
      "--ignore-certificate-errors",
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--homedir=/tmp/randompath0",
      "--single-process",
      "--data-path=/tmp/randompath1",
      "--disk-cache-dir=/tmp/randompath2",
      "--remote-debugging-port=9222"
    ]
  }

  launchChrome(chromeFlags)
    .then(chrome => {
      CDP(client => {

        // Deconstruct the client
        const {Network, Page, Runtime} = client

        // An event that triggers once Page emits a 'load' event.
        // https://chromedevtools.github.io/devtools-protocol/tot/Page#event-loadEventFired
        Page.loadEventFired(() => {
          const pageMetrics = Runtime.evaluate({
                expression: "JSON.parse(JSON.stringify(window.performance.timing))",
                returnByValue: true
              })
              .then(function(pageMetrics) {
                // console.log(pageMetrics.result.value)
                // Parse performance blob and send metrics to Datadog
                // https://github.com/dbader/node-datadog-metrics#gauges
                const performance = pageMetrics.result.value
                metrics.increment('chrome.launched')
                metrics.gauge("redirect", (performance.redirectEnd - performance.redirectStart))
                metrics.gauge("appCache", (performance.domainLookupStart - performance.fetchStart))
                metrics.gauge("dns", (performance.domainLookupEnd - performance.domainLookupStart))
                metrics.gauge("tcp", (performance.connectEnd - performance.connectStart))
                metrics.gauge("request", (performance.responseStart - performance.requestStart))
                metrics.gauge("response", (performance.responseEnd - performance.responseStart))
                metrics.gauge("processing", (performance.domComplete - performance.domLoading))
                metrics.gauge("domInteractive", (performance.domInteractive - performance.navigationStart))
                metrics.gauge("domComplete", (performance.domComplete - performance.navigationStart))
                metrics.gauge("onLoad", (performance.loadEventEnd - performance.loadEventStart))
                metrics.gauge("total", (performance.loadEventEnd - performance.navigationStart))
              })

          client.close()
        })

        Promise.all([
          Network.enable(),
          Runtime.enable(),
          Page.enable()
        ])
        .then(() => {
          // Navigate to the given url
          // https://chromedevtools.github.io/devtools-protocol/tot/Page#method-navigate
          return Page.navigate({url: url})
        })
        .catch(err => {
          console.error(err)
          client.close()
        })

      })
      .on('error', (err) => {
        console.error(err)
      })
    })
    .then(callback)
}
