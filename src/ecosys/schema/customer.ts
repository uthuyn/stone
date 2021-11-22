import { list } from '@keystone-next/keystone';
import { text, relationship } from '@keystone-next/keystone/fields';

export const customers = list({
  fields: {
    name: text({ validation: { isRequired: true } }),
    phone: text({ validation: { isRequired: true } }),
    email: text({ validation: { isRequired: false } }),
    properties: relationship({ ref: 'Property.owner', many: true }),
  },
})
export default customers;