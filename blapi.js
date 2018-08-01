const axios = require('axios');

module.exports = {
    /* discordClient: the client via wich your code is connected to discord
     * apiKeys: a JSON object formatted like: {"botlist name":"API Keys for that list", etc.} ; to see the names you need to use visit https://themetalist.org/api/docs
     * repeatInterval: integer value of minutes until you want to post again
     * This function is for automated use with discord.js */
    handle: async (discordClient, apiKeys, repeatInterval) => {
        //handle inputs
        if (!repeatInterval || repeatInterval < 1) {
            repeatInterval = 30;
        }
        //for now well just send the rest and return the errors the POST might throw

        //set the function to repeat
        let d = new Date(),
            h = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0 + repeatInterval, 0, 0),
            e = h - d;
        if (e > 100) { // some arbitrary time period
            setTimeout(handle.bind(null, discordClient, apiKeys, repeatInterval), e);
        }
        //the actual code to post the stats
        if (discordClient.user) {
            apiKeys["server_count"] = discordClient.guilds.array().length;
            apiKeys["bot_id"] = discordClient.user.id;
            axios.post('https://themetalist.org/api/count', apiKeys).catch((e) => console.log(e));
        } else {
            console.log("BLAPI : Discord client seems to not be connected yet, so we're skipping the post");
        }
    },
    /* guildCount: integer value of guilds your bot is serving
     * botID: snowflake of the ID the user your bot is using
     * apiKeys: a JSON object formatted like: {"botlist name":"API Keys for that list", etc.} ; to see the names you need to use visit https://themetalist.org/api/docs
     * This function is for when you don't use discord.js or just want to post to manual times */
    manualPost: async (guildCount, botID, apiKeys) => {
        //for now well just send the rest and return the errors the POST might throw

        //the actual code to post the stats
        apiKeys["server_count"] = guildCount;
        apiKeys["bot_id"] = botID;
        axios.post('https://themetalist.org/api/count', apiKeys).catch((e) => console.log(e));
    }
};
