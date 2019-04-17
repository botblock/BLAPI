# BLAPI - the BotListAPI

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ebd62ee46cd84964975ae65ac9462fa1)](https://app.codacy.com/app/T0TProduction/BLAPI?utm_source=github.com&utm_medium=referral&utm_content=T0TProduction/BLAPI&utm_campaign=Badge_Grade_Dashboard)
[![DeepScan grade](https://deepscan.io/api/teams/2846/projects/4250/branches/34642/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=2846&pid=4250&bid=34642)
[![dependencies Status](https://david-dm.org/T0TProduction/BLAPI/status.svg)](https://david-dm.org/T0TProduction/BLAPI) [![npm downloads](https://img.shields.io/npm/dt/blapi.svg)](https://nodei.co/npm/blapi/) [![install size](https://packagephobia.now.sh/badge?p=blapi)](https://packagephobia.now.sh/result?p=blapi) [![jsDelivr](https://data.jsdelivr.com/v1/package/npm/blapi/badge?style=rounded)](https://www.jsdelivr.com/package/npm/blapi)

[![nodei](https://nodei.co/npm/blapi.png)](https://nodei.co/npm/blapi/)

BLAPI is a package to handle posting your discord bot stats to botlists.

It's intended to be used with discord.js, though you can also manually post your stats.

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

### With discord.js

```js
const Discord = require("discord.js");
const blapi = require("blapi");

let bot = new Discord.Client({ autoReconnect: true });

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

### Turn on extended logging

```js
// Use this to get more detailed logging when posting
// Errors will always be logged
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

These lists are supported by being hardcoded, but BLAPI will look for new additions on startup via the [BotBlock API](https://botblock.org/api/docs#lists). BLAPI will try to update its API data daily.

| Domain                 | Supports guild count| Supports sharding | Is not extremely annoying |
|------------------------|---------------------|-------------------|---------------------------|
| botlist.space          | ✔️                 | ✔️                | ✔️                       |
| botsfordiscord.com     | ✔️                 | ❌                | ✔️                       |
| bots.ondiscord.xyz     | ✔️                 | ❌                | ✔️                       |
| discord.boats          | ✔️                 | ❌                | ✔️                       |
| discordapps.dev        | ✔️                 | ❌                | ✔️                       |
| discordboats.club      | ✔️                 | ❌                | ✔️                       |
| discordbotindex.com    | ✔️                 | ❌                | ✔️                       |
| discordbots.org        | ✔️                 | ✔️                | ❌                       |
| discordbotlist.com     | ✔️                 | ✔️                | ✔️                       |
| discordbotlist.xyz     | ✔️                 | ❌                | ✔️                       |
| discordbotreviews.xyz  | ✔️                 | ❌                | ✔️                       |
| discordbot.world       | ✔️                 | ✔️                | ✔️                       |
| discord.bots.gg        | ✔️                 | ✔️                | ✔️                       |
| discordbotslist.com    | ✔️                 | ❌                | ✔️                       |
| discordbots.group      | ✔️                 | ❌                | ✔️                       |
| discord.services       | ✔️                 | ❌                | ✔️                       |
| discordsbestbots.xyz   | ✔️                 | ✔️                | ✔️                       |
| discordsextremelist.tk | ✔️                 | ❌                | ✔️                       |
| divinediscordbots.com  | ✔️                 | ✔️                | ✔️                       |


Discordbots.org is still supported even though they blacklisted our API fetching service of choice, BotBlock.


If at any time you find other bot lists have added an API to post your guildcount, let us know on this repo or by contacting T0TProduction#0001 on Discord.

## Credit

All the people who helped making BLAPI are listed in [AUTHORS](https://github.com/T0TProduction/BLAPI/blob/master/AUTHORS)

By default we use the [BotBlock API](https://botblock.org/api/docs#count) to fetch and post.
