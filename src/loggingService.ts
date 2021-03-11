import {BaseError} from "@/src/error/baseError";

const loggingLevels = ['INFO', 'DEBUG'] as const;
export type LoggingLevel = typeof loggingLevels[number];

const getLoggingLevel = (): LoggingLevel => {
    const env = process.env.LOGGING_LEVEL as LoggingLevel
    return loggingLevels.includes(env) ? env as LoggingLevel : 'INFO'
}

export type LoggingService = {
    info: (...log: string[]) => Promise<void>,
    debug: (...log: string[]) => Promise<void>,
    error: (error: BaseError) => Promise<void>,
}

abstract class AbstractLoggingService implements LoggingService {
    private static readonly loggingLevel = getLoggingLevel()

    abstract decoratedInfo(...log: string[]): Promise<void>;
    abstract decoratedDebug(...log: string[]): Promise<void>;
    abstract decoratedError(...log: string[]): Promise<void>;


    private static flattenEntry(log: string[]): string[] {
        const flatten = (arr: Array<any>) =>  arr.reduce((flat, next) => flat.concat(next), []);
        return flatten(log.map(x => x.split('\n')))
    }

    async info(...log: string[]): Promise<void> {
        await this.decoratedInfo(...AbstractLoggingService.flattenEntry(log))
    }

    async debug(...log: string[]): Promise<void> {
        if(AbstractLoggingService.loggingLevel === 'DEBUG') await this.decoratedDebug(...AbstractLoggingService.flattenEntry(log))
    }

    async error(error: BaseError): Promise<void> {
        await this.decoratedError(...AbstractLoggingService.flattenEntry([`${error.name} - ${error.message}`, error.stack]))
    }
}

export class ConsoleLoggingService extends AbstractLoggingService {
    private static wrapConsoleEntry(produceConsoleEntry:() => void) {
        console.log('')
        produceConsoleEntry()
    }

    async decoratedInfo(...log: string[]) {
        ConsoleLoggingService.wrapConsoleEntry(() => log.forEach(x => console.log(`INFO - ${x}`)))
    }

    async decoratedDebug(...log: string[]) {
        ConsoleLoggingService.wrapConsoleEntry(() => log.forEach(x => console.log(`DEBUG - ${x}`)))
    }

    async decoratedError(...log: string[]) {
        ConsoleLoggingService.wrapConsoleEntry(() => log.forEach(x => console.log(`ERROR - ${x}`)))
    }
}
