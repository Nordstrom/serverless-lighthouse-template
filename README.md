# Serverless CDP

> Chrome Debugging Protocol interface that helps to instrument Chrome (or any other suitable implementation) by providing a simple abstraction of commands and notifications using a straightforward JavaScript API.

## Deployment

Install the required packages.
```sh
npm install --global serverless
npm install --save @serverless-chrome/lambda
npm install --save chrome-remote-interface
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
serverless deploy function -f CDP
```

## Usage

You can easily add a target to be audited and manipulate the performance data.

### Setting up a test.

By adding in some [serverless](https://serverless.com/framework/docs/providers/aws/events/schedule/) configs you can create a desktop script target.

```yaml
functions:
  CDP:
    handler: handler.chromeDevProto
    events:
      - schedule:
          name: cdp-script-trigger
          description: 'Run a CDP script on the input target.'
          rate: rate(5 minutes)
          enabled: true
          input:
            target: https://www.example.com/
```

This will create a desktop audit of "https://www.example.com/" and will run every 5 minutes.


## Docs

- [serverless](https://github.com/serverless/serverless)
- [chrome-remote-interface](https://github.com/cyrus-and/chrome-remote-interface)
- [serverless-chrome](https://github.com/adieuadieu/serverless-chrome)
