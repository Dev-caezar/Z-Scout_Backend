export const DB_NAME = "Z-Scout";
export const POSITIONS = [
  "Goalkeeper",
  "Centre Back",
  "Right Back",
  "Left Back",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Right Winger",
  "Left Winger",
  "Striker",
];

export const requiredFields = [
  "dateOfBirth",
  "gender",
  "nationality",
  "state",
  "city",
  "phoneNumber",
  "primaryPosition",
  "preferredFoot",
  "height",
  "weight",
];

export const allowedFields = [
  "profileImage",
  "coverImage",
  "bio",
  "dateOfBirth",
  "gender",
  "nationality",
  "state",
  "city",
  "phoneNumber",
  "primaryPosition",
  "secondaryPosition",
  "preferredFoot",
  "currentClubOrAcademy",
  "jerseyNumber",
  "height",
  "weight",
  "footballBio",
  "isAvailableForTrials",
  "willingToRelocate",
  "coach",
  "medicalInformation",
  "socialLinks",
];

export const MAX_VIDEOS_PER_PLAYER = 10;

export const NESTED_FIELDS = ["coach", "medicalInformation", "socialLinks"];
export const SENSITIVE_FIELDS =
  "-password -refreshToken -verificationOTP -verificationOTPExpires -passwordResetOTP -passwordResetOTPExpires";
export const VALID_STATUSES = ["pending", "approved", "rejected"];

export const SCOUT_ALLOWED_FIELDS = [
  "isIndependent",
  "organizationName",
  "title",
  "yearsOfExperience",
  "bio",
  "nationality",
  "state",
  "city",
  "regionsCovered",
  "phoneNumber",
  "referenceLink",
  "linkedIn",
];

export const SCOUT_REQUIRED_FIELDS = [
  "title",
  "yearsOfExperience",
  "nationality",
  "state",
  "city",
  "phoneNumber",
];

export const AGE_GROUP_RANGES = {
  U15: { min: 0, max: 15 },
  U17: { min: 16, max: 17 },
  U20: { min: 18, max: 20 },
  Senior: { min: 21, max: 200 },
};
 
export const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
 