const bttps = require(__dirname + '/bttps.js');

async function handleInternal(discordClient, apiKeys, repeatInterval) {
    //set the function to repeat
    setTimeout(handleInternal.bind(null, discordClient, apiKeys, repeatInterval), (60000 * repeatInterval));

    //the actual code to post the stats
    if (discordClient.user) {
        apiKeys["server_count"] = discordClient.guilds.size;
        apiKeys["bot_id"] = discordClient.user.id;
        if (repeatInterval > 2) { //if the interval isnt below Metalists ratelimit, use their API
            bttps.post('https://themetalist.org', '/api/count', 'no key needed for this', apiKeys).catch((e) => console.log(e));
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
            bttps.post('https://themetalist.org', '/api/count', 'no key needed for this', apiKeys).catch((e) => console.log(e));
        } else {
            postToAllLists(guildCount, botID, apiKeys);
        }
    }
};

function postCount(url, apiKey, guildCount) {
    axios.post(url, { "server_count": guildCount }, { headers: { "Content-type": "application/json", "Authorization": apiKey } }).catch((e) => console.log(e));
}

let listData;

async function postToAllLists(guildCount, botID, apiKeys) {
    //make sure we have all lists we can post to and their apis
    if (!listData) {
        listData = await bttps.get('https://themetalist.org/api/lists/count');
    }
    for (let listname in listData) {
        if (apiKeys[listname]) {
            let list = listData[listname];
            let url = 'https://' + listname;
            let apiPath = list['api_post'].replace(url, '').replace(':id', botID);
            let sendObj = JSON.parse('{ ' + list['api_field'] + ': ' + guildCount + ' }');
            bttps.post(url, apiPath, apiKeys[listname], sendObj).catch((e) => console.log(e));
        }
    }
}
