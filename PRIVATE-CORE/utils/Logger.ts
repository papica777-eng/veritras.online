export class Logger {
    private static instance: Logger;

    private constructor() { }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public log(message: string) {
        console.log(`[QANTUM-VORTEX-LOG] ${new Date().toISOString()}: ${message}`);
    }

    public warn(message: string) {
        console.warn(`[QANTUM-VORTEX-WARN] ${new Date().toISOString()}: ${message}`);
    }

    public error(message: string, error?: any) {
        console.error(`[QANTUM-VORTEX-ERROR] ${new Date().toISOString()}: ${message}`, error || '');
    }
}
