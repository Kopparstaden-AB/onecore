import { z } from 'zod'
import { Config } from '@src/common/config'
import { ContactsBackend } from './backend-types'
import { makeXpandBackend } from './xpand/backend'
import { makeMomentumBackend } from './momentum/backend'

/**
 * Selectable backends. To add one: implement a factory returning a
 * `ContactsBackend` under `src/adapters/<name>/backend.ts`, add its name here
 * and its factory to `factories` below.
 */
export const contactsBackends = ['xpand', 'momentum'] as const
export type ContactsBackendName = (typeof contactsBackends)[number]
export const contactsBackendNameSchema = z.enum(contactsBackends)

const factories: Record<
  ContactsBackendName,
  (config: Config) => ContactsBackend
> = {
  xpand: makeXpandBackend,
  momentum: makeMomentumBackend,
}

/**
 * Builds the backend named by `config.contactsBackend.name`.
 *
 * @throws ZodError for an unknown backend name, so a typo fails at startup
 *         rather than falling back to some other backend.
 * @throws ContactsBackendConfigError when the backend lacks required config.
 */
export const makeContactsBackend = (config: Config): ContactsBackend =>
  factories[contactsBackendNameSchema.parse(config.contactsBackend.name)](
    config
  )
