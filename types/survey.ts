export type SurveyAnswers = {
  goal: string;
  distance: string;
  interests: string[];
  locationPreference: string;
};

export type SurveyRecord = {
  answers?: SurveyAnswers;
  skipped?: boolean;
  completedAt: string;
};

