const { join } = require('path');
const bttps = require(join(__dirname, 'bttps.js'));
const fallbackListData = require('./fallbackListData.json');

let listData;

/**
 * @param {integer} guildCount Total number of guilds the bot is on
 * @param {string} botID User ID of bot to post stats for
 * @param {Object} apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
 */
const postToAllLists = async (guildCount, botID, apiKeys) => {
  // make sure we have all lists we can post to and their apis
  if (!listData) {
    listData = await bttps.get('https://botblock.org/api/lists').catch(e => console.error(`BLAPI: ${e}`));
    if (!listData) {
      console.error("BLAPI : Something went wrong when contacting BotBlock for the API of the lists, so we're using an older preset. Some lists might not be available because of this.");
      listData = fallbackListData;
    }
  }
  for (const listname in listData) {
    if (apiKeys[listname]) {
      const list = listData[listname];
      const url = `https://${listname}`;
      const apiPath = list['api_post'].replace(url, '').replace(':id', botID);
      const sendObj = JSON.parse(`{ "${list['api_field']}": ${guildCount} }`);
      bttps.post(listname, apiPath, apiKeys[listname], sendObj).catch(e => console.error(`BLAPI: ${e}`));
    }
  }
};

/**
 * @param {Client} client Discord.js client
 * @param {Object} apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
 * @param {number} repeatInterval Number of minutes between each repetition
 */
const handleInternal = (client, apiKeys, repeatInterval) => {
  // set the function to repeat
  setTimeout(handleInternal.bind(null, client, apiKeys, repeatInterval), 60000 * repeatInterval);

  // the actual code to post the stats
  if (client.user) {
    if (repeatInterval > 2) { // if the interval isnt below the BotBlock ratelimit, use their API
      apiKeys['server_count'] = client.guilds.size;
      apiKeys['bot_id'] = client.user.id;
      if (client.shard) {
        apiKeys['shard_id'] = client.shard.id;
        apiKeys['shard_count'] = client.shard.count;
      }
      bttps.post('botblock.org', '/api/count', 'no key needed for this', apiKeys).catch(e => console.error(`BLAPI: ${e}`));
    } else {
      postToAllLists(client.guilds.size, client.user.id, apiKeys);
    }
  } else {
    console.error("BLAPI : Discord client seems to not be connected yet, so we're skipping the post");
  }
};

module.exports = {
  /**
   * This function is for automated use with discord.js
   * @param {Client} discordClient Client via wich your code is connected to Discord
   * @param {Object} apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
   * @param {integer} repeatInterval Number of minutes until you want to post again, leave out to use 30
   */
  handle: (discordClient, apiKeys, repeatInterval) => {
    // handle inputs
    if (!repeatInterval || repeatInterval < 1) repeatInterval = 30;
    handleInternal(discordClient, apiKeys, repeatInterval);
  },
  /**
   * For when you don't use discord.js or just want to post to manual times
   * @param {integer} guildCount Integer value of guilds your bot is serving
   * @param {string} botID Snowflake of the ID the user your bot is using
   * @param {Object} apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
   * @param {boolean} noBotBlockPlis If you don't want to use the BotBlock API add this as True
   */
  manualPost: (guildCount, botID, apiKeys, noBotBlockPlis) => { // TODO add shard support
    if (noBotBlockPlis) {
      postToAllLists(guildCount, botID, apiKeys);
    } else {
      apiKeys['server_count'] = guildCount;
      apiKeys['bot_id'] = botID;
      bttps.post('botblock.org', '/api/count', 'no key needed for this', apiKeys).catch(e => console.error(`BLAPI: ${e}`));
    }
  }
};
