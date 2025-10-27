import * as yup from 'yup';

export const twoLevelApprovalSchema = yup.object({
  reviewers: yup
      .string()
      .optional()
      /*@ts-ignore */
      .test('is-valid-usernames', 'Invalid username format', value => {
        if (!value) return true;
        const usernames = value.split(',').map(u => u.trim());
        //   .every(username => /^@[a-zA-Z0-9_]+$/.test(username));
        return usernames;
      }),
});
