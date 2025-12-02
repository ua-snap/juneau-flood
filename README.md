# Juneau Glacial Lake Outburst Flood web tool

Originally developed by @codefean and funding provided through the Alaska Climate Adaptation Science Center (AK CASC).

## Building and Launching Website

### Environment File

To build the website, we need to have a .env file containing the production MapBox token that can be found in our MapBox account for juneauflood.org. Follow the structure of .env.example for how that should be laid out.

### NVM installation of lts/iron

The website requires at least lts/iron, so install that version of Node if you haven't already.

```bash
nvm install lts/iron
```

Use the lts/iron Node in your shell:

```bash
nvm use lts/iron
```

### Install the dependencies for the site

```bash
npm install
```

### Build the static version of the site

```bash
npm run build
```

### Upload the build directory to S3 bucket

Be sure to have the AWS CLI tools installed on your system.

```bash
aws s3 cp build/ s3://juneauflood.org/ --acl public-read --recursive
```

### Invalidate the CloudFront instance for juneauflood.org

```bash
aws cloudfront create-invalidation --distribution-id E1LZJ43CT5GFMD --paths "/*"
```
