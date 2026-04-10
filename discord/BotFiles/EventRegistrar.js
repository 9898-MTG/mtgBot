/**
 * @module EventRegistrar
 * @description Registers all Discord event listeners on the bot client.
 *
 * Extracted from bot.js to reduce file size and improve maintainability.
 * Each Discord event is wired to the DBS event handler and the HookRegistry.
 */

/**
 * Register all Discord.js event listeners.
 * @param {Object} DBS - The bot state object
 * @param {import('../../hooks/HookRegistry').HookRegistry} [hookRegistry] - Optional hook registry
 */
function registerDiscordEvents(DBS, hookRegistry) {
    const { Bot, EventHandler, EventsFile } = DBS;

    /**
     * Helper: safely handle a Discord event by delegating to EventHandler
     * and emitting the corresponding hook.
     * @param {string} eventType - Event name for EventHandler
     * @param {Object} vars - Variables to pass to the handler
     * @param {string} [hookName] - Optional hook to trigger
     * @param {string} errorLabel - Label for error logging
     */
    function handleEvent(eventType, vars, hookName, errorLabel) {
        try {
            EventHandler.Event_Handle(DBS, EventsFile, 0, eventType, vars);
            if (hookRegistry && hookName) {
                hookRegistry.trigger(hookName, { type: eventType, ...vars });
            }
        } catch (error) {
            DBS.logError({
                level: "error",
                message: `${errorLabel}: ${error.stack}`
            });
        }
    }

    // Message events
    Bot.on("messageCreate", message => DBS.checkMessage(message));

    // Member events
    Bot.on("guildMemberAdd", member => {
        handleEvent(
            "User Joins Server",
            { guild: member.guild, member },
            "H20:MemberJoin",
            "Guild member add"
        );
    });

    Bot.on("guildMemberRemove", member => {
        handleEvent(
            "User Kicked",
            { guild: member.guild, member },
            "H21:MemberLeave",
            "Guild member remove"
        );
    });

    // Ban events
    Bot.on("guildBanAdd", (guild, user) => {
        handleEvent(
            "User Banned",
            { guild, user },
            "H31:UserBanned",
            "Guild ban add"
        );
    });

    Bot.on("guildBanRemove", (guild, user) => {
        handleEvent(
            "Guild Ban Remove",
            { guild, user },
            null,
            "Guild ban remove"
        );
    });

    // Channel events
    Bot.on("channelCreate", channel => {
        handleEvent(
            "Channel Create",
            { guild: channel.guild, channel },
            null,
            "Channel create"
        );
    });

    Bot.on("channelDelete", channel => {
        handleEvent(
            "Channel Delete",
            { guild: channel.guild, channel },
            null,
            "Channel delete"
        );
    });

    Bot.on("channelPinsUpdate", (channel, _time) => {
        handleEvent(
            "Channel Pins Update",
            { guild: channel.guild, channel },
            null,
            "Channel pins update"
        );
    });

    Bot.on("channelUpdate", (oldchannel, newchannel) => {
        handleEvent(
            "Channel Update",
            { guild: newchannel.guild, oldchannel, newchannel },
            null,
            "Channel update"
        );
    });

    // Emoji events
    Bot.on("emojiCreate", emoji => {
        handleEvent(
            "Emoji Create",
            { guild: emoji.guild, emoji },
            null,
            "Emoji create"
        );
    });

    Bot.on("emojiDelete", emoji => {
        handleEvent(
            "Emoji Delete",
            { guild: emoji.guild, emoji },
            null,
            "Emoji delete"
        );
    });

    Bot.on("emojiUpdate", (oldemoji, newemoji) => {
        handleEvent(
            "Emoji Update",
            { guild: newemoji.guild, oldemoji, newemoji },
            null,
            "Emoji update"
        );
    });

    // Guild events
    Bot.on("guildCreate", guild => {
        handleEvent("Guild Create", { guild }, null, "Guild create");
    });

    Bot.on("guildDelete", guild => {
        handleEvent("Guild Delete", { guild }, null, "Guild delete");
    });

    Bot.on("guildMemberAvailable", member => {
        handleEvent(
            "Guild Member Available",
            { guild: member.guild, member },
            null,
            "Guild member available"
        );
    });

    Bot.on("guildMemberSpeaking", (member, _speaking) => {
        handleEvent(
            "Guild Member Speaking",
            { guild: member.guild, member },
            null,
            "Guild member speaking"
        );
    });

    Bot.on("guildMemberUpdate", (oldmember, newmember) => {
        handleEvent(
            "Guild Member Update",
            { guild: newmember.guild, oldmember, newmember },
            null,
            "Guild member update"
        );
    });

    Bot.on("guildUnavailable", guild => {
        handleEvent("Guild Unavailable", { guild }, null, "Guild unavailable");
    });

    Bot.on("guildUpdate", (oldguild, newguild) => {
        handleEvent(
            "Guild Update",
            { guild: newguild, oldguild, newguild },
            null,
            "Guild update"
        );
    });

    // Message lifecycle events
    Bot.on("messageDelete", message => {
        handleEvent(
            "Message Delete",
            { guild: message.guild, message },
            null,
            "Message delete"
        );
    });

    Bot.on("messageUpdate", (oldmessage, newmessage) => {
        handleEvent(
            "Message Update",
            { guild: newmessage.guild, newmessage, oldmessage },
            null,
            "Message update"
        );
    });

    // Role events
    Bot.on("roleCreate", role => {
        handleEvent("Role Create", { guild: role.guild, role }, null, "Role create");
    });

    Bot.on("roleDelete", role => {
        handleEvent("Role Delete", { guild: role.guild, role }, null, "Role delete");
    });

    Bot.on("roleUpdate", (oldrole, newrole) => {
        handleEvent(
            "Role Update",
            { guild: newrole.guild, oldrole, newrole },
            null,
            "Role update"
        );
    });

    // Typing event
    Bot.on("typingStart", typing => {
        handleEvent(
            "Typing Start",
            { guild: typing.channel.guild, channel: typing.channel, user: typing.user },
            null,
            "Typing start"
        );
    });

    // User update
    Bot.on("userUpdate", (olduser, newuser) => {
        handleEvent(
            "User Update",
            { guild: newuser.guild, olduser, newuser },
            null,
            "User Update"
        );
    });

    // Interaction handling (buttons, selects, slash commands)
    Bot.on("interactionCreate", async interaction => {
        const guildVars = { guild: interaction.guild };
        try {
            if (interaction.isButton()) {
                await interaction.deferReply({
                    ephemeral: DBS.buttons[interaction.customId]
                        ? DBS.buttons[interaction.customId].ephemeral
                        : false
                });
                guildVars.buttoninteraction = interaction;
                EventHandler.Event_Handle(DBS, EventsFile, 0, "Button Interaction", guildVars);
            } else if (interaction.isSelectMenu()) {
                await interaction.deferReply({
                    ephemeral: DBS.selects[interaction.customId]
                        ? DBS.selects[interaction.customId].ephemeral
                        : false
                });
                guildVars.selectinteraction = interaction;
                EventHandler.Event_Handle(DBS, EventsFile, 0, "Select Interaction", guildVars);
            } else {
                await interaction.deferReply({
                    ephemeral: DBS.slashCommands[interaction.commandName]
                        ? DBS.slashCommands[interaction.commandName].ephemeral
                        : false
                });
                guildVars.commandinteraction = interaction;
                EventHandler.Event_Handle(DBS, EventsFile, 0, "Command Interaction", guildVars);
            }

            if (hookRegistry) {
                hookRegistry.trigger("H23:InteractionReceived", {
                    type: interaction.isButton() ? "button" : interaction.isSelectMenu() ? "select" : "command",
                    guild: interaction.guild,
                    interaction
                });
            }
        } catch (error) {
            DBS.logError({
                level: "error",
                message: `Interaction Create: ${error.stack}`
            });
        }
    });
}

module.exports = { registerDiscordEvents };
