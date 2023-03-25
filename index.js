require("dotenv").config();
const Discord = require("discord.js");
const axios = require("axios");

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.MessageContent,
  ],
});

const githubApiBaseUrl = "https://api.github.com";
const githubOwner = process.env.GITHUB_OWNER;
const githubRepo = process.env.GITHUB_REPO;
const githubToken = process.env.GITHUB_TOKEN;

// Array to store the pull requests
let pullRequests = [];
client.on("messageCreate", async (message) => {
  if (message.content.includes("!pr-list")) {
    const response = await axios.get(
      `${githubApiBaseUrl}/repos/${githubOwner}/${githubRepo}/pulls`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
        },
      }
    );
    pullRequests = response.data;
    const prList = pullRequests.map((pr) => `${pr.number} -${pr.title}`);
    if (prList.length === 0) {
      message.reply("No PRs found");
      return;
    }
    message.reply(prList.join("\n"));
  } else if (message.content.includes("!pr-add:")) {
    const splitMessage = message.content.split(":");
    const prNumber = parseInt(splitMessage[1]);
    const isValidNumber = !isNaN(prNumber) && prNumber > 0;
    if (!isValidNumber) {
      message.reply("Please enter a valid PR number");
      return;
    }
    pullRequests.push(prNumber);
    message.reply(`PR ${prNumber} added to the queue`);
  } else if (message.content.includes("!pr-help")) {
    message.reply(`
    Here are the commands you can use:
    \`\`\`
    !pr-list - List all the PRs from the repo
    !pr-add:<PR_NUMBER> - Add a PR to the queue.
    !pr-remove - Remove the first PR from the queue
    !pr-clear - Clear the queue
    !pr-all - List all the PRs in the queue\`\`\`
    `);
  } else if (message.content.includes("!pr-remove")) {
    pullRequests.shift();
    message.reply(
      `\nFirst PR removed from the queue here is the new queue \n: ${pullRequests.join(
        "\n"
      )}`
    );
  } else if (message.content.includes("!pr-clear")) {
    pullRequests = [];
    message.reply(`\nQueue cleared`);
  } else if (message.content.includes("!pr-all")) {
    if (pullRequests.length === 0) {
      message.reply("No PRs found");
      return;
    } else {
      message.reply(`\n${pullRequests.join("\n")}`);
    }
  }
});

//make sure this line is the last line
client.login(process.env.DISCORD_TOKEN);
