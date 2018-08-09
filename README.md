  [![dependencies Status](https://david-dm.org/T0TProduction/BLAPI/status.svg)](https://david-dm.org/T0TProduction/BLAPI) [![install size](https://packagephobia.now.sh/badge?p=blapi@0.2.4)](https://packagephobia.now.sh/result?p=blapi) [![](https://data.jsdelivr.com/v1/package/npm/blapi/badge?style=rounded)](https://www.jsdelivr.com/package/npm/blapi)

<a href="https://nodei.co/npm/blapi/"><img src="https://nodei.co/npm/blapi.png"></a>
# BLAPI - the BotListAPI
BLAPI is a package to handle posting your discord bot stats to botlists.<br>
It's intended to be used with discord.js, though you can also manually post your stats.<br>
# Installation
Install via npm (recommended) <br>
```npm i blapi``` 
# Usage
The list of all supported bot lists and their respective names for the apiKeys object are listed [below](https://github.com/T0TProduction/BLAPI#Lists)
<br><br>
### With discord.js:

```js
const Discord = require("discord.js");
const blapi = require("blapi");

let bot = new Discord.Client({ autoReconnect: true });

//post to the APIs every 60 minutes; you can leave out the repeat delay as it defaults to 30
blapi.handle(bot, apiKeys, 60); 
```
### Manually, without need of discord libs:

```js
blapi.manualPost(guildCount, botID, apiKeys );
```
### apiKeys
The JSON object which includes all the API keys should look like this:
```js
{
"bot list domain": "API key for that bot list",
etc.
}
```
an example would be:
```js
{
"bots.ondiscord.xyz" : "aönvtauitnzvaltnvalztnbvaeöituvnautzcn",
"discordbots.org" : "nzovrzunwlvuaznwtvclawnztvcaöznhtcauhntclagbt"
}
```

# Lists
This is a list of all supported discord bot lists: <br>
-    "botsfordiscord.com"
-    "botlist.space"
-    "bots.ondiscord.xyz"
-    "discordboats.club"
-    "discordbots.org"
-    "discordbot.world"
-    "bots.discord.pw"
-    "discordbots.group"
-    "discord.services"
-    "listcord.com"
<br>
If at any time you find other bot lists have added an API to post your guildcount, let us know on this repo or by contacting T0TProduction#0001 on Discord.

# Credit
All the people who helped making BLAPI are listed in [AUTHORS](https://github.com/T0TProduction/BLAPI/blob/master/AUTHORS)
