const { join } = require('path');
const bttps = require(join(__dirname, 'bttps.js'));
const fallbackListData = require('./fallbackListData.json');

let listData;
let extendedLogging = false;

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
      bttps.post(listname, apiPath, apiKeys[listname], sendObj, extendedLogging).catch(e => console.error(`BLAPI: ${e}`));
    }
  }
};

/**
 * @param {Client} client Discord.js client
 * @param {Object} apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
 * @param {number} repeatInterval Number of minutes between each repetition
 */
const handleInternal = async (client, apiKeys, repeatInterval) => {
  // set the function to repeat
  setTimeout(handleInternal.bind(null, client, apiKeys, repeatInterval), 60000 * repeatInterval);

  // the actual code to post the stats
  if (client.user) {
    if (repeatInterval > 2) { // if the interval isnt below the BotBlock ratelimit, use their API
      apiKeys['bot_id'] = client.user.id;

      // Checks bot is sharded
      /* eslint-disable camelcase */
      if (client.shard) {
        if (client.shard.id === 0) {
          apiKeys.shard_count = client.shard.count;

          // This will get as much info as it can, without erroring
          const shardCounts = await client.shard.broadcastEval('this.guilds.size').catch(e => console.error('BLAPI: Error while fetching shard server counts:', e));
          if (shardCounts.length !== client.shard.count) {
            // If not all shards are up yet, we skip this run of handleInternal
            return;
          }

          apiKeys.shards = shardCounts;
          apiKeys.server_count = apiKeys.shards.reduce((prev, val) => prev + val, 0);
        }
      } else {
        apiKeys['server_count'] = client.guilds.size;
      }
      /* eslint-enable camelcase */

      bttps
        .post('botblock.org', '/api/count', 'no key needed for this', apiKeys)
        .catch(error => console.error('BLAPI:', error));
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
  manualPost: (guildCount, botID, apiKeys, noBotBlockPlis) => {
    if (noBotBlockPlis) {
      postToAllLists(guildCount, botID, apiKeys);
    } else {
      /* eslint-disable camelcase */
      apiKeys.server_count = guildCount;
      apiKeys.bot_id = botID;
      /* eslint-enable camelcase */
      bttps.post('botblock.org', '/api/count', 'no key needed for this', apiKeys, extendedLogging).catch(e => console.error(`BLAPI: ${e}`));
    }
  },
  /**
   * For when you don't use discord.js or just want to post to manual times
   * @param {integer} guildCount Integer value of guilds your bot is serving
   * @param {string} botID Snowflake of the ID the user your bot is using
   * @param {Object} apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
   * @param {integer} shardID The shard ID, which will be used to identify the shards valid for posting (and for super efficient posting with BLAPIs own distributer when not using botBlock)
   * @param {integer} shardCount The number of shards the bot has, which is posted to the lists
   * @param {[integer]} shards An array of guild counts of each single shard (this should be a complete list, and only a single shard will post it)
   * @param {boolean} noBotBlockPlis If you don't want to use the BotBlock API add this as True
   */
  manualPostSharded: (guildCount, botID, apiKeys, shardID, shardCount, shards, noBotBlockPlis) => { // TODO complete
    if (noBotBlockPlis) {
      postToAllLists(guildCount, botID, apiKeys); // redo function for sharded
    } else if (shardID === 0) {
      /* eslint-disable camelcase */
      apiKeys.server_count = guildCount;
      apiKeys.bot_id = botID;
      apiKeys.server_count = guildCount;
      apiKeys.shard_count = shardCount;
      /* eslint-enable camelcase */
      if (shards) {
        apiKeys.shards = shards;
      }
      bttps.post('botblock.org', '/api/count', 'no key needed for this', apiKeys, extendedLogging).catch(e => console.error(`BLAPI: ${e}`));
    }
  },
  setLogging: setLogging => {
    extendedLogging = setLogging;
  }
};
