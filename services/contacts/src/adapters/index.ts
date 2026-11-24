export { xpandContactsRepository } from './xpand'
export { momentumContactsRepository, momentumGraphQLClient } from './momentum'
export {
  makeContactsBackend,
  contactsBackends,
  contactsBackendNameSchema,
} from './contacts-backend'
export type { ContactsBackendName } from './contacts-backend'
export { ContactsBackendConfigError } from './backend-types'
export type { ContactsBackend } from './backend-types'

export type {
  ContactsRepository,
  ContactListParams,
  Pagination,
} from './contact-adapter'
