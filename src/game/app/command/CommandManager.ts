import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import Logger from '@/core/infra/logger/Logger';
import Command from '@/game/domain/command/Command';
import { CommandMapValue } from '@/game/domain/command/Commands';

const PUBLIC_COMMANDS = new Set(['/help', '/logout']);

export default class CommandManager {
    private readonly logger: Logger;
    private readonly commands: Map<string, CommandMapValue<Command>>;
    private readonly container;

    constructor(container: { logger: Logger; commands: Map<string, CommandMapValue<Command>>; [key: string]: any }) {
        this.logger = container.logger;
        this.commands = container.commands;
        this.container = container;
    }

    async execute({ message, player }: { message: string; player: Player }) {
        //TODO: validate ban words
        if (message.startsWith('/help')) {
            for (const { command } of this.commands.values()) {
                const example = command.getExample() ? `- Example: ${command.getExample()}` : '';
                player.chat({
                    message: `Command: ${command.getName()} - Description: ${command.getDescription()} ${example} `,
                    messageType: ChatMessageTypeEnum.INFO,
                });
            }
            return;
        }

        const [commandName, ...args] = message.split(' ');
        const commandBuilder = this.commands.get(commandName);

        if (!commandBuilder) {
            this.logger.info(`[CommandManager] Invalid command: ${commandName}`);
            player.chat({
                message: `Invalid command: ${commandName}`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        // Read at execution time so test harnesses and controlled runtime configuration
        // changes take effect without trusting a client-provided character name.
        const gmAccountIds = new Set(
            (process.env.GM_ACCOUNT_IDS || '')
                .split(',')
                .map((value) => Number(value.trim()))
                .filter((value) => Number.isSafeInteger(value) && value > 0),
        );

        if (!PUBLIC_COMMANDS.has(commandName) && !gmAccountIds.has(player.getAccountId())) {
            this.logger.info(`[CommandManager] Denied privileged command ${commandName} for account ${player.getAccountId()}`);
            player.chat({
                message: '[SYSTEM] You do not have permission to use this command.',
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        const { command: Command, createHandler } = commandBuilder;
        const command = new Command({ args });
        const commandHandler = createHandler(this.container);
        await commandHandler.execute(player, command);
    }
}
