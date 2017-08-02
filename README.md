# Eyeson Zendesk App

Video conferencing app providing online meeting rooms in your Zendesk tickets.

## Setup

```sh
bundle install
cp manifest.json{.example,}
zat
```

## Config

Swap out the `api_key` param in `manifest.json` for a real API key.


## Zendesk App Tools (ZAT)

The Zendesk App Tools (ZAT) are a collection of local development tools that
simplify building and deploying Zendesk apps. The tools lets you create, test,
validate, and package your apps.

https://developer.zendesk.com/apps/docs/apps-v2/getting_started#zendesk-app-tools

To test your changes on Zendesk run `zat create` or `zat update` to push the app
up to your Zendesk account as a private app (shortcut for uploading zip manually).

To package the app for release run `zat package` and the latest build will be
added to `./tmp`.
