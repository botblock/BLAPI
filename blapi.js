const axios = require('axios');

async function handleInternal(discordClient, apiKeys, repeatInterval) {
    //set the function to repeat
    setTimeout(handleInternal.bind(null, discordClient, apiKeys, repeatInterval), (60000 * repeatInterval));

    //the actual code to post the stats
    if (discordClient.user) {
        apiKeys["server_count"] = discordClient.guilds.size;
        apiKeys["bot_id"] = discordClient.user.id;
        if (repeatInterval > 2) { //if the interval isnt below Metalists ratelimit, use their API
            axios.post('https://themetalist.org/api/count', apiKeys, { headers: { "Content-type": "application/json" } }).catch((e) => console.log(e));
        } else {
            postToAllLists(discordClient.guilds.size, discordClient.user.id, apiKeys);
        }
    } else {
        console.log("BLAPI : Discord client seems to not be connected yet, so we're skipping the post");
    }
}

module.exports = {
    /* discordClient: the client via wich your code is connected to discord
     * apiKeys: a JSON object formatted like: {"botlist name":"API Keys for that list", etc.} ; to see the names you need to use visit https://themetalist.org/api/docs
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
     * apiKeys: a JSON object formatted like: {"botlist name":"API Keys for that list", etc.} ; to see the names you need to use visit https://themetalist.org/api/docs
     * noMetaListPlis: you don't want to use MetaLists API for some reason, so you don't need to
     * This function is for when you don't use discord.js or just want to post to manual times */
    manualPost: async (guildCount, botID, apiKeys, noMetaListPlis) => {
        if (!noMetaListPlis) {
            apiKeys["server_count"] = guildCount;
            apiKeys["bot_id"] = botID;
            axios.post('https://themetalist.org/api/count', apiKeys, { headers: { "Content-type": "application/json" } }).catch((e) => console.log(e));
        } else {
            postToAllLists(guildCount, botID, apiKeys);
        }
    }
};

function postCount(url, apiKey, guildCount) {
    axios.post(url, { "server_count": guildCount }, { headers: { "Content-type": "application/json", "Authorization": apiKey } }).catch((e) => console.log(e));
}

async function postToAllLists(guildCount, botID, apiKeys) {
    //very ugly checks incoming
    if (apiKeys.contains("botlist.space"))
        postCount('https://botlist.space/api/bots/' + botID, apiKeys["botlist.space"], guildCount);

    if (apiKeys.contains("bots.discord.pw"))
        postCount('https://bots.discord.pw/api/bots/' + botID + '/stats', apiKeys["bots.discord.pw"], guildCount);

    if (apiKeys.contains("bots.ondiscord.xyz"))
        postCount('https://bots.ondiscord.xyz/bot-api/bots/' + botID + '/guilds', apiKeys["bots.ondiscord.xyz"], guildCount);
    else if (apiKeys.contains("BonD"))
        postCount('https://bots.ondiscord.xyz/bot-api/bots/' + botID + '/guilds', apiKeys["BonD"], guildCount);

    if (apiKeys.contains("botsfordiscord.com"))
        postCount('https://botsfordiscord.com/api/v1/bots/' + botID, apiKeys["botsfordiscord.com"], guildCount);
    else if (apiKeys.contains("BFD"))
        postCount('https://botsfordiscord.com/api/v1/bots/' + botID, apiKeys["BFD"], guildCount);

    if (apiKeys.contains("discord.services"))
        postCount('https://discord.services/api/bots/' + botID, apiKeys["discord.services"], guildCount);

    if (apiKeys.contains("discordboats.club"))
        axios.post('https://discordboats.club/api/public/stats', { "server_count": guildCount }, { headers: { "Content-type": "application/json", "Authorization": apiKeys["discordboats.club"] } }).catch((e) => console.log(e));

    if (apiKeys.contains("discordbot.world"))
        axios.post('https://discordbot.world/api/bot/' + botID + ' /stats', { "guild_count": guildCount }, { headers: { "Content-type": "application/json", "Authorization": apiKeys["discordbot.world"] } }).catch((e) => console.log(e));

    if (apiKeys.contains("discordbots.group"))
        axios.post('https://discordbots.group/api/bot/' + botID, { "count": guildCount }, { headers: { "Content-type": "application/json", "Authorization": apiKeys["discordbots.group"] } }).catch((e) => console.log(e));

    if (apiKeys.contains("discordbots.org"))
        postCount('https://discordbots.org/api/bots/' + botID + '/stats', apiKeys["discordbots.org"], guildCount);
    else if (apiKeys.contains("DBL"))
        postCount('https://discordbots.org/api/bots/' + botID + '/stats', apiKeys["DBL"], guildCount);

    if (apiKeys.contains("listcord.com"))
        axios.post('https://listcord.com/api/bot/' + botID + '/guilds', { "guilds": guildCount }, { headers: { "Content-type": "application/json", "Authorization": apiKeys["listcord.com"] } }).catch((e) => console.log(e));
}
