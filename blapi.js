const bttps = require(__dirname + '/bttps.js');

async function handleInternal(discordClient, apiKeys, repeatInterval) {
    //set the function to repeat
    setTimeout(handleInternal.bind(null, discordClient, apiKeys, repeatInterval), (60000 * repeatInterval));

    //the actual code to post the stats
    if (discordClient.user) {
        if (repeatInterval > 2) { //if the interval isnt below Metalists ratelimit, use their API
            apiKeys["server_count"] = discordClient.guilds.size;
            apiKeys["bot_id"] = discordClient.user.id;
            bttps.post('themetalist.org', '/api/count', 'no key needed for this', apiKeys).catch((e) => console.log(e));
        } else {
            postToAllLists(discordClient.guilds.size, discordClient.user.id, apiKeys);
        }
    } else {
        console.error("BLAPI : Discord client seems to not be connected yet, so we're skipping the post");
    }
}

module.exports = {
    /* discordClient: the client via wich your code is connected to discord
     * apiKeys: a JSON object formatted like: {"botlist name":"API Keys for that list", etc.} ; 
     * repeatInterval: integer value of minutes until you want to post again
     * This function is for automated use with discord.js */
    handle: async (discordClient, apiKeys, repeatInterval) => {
        //handle inputs
        if (!repeatInterval || repeatInterval < 1)
            repeatInterval = 30;
        handleInternal(discordClient, apiKeys, repeatInterval);
    },
    /* guildCount: integer value of guilds your bot is serving
     * botID: snowflake of the ID the user your bot is using
     * apiKeys: a JSON object formatted like: {"botlist name":"API Keys for that list", etc.} ; 
     * noMetaListPlis: you don't want to use MetaLists API for some reason, so you don't need to
     * This function is for when you don't use discord.js or just want to post to manual times */
    manualPost: async (guildCount, botID, apiKeys, noMetaListPlis) => {
        if (!noMetaListPlis) {
            apiKeys["server_count"] = guildCount;
            apiKeys["bot_id"] = botID;
            bttps.post('themetalist.org', '/api/count', 'no key needed for this', apiKeys).catch((e) => console.log(e));
        } else {
            postToAllLists(guildCount, botID, apiKeys);
        }
    }
};

let listData;

async function postToAllLists(guildCount, botID, apiKeys) {
    //make sure we have all lists we can post to and their apis
    if (!listData) {
        listData = await bttps.get('https://themetalist.org/api/lists/count').catch((e) => console.log(e));
        if (!listData) {
            console.error("BLAPI : Something went wrong when contacting themetalist for the API of the lists, so we're using an older preset. Some lists might not be available because of this.");
            listData = oldListData;
        }
    }
    for (let listname in listData) {
        if (apiKeys[listname]) {
            let list = listData[listname];
            let url = 'https://' + listname;
            let apiPath = list['api_post'].replace(url, '').replace(':id', botID);
            console.log(`trying to post to ${list}, the api_field should be ${list["api_field"]}, guildCount is ${guildCount}`);
            let sendObj = JSON.parse(`{ "${list["api_field"]}": ${guildCount} }`);
            console.log(`we made this : ${sendObj}`);
            bttps.post(listname, apiPath, apiKeys[listname], sendObj).catch((e) => console.log(e));
        }
    }
}

const oldListData = {
    "botsfordiscord.com": {
        "api_docs": "https://botsfordiscord.com/docs/v1",
        "api_post": "https://botsfordiscord.com/api/v1/bots/:id",
        "api_field": "server_count"
    },
    "botlist.space": {
        "api_docs": "https://botlist.space/docs/api",
        "api_post": "https://botlist.space/api/bots/:id",
        "api_field": "server_count"
    },
    "bots.ondiscord.xyz": {
        "api_docs": "https://bots.ondiscord.xyz/info/api",
        "api_post": "https://bots.ondiscord.xyz/bot-api/bots/:id/guilds",
        "api_field": "guildCount"
    },
    "carbonitex.net": {
        "api_docs": "",
        "api_post": null,
        "api_field": null
    },
    "discordboats.club": {
        "api_docs": "",
        "api_post": "https://discordboats.club/api/public/bot/stats",
        "api_field": "server_count"
    },
    "discordbots.org": {
        "api_docs": "https://discordbots.org/api/docs",
        "api_post": "https://discordbots.org/api/bots/:id/stats",
        "api_field": "server_count"
    },
    "discordbot.world": {
        "api_docs": "https://discordbot.world/docs",
        "api_post": "https://discordbot.world/api/bot/:id/stats",
        "api_field": "guild_count"
    },
    "bots.discord.pw": {
        "api_docs": "https://bots.discord.pw/api",
        "api_post": "https://bots.discord.pw/api/bots/:id/stats",
        "api_field": "server_count"
    },
    "discordbots.group": {
        "api_docs": "https://discordbots.group/api/docs",
        "api_post": "https://discordbots.group/api/bot/:id",
        "api_field": "count"
    },
    "discordbots.co.uk": {
        "api_docs": "",
        "api_post": "",
        "api_field": ""
    },
    "discordmusicbots.com": {
        "api_docs": "",
        "api_post": null,
        "api_field": null
    },
    "discord.services": {
        "api_docs": "http://discord.services/api/",
        "api_post": "https://discord.services/api/bots/:id",
        "api_field": "server_count"
    },
    "listcord.com": {
        "api_docs": "https://listcord.com/documentation",
        "api_post": "https://listcord.com/api/bot/:id/guilds",
        "api_field": "guilds"
    },
    "botlist.co": {
        "api_docs": "",
        "api_post": null,
        "api_field": null
    },
    "solutions.softonic.com": {
        "api_docs": "",
        "api_post": null,
        "api_field": null
    },
    "thereisabotforthat.com": {
        "api_docs": null,
        "api_post": null,
        "api_field": null
    }
}