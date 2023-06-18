import { Type as t } from '@sinclair/typebox';

export const HackerTypeboxObject = t.Object({
  id: t.String(),
  firstName: t.String(),
  lastName: t.String(),
  email: t.String(),
  emailVerified: t.Boolean(),
  phone: t.String(),
  birthDate: t.String(),
  school: t.String(),
  country: t.String(),
  major: t.String(),
  gender: t.Union([t.Literal("Male"), t.Literal("Female"), t.Literal("Nonbinary"), t.Literal("Other"), t.Literal("PreferNot")]),
  ethnicities: t.String(),
  shirtSize: t.Union([t.Literal("XSmall"), t.Literal("Small"), t.Literal("Medium"), t.Literal("Large"), t.Literal("XLarge"), t.Literal("XXLarge")]),
  howHeard: t.Array(t.Object({
    reason: t.String()
  })),

  auth: t.Object({
    id: t.String(),
    email: t.String(),
    checkedIn: t.Boolean(),
    role: t.Union([t.Literal("HACKER"), t.Literal("SPONSOR"), t.Literal("JUDGE")])
  })
})