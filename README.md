# BLAPI - the BotListAPI

[![dependencies Status](https://david-dm.org/T0TProduction/BLAPI/status.svg)](https://david-dm.org/T0TProduction/BLAPI) [![install size](https://packagephobia.now.sh/badge?p=blapi)](https://packagephobia.now.sh/result?p=blapi) [![jsDelivr](https://data.jsdelivr.com/v1/package/npm/blapi/badge?style=rounded)](https://www.jsdelivr.com/package/npm/blapi)

[![nodei](https://nodei.co/npm/blapi.png)](https://nodei.co/npm/blapi/)

BLAPI is a package to handle posting your discord bot stats to botlists.

It's intended to be used with discord.js, though you can also manually post your stats.

BLAPI fully supports sharding when using the [BotBlock API](https://botblock.org/api/docs#count), but not **yet** when manually posting.

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
// `postWithoutBotBlock` is a optional boolean if you don't want to use the BotBlock API
// Consider adding it if you get ratelimited from bot lists
blapi.manualPost(guildCount, botID, apiKeys, postWithoutBotBlock);
```

### Turn on extended logging

```js
// Use this to get more detailed logging when using botBlock
// Errors will always be logged
blapi.setLogging(True);
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
  "bots.ondiscord.xyz" : "aönvtauitnzvaltnvalztnbvaeöituvnautzcn",
  "discordbots.org" : "nzovrzunwlvuaznwtvclawnztvcaöznhtcauhntclagbt"
}
```

## Lists

This is a list of all supported discord bot lists:

| Website            |
|--------------------|
| botsfordiscord.com |
| bots.ondiscord.xyz |
| boatlist.ml        |
| botlist.space      |
| discordboats.club  |
| discordbots.org    |
| discordbot.world   |
| bots.discord.pw    |
| discordbots.group  |
| discord.services   |

These lists are supported by being hardcoded, but BLAPI will always look for new additions on startup via the [BotBlock API](https://botblock.org/api/docs#lists)

If at any time you find other bot lists have added an API to post your guildcount, let us know on this repo or by contacting T0TProduction#0001 on Discord.

## Credit

All the people who helped making BLAPI are listed in [AUTHORS](https://github.com/T0TProduction/BLAPI/blob/master/AUTHORS)

By default we use the [BotBlock API](https://botblock.org/api/docs#count) to post all the data
