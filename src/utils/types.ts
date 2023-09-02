import { Type as t } from '@sinclair/typebox';

/*

       d8888          888    888      
      d88888          888    888      
     d88P888          888    888      
    d88P 888 888  888 888888 88888b.  
   d88P  888 888  888 888    888 "88b 
  d88P   888 888  888 888    888  888 
 d8888888888 Y88b 888 Y88b.  888  888 
d88P     888  "Y88888  "Y888 888  888 
          
*/

export const AuthRecordBaseObject = t.Object({
  id: t.String(),
  email: t.String({ format: 'email', examples: ['test@email.com'] }),
  password: t.String(),
  emailVerified: t.Boolean(),
  role: t.Union([t.Literal('HACKER'), t.Literal('SPONSOR'), t.Literal('JUDGE')]),
  checkedIn: t.Boolean(),
});

export const AuthRecordReplyDto = t.Omit(AuthRecordBaseObject, ['password']);

/*

888    888                   888                       
888    888                   888                       
888    888                   888                       
8888888888  8888b.   .d8888b 888  888  .d88b.  888d888 
888    888     "88b d88P"    888 .88P d8P  Y8b 888P"   
888    888 .d888888 888      888888K  88888888 888     
888    888 888  888 Y88b.    888 "88b Y8b.     888     
888    888 "Y888888  "Y8888P 888  888  "Y8888  888     
                                                       
*/
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
    [
      t.Literal('Male'),
      t.Literal('Female'),
      t.Literal('Nonbinary'),
      t.Literal('Other'),
      t.Literal('PreferNot'),
    ],
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
  howHeard: t.Array(t.String(), { examples: [['2', '3']], collectionFormat: 'multi' }),
});

export const HackerResponseDto = t.Composite(
  [HackerBaseObject, t.Object({ auth: t.Omit(AuthRecordBaseObject, ['password']) })],
  { additionalProperties: false },
); // Set additionalProperties "false" to prevent leakage of fields not defined in schema, e.g. "password"

export const HackerCreateDto = t.Composite([
  t.Omit(HackerBaseObject, ['id', 'isMinor']),
  t.Object({
    email: t.String({ format: 'email', examples: ['test@email.com'] }),
  }), // Add an `email` field in the creation request body
]);

export const HackerUpdateDto = t.Object({
  firstName: t.String({ examples: ['First'] }),
  lastName: t.String({ examples: ['Last'] }),
  email: t.String({ format: 'email', examples: ['test@email.com'] }),
  checkedIn: t.Boolean(),
  emailVerified: t.Boolean(),
});

/*

  888888               888                   
    "88b               888                   
     888               888                   
     888 888  888  .d88888  .d88b.   .d88b.  
     888 888  888 d88" 888 d88P"88b d8P  Y8b 
     888 888  888 888  888 888  888 88888888 
     88P Y88b 888 Y88b 888 Y88b 888 Y8b.     
     888  "Y88888  "Y88888  "Y88888  "Y8888  
   .d88P                        888          
 .d88P"                    Y8b d88P          
888P"                       "Y88P"           
*/

export const JudgeBaseObject = t.Object({
  id: t.String(),
  name: t.String(),
  category: t.String(),
  company: t.String(),
});

export const JudgeCreateDto = t.Composite([
  t.Omit(JudgeBaseObject, ['id']),
  t.Object({
    email: t.String({ format: 'email', examples: ['judge@email.com'] }),
  }), // Add an `email` field in the creation request body
]);

export const JudgeUpdateDto = t.Object({
  category: t.String(),
  name: t.String(),
});

export const JudgeReplyDto = t.Composite([
  JudgeBaseObject,
  t.Object({
    auth: t.Omit(AuthRecordBaseObject, ['password']),
  }),
]);

export const UploadProjectCsvDto = t.Object({
  csvFile: t.String({ format: 'binary' }),
});

export const UploadProjectCsvReplyDto = t.Object({
  count: t.Number(),
});

/*

 .d8888b.                                                       
d88P  Y88b                                                      
Y88b.                                                           
 "Y888b.   88888b.   .d88b.  88888b.  .d8888b   .d88b.  888d888 
    "Y88b. 888 "88b d88""88b 888 "88b 88K      d88""88b 888P"   
      "888 888  888 888  888 888  888 "Y8888b. 888  888 888     
Y88b  d88P 888 d88P Y88..88P 888  888      X88 Y88..88P 888     
 "Y8888P"  88888P"   "Y88P"  888  888  88888P'  "Y88P"  888     
           888                                                  
           888                                                  
           888                                                  
*/

export const SponsorBaseObject = t.Object({
  id: t.String(),
  name: t.String(),
  company: t.String(),
});

export const SponsorCreateDto = t.Composite([
  t.Omit(SponsorBaseObject, ['id']),
  t.Object({
    email: t.String({ format: 'email', examples: ['sponsor@email.com'] }),
  }), // Add an `email` field in the creation request body
]);

export const SponsorReplyDto = t.Composite([
  SponsorBaseObject,
  t.Object({
    auth: t.Omit(AuthRecordBaseObject, ['password']),
  }),
]);
