import { MuscleGroupKey } from "../types/muscleRecovery";

export interface MuscleTrainingInfo {
  key: MuscleGroupKey;
  name: string;
  anatomicalName: string;
  category: string;
  primaryStat: string;
  statBonus: string;
  recommendedExercises: Array<{
    name: string;
    type: "Compound" | "Isolation" | "Bodyweight";
    setsReps: string;
    benefit: string;
  }>;
  actionableCues: string[];
  recoveryLore: string;
}

export const MUSCLE_TRAINING_GUIDE: Record<MuscleGroupKey, MuscleTrainingInfo> = {
  CHEST: {
    key: "CHEST",
    name: "Chest",
    anatomicalName: "Pectoralis Major & Pectoralis Minor",
    category: "Upper Push",
    primaryStat: "Strength",
    statBonus: "Strength & Endurance Gains",
    recommendedExercises: [
      { name: "Barbell Flat Bench Press", type: "Compound", setsReps: "3-5 sets of 5-8 reps", benefit: "Maximal mechanical tension & upper body pushing strength" },
      { name: "Incline Dumbbell Press", type: "Compound", setsReps: "3-4 sets of 8-12 reps", benefit: "Upper chest (clavicular head) development" },
      { name: "Weighted Chest Dips", type: "Compound", setsReps: "3 sets of 6-10 reps", benefit: "Lower chest flare & tricep lockout power" },
      { name: "Cable Crossover / Pec Deck", type: "Isolation", setsReps: "3 sets of 12-15 reps", benefit: "Targeted chest contraction at peak stretch" },
      { name: "Deficit Push-ups", type: "Bodyweight", setsReps: "3 sets to near failure", benefit: "Endurance & scapular mobility finisher" }
    ],
    actionableCues: [
      "Retract and pull your shoulder blades down onto the bench before unracking",
      "Lower the barbell to lower sternum under control with a 2-second lowering phase",
      "Keep elbows at a safe 45-degree angle to avoid shoulder strain"
    ],
    recoveryLore: "Heavy pressing creates micro-tears across chest muscle fibers. Requires 48-72h for optimal recovery and protein synthesis."
  },
  FRONT_DELTS: {
    key: "FRONT_DELTS",
    name: "Front Deltoids",
    anatomicalName: "Anterior Deltoid",
    category: "Upper Push",
    primaryStat: "Strength & Focus",
    statBonus: "Strength & Focus Gains",
    recommendedExercises: [
      { name: "Standing Overhead Barbell Press (OHP)", type: "Compound", setsReps: "3-5 sets of 5-8 reps", benefit: "Vertical pressing power and core stabilization" },
      { name: "Seated Dumbbell Shoulder Press", type: "Compound", setsReps: "3-4 sets of 8-10 reps", benefit: "Balanced shoulder development" },
      { name: "Incline Bench Front Dumbbell Raises", type: "Isolation", setsReps: "3 sets of 10-12 reps", benefit: "Strict isolated front delt work" },
      { name: "Pike Push-ups / Handstand Push-ups", type: "Bodyweight", setsReps: "3 sets of 6-10 reps", benefit: "Bodyweight pressing balance and control" }
    ],
    actionableCues: [
      "Brace core and glutes during overhead pressing to protect your lower back",
      "Press the bar in a direct vertical path over mid-foot",
      "Avoid excessive front raise volume if you already bench press heavily"
    ],
    recoveryLore: "Key stabilizer for the shoulder joint. Protects the rotator cuff during pressing and overhead lifts."
  },
  SHOULDERS: {
    key: "SHOULDERS",
    name: "Side Shoulders (Lateral Delts)",
    anatomicalName: "Lateral Deltoid",
    category: "Upper Push / Isolation",
    primaryStat: "Endurance & Discipline",
    statBonus: "Endurance & Shoulder Width",
    recommendedExercises: [
      { name: "Dumbbell Lateral Raises", type: "Isolation", setsReps: "4 sets of 12-15 reps", benefit: "Shoulder cap width and upper body symmetry" },
      { name: "Cable Lateral Raises (Behind Back)", type: "Isolation", setsReps: "3-4 sets of 12-15 reps", benefit: "Constant tension across the entire range of motion" },
      { name: "Dumbbell Arnold Press", type: "Compound", setsReps: "3 sets of 8-12 reps", benefit: "Full shoulder rotation and fiber recruitment" },
      { name: "Leaning Single-Arm Cable Raises", type: "Isolation", setsReps: "3 sets of 15 reps", benefit: "Maximum stretch and continuous tension" }
    ],
    actionableCues: [
      "Lead with your elbows and maintain a slight forward torso lean",
      "Avoid using hip momentum; pause for 1 second at shoulder height",
      "Higher frequency (2-3x per week) with lighter weights accelerates lateral delt growth"
    ],
    recoveryLore: "Composed predominantly of fatigue-resistant muscle fibers that thrive on higher rep volume and frequency."
  },
  REAR_DELTS: {
    key: "REAR_DELTS",
    name: "Rear Deltoids",
    anatomicalName: "Posterior Deltoid",
    category: "Upper Pull",
    primaryStat: "Posture & Joint Health",
    statBonus: "Shoulder Health & Recovery",
    recommendedExercises: [
      { name: "Face Pulls with External Rotation", type: "Isolation", setsReps: "4 sets of 15-20 reps", benefit: "Rotator cuff health & posterior delt thickness" },
      { name: "Bent-Over Dumbbell Rear Delt Flyes", type: "Isolation", setsReps: "3-4 sets of 12-15 reps", benefit: "Direct upper back and shoulder isolation" },
      { name: "Reverse Pec Deck Flyes", type: "Isolation", setsReps: "3 sets of 12-15 reps", benefit: "Strict stabilized rear delt contraction" },
      { name: "Incline Bench Prone Y-Raises", type: "Bodyweight", setsReps: "3 sets of 12 reps", benefit: "Lower trap & posterior chain integration" }
    ],
    actionableCues: [
      "Keep palms facing inward or down and focus on driving elbows outward",
      "Pull towards eye level on face pulls to engage external rotators",
      "Essential for counter-balancing heavy pressing and maintaining upright posture"
    ],
    recoveryLore: "Crucial stabilizer for the upper back and shoulder joint. Restores muscular balance and prevents shoulder impingement."
  },
  TRAPS: {
    key: "TRAPS",
    name: "Trapezius (Traps)",
    anatomicalName: "Superior, Middle & Inferior Trapezius",
    category: "Upper Pull / Back",
    primaryStat: "Upper Back Strength & Power",
    statBonus: "Grip & Pulling Strength",
    recommendedExercises: [
      { name: "Barbell Power Shrugs", type: "Compound", setsReps: "4 sets of 8-12 reps", benefit: "Upper trap mass and heavy spinal loading tolerance" },
      { name: "Heavy Dumbbell Farmer's Walks", type: "Compound", setsReps: "3 rounds of 40m", benefit: "Core stability, trap endurance, and grip strength" },
      { name: "Snatch-Grip Barbell High Pulls", type: "Compound", setsReps: "4 sets of 5-6 reps", benefit: "Explosive triple extension and upper back power" },
      { name: "Kelso Shrugs on Incline Bench", type: "Isolation", setsReps: "3 sets of 12-15 reps", benefit: "Mid and lower trapezius retraction" }
    ],
    actionableCues: [
      "Pause and squeeze at the peak of the shrug for 2 full seconds",
      "Avoid rolling shoulders in circles to prevent neck discomfort",
      "Farmer's carries build exceptional structural stability for heavy compound lifts"
    ],
    recoveryLore: "Supports heavy spinal loading and posture. Traps respond powerfully to heavy loaded carries and explosive pulls."
  },
  LATS: {
    key: "LATS",
    name: "Lats (Upper & Mid Back)",
    anatomicalName: "Latissimus Dorsi & Rhomboids",
    category: "Upper Pull",
    primaryStat: "Pulling Strength",
    statBonus: "Back Width & Pulling Power",
    recommendedExercises: [
      { name: "Weighted Pull-ups / Chin-ups", type: "Compound", setsReps: "3-4 sets of 5-8 reps", benefit: "Gold standard for vertical pulling power and back width" },
      { name: "Barbell Bent-Over Rows", type: "Compound", setsReps: "4 sets of 6-10 reps", benefit: "Back density and spinal erector isometric bracing" },
      { name: "Neutral-Grip Lat Pulldowns", type: "Compound", setsReps: "3-4 sets of 8-12 reps", benefit: "Full stretch and controlled lat contraction" },
      { name: "Chest-Supported T-Bar Rows", type: "Compound", setsReps: "3 sets of 8-12 reps", benefit: "Heavy mid-back rowing without lower back fatigue" },
      { name: "Straight-Arm Cable Pullovers", type: "Isolation", setsReps: "3 sets of 12-15 reps", benefit: "Isolated lat stretch without bicep fatigue" }
    ],
    actionableCues: [
      "Initiate every pull by driving your elbows down toward your back pockets",
      "Achieve a full hang stretch at the bottom of pull-ups to maximize range of motion",
      "Keep chest lifted and avoid rounding your upper back"
    ],
    recoveryLore: "The primary pulling muscle of the upper body. Transfers force across the torso during compound movements."
  },
  LOWER_BACK: {
    key: "LOWER_BACK",
    name: "Lower Back & Spinal Erectors",
    anatomicalName: "Erector Spinae & Quadratus Lumborum",
    category: "Core Posterior",
    primaryStat: "Core Stability & Endurance",
    statBonus: "Spinal Stability & Posture",
    recommendedExercises: [
      { name: "Conventional Barbell Deadlifts", type: "Compound", setsReps: "3-5 sets of 3-5 reps", benefit: "Full posterior chain strength and spinal bracing" },
      { name: "Hyperextensions / Back Extensions", type: "Compound", setsReps: "3 sets of 12-15 reps", benefit: "Spinal erector endurance and glute synergy" },
      { name: "Barbell Good Mornings", type: "Compound", setsReps: "3 sets of 8-10 reps", benefit: "Hip hinge control under moderate barbell load" },
      { name: "Bird-Dog Isometric Holds", type: "Bodyweight", setsReps: "3 sets of 10 per side", benefit: "Lumbar stabilization and deep core activation" }
    ],
    actionableCues: [
      "Take a deep diaphragmatic breath and brace core tightly before lifting",
      "Keep the barbell path tight against your shins and thighs throughout deadlifts",
      "Never round your lower back under heavy spinal loads"
    ],
    recoveryLore: "The central support pillar for the spine. Requires up to 72 hours of recovery after heavy deadlifts or squats."
  },
  BICEPS: {
    key: "BICEPS",
    name: "Biceps & Brachialis",
    anatomicalName: "Biceps Brachii & Brachialis",
    category: "Arms / Upper Pull",
    primaryStat: "Arm Strength",
    statBonus: "Bicep & Grip Strength",
    recommendedExercises: [
      { name: "Standing Barbell Bicep Curls", type: "Compound", setsReps: "3-4 sets of 8-10 reps", benefit: "Heavy bicep overloading and supination power" },
      { name: "Incline Dumbbell Curls", type: "Isolation", setsReps: "3 sets of 10-12 reps", benefit: "Long head stretch and hypertrophy" },
      { name: "Dumbbell Hammer Curls", type: "Isolation", setsReps: "3-4 sets of 8-12 reps", benefit: "Brachialis and forearm thickness" },
      { name: "EZ-Bar Preacher Curls", type: "Isolation", setsReps: "3 sets of 10-12 reps", benefit: "Strict isolation eliminating body sway" }
    ],
    actionableCues: [
      "Keep elbows pinned at your sides and rotate wrists upward at peak contraction",
      "Control the lowering phase for 2-3 seconds on every rep",
      "Incline curls place the bicep under maximum stretch for steady growth"
    ],
    recoveryLore: "Powers pulling movements and elbow flexion. Recovers relatively quickly within 36-48 hours."
  },
  TRICEPS: {
    key: "TRICEPS",
    name: "Triceps",
    anatomicalName: "Triceps Brachii (Lateral, Long & Medial Heads)",
    category: "Arms / Upper Push",
    primaryStat: "Pressing Strength",
    statBonus: "Lockout & Tricep Power",
    recommendedExercises: [
      { name: "Close-Grip Barbell Bench Press", type: "Compound", setsReps: "3-4 sets of 6-8 reps", benefit: "Heavy compound tricep overload and lockout force" },
      { name: "Overhead Rope Tricep Extensions", type: "Isolation", setsReps: "3-4 sets of 10-12 reps", benefit: "Long head stretch and overhead mobility" },
      { name: "EZ-Bar Skull Crushers (Lying Extensions)", type: "Isolation", setsReps: "3 sets of 8-12 reps", benefit: "Medial and lateral head recruitment" },
      { name: "Cable V-Bar Pushdowns", type: "Isolation", setsReps: "3 sets of 12-15 reps", benefit: "Continuous tension and peak contraction" }
    ],
    actionableCues: [
      "Keep elbows tucked and avoid excessive flaring",
      "Overhead extensions are key for fully targeting the long head",
      "Lock out fully at the bottom of cable pushdowns for maximal contraction"
    ],
    recoveryLore: "Comprises 60% of upper arm volume and provides the lockout power in all pressing movements."
  },
  FOREARMS: {
    key: "FOREARMS",
    name: "Forearms & Grip",
    anatomicalName: "Brachioradialis, Flexor & Extensor Carpi",
    category: "Arms / Grip",
    primaryStat: "Grip Strength & Endurance",
    statBonus: "Crushing Grip & Wrist Stability",
    recommendedExercises: [
      { name: "Dead Hangs from Pull-Up Bar", type: "Bodyweight", setsReps: "3 sets for max time (45-90s)", benefit: "Grip endurance and shoulder joint decompression" },
      { name: "Reverse EZ-Bar Forearm Curls", type: "Isolation", setsReps: "3 sets of 12-15 reps", benefit: "Brachioradialis and forearm extensor development" },
      { name: "Dumbbell Wrist Curls (Palms Up & Down)", type: "Isolation", setsReps: "3 sets of 15-20 reps", benefit: "Wrist tendon resilience and flexor strength" },
      { name: "Heavy Hex Dumbbell Pinch Carries", type: "Compound", setsReps: "3 rounds of 30 seconds", benefit: "Pinch grip strength and finger endurance" }
    ],
    actionableCues: [
      "Incorporate dead hangs into daily warmups to decompress the spine and build grip",
      "Avoid using lifting straps on warmup sets to develop natural hand strength",
      "Higher rep ranges (15-25) work best for forearm tendon adaptation"
    ],
    recoveryLore: "Provides the grip strength foundation for holding heavy barbells and dumbbells without slipping."
  },
  ABS: {
    key: "ABS",
    name: "Abdominals (Core)",
    anatomicalName: "Rectus Abdominis & Transverse Abdominis",
    category: "Core Anterior",
    primaryStat: "Core Stability",
    statBonus: "Core Strength & Anti-Extension",
    recommendedExercises: [
      { name: "Hanging Leg Raises / Toes-to-Bar", type: "Bodyweight", setsReps: "3-4 sets of 10-15 reps", benefit: "Lower abdominal recruitment and hip flexor control" },
      { name: "Ab Wheel Rollouts", type: "Bodyweight", setsReps: "3-4 sets of 8-12 reps", benefit: "Anti-extension core strength and transverse bracing" },
      { name: "Kneeling Cable Crunches", type: "Isolation", setsReps: "3 sets of 12-15 reps", benefit: "Progressively overloaded abdominal flexion" },
      { name: "Weighted Plank Holds", type: "Bodyweight", setsReps: "3 sets of 60 seconds", benefit: "Core endurance and anti-extension control" }
    ],
    actionableCues: [
      "Tilt pelvis backward and curl your spine during crunches to work abs rather than hip flexors",
      "Exhale fully at peak contraction for maximum core compression",
      "Abs are revealed through nutrition balance and strengthened through progressive overload"
    ],
    recoveryLore: "The central pillar of core stability. Connects upper and lower body force transfer during athletic movements."
  },
  OBLIQUES: {
    key: "OBLIQUES",
    name: "Obliques & Lateral Core",
    anatomicalName: "External & Internal Obliques",
    category: "Core Lateral",
    primaryStat: "Rotational Core Power",
    statBonus: "Rotational Strength & Stability",
    recommendedExercises: [
      { name: "Standing Cable Woodchoppers (High-to-Low)", type: "Compound", setsReps: "3 sets of 12 per side", benefit: "Rotational torque and athletic core power" },
      { name: "Hanging Windshield Wipers", type: "Bodyweight", setsReps: "3 sets of 8-10 reps per side", benefit: "Advanced rotational core control" },
      { name: "Suitcase Carries (Single-Arm Walk)", type: "Compound", setsReps: "3 rounds of 30m per side", benefit: "Anti-lateral flexion and spinal stabilization" },
      { name: "Side Plank with Hip Dips", type: "Bodyweight", setsReps: "3 sets of 15 per side", benefit: "Lateral core endurance and hip stability" }
    ],
    actionableCues: [
      "Initiate rotations from the core rather than pulling with arms or shoulders",
      "Suitcase carries train obliques to resist asymmetric loads without leaning",
      "Crucial for rotational power and protecting the lower spine"
    ],
    recoveryLore: "Ties the ribcage to the pelvis and controls torso rotation while protecting the spine from twisting under load."
  },
  QUADS: {
    key: "QUADS",
    name: "Quadriceps (Front Thighs)",
    anatomicalName: "Rectus Femoris, Vastus Lateralis, Medialis & Intermedius",
    category: "Legs",
    primaryStat: "Leg Strength",
    statBonus: "Squat Power & Quad Size",
    recommendedExercises: [
      { name: "Barbell Back Squats (High/Low Bar)", type: "Compound", setsReps: "3-5 sets of 5-8 reps", benefit: "Gold standard for lower body strength and quad hypertrophy" },
      { name: "Barbell Front Squats", type: "Compound", setsReps: "3-4 sets of 6-8 reps", benefit: "Upright quad emphasis and core posture" },
      { name: "Bulgarian Split Squats (Dumbbell)", type: "Compound", setsReps: "3 sets of 8-10 per leg", benefit: "Unilateral leg strength, balance, and knee stability" },
      { name: "Leg Press (Close & Low Stance)", type: "Compound", setsReps: "3-4 sets of 10-12 reps", benefit: "Quad overload with zero spinal loading" },
      { name: "Leg Extensions", type: "Isolation", setsReps: "3 sets of 12-15 reps", benefit: "Peak quad contraction and knee extension control" }
    ],
    actionableCues: [
      "Push knees out in line with toes and achieve depth at or below parallel",
      "Keep torso upright during front squats and drive through the mid-foot",
      "Control the descent on Bulgarian split squats to protect the knee joint"
    ],
    recoveryLore: "The primary knee extenders and power drivers for squats and jumps. Requires adequate protein and 48-72h recovery."
  },
  HAMSTRINGS: {
    key: "HAMSTRINGS",
    name: "Hamstrings (Back Thighs)",
    anatomicalName: "Biceps Femoris, Semitendinosus & Semimembranosus",
    category: "Legs Posterior",
    primaryStat: "Posterior Chain Strength",
    statBonus: "Hinge Strength & Sprint Power",
    recommendedExercises: [
      { name: "Romanian Deadlifts (RDLs)", type: "Compound", setsReps: "3-4 sets of 6-10 reps", benefit: "Deep stretch-mediated hamstring growth" },
      { name: "Lying or Seated Leg Curls", type: "Isolation", setsReps: "3-4 sets of 10-12 reps", benefit: "Knee flexion isolation and tendon resilience" },
      { name: "Glute-Ham Raises (GHR)", type: "Bodyweight", setsReps: "3 sets of 6-10 reps", benefit: "Eccentric hamstring strength for sprint deceleration" },
      { name: "Single-Leg Dumbbell RDLs", type: "Compound", setsReps: "3 sets of 8-10 per leg", benefit: "Unilateral hip hinge balance and stabilizer recruitment" }
    ],
    actionableCues: [
      "Push hips backward as if closing a door behind you with your glutes",
      "Keep a soft knee bend and stop descending once your hips stop traveling back",
      "Feel the deep stretch in your hamstrings before driving hips forward"
    ],
    recoveryLore: "Powers hip extension and sprint deceleration. Best trained with deep stretches and controlled eccentric lowering."
  },
  GLUTES: {
    key: "GLUTES",
    name: "Glutes",
    anatomicalName: "Gluteus Maximus, Medius & Minimus",
    category: "Legs Posterior",
    primaryStat: "Hip Power & Strength",
    statBonus: "Hip Extension & Glute Power",
    recommendedExercises: [
      { name: "Barbell Hip Thrusts", type: "Compound", setsReps: "3-4 sets of 8-12 reps", benefit: "Maximal hip extension and peak glute tension" },
      { name: "Sumo Deadlifts", type: "Compound", setsReps: "3-4 sets of 5-8 reps", benefit: "Wide-stance glute and adductor recruitment" },
      { name: "Walking Dumbbell Lunges", type: "Compound", setsReps: "3 sets of 20 total strides", benefit: "Dynamic glute stretch and single-leg strength" },
      { name: "Standing Cable Glute Kickbacks", type: "Isolation", setsReps: "3 sets of 12-15 per leg", benefit: "Direct glute isolation and peak contraction" }
    ],
    actionableCues: [
      "Keep chin tucked and maintain a neutral spine at the top of hip thrusts",
      "Squeeze glutes hard at the top for 1-2 seconds of peak contraction",
      "The largest and most powerful muscle group in the human body"
    ],
    recoveryLore: "The largest and most powerful muscle group in the human body, driving hip extension and posture."
  },
  CALVES: {
    key: "CALVES",
    name: "Calves",
    anatomicalName: "Gastrocnemius & Soleus",
    category: "Legs Lower",
    primaryStat: "Ankle Mobility & Endurance",
    statBonus: "Calf Size & Ankle Stability",
    recommendedExercises: [
      { name: "Standing Barbell Calf Raises", type: "Isolation", setsReps: "4 sets of 12-15 reps", benefit: "Gastrocnemius (straight leg) muscle thickness" },
      { name: "Seated Machine Calf Raises", type: "Isolation", setsReps: "3-4 sets of 15-20 reps", benefit: "Soleus (bent knee) deep muscle hypertrophy" },
      { name: "Donkey Calf Raises / Leg Press Calf Raises", type: "Isolation", setsReps: "3 sets of 15 reps", benefit: "Deep stretch at the bottom of the ankle range" },
      { name: "Jump Rope / Double Unders", type: "Bodyweight", setsReps: "3 rounds of 2 minutes", benefit: "Achilles tendon elasticity and cardiovascular stamina" }
    ],
    actionableCues: [
      "Pause for a full 2-second stretch at the bottom of each rep to eliminate elastic bounce",
      "Press through the big toes and hold the contraction at the top for 1 second",
      "Higher frequency (3-4x weekly) and full range of motion unlocks calf growth"
    ],
    recoveryLore: "Built for endurance and daily walking. Requires full stretch and pause at the bottom of each rep to maximize growth."
  }
};
