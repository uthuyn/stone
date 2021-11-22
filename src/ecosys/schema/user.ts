import { list } from '@keystone-next/keystone';
import { password, text } from '@keystone-next/keystone/fields';

export const users = list({
  fields: {
    name: text({ validation: { isRequired: true } }),
    // Added an email and password pair to be used with authentication
    // The email address is going to be used as the identity field, so it's
    // important that we set isRequired and isIndexed: 'unique'.
    email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
    // The password field stores a hash of the supplied password, and
    // we want to ensure that all people have a password set, so we use
    // the validation.isRequired flag.
    password: password({ validation: { isRequired: true } })
  },
})
export default users;