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

// This flag is used to make sure that only real pull requests are added to the queue
// otherwise anyone can add any number to the queue
const onlyAllowRealPullRequests = true;

// Array to store the pull requests
let pullRequests = [];

client.on("messageCreate", async (message) => {
  if (message.author.bot) {
    return;
  }

  const { content } = message;

  if (content.includes("!pr-list")) {
    const pullRequestsFromRepo = await getPullRequestsFromRepo();
    const prList = pullRequestsFromRepo.map(
      (pr) => `${pr.number} - ${pr.title}`
    );
    message.reply(prList.length ? prList.join("\n") : "No PRs found");
  } else if (content.includes("!pr-add:")) {
    const prNumber = parseInt(content.split(":")[1]);

    if (isNaN(prNumber) || prNumber <= 0) {
      message.reply("Please enter a valid PR number");
      return;
    }

    if (onlyAllowRealPullRequests) {
      const pullRequestsFromRepo = await getPullRequestsFromRepo();
      const pullRequestsNumbers = pullRequestsFromRepo.map((pr) => pr.number);

      if (!pullRequestsNumbers.includes(prNumber)) {
        message.reply("Please enter a PR number from the repo");
        return;
      }
    }

    if (pullRequests.includes(prNumber)) {
      message.reply("PR already in the queue");
      return;
    }

    pullRequests.push(prNumber);
    message.reply(`PR ${prNumber} added to the queue`);
  } else if (content.includes("!pr-help")) {
    message.reply(`Here are the commands you can use:
      \`\`\`
      !pr-list - List all the PRs from the repo
      !pr-add:<PR_NUMBER> - Add a PR to the queue.
      !pr-remove - Remove the first PR from the queue
      !pr-clear - Clear the queue
      !pr-all - List all the PRs in the queue
      \`\`\`
    `);
  } else if (content.includes("!pr-remove")) {
    // Because this is a queue, we remove the first PR from the queue because queues are FIFO
    const nextPR = pullRequests.shift();

    // You can do any logic here to process the `nextPR` variable like closing the PR, merging the PR, etc.

    message.reply(
      `PR #${nextPR} removed from the queue, here is the new queue:\n${pullRequests.join(
        "\n"
      )}`
    );
  } else if (content.includes("!pr-clear")) {
    pullRequests = [];
    message.reply("Queue cleared");
  } else if (content.includes("!pr-all")) {
    message.reply(
      pullRequests.length > 0 ? JSON.stringify(pullRequests) : "No PRs found"
    );
  }
});

async function getPullRequestsFromRepo() {
  const response = await axios
    .get(
      `${githubApiBaseUrl}/repos/${githubOwner}/${githubRepo}/pulls?state=open`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
        },
      }
    )
    .catch((error) => {
      console.log(error);
    });
  if (response) {
    return response.data;
  } else {
    return [];
  }
}

client.login(process.env.DISCORD_TOKEN);
