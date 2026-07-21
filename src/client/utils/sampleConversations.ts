export interface SampleConversation {
  id: string;
  title: string;
  description: string;
  clientName: string;
  daysCount: number;
  text: string;
}

export const SAMPLE_CONVERSATIONS: SampleConversation[] = [
  {
    id: "sample-1",
    title: "1-Day Daily Check-In",
    description: "Single-day consultation focusing on immediate hydration, meal prep, and sleep.",
    clientName: "Jordan Hayes",
    daysCount: 1,
    text: `Day 1
Coach Sarah: Good morning Jordan! How did your sleep and nutrition feel yesterday?
Client: Morning Sarah! Slept about 7.5 hours last night. Drank 2.5 liters of water and logged 9,000 steps during my evening walk.
Coach Sarah: Fantastic energy Jordan! How did your lunch prep hold up?
Client: Ate grilled salmon salad for lunch. Had a small headache around 4 PM, but felt much better after drinking more water.`
  },
  {
    id: "sample-2",
    title: "5-Day Multi-Day Progress Review",
    description: "5-day multi-day transcript featuring sleep issues, work deadlines, and knee soreness.",
    clientName: "Alex Vance",
    daysCount: 5,
    text: `Day 1
Coach Sarah: Good morning Alex! Welcome to your wellness check-in. How did your sleep and energy feel over the weekend?
Client: Morning Sarah! Sleep was rough on Saturday, I only got about 4.5 hours of sleep because of a late work deadline. Felt super exhausted on Sunday.
Coach Sarah: Deadline stress can really throw off your circadian rhythm. Did you manage to hit your 2.5 liters water target yesterday?
Client: I drank around 1.5 liters of water yesterday. Forget to drink when I'm locked into work.

Day 2
Coach Sarah: How are we doing today? Did you get a chance to fit in your 30-minute cardio walk?
Client: Yes! Walked around the park during lunch and logged 8,500 steps today.
Coach Sarah: Excellent work! How did your lunch and dinner meal prep hold up?
Client: Lunch was great - grilled chicken salad. But dinner was takeout pizza because meetings ran late until 8 PM.

Day 3
Coach Sarah: Thanks for updating Alex. Let's aim for a quick protein snack before late meetings tonight. How is your knee feeling after yesterday's walk?
Client: My left knee is feeling a bit sore and aching today when going down stairs.
Coach Sarah: Let me know if that soreness persists. Try to focus on light stretching and keep water intake above 2 liters today.

Day 4
Coach Sarah: Checking in on how the knee and hydration are feeling today.
Client: Knee is still aching slightly. I drank 2.2 liters of water today and slept 7 hours last night!
Coach Sarah: Great news on the sleep and water! Let me know if you can manage 7,000 steps today.

Day 5
Coach Sarah: Check-in Alex! How was your overall stress and workload over these 5 days?
Client: Work pressure was extremely high. I felt overwhelmed on Thursday night and almost felt like giving up on diet prep. But I stayed on track on Friday.
Coach Sarah: You showed great resilience Alex. Let's make sure we schedule a 15-min relaxation window each evening.`
  },
  {
    id: "sample-3",
    title: "7-Day Weekly Client Review",
    description: "Full 7-day transcript evaluating nutrition adherence, shoulder recovery, and daily activity.",
    clientName: "Elena Rostova",
    daysCount: 7,
    text: `Day 1
Coach Mark: Hi Elena! How is your shoulder recovery progressing after starting the light resistance band exercises?
Client: Hi Mark! Doing okay. Did 20 minutes of resistance band exercises this morning. Felt a slight tightness in the right shoulder.
Coach Mark: Got it. Did you apply ice after the session as planned?
Client: Yes, iced for 15 minutes right after. Slept about 8 hours last night.

Day 2
Coach Mark: Morning Elena! How's your daily diet and protein intake looking for muscle recovery?
Client: Ate 3 meals today with lean salmon and eggs. Estimated around 110g protein. Also completed 6,200 steps.
Coach Mark: Great habit building! Did you hit your 3 liters of water target?
Client: Hit 3 liters of water easily today. Keeping a marked water bottle at my desk helped a lot.

Day 3
Coach Mark: Checking in on shoulder mobility today.
Client: Shoulder feeling much better today. Slept 7.5 hours.

Day 4
Coach Mark: Great progress Elena. Were you able to do the stretching routine?
Client: Yes, completed 15 minutes of upper body stretching.

Day 5
Coach Mark: How was hydration today?
Client: Drank 2.8 liters of water and logged 7,500 steps.

Day 6
Coach Mark: Weekend check-in Elena! How did meal prep go?
Client: Meal prep went smoothly. Prepared chicken breast and brown rice for the next 2 days.

Day 7
Coach Mark: Wrapping up today's check-in! How do you feel overall after this analyzed period?
Client: Feeling very strong! Shoulder tightness is gone and energy has been consistently high across our recorded check-ins.`
  }
];
