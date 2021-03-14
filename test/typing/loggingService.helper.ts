import { LoggingService } from '@/src/loggingService'

export type PartialLoggingServiceMock<K1 extends keyof LoggingService> = jest.Mocked<
  Pick<LoggingService, K1>
>
