# phobot
discord bot to mess with mc server

## Versions
| Software | Package Name | Version |
| ------------- | ------------- | ------------- |
| [Node.js](https://nodejs.org/en) | `node` | `>=v18.*.*` |
| [Discord.js](https://discordjs.guide) | `discord.js` | `14.21.0` |

## Deployment

```bash
git clone https://github.com/KevinFham/phobot.git
pnpm install
pnpm run register
pm2 start .
```


## Commands

### Discord Bot Interactions

**`/ping`** - Test bot response

**`/serverstart`** - Start machine

**`/serverstatus`** - View machine and minecraft server details

### JS Dev 

**`pnpm run register`** - Register all valid commands in `command/` to a single Discord server, routed by Server ID and defined in `.env`

**`pnpm run register-global`** - Globally register all valid commands in `command/`. This takes about an hour to take effect

**`nodemon .`** - Developer application watcher

## Resources

[Discord.js Guide](https://discordjs.guide)

[Discord.js 14.21.0 Docs](https://discord.js.org/docs/packages/discord.js/14.21.0)
