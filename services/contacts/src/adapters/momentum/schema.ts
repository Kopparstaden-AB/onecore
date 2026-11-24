import z from 'zod'

export const MomentumCustomerCommunicationTypeSchema = z.enum([
  'email',
  'mobile',
  'homePhone',
  'phoneWork',
  'intercom',
])

export const MomentumCustomerSchema = z.object({
  id: z.string(),
  number: z.string(),
  identityName: z.string(),
  identityLastName: z.string(),
  identityFullName: z.string(),
  identityDateOfBirth: z.string(),
  identityOfficialNumber: z.string(),
  communications: z.array(
    z.object({
      value: z.string(),
      type: z.object({
        id: MomentumCustomerCommunicationTypeSchema,
      }),
      statusChanged: z.coerce.date(),
      statusCreated: z.coerce.date(),
    })
  ),
  isCustomer: z.boolean(),
  isOrganisation: z.boolean(),
})

export const MomentumCustomersResponseSchema = z.object({
  customers: z.object({
    edges: z.array(z.object({ node: MomentumCustomerSchema })),
  }),
})

export type MomentumCustomer = z.infer<typeof MomentumCustomerSchema>
export type MomentumCustomerCommunicationType = z.infer<
  typeof MomentumCustomerCommunicationTypeSchema
>
