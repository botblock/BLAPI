# BLAPI
BLAPI is a package to handle posting your discord stats to botlists.<br>
It's intended to be used with discord.js, though you can also manually input stats and let them be posted.

# Installation
`npm install axios` to install axios <br>
`npm install blapi` to install BLAPI <br>
<br>
A usage example with discord.js would look like this:

```js
const Discord = require("discord.js");
const blapi = require("blapi");

let bot = new Discord.Client({ autoReconnect: true });

//post to the APIs every 60 minutes
blapi.handle(bot, {"bots.ondiscord.xyz" : "thisIsSomeApiKey", "discordbots.org" : "thisIsSomeOtherApiKey"}, 60);
```

# Credit
We're using [axios](https://github.com/axios/axios) for handling the POSTs and the [metalist API](https://themetalist.org/api/docs) to distribute the data to every botlist
