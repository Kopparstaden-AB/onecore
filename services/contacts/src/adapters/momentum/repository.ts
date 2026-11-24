import { gql, type GraphQLClient } from 'graphql-request'
import {
  ContactListParams,
  ContactsRepository,
} from '@src/adapters/contact-adapter'
import { ContactIncludeOptions } from '@src/adapters/xpand/batch-query'
import {
  PhoneNumber,
  Contact,
  ContactCode,
  NationalIdNumber,
  RelatedContact,
} from '@src/domain'
import { MomentumCustomersResponseSchema } from './schema'
import { toContact } from './transform'

/**
 * Creates a ContactsRepository that interacts with the Momentum GraphQL API,
 * using the provided GraphQL client.
 *
 * @param client - A GraphQLClient configured for the Momentum API.
 *
 * @returns An implementation of the ContactsRepository interface.
 */
export const momentumContactsRepository = (
  client: GraphQLClient
): ContactsRepository => {
  return {
    /**
     * Retrieve a paginated and, optionally, filtered list of contacts
     *
     * @param params - Parameters for listing contacts, including filter
     *                 and pagination options.
     *
     * @returns A promise that resolves to the page of contacts and the
     *          total record count.
     */
    list: async (
      params: ContactListParams
    ): Promise<{ content: Contact[]; totalRecords: number }> => {
      throw new Error('Not implemented: momentum.list')
    },

    /**
     * Retrieve a contact by its contact code
     *
     * @param contactCode - The unique code of the contact to retrieve.
     *
     * @returns A promise that resolves to the Contact, or null if not found.
     */
    getByContactCode: async (
      contactCode: ContactCode
    ): Promise<Contact | null> => {
      throw new Error('Not implemented: momentum.getByContactCode')
    },

    /**
     * Batch lookup of contacts by their contact codes
     *
     * @param contactCodes - The contact codes to look up.
     * @param options - Optional include flags for phone/email/address.
     *
     * @returns A promise that resolves to an array of Contact objects.
     */
    getByContactCodeBatch: async (
      contactCodes: ContactCode[],
      options?: ContactIncludeOptions
    ): Promise<Contact[]> => {
      throw new Error('Not implemented: momentum.getByContactCodeBatch')
    },

    /**
     * Retrieve a contact by national id number
     *
     * @param nid - The national ID number to search for.
     *
     * @returns A promise that resolves to the Contact, or null if not found.
     */
    getByNationalIdNumber: async (
      nid: NationalIdNumber
    ): Promise<Contact | null> => {
      throw new Error('Not implemented: momentum.getByNationalIdNumber')
    },

    /**
     * Retrieve contacts by phone number
     *
     * @param phoneNumber - The phone number to search for.
     *
     * @returns A promise that resolves to an array of Contact objects.
     */
    getByPhoneNumber: async (phoneNumber: PhoneNumber): Promise<Contact[]> => {
      throw new Error('Not implemented: momentum.getByPhoneNumber')
    },

    /**
     * Retrieve contacts by email address
     *
     * @param emailAddress - The email address to search for.
     *
     * @returns A promise that resolves to an array of Contact objects.
     */
    getByEmailAddress: async (emailAddress: string): Promise<Contact[]> => {
      throw new Error('Not implemented: momentum.getByEmailAddress')
    },

    getContactsUpdatedSince: async (since: Date): Promise<Contact[]> => {
      const response = await client.request(
        gql`
          query ($since: DateTime) {
            customers(
              first: 1
              where: {
                communications: {
                  some: {
                    and: {
                      statusChanged: { gte: $since }
                      type: { id: { eq: "intercom" } }
                    }
                  }
                }
              }
            ) {
              edges {
                node {
                  id
                  number
                  identityOfficialNumber
                  identityName
                  identityLastName
                  identityFullName
                  identityDateOfBirth
                  communications {
                    value
                    type {
                      id
                    }
                    statusCreated
                    statusChanged
                  }
                  isCustomer
                  isOrganisation
                }
              }
            }
          }
        `,
        {
          since,
        }
      )

      const parsed = MomentumCustomersResponseSchema.parse(response)

      return parsed.customers.edges.map((e) => toContact(e.node))
    },

    getAdministrators: function (
      contactCode: ContactCode
    ): Promise<RelatedContact[] | null> {
      throw new Error('Function not implemented.')
    },
    getAdministratorsFor: function (
      contactCode: ContactCode
    ): Promise<RelatedContact[] | null> {
      throw new Error('Function not implemented.')
    },
    getTrustees: function (
      contactCode: ContactCode
    ): Promise<RelatedContact[] | null> {
      throw new Error('Function not implemented.')
    },
    getTrusteesFor: function (
      contactCode: ContactCode
    ): Promise<RelatedContact[] | null> {
      throw new Error('Function not implemented.')
    },
    getOtherInvoiceRecipients: function (
      contactCode: ContactCode
    ): Promise<RelatedContact[] | null> {
      throw new Error('Function not implemented.')
    },
    getOtherInvoiceRecipientsFor: function (
      contactCode: ContactCode
    ): Promise<RelatedContact[] | null> {
      throw new Error('Function not implemented.')
    },
    existsByNationalIdNumber: function (
      nid: NationalIdNumber
    ): Promise<ContactCode | null> {
      throw new Error('Function not implemented.')
    },
    getChangedContactCodes: function (
      since: Date | null
    ): Promise<{ contactCode: string; timestamp: Date }[]> {
      throw new Error('Function not implemented.')
    },
    getByContactCodes: function (
      codes: ContactCode[],
      options?: { includeRelations?: boolean }
    ): Promise<Contact[]> {
      throw new Error('Function not implemented.')
    },
  }
}
