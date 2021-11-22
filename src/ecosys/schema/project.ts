import { list } from '@keystone-next/keystone';
import { text, relationship } from '@keystone-next/keystone/fields';

export const projects = list({
  fields: {
    name: text({ validation: { isRequired: true } }),
    address: text({ validation: { isRequired: true } }),
    owner: text({ validation: { isRequired: true } }),
    properties: relationship({ ref: 'Property.project', many: true }),
  },
})
export default projects;