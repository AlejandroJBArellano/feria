/** Copy aligned with feria-infra/src/lib/onboarding-questions.ts (4 voice steps). */
export const ONBOARDING_QUESTION_COUNT = 4;

export type OnboardingQuestionDef = {
  id: string;
  title: string;
  prompt: string;
};

export const ONBOARDING_QUESTIONS: readonly OnboardingQuestionDef[] = [
  {
    id: 'goal',
    title: 'Tu objetivo',
    prompt:
      '¿Qué te gustaría conseguir al usar Feria para tus finanzas personales? Responde con tu voz.',
  },
  {
    id: 'situation',
    title: 'Tu situación hoy',
    prompt:
      '¿Cómo describirías tu situación con el dinero ahora: apretado, estable, o con margen para ahorrar?',
  },
  {
    id: 'spend_focus',
    title: 'En qué piensas más',
    prompt: '¿Qué tipo de gasto te cuesta más controlar o te preocupa más en el día a día?',
  },
  {
    id: 'checkin',
    title: 'Cómo quieres revisar',
    prompt:
      '¿Con qué frecuencia te gustaría revisar tus números: casi cada día, una vez a la semana, o cuando puedas?',
  },
];
