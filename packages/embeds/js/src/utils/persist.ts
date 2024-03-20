// Copied from https://github.com/solidjs-community/solid-primitives/blob/main/packages/storage/src/types.ts
// Simplifying and adding a `isEnabled` prop

/* eslint-disable @typescript-eslint/no-explicit-any */
import { defaultSettings } from '@typebot.io/schemas/features/typebot/settings/constants'
import type { Setter, Signal } from 'solid-js'
import { untrack } from 'solid-js'
import { reconcile } from 'solid-js/store'

type Params = {
  key: string
  storage: 'local' | 'session' | undefined
}

export function persist<T>(signal: Signal<T>, params: Params): Signal<T> {
  if (!params.storage) return signal

  const storage = parseRememberUserStorage(
    params.storage || defaultSettings.general.rememberUser.storage
  )
  const serialize: (data: T) => string = JSON.stringify.bind(JSON)
  const deserialize: (data: string) => T = JSON.parse.bind(JSON)
  const init = storage.getItem(params.key)
  const set =
    typeof signal[0] === 'function'
      ? (data: string) => (signal[1] as any)(() => deserialize(data))
      : (data: string) => (signal[1] as any)(reconcile(deserialize(data)))

  if (init) set(init)

  return [
    signal[0],
    typeof signal[0] === 'function'
      ? (value?: T | ((prev: T) => T)) => {
          const output = (signal[1] as Setter<T>)(value as any)

          if (value) storage.setItem(params.key, serialize(output))
          else storage.removeItem(params.key)
          return output
        }
      : (...args: any[]) => {
          ;(signal[1] as any)(...args)
          const value = serialize(untrack(() => signal[0] as any))
          storage.setItem(params.key, value)
        },
  ] as typeof signal
}

const parseRememberUserStorage = (
  storage: 'local' | 'session' | undefined
): typeof localStorage | typeof sessionStorage =>
  (storage ?? defaultSettings.general.rememberUser.storage) === 'session'
    ? sessionStorage
    : localStorage
