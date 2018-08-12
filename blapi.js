const { join } = require('path');
const bttps = require(join(__dirname, 'bttps.js'));

async function handleInternal(discordClient, apiKeys, repeatInterval) {
    //set the function to repeat
    setTimeout(handleInternal.bind(null, discordClient, apiKeys, repeatInterval), (60000 * repeatInterval));

    //the actual code to post the stats
    if (discordClient.user) {
        if (repeatInterval > 2) { //if the interval isnt below metalists ratelimit, use their API
            apiKeys["server_count"] = discordClient.guilds.size;
            apiKeys["bot_id"] = discordClient.user.id;
            if (discordClient.shard) {
                apiKeys["shard_id"] = discordClient.shard.id;
                apiKeys["shard_count"] = discordClient.shard.count;
            }
            bttps.post('metalist.xyz', '/api/count', 'no key needed for this', apiKeys).catch((e) => console.error(`BLAPI: ${e}`));
        } else {
            postToAllLists(discordClient.guilds.size, discordClient.user.id, apiKeys);
        }
    } else {
        console.error("BLAPI : Discord client seems to not be connected yet, so we're skipping the post");
    }
}

module.exports = {
    /**
     * This function is for automated use with discord.js
     * @param {Client} discordCLient Client via wich your code is connected to Discord
     * @param {object} apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
     * @param {integer} repeatInterval Number of minutes until you want to post again, leave out to use 30
     */
    handle: async (discordClient, apiKeys, repeatInterval) => {
        //handle inputs
        if (!repeatInterval || repeatInterval < 1)
            repeatInterval = 30;
        handleInternal(discordClient, apiKeys, repeatInterval);
    },
    /**
     * For when you don't use discord.js or just want to post to manual times
     * @param {integer} guildCount Integer value of guilds your bot is serving
     * @param {string} botID Snowflake of the ID the user your bot is using
     * @param {object} apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
     * @param {boolean} noMetaListPlis If you don't want to use the metalist API add this as True
     */
    manualPost: async (guildCount, botID, apiKeys, noMetaListPlis) => { //TODO add shard support
        if (!noMetaListPlis) {
            apiKeys["server_count"] = guildCount;
            apiKeys["bot_id"] = botID;
            bttps.post('metalist.xyz', '/api/count', 'no key needed for this', apiKeys).catch((e) => console.error(`BLAPI: ${e}`));
        } else {
            postToAllLists(guildCount, botID, apiKeys);
        }
    }
};

let listData;

async function postToAllLists(guildCount, botID, apiKeys) {
    //make sure we have all lists we can post to and their apis
    if (!listData) {
        listData = await bttps.get('https://metalist.xyz/api/lists/count').catch((e) => console.error(`BLAPI: ${e}`));
        if (!listData) {
            console.error("BLAPI : Something went wrong when contacting metalist for the API of the lists, so we're using an older preset. Some lists might not be available because of this.");
            listData = oldListData;
        }
    }
    for (let listname in listData) {
        if (apiKeys[listname]) {
            let list = listData[listname];
            let url = 'https://' + listname;
            let apiPath = list['api_post'].replace(url, '').replace(':id', botID);
            let sendObj = JSON.parse(`{ "${list["api_field"]}": ${guildCount} }`);
            bttps.post(listname, apiPath, apiKeys[listname], sendObj).catch((e) => console.error(`BLAPI: ${e}`));
        }
    }
}

const oldListData = {
    "botsfordiscord.com": {
        "api_docs": "https://botsfordiscord.com/docs/v1",
        "api_post": "https://botsfordiscord.com/api/v1/bots/:id",
        "api_field": "server_count",
        "api_shard_id": null,
        "api_shard_count": null,
        "api_shards": null
    },
    "bots.ondiscord.xyz": {
        "api_docs": "https://bots.ondiscord.xyz/info/api",
        "api_post": "https://bots.ondiscord.xyz/bot-api/bots/:id/guilds",
        "api_field": "guildCount",
        "api_shard_id": null,
        "api_shard_count": null,
        "api_shards": null
    },
    "boatlist.ml": {
        "api_docs": null,
        "api_post": "https://boatlist.ml/api/bots/:id/stats",
        "api_field": "server_count",
        "api_shard_id": null,
        "api_shard_count": null,
        "api_shards": null
    },
    "botlist.space": {
        "api_docs": "https://botlist.space/docs/api",
        "api_post": "https://botlist.space/api/bots/:id",
        "api_field": "server_count",
        "api_shard_id": null,
        "api_shard_count": null,
        "api_shards": "shards"
    },
    "carbonitex.net": {
        "api_docs": null,
        "api_post": null,
        "api_field": null,
        "api_shard_id": null,
        "api_shard_count": null,
        "api_shards": null
    },
    "discordboats.club": {
        "api_docs": null,
        "api_post": "https://discordboats.club/api/public/bot/stats",
        "api_field": "server_count",
        "api_shard_id": null,
        "api_shard_count": null,
        "api_shards": null
    },
    "discordbots.fr": {
        "api_docs": "https://discordbots.fr/docs",
        "api_post": "https://discordbots.fr/api/v1/bot/:id",
        "api_field": "count",
        "api_shard_id": null,
        "api_shard_count": "shard",
        "api_shards": null
    },
    "discordbots.org": {
        "api_docs": "https://discordbots.org/api/docs",
        "api_post": "https://discordbots.org/api/bots/:id/stats",
        "api_field": "server_count",
        "api_shard_id": "shard_id",
        "api_shard_count": "shard_count",
        "api_shards": "shards"
    },
    "discordbot.world": {
        "api_docs": "https://discordbot.world/docs",
        "api_post": "https://discordbot.world/api/bot/:id/stats",
        "api_field": "guild_count",
        "api_shard_id": null,
        "api_shard_count": null,
        "api_shards": "shards"
    },
    "bots.discord.pw": {
        "api_docs": "https://bots.discord.pw/api",
        "api_post": "https://bots.discord.pw/api/bots/:id/stats",
        "api_field": "server_count",
        "api_shard_id": "shard_id",
        "api_shard_count": "shard_count",
        "api_shards": null
    },
    "discordbots.group": {
        "api_docs": "https://discordbots.group/api/docs",
        "api_post": "https://discordbots.group/api/bot/:id",
        "api_field": "count",
        "api_shard_id": null,
        "api_shard_count": null,
        "api_shards": null
    },
    "discordbots.co.uk": {
        "api_docs": null,
        "api_post": null,
        "api_field": null,
        "api_shard_id": null,
        "api_shard_count": null,
        "api_shards": null
    },
    "discordmusicbots.com": {
        "api_docs": null,
        "api_post": null,
        "api_field": null,
        "api_shard_id": null,
        "api_shard_count": null,
        "api_shards": null
    },
    "discord.services": {
        "api_docs": "http://discord.services/api/",
        "api_post": "https://discord.services/api/bots/:id",
        "api_field": "server_count",
        "api_shard_id": null,
        "api_shard_count": null,
        "api_shards": null
    },
    "listcord.com": {
        "api_docs": "https://listcord.com/documentation",
        "api_post": "https://listcord.com/api/bot/:id/guilds",
        "api_field": "guilds",
        "api_shard_id": "shard",
        "api_shard_count": null,
        "api_shards": null
    },
    "botlist.co": {
        "api_docs": null,
        "api_post": null,
        "api_field": null,
        "api_shard_id": null,
        "api_shard_count": null,
        "api_shards": null
    },
    "solutions.softonic.com": {
        "api_docs": null,
        "api_post": null,
        "api_field": null,
        "api_shard_id": null,
        "api_shard_count": null,
        "api_shards": null
    },
    "thereisabotforthat.com": {
        "api_docs": null,
        "api_post": null,
        "api_field": null,
        "api_shard_id": null,
        "api_shard_count": null,
        "api_shards": null
    }
}