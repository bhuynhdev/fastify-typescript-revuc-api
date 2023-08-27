import { Type as t } from '@sinclair/typebox';

export const HackerBaseObject = t.Object({
  id: t.String(),
  firstName: t.String({ examples: ['First'] }),
  lastName: t.String({ examples: ['Last'] }),
  phone: t.String({ examples: ['1112223333'] }),
  birthDate: t.String({ examples: ['05/05/1999'] }),
  isMinor: t.Boolean(),
  school: t.String({ examples: ['Harvard College'] }),
  country: t.String({ examples: ['USA'] }),
  major: t.String({ examples: ['Computer Science'] }),
  gender: t.Union(
    [t.Literal('Male'), t.Literal('Female'), t.Literal('Nonbinary'), t.Literal('Other'), t.Literal('PreferNot')],
    { examples: ['Other'] },
  ),
  ethnicities: t.String({ examples: ['Asian'] }),
  shirtSize: t.Union(
    [
      t.Literal('XSmall'),
      t.Literal('Small'),
      t.Literal('Medium'),
      t.Literal('Large'),
      t.Literal('XLarge'),
      t.Literal('XXLarge'),
    ],
    { examples: ['XXLarge'] },
  ),
  howHeard: t.Array(t.String(), { examples: [['2', '3']], collectionFormat: "multi" }),
});

export const HackerResponseDto = t.Composite([
  HackerBaseObject,
  t.Object({
    auth: t.Object({
      id: t.String(),
      email: t.String({ format: 'email', examples: ['test@email.com'] }),
      checkedIn: t.Boolean(),
      role: t.Union([t.Literal('HACKER'), t.Literal('SPONSOR'), t.Literal('JUDGE')]),
      emailVerified: t.Boolean(),
    })
  }),
], { additionalProperties: false }); // Set additionalProperties "false" to prevent leakage of fields not defined in schema, e.g. "password"

export const HackerCreateDto = t.Composite([
  t.Omit(HackerBaseObject, ['id', 'isMinor']),
  t.Object({
    email: t.String({ format: 'email', examples: ['test@email.com'] }),
  }) // Allow an `email` field in the request body (since we only store the `email` in the AuthRecord table)
]);

export const HackerUpdateDto = t.Object({
  firstName: t.String({ examples: ['First'] }),
  lastName: t.String({ examples: ['Last'] }),
  email: t.String({ format: 'email', examples: ['test@email.com'] }),
  checkedIn: t.Boolean(),
  emailVerified: t.Boolean(),
})
