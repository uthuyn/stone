import { list } from '@keystone-next/keystone';
import { text, relationship } from '@keystone-next/keystone/fields';

export const properties = list({
  ui: { labelField: 'no' },
  fields: {
    no: text({ validation: { isRequired: true } }),
    owner: relationship({
      ref: 'Customer.properties',
      many: false,
      ui: {
        displayMode: 'cards',
        cardFields: ['name', 'phone'],
        removeMode: 'disconnect',
        inlineCreate: { fields: ['name', 'phone'] },
        inlineConnect: true,
      }
    }),
    project: relationship({ ref: 'Project.properties', many: false }),
    addressLine: text({ validation: { isRequired: false } }),
  },
})
export default properties;