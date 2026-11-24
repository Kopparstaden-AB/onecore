import { Contact, PhoneNumberType } from '@src/domain'
import { MomentumCustomer, MomentumCustomerCommunicationType } from '../schema'

export const toContact = (momentumCustomer: MomentumCustomer): Contact => {
  const {
    number,
    id,
    identityName,
    identityLastName,
    identityFullName,
    identityDateOfBirth,
    identityOfficialNumber,
    communications,
    isCustomer,
    isOrganisation,
  } = momentumCustomer

  const base = {
    contactCode: number,
    contactKey: id,
    communication: {
      emailAddresses: communications
        .filter((c) => c.type.id === 'email')
        .map((c) => ({
          emailAddress: c.value,
          type: 'unspecified' as const,
          isPrimary: true,
        })),
      phoneNumbers: communications
        .filter((c) =>
          ['mobile', 'homePhone', 'phoneWork', 'intercom'].includes(c.type.id)
        )
        .map((c) => ({
          phoneNumber: c.value,
          type: toPhoneNumberType(c.type.id),
          isPrimary: true,
        })),
      specialAttention: false,
    },
    addresses: [
      {
        street: null,
        zipCode: null,
        city: null,
        region: null,
        country: null,
        full: null,
      },
    ],
    protectedIdentity: false,
  }

  if (isOrganisation) {
    return {
      ...base,
      type: 'organisation',
      organisation: {
        name: identityFullName,
        organisationNumber: identityOfficialNumber,
      },
    }
  } else if (isCustomer) {
    return {
      ...base,
      type: 'individual',
      personal: {
        firstName: identityName,
        lastName: identityLastName,
        fullName: identityFullName,
        nationalId: identityDateOfBirth,
        birthDate: identityDateOfBirth,
      },
    }
  }

  throw new Error('Momentum customer is neither customer nor organisation')
}

const toPhoneNumberType = (
  type: MomentumCustomerCommunicationType
): PhoneNumberType => {
  switch (type) {
    case 'mobile':
      return 'mobile'
    case 'homePhone':
      return 'home'
    case 'phoneWork':
      return 'work'
    case 'intercom':
      return 'intercom'
    default:
      return 'unspecified'
  }
}
