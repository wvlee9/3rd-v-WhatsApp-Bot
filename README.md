# WVLEE9 WH BOT V4 🔥

## Core design
Routine administration is performed from WhatsApp chat. No web dashboard is required for day-to-day bot configuration after deployment.

## V4 additions
- Full WhatsApp command console
- Status/health dashboard
- Statistics
- Recent event logs and `/clearlogs`
- Custom replies + deletion + listing
- Command aliases
- Auto-reply toggle
- Anti-spam toggle + configurable threshold
- Bad-word moderation list
- Warning/block lists
- Welcome-message controls
- Maintenance mode
- Scheduled-message storage/management
- Admin-only controls
- Persistent JSON state
- Interactive WhatsApp menu buttons

## Main commands
`/menu`, `/status`, `/stats`, `/logs`, `/clearlogs`,
`/addcmd`, `/delcmd`, `/listcmd`, `/alias`, `/auto`,
`/antispam`, `/setspam`, `/badword`, `/badwords`,
`/warn`, `/unwarn`, `/warnings`, `/block`, `/unblock`, `/blocked`,
`/setwelcome`, `/welcome`, `/maintenance`,
`/schedule`, `/schedules`, `/delschedule`.

## Important API boundary
This implementation uses the official WhatsApp Cloud API model. It does not claim unsupported consumer-WhatsApp operations. Group member administration and Status reactions must only be added if the selected API/provider explicitly supports them. Do not expose access tokens.
