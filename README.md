# BLAPI - the BotListAPI
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![npm downloads](https://img.shields.io/npm/dt/blapi.svg)](https://nodei.co/npm/blapi/) [![install size](https://packagephobia.now.sh/badge?p=blapi)](https://packagephobia.now.sh/result?p=blapi)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/blapi/badge?style=rounded)](https://www.jsdelivr.com/package/npm/blapi)

[![nodei](https://nodei.co/npm/blapi.png)](https://nodei.co/npm/blapi/)

BLAPI is a package to handle posting your discord bot stats to botlists. Now typed and ready to be used in your Typescript powered bots!

It's intended to be used with discord.js v12 or v13, though you can also manually post your stats.

BLAPI fully supports external and discord.js internal sharding with and without the use of the [BotBlock API](https://botblock.org/api/docs#count).

## Installation

### NPM (recommended)

```bash
npm i blapi
```

### Yarn

```bash
yarn add blapi
```

## Usage

The list of all supported bot lists and their respective names for the apiKeys object are listed [below](https://github.com/T0TProduction/BLAPI#lists)

### Import the lib via ES6 or commonJS modules

```js
// ES6
import * as blapi from "blapi";
// or
import { handle } from "blapi"; // Just the functions you want to use
// or commonJS
const blapi = require("blapi");
```

### With discord.js (version 12.x or 13.x)

```js
import Discord from "discord.js";

const bot = new Discord.Client();

// Post to the APIs every 60 minutes; you can leave out the repeat delay as it defaults to 30
// If the interval is below 3 minutes BLAPI will not use the BotBlock API because of ratelimits
blapi.handle(bot, apiKeys, 60);
```

### Manually, without need of Discord libraries

```js
// If you want to post sharddata you can add the optional parameters
// shardID and shardCount should both be integers
// shardsArray should be an integer array containing the guildcounts of the respective shards
blapi.manualPost(guildCount, botID, apiKeys[, shardID, shardCount[, shardsArray]]);
```


### Logging Options
```js
// Use this to get more detailed logging when posting
// Errors will always be logged
blapi.setLogging({
  extended: true
});
```

```js
// If you have your own logger that you want to use pass it to BLAPI like this:
// Important: The logger needs to include the following methods: log.info(), log.warn() and log.error()
blapi.setLogging({
  extended: true,
  logger: yourCustomLogger
})
```
```js
// If you only want to pass your custom logger but dont want extended logging to be enabled:
blapi.setLogging({
  logger: yourCustomLogger
})
```
### Turn on extended logging
![](https://img.shields.io/badge/deprecated-Do%20not%20use%20this%20anymore-orange)

```js
// Following method to activate extended logging still works, but is deprecated.
// Switch to using above syntax, as this will be removed at some point.
blapi.setLogging(true);
```

### Turn off the use of the BotBlock API

```js
// Use this to turn off BotBlock usage
// By default it is set to true
blapi.setBotblock(false);
```

### apiKeys

The JSON object which includes all the API keys should look like this:

```json
{
  "bot list domain": "API key for that bot list",
  "bot list domain": "API key for that bot list"
}
```

an example would be:

```json
{
  "bots.ondiscord.xyz": "dsag38_auth_token_fda6gs",
  "discordbots.group": "qos56a_auth_token_gfd8g6"
}
```

## Lists

BLAPI automatically supports posting to all lists that are [listed on botblock](https://botblock.org/api/docs#lists). For the rare case that their API is down, BLAPI has an [integrated fallback list](https://github.com/botblock/BLAPI/blob/master/src/fallbackListData.ts). This list is kept somewhat up to date inside the repository, but once BLAPI is running in your bot, it will update the internal fallback on a daily basis.

Supported legacy Ids are supported in a similar fashion. BLAPI supports all [legacy IDs listed on botblock](https://botblock.org/api/docs#legacy-ids). The fallback legacy IDs can be found [here](https://github.com/botblock/BLAPI/blob/master/src/legacyIdsFallbackData.ts), and they are also internally updated on a daily basis once you have BLAPI up and running.

If at any time you find other bot lists have added an API to post your guildcount, let us know on this repo or by contacting T0TProduction#0001 on Discord. In general, if a list is not listed on BotBlock, the best way to get it added is to directly [join the BotBlock Discord server](https://botblock.org/discord) and request it there.

## Development

To work on BLAPI, install the node version specified in [.nvmrc](https://github.com/botblock/BLAPI/blob/master/.nvmrc).
If you are using nvm on a unix based system, this can be done quickly by using `nvm use` and if the version is not installed, `nvm install`.
Install all the dependencies following the package-lock via `npm ci`.

This repo enforces eslint rules which are included in the installation.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="http://diluz.io"><img src="https://avatars.githubusercontent.com/u/18548570?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sebastian Di Luzio</b></sub></a><br /><a href="https://github.com/botblock/BLAPI/commits?author=T0TProduction" title="Code">💻</a> <a href="#maintenance-T0TProduction" title="Maintenance">🚧</a> <a href="https://github.com/botblock/BLAPI/commits?author=T0TProduction" title="Documentation">📖</a></td>
      <td align="center"><a href="https://advaith.io"><img src="https://avatars.githubusercontent.com/u/11778454?v=4?s=100" width="100px;" alt=""/><br /><sub><b>advaith</b></sub></a><br /><a href="https://github.com/botblock/BLAPI/commits?author=advaith1" title="Documentation">📖</a> <a href="https://github.com/botblock/BLAPI/issues?q=author%3Aadvaith1" title="Bug reports">🐛</a></td>
      <td align="center"><a href="https://mattcowley.co.uk/"><img src="https://avatars.githubusercontent.com/u/12371363?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Matt Cowley</b></sub></a><br /><a href="https://github.com/botblock/BLAPI/commits?author=MattIPv4" title="Documentation">📖</a> <a href="https://github.com/botblock/BLAPI/commits?author=MattIPv4" title="Code">💻</a></td>
      <td align="center"><a href="https://jonahsnider.com"><img src="https://avatars.githubusercontent.com/u/7608555?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jonah Snider</b></sub></a><br /><a href="https://github.com/botblock/BLAPI/commits?author=jonahsnider" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!