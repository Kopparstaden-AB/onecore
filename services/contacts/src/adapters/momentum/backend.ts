import { Config } from '@src/common/config'
import {
  ContactsBackend,
  ContactsBackendConfigError,
} from '@src/adapters/backend-types'
import { ContactWriter } from '@src/adapters/contact-writer'
import { RelationDependencies } from '@src/services/contacts-service/relations'
import { momentumGraphQLClient } from './client'
import { momentumContactsRepository } from './repository'

const momentumContactWriter: ContactWriter = {
  createContact: async () => ({
    ok: false,
    err: 'write-backend-not-configured',
  }),
}

const notImplemented = (fn: string) => () => {
  throw new Error(`Not implemented: momentum.${fn}`)
}

const momentumRelationDependencies: RelationDependencies = {
  db: notImplemented('relationDependencies.db'),
  canonicalContactCode: notImplemented(
    'relationDependencies.canonicalContactCode'
  ),
  relatedContactsFor: notImplemented('relationDependencies.relatedContactsFor'),
  relatedContactForEdge: notImplemented(
    'relationDependencies.relatedContactForEdge'
  ),
}

export const makeMomentumBackend = (config: Config): ContactsBackend => {
  if (!config.momentumApi?.graphqlUrl) {
    throw new ContactsBackendConfigError('momentum', 'momentumApi.graphqlUrl')
  }

  return {
    contactsRepository: momentumContactsRepository(
      momentumGraphQLClient(config.momentumApi)
    ),
    contactWriter: momentumContactWriter,
    relationDependencies: momentumRelationDependencies,
    resources: [],
  }
}
