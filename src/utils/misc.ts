/**
 * Calculate the age of hacker at the hackathon date
 * 
 * Default hackathon date is 02/23/2024
 * @param hackerBirthDate string Birthdate of hacker in string
 */
export function getAgeOfHacker(hackerBirthDate: string, hackathonDate = "02/23/2024"): number {
  // Credit: https://stackoverflow.com/a/10008175/14426823
  const birthDateEpochMs = new Date(hackerBirthDate).valueOf();
  const hackathonDateEpochMs = new Date(hackathonDate).valueOf();
  const diff = hackathonDateEpochMs - birthDateEpochMs; // This is the difference in milliseconds
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}