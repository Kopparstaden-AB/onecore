import { type Resource } from '@onecore/utilities'
import { Knex } from 'knex'
import { ContactsRepository } from './contact-adapter'
import { ContactWriter } from './contact-writer'
import { RelationDependencies } from '@src/services/contacts-service/relations'

/**
 * Everything the service needs from its system of record, built together from
 * config so that each backend owns the clients it talks through.
 */
export type ContactsBackend = {
  contactsRepository: ContactsRepository
  contactWriter: ContactWriter
  relationDependencies: RelationDependencies
  /**
   * Database pools this backend owns. Probed by `/health` and closed on
   * teardown; empty for a backend that holds no database connections.
   */
  resources: Resource<Knex>[]
}

/**
 * The selected backend is missing configuration it cannot run without.
 * Thrown at startup so a misconfigured deploy fails fast instead of on the
 * first request.
 */
export class ContactsBackendConfigError extends Error {
  constructor(
    readonly backend: string,
    readonly missing: string
  ) {
    super(`Contacts backend '${backend}' requires config '${missing}'`)
    this.name = 'ContactsBackendConfigError'
  }
}
