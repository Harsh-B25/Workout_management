export const EXERCISES_DB = [
  { id:1,  name:"Bench Press",           equipment:"Barbell",    type:"Strength", muscles:["Chest","Triceps"] },
  { id:2,  name:"Squat",                 equipment:"Barbell",    type:"Strength", muscles:["Quads","Glutes"] },
  { id:3,  name:"Deadlift",             equipment:"Barbell",    type:"Strength", muscles:["Back","Hamstrings"] },
  { id:4,  name:"Pull-Up",              equipment:"Bodyweight", type:"Strength", muscles:["Back","Biceps"] },
  { id:5,  name:"Overhead Press",       equipment:"Barbell",    type:"Strength", muscles:["Shoulders","Triceps"] },
  { id:6,  name:"Sumo Squat",           equipment:"Barbell",    type:"Strength", muscles:["Quads","Glutes"] },
  { id:7,  name:"Incline Bench Press",  equipment:"Barbell",    type:"Strength", muscles:["Chest","Shoulders"] },
  { id:8,  name:"Lat Pulldown",         equipment:"Cable",      type:"Strength", muscles:["Back","Biceps"] },
  { id:9,  name:"Leg Press",            equipment:"Machine",    type:"Strength", muscles:["Quads","Glutes"] },
  { id:10, name:"Bicep Curl",           equipment:"Barbell",    type:"Strength", muscles:["Biceps"] },
  { id:11, name:"Triceps Rope Pushdown",equipment:"Cable",      type:"Strength", muscles:["Triceps"] },
  { id:12, name:"Romanian Deadlift",    equipment:"Barbell",    type:"Strength", muscles:["Hamstrings","Glutes"] },
  { id:13, name:"Seated Cable Row",     equipment:"Cable",      type:"Strength", muscles:["Back","Biceps"] },
  { id:14, name:"Face Pull",            equipment:"Cable",      type:"Strength", muscles:["Shoulders"] },
  { id:15, name:"Plank",               equipment:"Bodyweight", type:"Strength", muscles:["Abs"] },
  { id:16, name:"Chest Fly",           equipment:"Machine",    type:"Strength", muscles:["Chest"] },
  { id:17, name:"Lateral Raise",       equipment:"Dumbbell",   type:"Strength", muscles:["Shoulders"] },
  { id:18, name:"Treadmill",           equipment:"Machine",    type:"Cardio",   muscles:["Cardio"] },
];

export const ROUTINES = [
  { id:1, name:"Chest + Tricep",   exercises:[1,7,16,11], desc:"Push Up, Bench Press (Barbell), Chest Fly (Machine), Incline Bench Press (Barbell)..." },
  { id:2, name:"Back + Bicep",     exercises:[3,4,8,13,10], desc:"Deadlift, Pull-Up, Lat Pulldown (Cable), Seated Cable Row, Bicep Curl..." },
  { id:3, name:"Shoulder + Core",  exercises:[5,14,17,15], desc:"Overhead Press, Face Pull (Cable), Lateral Raise, Plank..." },
  { id:4, name:"Leg day",          exercises:[2,6,9,12],  desc:"Squat, Sumo Squat (Barbell), Leg Press (Machine), Romanian Deadlift..." },
];

export const WORKOUT_HISTORY = [
  {
    id:1, name:"Evening workout", date:"2026-03-12", time:"5:23pm", duration:94, volume:10550,
    exercises:[
      { id:5,  name:"Overhead Press (Smith Machine)", sets:[{no:"W",kg:10,reps:15},{no:1,kg:40,reps:10},{no:2,kg:50,reps:8},{no:3,kg:55,reps:6}] },
      { id:14, name:"Face Pull", sets:[{no:1,kg:25,reps:15},{no:2,kg:30,reps:12}] },
      { id:17, name:"Lateral Raise", sets:[{no:1,kg:12,reps:15},{no:2,kg:14,reps:12},{no:3,kg:16,reps:10}] },
    ]
  },
  {
    id:2, name:"Afternoon workout", date:"2026-03-11", time:"2:14pm", duration:85, volume:12860,
    exercises:[
      { id:6,  name:"Sumo Squat (Barbell)",  sets:[{no:1,kg:80,reps:8},{no:2,kg:85,reps:6}] },
      { id:2,  name:"Squat (Barbell)",       sets:[{no:1,kg:100,reps:5},{no:2,kg:105,reps:5}] },
      { id:9,  name:"Leg Press (Machine)",   sets:[{no:1,kg:150,reps:10},{no:2,kg:160,reps:10},{no:3,kg:170,reps:8}] },
    ]
  },
  {
    id:3, name:"Evening workout", date:"2026-03-10", time:"5:23pm", duration:60, volume:6530,
    exercises:[
      { id:1,  name:"Bench Press (Barbell)",       sets:[{no:"W",kg:20,reps:15},{no:1,kg:40,reps:8},{no:2,kg:40,reps:12},{no:3,kg:45,reps:10},{no:4,kg:45,reps:8}] },
      { id:16, name:"Chest Fly (Machine)",         sets:[{no:1,kg:35,reps:15},{no:2,kg:40,reps:12},{no:3,kg:42,reps:10}] },
      { id:11, name:"Triceps Rope Pushdown",       sets:[{no:1,kg:25,reps:15},{no:2,kg:27,reps:12},{no:3,kg:30,reps:10}] },
    ]
  },
];

export const CHART_DATA = [
  { label:"Dec 21", hrs:2.5 }, { label:"Dec 28", hrs:1 }, { label:"Jan 4", hrs:4 },
  { label:"Jan 11", hrs:3 },   { label:"Jan 18", hrs:8.5 }, { label:"Jan 25", hrs:8 },
  { label:"Feb 1",  hrs:4.5 }, { label:"Feb 8",  hrs:4 },  { label:"Feb 15", hrs:4.5 },
  { label:"Feb 22", hrs:4 },   { label:"Mar 1",  hrs:5.5 }, { label:"Mar 8",  hrs:2.5 },
  { label:"Mar 13", hrs:4.5 },
];

export const MUSCLE_GROUPS = ["All","Chest","Back","Shoulders","Biceps","Triceps","Abs","Quads","Hamstrings","Glutes","Cardio"];

export const C = {
  bg: "#0d0f10", surface: "#141618", card: "#1a1d1f", cardHover: "#1f2224",
  border: "#252829", borderMid: "#2e3235", accent: "#1e9bcc", accentBright: "#2db8ef",
  accentDim: "rgba(30,155,204,0.12)", accentText: "#4fc3f7", red: "#ef5350",
  redDim: "rgba(239,83,80,0.12)", green: "#66bb6a", amber: "#ffa726",
  text: "#f0f2f4", textSub: "#8a9099", textDim: "#4a5058", white: "#ffffff",
};

export const SANS = "'Inria Sans', 'Inter', 'Helvetica Neue', Arial, sans-serif";