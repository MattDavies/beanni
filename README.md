# Beanni

Your friendly Australian bean-counter, [Beanni](https://www.youtube.com/watch?v=Aey_zIE3K9E).

By [@mjhilton](https://github.com/mjhilton) and [@tathamoddie](https://github.com/tathamoddie).

Beanni helps gather financial data from all of your various providers, institutions, and banks. Having all of this cached in a local database allows you to do deeper analysis than typical online banking tools would allow, such as spend-by-merchant stats, or net-worth trends.

## Usage

Get started in minutes:

| Run | Why |
| --- | --- |
| https://nodejs.org/en/download/ | Beanni is built on Node.js |
| `mkdir beanni` <br/> `cd beanni` | Create a local folder where config and data will be stored |
| `npm install beanni --save` | Install Beanni into this folder |
| `npx beanni init` | Create an example `config.yaml` |
| Edit `config.yaml` | Add your own banking relationships |
| `npx beanni fetch` | Grab your data |
| `npx beanni explore` | Launch the analysis UI |

💡 Be careful with `npm` vs `npx` in some of those commands; they look very similar at a glance.

In future:

| Run | Why |
| --- | --- |
| `npm update beanni` | Update Beanni to the latest version |
| `npx beanni fetch` | Grab your data |
| `npx beanni explore` | Launch the analysis UI |

## Security, by design

### Execution Environment

Beanni all runs locally on your own machine, or your own hosting. There are no shared web services in play.

### Secret Storage

Secrets are kept out of configuration files entirely, by design.

Secrets are stored in your operating system's credential store (Credential Manager on Windows, or Keychain on MacOS). We use [keytar](https://www.npmjs.com/package/keytar) to do this.

### Dependency Supply Chain

Our dependency supply chain is the biggest risk. We've been careful to keep our [package.json](package.json) dependencies list short, and highly trustworthy:

| Package | Weekly Package Downloads | Known/Trusted Maintainer |
| --- | --- | --- |
| [`commander`](https://www.npmjs.com/package/commander) | >15M | |
| [`inquirer`](https://www.npmjs.com/package/inquirer) | ~10M | |
| [`js-yaml`](https://www.npmjs.com/package/js-yaml) | >10M | |
| [`keytar`](https://www.npmjs.com/package/keytar) | >20k | [Atom](https://github.com/atom/node-keytar) |
| [`lodash`](https://www.npmjs.com/package/lodash) | >15M | |
| [`puppeteer`](https://www.npmjs.com/package/puppeteer) | >500k | [Google Chrome](https://github.com/GoogleChrome/puppeteer#readme) |
| [`sqlite`](https://www.npmjs.com/package/sqlite) | >20k | |
| [`ts-node`](https://www.npmjs.com/package/ts-node) | >1M | |

It would be very visible if any of these packages, or their dependencies, were to be compromised.

You can compare this table with https://www.npmjs.com/package/beanni (NPM's view of Beanni's dependencies).

## Development

Run it locally:

1. Clone
1. `npm install`
1. One of:
    * VS Code > `Ctrl+F5`
    * `npx ts-node .\src\app.ts --help`
