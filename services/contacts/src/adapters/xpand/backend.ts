import { type Resource } from '@onecore/utilities'
import { Knex } from 'knex'
import { Config } from '@src/common/config'
import { ContactsBackend } from '@src/adapters/backend-types'
import { contactsDbClient } from '@src/adapters/db'
import { makeRelationDependencies } from '@src/services/contacts-service/relations'
import { xpandDbClient } from './db'
import { xpandContactsRepository } from './repository'
import { xpandSoapContactWriter } from './soap'

export type XpandBackend = ContactsBackend & {
  xpandDb: Resource<Knex>
  /** The contacts service's own database, holding `contact_relation`. */
  contactsDb: Resource<Knex>
}

/**
 * Xpand backend: contacts are read from the Xpand database, created through
 * Xpand's SOAP service, and relations are stored in the contacts database.
 *
 * Constructing the backend opens no connections — the Knex resources connect
 * on `init()`.
 */
export const makeXpandBackend = (config: Config): XpandBackend => {
  const xpandDb = xpandDbClient(config.xpandDatabase)
  const contactsDb = contactsDbClient(config.contactsDatabase)

  return {
    contactsRepository: xpandContactsRepository(xpandDb, contactsDb),
    contactWriter: xpandSoapContactWriter(config.xpandSoap),
    relationDependencies: makeRelationDependencies(xpandDb, contactsDb),
    resources: [xpandDb, contactsDb],
    xpandDb,
    contactsDb,
  }
}
