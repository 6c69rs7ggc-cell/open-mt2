import Command from '../../Command';

export default class AccountIdCommand extends Command {
    static getName() {
        return '/accountid';
    }

    static getDescription() {
        return 'show your account ID for GM setup';
    }

    static getExample() {
        return '/accountid';
    }
}
