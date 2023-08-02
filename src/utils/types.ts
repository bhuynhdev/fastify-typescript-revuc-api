import { Type as t } from '@sinclair/typebox';

export const HackerBaseObject = t.Object({
  id: t.String(),
  firstName: t.String({ examples: ['First'] }),
  lastName: t.String({ examples: ['Last'] }),
  email: t.String({ format: 'email', examples: ['test@email.com'] }),
  emailVerified: t.Boolean(),
  phone: t.String({ examples: ['1112223333'] }),
  birthDate: t.String({ examples: ['05/05/1999'] }),
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
  isMinor: t.Boolean(),
});

export const HackerResponseDto = t.Composite([
  HackerBaseObject,
  t.Object({
    auth: t.Object({
      id: t.String(),
      email: t.String(),
      checkedIn: t.Boolean(),
      role: t.Union([t.Literal('HACKER'), t.Literal('SPONSOR'), t.Literal('JUDGE')]),
    })
  }),
], { additionalProperties: false }); // Set additionalProperties "false" to prevent leakage of fields not defined in schema, e.g. "password"

export const HackerCreateDto = t.Omit(HackerBaseObject, ['id', 'emailVerified', 'isMinor']);
