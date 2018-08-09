const { join } = require('path');
const bttps = require(join(__dirname, 'bttps.js'));

async function handleInternal(discordClient, apiKeys, repeatInterval) {
    //set the function to repeat
    setTimeout(handleInternal.bind(null, discordClient, apiKeys, repeatInterval), (60000 * repeatInterval));

    //the actual code to post the stats
    if (discordClient.user) {
        postToAllLists(discordClient.guilds.size, discordClient.user.id, apiKeys);
    } else {
        console.error("BLAPI : Discord client seems to not be connected yet, so we're skipping the post");
    }
}

module.exports = {
    /**
     * This function is for automated use with discord.js
     * @param {Client} discordCLient Client via wich your code is connected to Discord
     * @param {object} apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
     * @param {integer} repeatInterval Number of minutes until you want to post again
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
     */
    manualPost: async (guildCount, botID, apiKeys) => {
        postToAllLists(guildCount, botID, apiKeys);
    }
};


async function postToAllLists(guildCount, botID, apiKeys) {
    for (let listname in listData) {
        if (apiKeys[listname]) {
            let list = listData[listname];
            let url = 'https://' + listname;
            let apiPath = list['api_post'].replace(url, '').replace(':id', botID);
            let sendObj = JSON.parse(`{ "${list["api_field"]}": ${guildCount} }`);
            bttps.post(listname, apiPath, apiKeys[listname], sendObj).catch((e) => console.log(e));
        }
    }
}

const listData = {
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
