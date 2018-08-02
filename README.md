  [![dependencies Status](https://david-dm.org/T0TProduction/BLAPI/status.svg)](https://david-dm.org/T0TProduction/BLAPI) [![install size](https://packagephobia.now.sh/badge?p=blapi@0.2.4)](https://packagephobia.now.sh/result?p=blapi@0.2.4) [![](https://data.jsdelivr.com/v1/package/npm/blapi/badge?style=rounded)](https://www.jsdelivr.com/package/npm/blapi)

<a href="https://nodei.co/npm/blapi/"><img src="https://nodei.co/npm/blapi.png"></a>
# BLAPI - the BotListAPI
BLAPI is a package to handle posting your discord bot stats to botlists.<br>
It's intended to be used with discord.js, though you can also manually post your stats.<br>
The function automatically turns off use of the metalist API if your post rate would be more than their ratelimit allows.<br>
You can also manually set it to not use their API in the manual post, if you desire so for any reason.
# Installation
`npm i blapi` to install BLAPI <br>
<br>
The list of all supported bot lists and their respective names for the apiKeys object are listed [here](https://themetalist.org/api/docs#count)
<br><br>
Use it with discord.js:

```js
const Discord = require("discord.js");
const blapi = require("blapi");

let bot = new Discord.Client({ autoReconnect: true });

//post to the APIs every 60 minutes; you can leave out the repeat delay as it defaults to 30
blapi.handle(bot, {"bots.ondiscord.xyz" : "thisIsSomeApiKey", "discordbots.org" : "thisIsSomeOtherApiKey"}, 60); 
```
<br>
Or manually, which works without discord.js :

```js
//noMetaList can be added as "True" if you don't want to forward your keys to 3rd party APIs or need to ignore their ratelimit
blapi.manualPost(guildCount, botID, {"bots.ondiscord.xyz" : "thisIsSomeApiKey", "discordbots.org" : "thisIsSomeOtherApiKey"}, noMetaList);
```


# Credit
By default BLAPI uses the [metalist API](https://themetalist.org/api/docs) to distribute the data to every botlist.<br>
They also provide the list of botlist APIs and their respective format.
