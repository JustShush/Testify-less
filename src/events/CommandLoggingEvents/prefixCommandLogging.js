const { Events, EmbedBuilder, WebhookClient } = require('discord.js');
const esysSchema = require('../../schemas/prefixEnableSystem.js');

module.exports = {
    name: Events.MessageCreate,
    async execute (message, client) {

		const esys = await esysSchema.findOne({ Guild: message.guild.id });
		if (!esys)
			return message.reply({ content: `The prefix System is not **ENABLED** pls run \`\/prefix enable\` to turn enable it.`}).then((msg) => { setTimeout(() => { msg.delete(); }, 5 * 1000); }); // delete msg after 5 sec

		const PREFIXES = esys.Prefix; // this never fails cuz there is always default prefix
		const prefix = PREFIXES.find(ele => ele == message.content.startsWith(ele));

        const guildPrefix = prefix;
        if (!message.author.bot && message.content.startsWith(guildPrefix)) {

            const webhookURL = process.env.webhookPrefixLogging;
            const server = message.guild.name;
            const user = message.author.username;
            const userID = message.author.id;

            const embed = new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setAuthor({ name: `${user} has used a command.`, iconURL: client.user.avatarURL({ dynamic: true }) })
            .setTitle(`${client.user.username} Command Logger ${client.config.arrowEmoji}`)
            .addFields({ name: 'Server Name', value: `${server}` })
            .addFields({ name: 'Command', value: `\`\`\`${message.content}\`\`\`` })
            .addFields({ name: 'User', value: `${user} | ${userID}` })
            .setTimestamp()
            .setFooter({ text: `Command Logger ${client.config.devBy}`, iconURL: message.author.avatarURL({ dynamic: true }) })

            try {
                const webhookClient = new WebhookClient({ url: webhookURL });

                await webhookClient.send({
                    embeds: [embed],
                    username: `${client.user.username} Prefix Command Logger`,
                    avatarURL: client.user.avatarURL(),
                });
            } catch (error) {
                client.logs.error('[COMMAND_PREFIX_LOGGING_WEBHOOK] Error whilst sending webhook:', error);
            }
        }
    }
}
