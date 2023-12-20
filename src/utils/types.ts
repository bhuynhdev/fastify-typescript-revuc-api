import {
	ArrayOptions,
	IntersectOptions,
	NumericOptions,
	ObjectOptions,
	SchemaOptions,
	StringOptions,
	TArray,
	TInteger,
	TIntersect,
	TNumber,
	TObject,
	TOptional,
	TPartial,
	TSchema,
	TString,
	Type as t,
} from '@sinclair/typebox'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { hacker, identity, judge, sponsor } from '../drizzle/schema'

type TypeboxSchemaOptions<T extends TSchema> = T extends TString
	? StringOptions
	: T extends TArray
	? ArrayOptions
	: T extends TNumber | TInteger
	? NumericOptions<number>
	: T extends TIntersect
	? IntersectOptions
	: T extends TObject | TPartial<T>
	? ObjectOptions
	: SchemaOptions

export function extendSchema<T extends TSchema>(schema: T, options?: TypeboxSchemaOptions<T>): T {
	return { ...options, ...schema }
}

/*
8888888     888                   888    d8b 888             
  888       888                   888    Y8P 888             
  888       888                   888        888             
  888   .d88888  .d88b.  88888b.  888888 888 888888 888  888 
  888  d88" 888 d8P  Y8b 888 "88b 888    888 888    888  888 
  888  888  888 88888888 888  888 888    888 888    888  888 
  888  Y88b 888 Y8b.     888  888 Y88b.  888 Y88b.  Y88b 888 
8888888 "Y88888  "Y8888  888  888  "Y888 888  "Y888  "Y88888 
                                                         888 
                                                    Y8b d88P 
                                                     "Y88P"  
*/

export const IdentityRecordSchema = createSelectSchema(identity, {
	email: (s) => extendSchema(s.email, { format: 'email' }),
})

export const IdentityRecordResponseDto = t.Omit(IdentityRecordSchema, ['password'])

function WithIdentity<T extends TObject>(schema: T) {
	// Set additionalProperties "false" to prevent leakage of fields not defined in schema, e.g. "password"
	return t.Composite([schema, t.Object({ identity: IdentityRecordResponseDto })], { additionalProperties: false })
}

function WithoutIds<T extends TObject<{ id: TOptional<TString>; identityId: TString }>>(schema: T) {
	return t.Omit(schema, ['id', 'identityId'])
}
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
// export const HackerBaseObject = t.Object({
// 	id: t.String(),
// 	firstName: t.String({ examples: ['First'] }),
// 	lastName: t.String({ examples: ['Last'] }),
// 	phone: t.String({ examples: ['1112223333'] }),
// 	birthDate: t.String({ examples: ['05/05/1999'] }),
// 	isMinor: t.Boolean(),
// 	school: t.String({ examples: ['Harvard College'] }),
// 	country: t.String({ examples: ['USA'] }),
// 	major: t.String({ examples: ['Computer Science'] }),
// 	gender: t.Union(
// 		[t.Literal('Male'), t.Literal('Female'), t.Literal('Nonbinary'), t.Literal('Other'), t.Literal('PreferNot')],
// 		{ examples: ['Other'] },
// 	),
// 	ethnicities: t.String({ examples: ['Asian'] }),
// 	shirtSize: t.Union(
// 		[
// 			t.Literal('XSmall'),
// 			t.Literal('Small'),
// 			t.Literal('Medium'),
// 			t.Literal('Large'),
// 			t.Literal('XLarge'),
// 			t.Literal('XXLarge'),
// 		],
// 		{ examples: ['XXLarge'] },
// 	),
// 	howHeard: t.Array(t.String(), { examples: [['2', '3']], collectionFormat: 'multi' }),
// })

const HackerSchema = createSelectSchema(hacker, {
	// Manually convert to Array since Drizzle doesn't product correct Array type: https://github.com/drizzle-team/drizzle-orm/issues/1110
	howHeard: t.Array(t.String()),
	ethnicities: t.Array(t.String()),
})

export const HackerResponseDto = WithIdentity(HackerSchema)

export const HackerCreateDto = t.Composite([
	WithoutIds(createInsertSchema(hacker, { howHeard: t.Array(t.String()), ethnicities: t.Array(t.String()) })),
	t.Object({
		email: t.String({ format: 'email' }),
	}), // Add an `email` field in the creation request body
])

// export const HackerUpdateDto = t.Object({
// 	firstName: t.String({ examples: ['First'] }),
// 	lastName: t.String({ examples: ['Last'] }),
// 	email: t.String({ format: 'email', examples: ['test@email.com'] }),
// 	checkedIn: t.Boolean(),
// 	emailVerified: t.Boolean(),
// })

export const HackerUpdateDto = HackerCreateDto

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

export const JudgeBaseObject = createSelectSchema(judge)

export const JudgeCreateDto = t.Composite([
	WithoutIds(createInsertSchema(judge)),
	t.Object({
		email: t.String({ format: 'email' }),
	}), // Add an `email` field in the creation request body
])

export const JudgeUpdateDto = t.Object({
	category: t.String(),
	name: t.String(),
})

export const JudgeReplyDto = WithIdentity(JudgeBaseObject)

export const UploadProjectCsvDto = t.Object({
	csvFile: t.String({ format: 'binary' }),
})

export const UploadProjectCsvReplyDto = t.Object({
	count: t.Number(),
})

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

export const SponsorBaseObject = createSelectSchema(sponsor)

export const SponsorCreateDto = t.Composite([
	WithoutIds(createInsertSchema(sponsor)),
	t.Object({
		email: t.String({ format: 'email' }),
	}), // Add an `email` field in the creation request body
])

export const SponsorReplyDto = WithIdentity(SponsorBaseObject)

export const HttpError = {
	NotFound: (message = 'Not found') => t.Object({ message: t.String({ examples: [message] }) }),
	Conflict: (message = 'Conflict') => t.Object({ message: t.String({ examples: [message] }) }),
}