import Player from '@/core/domain/entities/game/player/Player';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import CommandHandler from '../../CommandHandler';
import AccountIdCommand from './AccountIdCommand';

export default class AccountIdCommandHandler extends CommandHandler<AccountIdCommand> {
    async execute(player: Player): Promise<void> {
        player.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: `[SYSTEM] Your account ID is: ${player.getAccountId()}`,
        });
    }
}
