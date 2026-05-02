export default async function handlePrefix(msg, client) {
    const args = msg.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "settings") {
        return msg.reply("Settings panel coming soon.");
    }

    if (command === "vouch") {
        return msg.reply("Vouch system active.");
    }

    msg.reply("Unknown command.");
}
