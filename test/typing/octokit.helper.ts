import { OctokitClient } from '@/src/octokitClient'
import { Pick2 } from '@/test/typing/pick.helper'

type Partial1OctokitClientMock<K1 extends keyof OctokitClient> = jest.Mocked<
  Pick<OctokitClient, K1>
>

type Partial2OctokitClientMock<
  K1 extends keyof OctokitClient,
  K2 extends keyof OctokitClient[K1]
> = jest.Mocked<Pick2<OctokitClient, K1, K2>>

export type PartialOctokitClientMock<
  K1 extends keyof OctokitClient,
  K2 extends keyof OctokitClient[K1] = never
> = Partial1OctokitClientMock<K1> | Partial2OctokitClientMock<K1, K2>
