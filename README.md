[![Build Status](https://travis-ci.org/toolness/portfolio.svg?branch=master)](https://travis-ci.org/toolness/portfolio)

This is Atul's portfolio.

## Quick Start

```
cp .env.sample .env
yarn
yarn start
```

Then visit http://localhost:8080/.

## Deploying

Run `yarn build`, then copy the `dist` directory to a web server.

`yarn s3` can be used to deploy directly to S3; just make sure
the `AWS_ACCESS_KEY` and `AWS_SECRET_KEY` environment variables are set
in your `.env` file or environment.
