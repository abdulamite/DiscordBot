#Discord-PR Bot
This is a Discord bot that helps manage your pull requests through Discord. By using a few simple commands you can add, remove, and list pull requests from your repo.

##Prerequisites
Before you can run this bot, you need to create a new Discord bot on the Discord Developer Portal. You can do that here: https://discord.com/developers/applications

##Installation

1. Clone this repository using git clone.
2. Run npm install to install the dependencies.
3. (Optional) add your tokens to the .env file.

##Usage
Start the bot with the following command:

`npm start`

The bot will listens for specific messages from users on Discord. These messages are formatted as follows:

```
!pr-list: Lists all the pull requests in the queue.
!pr-add:<PR Number>: Adds a pull request to the queue. e.g. !pr-add:123
!pr-remove: Removes the first pull request from the queue.
!pr-clear: Clears the entire queue.
!pr-all: Lists all the pull requests in the queue.
```

##Adding your own commands
You can add your own commands to the bot by creating a new condition in the if/else statement in the following block of code in the index.js file:

```
client.on("messageCreate", async (message) => {
    // Add your own commands here
    // Example
    if (message.content.startsWith("!ping")) {
        message.channel.send("pong!");
    }
});
```

##Dependencies

- Node.js
- Discord.js
- Axios
