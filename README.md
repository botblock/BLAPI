# BLAPI
BLAPI is a package to handle posting your discord bot stats to botlists.<br>
It's intended to be used with discord.js, though you can also manually post your stats.<br>
The commands adjust to fit your needs, automatically turning off use of the metalist API if your post rate would be more than their ratelimit allows.<br>
You can also always request to not use their API in the manual post, if you desire so for any reason.
# Installation
`npm i blapi` to install BLAPI <br>
<br>
The list of all supported bot lists and their respective names for the apiKeys object are listed [here](https://themetalist.org/api/docs)
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
//noMetaList can be added as "True" if you don't want to forward you keys to foreign APIs or need to ignore their ratelimit
blapi.manualPost(guildCount, botID, {"bots.ondiscord.xyz" : "thisIsSomeApiKey", "discordbots.org" : "thisIsSomeOtherApiKey"}, noMetaList);
```


# Credit
BLAPI uses [axios](https://github.com/axios/axios) for handling the POSTs and the [metalist API](https://themetalist.org/api/docs) to distribute the data to every botlist
