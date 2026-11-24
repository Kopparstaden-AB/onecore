import { ZodError } from 'zod'
import { Config } from '@src/common/config'
import { ContactsBackendConfigError, makeContactsBackend } from '@src/adapters'

const dbParams = {
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'db',
  port: 1433,
}

const baseConfig: Config = {
  port: 0,
  applicationName: 'contacts-test',
  xpandDatabase: dbParams,
  contactsDatabase: dbParams,
  xpandSoap: {
    url: '',
    username: '',
    password: '',
    messageCulture: '1053',
    companyCode: '001',
    timeoutMs: 1000,
  },
  contactsBackend: { name: 'xpand' },
  logging: { enabled: false },
}

const momentumApi = {
  url: 'http://momentum.invalid',
  graphqlUrl: 'http://momentum.invalid/graphql',
  username: 'user',
  password: 'password',
}

const withBackend = (
  name: string,
  overrides: Partial<Config> = {}
): Config => ({
  ...baseConfig,
  ...overrides,
  contactsBackend: { name },
})

describe(makeContactsBackend, () => {
  it('builds the xpand backend with its two database connections', async () => {
    const backend = makeContactsBackend(withBackend('xpand'))

    expect(backend.resources).toHaveLength(2)
    expect(backend.contactsRepository).toBeDefined()
    expect(backend.contactWriter).toBeDefined()
    expect(backend.relationDependencies).toBeDefined()

    await Promise.allSettled(backend.resources.map((r) => r.close()))
  })

  it('builds the momentum backend without any database connections', () => {
    const backend = makeContactsBackend(
      withBackend('momentum', { momentumApi })
    )

    expect(backend.resources).toEqual([])
    expect(backend.contactsRepository).toBeDefined()
  })

  it('refuses contact creation on the momentum backend', async () => {
    const backend = makeContactsBackend(
      withBackend('momentum', { momentumApi })
    )

    const result = await backend.contactWriter.createContact({
      nationalId: '199001011234',
      firstName: 'Test',
      lastName: 'Testsson',
      addresses: [],
      emailAddresses: [],
      phoneNumbers: [],
      credentials: { name: '199001011234', email: 'a@b.se', password: 'x' },
    })

    expect(result).toEqual({ ok: false, err: 'write-backend-not-configured' })
  })

  it('fails when momentum is selected without its api config', () => {
    expect(() => makeContactsBackend(withBackend('momentum'))).toThrow(
      ContactsBackendConfigError
    )
  })

  it.each(['bogus', '', 'Xpand'])('rejects unknown backend name %p', (name) => {
    expect(() => makeContactsBackend(withBackend(name))).toThrow(ZodError)
  })
})
