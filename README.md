# Serverless Lighthouse

> Using headless Chrome and Lambda, Serverless Lighthouse analyzes web apps and web pages, collecting modern performance metrics and insights on developer best practices.

## Deployment

Install the required packages.
```sh
npm install --global serverless
npm install --save lighthouse
npm install --save serverless-plugin-chrome
npm install --save-dev serverless-attach-managed-policy
```
Once the packages are installed you must set your AWS credentials by defining `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environmental variables, or using an AWS profile. You can read more about this on the [Serverless Credentials Guide](https://serverless.com/framework/docs/providers/aws/guide/credentials/).

In short, either:

```bash
export AWS_PROFILE=<your-profile-name>
```

or

```bash
export AWS_ACCESS_KEY_ID=<your-key-here>
export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>
```

Then, to deploy the service and all of its functions:

```bash
serverless deploy -v
```

Use this to quickly upload and overwrite your AWS Lambda code on AWS, allowing you to develop faster.

```bash
serverless deploy function -f auditor
```

## Usage

You can easily add a target to be audited and manipulate the performance data.

### Setting up a test.

By adding in some [serverless](https://serverless.com/framework/docs/providers/aws/events/schedule/) configs you can create a desktop or mobile audit target.

```yaml
functions:
  auditor:
    handler: handler.audit
    events:
      - schedule:
          name: lighthouse-audit-trigger
          description: 'Audit the input target.'
          rate: rate(5 minutes)
          enabled: true
          input:
            target: https://www.example.com/
            mobile: false
```

This will create a desktop audit of "https://www.example.com/" and will run every 5 minutes.

### Manipulate Performance Data

The output of the audit is a json blob that is anywhere from 30mb to 80mb in size. This can be saved off to a file and loaded in the [Lighthouse Viewer](https://googlechrome.github.io/lighthouse/viewer/) at a later time.

You can use [Lighthouse programmatically](https://github.com/GoogleChrome/lighthouse/blob/master/docs/readme.md#using-programmatically) and manipulate the json blob

```javascript
lighthouse(url, flags).then(function(results) {
  console.log('timestamp: ' + results.generatedTime)
  console.log('target: ' + results.url)
  console.log('total-time: ' + results.timing.total)
  console.log('score: ' + results.score)
})

```

## Docs

- [serverless](https://github.com/serverless/serverless)
- [lighthouse](https://github.com/GoogleChrome/lighthouse)
- [serverless-chrome](https://github.com/adieuadieu/serverless-chrome)
