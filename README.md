# phobot
Discord bot to control minecraft server. The minecraft server runs within a docker compose setup ([GitHub Project](https://github.com/itzg/docker-minecraft-server)) on a separate machine, which is set to shut down when the minecraft server is down. Phobot makes it easy to wake up the machine and start the server, as well as view the current status of the server.

## Versions
| Software | Package Name | Version |
| ------------- | ------------- | ------------- |
| [Node.js](https://nodejs.org/en) | `node` | `>=v18.*.*` |
| [Discord.js](https://discordjs.guide) | `discord.js` | `14.21.0` |

## Deployment

Clone the repo:

```bash
git clone https://github.com/KevinFham/phobot.git
cd phobot
pnpm install
```

Rename `.example-env` to `.env` and set all values. See the Discord.js [documentation](https://discordjs.guide/preparations/setting-up-a-bot-application.html) for setting up the Discord Bot Application and where to get values for `APP_ID`, `PUBLIC_KEY`, and `DISCORD_TOKEN`. See [this](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links) to learn how to add the bot to the server, and [this](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID) for getting the server ID.

Then register the commands to discord and daemonize the bot:

```bash
pnpm run register
pm2 start main.js

# Daemonize on startup (follow the instructions that appear in the console)
pm2 startup
```

Configure `config.yml` to change refresh rate values.

## Commands

### Discord Bot Interactions

**`/ping`** - Test bot response

**`/serverstart`** - Start machine

**`/serverstatus`** - View machine and minecraft server details

**`/serverstop`** - Stop machine if noone is online

### JS Dev 

**`pnpm run register`** - Register all valid commands in `command/` to a single Discord server, routed by Server ID and defined in `.env`

**`pnpm run register-global`** - Globally register all valid commands in `command/`. This takes about an hour to take effect

**`nodemon .`** - Developer application watcher

## Resources

[Discord.js Guide](https://discordjs.guide)

[Discord.js 14.21.0 Docs](https://discord.js.org/docs/packages/discord.js/14.21.0)
