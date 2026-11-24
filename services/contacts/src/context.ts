import { loggerMiddlewares, type Resource } from '@onecore/utilities'
import { Knex } from 'knex'
import { Config } from './common/config'
import {
  ContactsBackend,
  ContactsRepository,
  makeContactsBackend,
} from './adapters'
import { ContactWriter } from './adapters/contact-writer'
import { RelationDependencies } from './services/contacts-service/relations'
import Koa from 'koa'

/**
 * The Application Context for the Contacts Application,
 */
export interface AppContext {
  /**
   * The bare Application Configuration
   */
  config: Config
  /**
   * Application infrastructure components
   */
  infrastructure: {
    /**
     * Database connections owned by the selected backend.
     */
    resources: Resource<Knex>[]
    /**
     * Configurable Koa middlewares.
     */
    middlewares: Koa.Middleware[]
  }
  /**
   * The Application modules
   */
  modules: {
    /**
     * The ContactsRepository implementation to use.
     */
    contactsRepository: ContactsRepository
    /**
     * The ContactWriter implementation to use for creating contacts.
     */
    contactWriter: ContactWriter
    /**
     * Everything the relation write rules need (relation storage, existence
     * and name lookups), resolved per request.
     */
    relationDependencies: RelationDependencies
  }
}

/**
 * Type describing the infrastructure shape of the ApplicationContext.
 */
export type AppInfrastructure = AppContext['infrastructure']

/**
 * Type describing the modules shape of the ApplicationContext.
 */
export type AppModules = AppContext['modules']

export type AppContextOverrides = Partial<AppModules> & {
  /** Use this backend instead of building one from `config.contactsBackend`. */
  backend?: ContactsBackend
}

/**
 * Construct an ApplicationContext from a Config instance.
 *
 * The backend (Xpand, Momentum, ...) is selected by `config.contactsBackend`
 * and supplies the modules and the database connections they use.
 *
 * `overrides` replaces the backend or individual modules after they are
 * constructed. It exists for tests, which inject a fake ContactWriter so no
 * test run can reach a live Xpand environment — contact creation cannot be
 * undone, so that guarantee is worth an explicit seam rather than relying on
 * configuration being unset.
 */
export const makeAppContext = (
  config: Config,
  { backend: backendOverride, ...moduleOverrides }: AppContextOverrides = {}
): AppContext => {
  const backend = backendOverride ?? makeContactsBackend(config)

  /**
   * Attach logger middlewares if logging is enabled.
   *
   * This allows disabling these middlewares for testing purposes.
   * `config.logging.enabled` defaults to `true`, and should always
   * be enabled unless explicitly disabled.
   */
  const middlewares = config.logging.enabled
    ? [loggerMiddlewares.pre, loggerMiddlewares.post]
    : []

  /**
   * Return a concrete ApplicationContext, from which to wire up
   * the application.
   */
  return {
    config: config,
    infrastructure: {
      resources: backend.resources,
      middlewares: middlewares,
    },
    modules: {
      contactsRepository: backend.contactsRepository,
      contactWriter: backend.contactWriter,
      relationDependencies: backend.relationDependencies,
      ...moduleOverrides,
    },
  }
}
