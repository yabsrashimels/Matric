import { Question, Subject, Badge } from '../types';
import math2014 from './matric_math_2014EC_practice.json';
import math2015 from './maths/matric_math_2015EC_practice.json.json';
import math2016 from './maths/matric_math_2016EC_practice.json.json';
import physics2014 from './physics/matric_physics_2014ET.json';
import physics2015 from './physics/matric_physics_2015Et.json';
import physics2016 from './physics/matric_physics_2016Et.json';
import biology2008 from './biology/matric_biology_2008Et.json';
import biology2009 from './biology/matric_biology_2009Et.json';
import biology2010 from './biology/matric_biology_2010Et.json';
import chemistry2005 from './chemistry/matric_chemistry_2005Et.json';
import chemistry2014 from './chemistry/matric_chemistry_2014Et.json';
import chemistry2015 from './chemistry/matric_chemistry_2015Et.json';

export const SUBJECTS: Subject[] = [
  {
    id: 'math',
    name: 'Mathematics',
    icon: 'Calculator',
    description: 'Calculus, Vectors, Matrices, Complex Numbers, Sequences and Series.',
    questionCount: 4,
    difficulty: 'Hard'
  },
  {
    id: 'physics',
    name: 'Physics',
    icon: 'Atom',
    description: 'Rotational Dynamics, Electromagnetism, Quantum Mechanics, Thermodynamics.',
    questionCount: 3,
    difficulty: 'Hard'
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: 'Beaker',
    description: 'Chemical Kinetics, Electrochemistry, Chemical Equilibrium, Organic Chemistry.',
    questionCount: 285,
    difficulty: 'Medium'
  },
  {
    id: 'biology',
    name: 'Biology',
    icon: 'Dna',
    description: 'Genetics, Cellular Respiration, Photosynthesis, Human Anatomy and Ecology.',
    questionCount: 303,
    difficulty: 'Medium'
  },
  {
    id: 'english',
    name: 'English',
    icon: 'BookOpen',
    description: 'English Grammar, Word Order, Vocabulary, Reading Comprehension, Phrasal Verbs.',
    questionCount: 3,
    difficulty: 'Easy'
  },
  {
    id: 'ict',
    name: 'ICT',
    icon: 'Cpu',
    description: 'Computer Networks, Database Management, Web Technology, System Security.',
    questionCount: 2,
    difficulty: 'Easy'
  },
  {
    id: 'history',
    name: 'History',
    icon: 'Milestone',
    description: 'Ethiopian History (Battle of Adwa, Aksum), World Wars, and African Decolonization.',
    questionCount: 2,
    difficulty: 'Medium'
  },
  {
    id: 'geography',
    name: 'Geography',
    icon: 'Globe',
    description: 'Drainage Systems of Ethiopia, Map Reading, Climate Zones, and Population.',
    questionCount: 2,
    difficulty: 'Medium'
  },
  {
    id: 'civics',
    name: 'Civics',
    icon: 'Shield',
    description: 'The Federal Constitution, Rule of Law, Democratic Culture, and Patriotic Duties.',
    questionCount: 2,
    difficulty: 'Easy'
  },
  {
    id: 'economics',
    name: 'Economics',
    icon: 'Coins',
    description: 'Microeconomics, Macroeconomics, Inflation, GDP, and the Ethiopian Economy.',
    questionCount: 2,
    difficulty: 'Medium'
  }
];

export const BADGES: Badge[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Answer your first practice question correctly.',
    icon: 'Award',
    requirement: '1 correct answer'
  },
  {
    id: 'streak_3',
    title: 'Consistent Scholar',
    description: 'Maintain a 3-day learning streak.',
    icon: 'Flame',
    requirement: '3-day streak'
  },
  {
    id: 'perfect_10',
    title: 'Perfect Ten',
    description: 'Answer 10 questions correctly in practice.',
    icon: 'CheckCircle',
    requirement: '10 correct answers'
  },
  {
    id: 'subject_master',
    title: 'Subject Scholar',
    description: 'Complete all questions in any single subject.',
    icon: 'Star',
    requirement: 'All questions in one subject completed'
  },
  {
    id: 'mock_champion',
    title: 'Mock Champion',
    description: 'Score 80% or higher in a Full Mock Exam.',
    icon: 'Trophy',
    requirement: '>= 80% on Mock Exam'
  },
  {
    id: 'xp_warrior',
    title: 'XP Overlord',
    description: 'Earn a total of 1000 XP on the platform.',
    icon: 'Zap',
    requirement: '1000 XP reached'
  }
];

// Keep base questions in `baseQuestions` then merge with imported 2014 math items below.
const baseQuestions: Question[] = [
  // MATHEMATICS
  {
    id: 1,
    subject: 'Mathematics',
    topic: 'Differentiation',
    difficulty: 'Medium',
    year: 2016,
    question: 'If f(x) = ln(x² + 3x), what is f\' (x)?',
    options: [
      '1 / (x² + 3x)',
      '(2x + 3) / (x² + 3x)',
      '2x + 3',
      '(x² + 3x) / (2x + 3)'
    ],
    correctAnswer: '(2x + 3) / (x² + 3x)',
    explanation: 'By applying the chain rule of differentiation: d/dx[ln(g(x))] = g\' (x) / g(x). Here, g(x) = x² + 3x, so g\' (x) = 2x + 3. Thus, f\' (x) = (2x + 3) / (x² + 3x). This is a frequent concept in the Grade 12 National Exam under differentiation.',
    incorrectExplanations: {
      '1 / (x² + 3x)': 'This only differentiates the natural log outer function without applying the Chain Rule to the inner function (x² + 3x).',
      '2x + 3': 'This is only the derivative of the inner function g\' (x). It neglects the natural log outer function.',
      '(x² + 3x) / (2x + 3)': 'This is the reciprocal of the correct derivative. Remember that derivative of ln(u) is u\'/u, not u/u\'.'
    },
    reference: 'Grade 12 Mathematics Textbook, Unit 3: Introduction to Calculus',
    hint: 'Use the Chain Rule: d/dx[ln(u)] = (1/u) * du/dx.',
    time: '45 seconds'
  },
  {
    id: 2,
    subject: 'Mathematics',
    topic: 'Matrices',
    difficulty: 'Hard',
    year: 2015,
    question: 'What is the determinant of the matrix A = [[2, 1], [4, 7]]?',
    options: [
      '10',
      '14',
      '6',
      '18'
    ],
    correctAnswer: '10',
    explanation: 'For a 2x2 matrix [[a, b], [c, d]], the determinant is given by (ad - bc). Here, a = 2, b = 1, c = 4, and d = 7. Thus, Det(A) = (2 * 7) - (1 * 4) = 14 - 4 = 10. Matrices and Determinants are always featured in the Ethiopian Grade 12 Mathematics exam.',
    incorrectExplanations: {
      '14': 'This is just the product of the principal diagonal elements (a * d). You forgot to subtract the secondary diagonal product (b * c).',
      '6': 'This is calculated as (ad - 2*bc) or a mistake in arithmetic subtraction (14 - 8 instead of 14 - 4).',
      '18': 'This is calculated by adding the secondary diagonal product (ad + bc) instead of subtracting it.'
    },
    reference: 'Grade 12 Mathematics Textbook, Unit 1: Sequences and Matrices',
    hint: 'Apply the formula: det(A) = ad - bc.',
    time: '30 seconds'
  },
  {
    id: 3,
    subject: 'Mathematics',
    topic: 'Limits',
    difficulty: 'Medium',
    year: 2016,
    question: 'Find the limit: lim(x -> 3) (x² - 9) / (x - 3).',
    options: [
      '3',
      '6',
      '0',
      'Undefined'
    ],
    correctAnswer: '6',
    explanation: 'Direct substitution gives the indeterminate form 0/0. Factoring the numerator as a difference of squares: x² - 9 = (x - 3)(x + 3). The limit becomes lim(x -> 3) [(x - 3)(x + 3)] / (x - 3) = lim(x -> 3) (x + 3) = 3 + 3 = 6. Alternatively, L\'Hopital\'s Rule can be applied to give 2x / 1, which evaluates to 6 at x = 3.',
    incorrectExplanations: {
      '3': 'This is the value of x we are approaching, or a computational error where you forgot to add the final 3.',
      '0': 'This is obtained by incorrectly substituting x=3 into the numerator without factoring or dividing out the common term.',
      'Undefined': 'While direct substitution yields 0/0, the limit itself exists and can be resolved by algebraic simplification or L\'Hopital\'s rule.'
    },
    reference: 'Grade 12 Mathematics Textbook, Unit 2: Limits and Continuity',
    hint: 'Factor the numerator (x² - 9) as a difference of squares, cancel out the common factor (x - 3), then evaluate.',
    time: '40 seconds'
  },
  {
    id: 4,
    subject: 'Mathematics',
    topic: 'Integration',
    difficulty: 'Hard',
    year: 2014,
    question: 'Evaluate the definite integral: ∫(from 0 to 2) 3x² dx.',
    options: [
      '4',
      '8',
      '12',
      '16'
    ],
    correctAnswer: '8',
    explanation: 'The antiderivative of 3x² is x³. Evaluating x³ from 0 to 2 gives [2³ - 0³] = 8 - 0 = 8. Definite integrals are crucial components of Grade 12 National Exams, testing the fundamental theorem of calculus.',
    incorrectExplanations: {
      '4': 'This might come from an incorrect power integration rule, such as integrating 3x² to 1.5x² instead of x³.',
      '12': 'This is f(2) multiplied by 1.5, or a computation error. Remember to raise the exponent by 1 and divide by the new exponent: ∫ x^n dx = x^(n+1)/(n+1).',
      '16': 'This is 2^4, which is a calculation error in raising the power of the integral boundary values.'
    },
    reference: 'Grade 12 Mathematics Textbook, Unit 4: Integral Calculus',
    hint: 'Find the antiderivative of 3x² which is x³, then evaluate at the bounds x = 2 and x = 0.',
    time: '50 seconds'
  },

  // PHYSICS
  {
    id: 5,
    subject: 'Physics',
    topic: 'Rotational Motion',
    difficulty: 'Hard',
    year: 2016,
    question: 'A flywheel accelerates from rest to an angular velocity of 12 rad/s in 4 seconds. What is its angular acceleration in rad/s²?',
    options: [
      '3 rad/s²',
      '48 rad/s²',
      '0.33 rad/s²',
      '6 rad/s²'
    ],
    correctAnswer: '3 rad/s²',
    explanation: 'Angular acceleration (α) is defined as the change in angular velocity (Δω) divided by the change in time (Δt). Here, α = (ω_final - ω_initial) / t = (12 rad/s - 0 rad/s) / 4 s = 3 rad/s². This mirrors linear acceleration (a = v/t) in rotational kinematics.',
    incorrectExplanations: {
      '48 rad/s²': 'This is calculated by multiplying angular velocity and time (12 * 4), which is incorrect. Kinematic variables are divided, not multiplied, to find acceleration.',
      '0.33 rad/s²': 'This is the reciprocal of the acceleration (4 / 12). Remember that acceleration is change in velocity over time, not time over velocity.',
      '6 rad/s²': 'This would be the average velocity over that interval if the acceleration were different, or a basic division mistake.'
    },
    reference: 'Grade 12 Physics Textbook, Unit 1: Rotational Motion',
    hint: 'Use the rotational kinematics formula: ω = ω_0 + αt, and solve for α.',
    time: '45 seconds'
  },
  {
    id: 6,
    subject: 'Physics',
    topic: 'Electromagnetism',
    difficulty: 'Medium',
    year: 2015,
    question: 'According to Faraday\'s law of electromagnetic induction, what is induced in a coil when the magnetic flux linking it changes?',
    options: [
      'Electric Charge',
      'Electromotive Force (EMF)',
      'Electrostatic Force',
      'Magnetic Field Strength'
    ],
    correctAnswer: 'Electromotive Force (EMF)',
    explanation: 'Faraday\'s law states that a changing magnetic flux induces an electromotive force (EMF) in any closed loop. The magnitude of the induced EMF is proportional to the rate of change of magnetic flux: ε = -N(dΦ_B / dt). This is a standard concept in electrodynamics.',
    incorrectExplanations: {
      'Electric Charge': 'While charges will flow if the circuit is closed, the fundamental quantity induced by changing flux is the potential difference or electromotive force (EMF).',
      'Electrostatic Force': 'Electrostatic force is the force between stationary electric charges, not an induced voltage from moving fields.',
      'Magnetic Field Strength': 'The magnetic field strength exists independently. It is the CHANGE of its flux that induces an EMF.'
    },
    reference: 'Grade 12 Physics Textbook, Unit 4: Electromagnetism',
    hint: 'Look for the term representing the induced voltage or electrical pressure created in the loop.',
    time: '30 seconds'
  },
  {
    id: 7,
    subject: 'Physics',
    topic: 'Thermodynamics',
    difficulty: 'Hard',
    year: 2014,
    question: 'In which thermodynamic process does the volume of the gas remain constant?',
    options: [
      'Isothermal Process',
      'Isobaric Process',
      'Isochoric Process',
      'Adiabatic Process'
    ],
    correctAnswer: 'Isochoric Process',
    explanation: 'An isochoric (or isovolumetric) process is a thermodynamic process in which the volume remains constant (ΔV = 0). Consequently, the work done by the gas is zero (W = PΔV = 0), and all heat added goes into changing the internal energy (ΔU = Q).',
    incorrectExplanations: {
      'Isothermal Process': 'In an isothermal process, the temperature remains constant (ΔT = 0).',
      'Isobaric Process': 'In an isobaric process, the pressure remains constant (ΔP = 0).',
      'Adiabatic Process': 'In an adiabatic process, there is no heat exchange between the system and its surroundings (Q = 0).'
    },
    reference: 'Grade 11/12 Physics Textbook, Unit on Thermodynamics',
    hint: 'Think of the Greek word roots: "iso-" means equal, and "-choric" refers to space or volume.',
    time: '30 seconds'
  },

  // CHEMISTRY
  {
    id: 8,
    subject: 'Chemistry',
    topic: 'Chemical Kinetics',
    difficulty: 'Medium',
    year: 2016,
    question: 'What is the unit of the rate constant (k) for a first-order chemical reaction?',
    options: [
      'mol / (L · s)',
      'L / (mol · s)',
      's⁻¹',
      'L² / (mol² · s)'
    ],
    correctAnswer: 's⁻¹',
    explanation: 'For a first-order reaction, the rate law is Rate = k[A]. The rate is in units of M/s (mol/L·s) and concentration [A] is in M (mol/L). Solving for k: k = Rate / [A] = (M/s) / M = 1/s = s⁻¹. This is a highly tested topic in Grade 12 Chemistry kinetics.',
    incorrectExplanations: {
      'mol / (L · s)': 'This is the unit of the reaction rate itself (M/s) or the rate constant of a zero-order reaction.',
      'L / (mol · s)': 'This is the unit of the rate constant (k) for a second-order reaction (M⁻¹s⁻¹).',
      'L² / (mol² · s)': 'This is the unit of the rate constant (k) for a third-order reaction (M⁻²s⁻¹).'
    },
    reference: 'Grade 12 Chemistry Textbook, Unit 1: Reaction Rates and Chemical Equilibrium',
    hint: 'Recall that rate = k[A]^n. Match the units on both sides of the equation when n = 1.',
    time: '45 seconds'
  },
  {
    id: 9,
    subject: 'Chemistry',
    topic: 'Electrochemistry',
    difficulty: 'Medium',
    year: 2015,
    question: 'In an electrochemical cell (Galvanic cell), where does the oxidation half-reaction occur?',
    options: [
      'Cathode',
      'Anode',
      'Salt Bridge',
      'Voltmeter'
    ],
    correctAnswer: 'Anode',
    explanation: 'Oxidation is the loss of electrons. By definition, the anode is the electrode where oxidation occurs. Reduction (gain of electrons) occurs at the cathode. A helpful mnemonic is "An Ox" (Anode = Oxidation) and "Red Cat" (Reduction = Cathode).',
    incorrectExplanations: {
      'Cathode': 'Reduction (gain of electrons) occurs at the cathode. "Red Cat" is a useful mnemonic to remember this.',
      'Salt Bridge': 'The salt bridge only serves to maintain electrical neutrality by permitting the migration of ions between compartments.',
      'Voltmeter': 'The voltmeter measures the potential difference (voltage) between the electrodes, but no chemical reactions occur inside it.'
    },
    reference: 'Grade 12 Chemistry Textbook, Unit 4: Electrochemistry',
    hint: 'Use the mnemonic "An Ox, Red Cat" to associate the electrode names with their chemical half-reactions.',
    time: '25 seconds'
  },
  {
    id: 10,
    subject: 'Chemistry',
    topic: 'Chemical Equilibrium',
    difficulty: 'Hard',
    year: 2016,
    question: 'For the exothermic reaction: N₂(g) + 3H₂(g) ⇌ 2NH₃(g) + Heat, what happens to the equilibrium if the temperature is increased?',
    options: [
      'Shifts to the right (more NH₃ produced)',
      'Shifts to the left (more N₂ and H₂ produced)',
      'No change in equilibrium position',
      'The reaction stops completely'
    ],
    correctAnswer: 'Shifts to the left (more N₂ and H₂ produced)',
    explanation: 'According to Le Chatelier\'s principle, adding heat to an exothermic reaction (where heat is treated as a product) causes the system to shift in the direction that absorbs heat (the reverse, endothermic direction). Therefore, increasing the temperature shifts the equilibrium to the left, decreasing the yield of NH₃.',
    incorrectExplanations: {
      'Shifts to the right (more NH₃ produced)': 'Shifting to the right would release more heat, which would counteract Le Chatelier\'s principle since we are already heating the system.',
      'No change in equilibrium position': 'Temperature changes affect both the equilibrium position and the value of the equilibrium constant (K_c). Only catalysts change the rate without changing the equilibrium position.',
      'The reaction stops completely': 'Reactions in dynamic equilibrium never stop; the forward and reverse rates remain non-zero and equal.'
    },
    reference: 'Grade 12 Chemistry Textbook, Unit 1: Chemical Equilibrium and Rates of Reaction',
    hint: 'Consider heat as a product. Increasing temperature is like adding more product, so the system will shift to consume it.',
    time: '40 seconds'
  },

  // BIOLOGY
  {
    id: 11,
    subject: 'Biology',
    topic: 'Genetics',
    difficulty: 'Medium',
    year: 2016,
    question: 'If a plant heterozygous for tallness (Tt) is crossed with a homozygous recessive dwarf plant (tt), what is the expected phenotypic ratio of tall to dwarf offspring?',
    options: [
      '3:1',
      '1:1',
      '1:2:1',
      'All tall'
    ],
    correctAnswer: '1:1',
    explanation: 'This is a test cross. Crossing Tt (heterozygous tall) with tt (homozygous recessive) yields genotypes: 50% Tt (tall) and 50% tt (dwarf). Therefore, the phenotypic ratio is 1 tall : 1 dwarf (or 1:1). Mendel\'s laws of inheritance are key to Grade 12 Biology matric exams.',
    incorrectExplanations: {
      '3:1': 'This is the phenotypic ratio obtained when crossing two heterozygotes (Tt x Tt).',
      '1:2:1': 'This is the GENOTYPIC ratio (TT:Tt:tt) of a monohybrid cross between two heterozygotes, not the phenotypic ratio of a test cross.',
      'All tall': 'This would be the result if we crossed homozygous tall (TT) with dwarf (tt).'
    },
    reference: 'Grade 12 Biology Textbook, Unit 2: Genetics and Evolution',
    hint: 'Set up a 2x2 Punnett square crossing T and t with t and t.',
    time: '35 seconds'
  },
  {
    id: 12,
    subject: 'Biology',
    topic: 'Cellular Respiration',
    difficulty: 'Hard',
    year: 2015,
    question: 'What is the primary site of ATP synthesis during the electron transport chain of cellular respiration?',
    options: [
      'Cytoplasm',
      'Inner Mitochondrial Membrane',
      'Mitochondrial Matrix',
      'Ribosome'
    ],
    correctAnswer: 'Inner Mitochondrial Membrane',
    explanation: 'The electron transport chain (ETC) is located in the inner mitochondrial membrane (cristae). Protons are pumped into the intermembrane space, creating a gradient. Protons flow back through ATP synthase located in this membrane, synthesizing ATP (oxidative phosphorylation).',
    incorrectExplanations: {
      'Cytoplasm': 'The cytoplasm is the site of Glycolysis, which produces only 2 net ATP molecules.',
      'Mitochondrial Matrix': 'The Krebs cycle (Citric Acid Cycle) occurs in the mitochondrial matrix, not the Electron Transport Chain.',
      'Ribosome': 'The ribosome is the organelle responsible for protein translation and synthesis, not cellular respiration or ATP synthesis.'
    },
    reference: 'Grade 11 Biology Textbook, Unit 4: Cell Biology and Metabolism',
    hint: 'Think about where the electron transport chain complexes and ATP synthase are embedded.',
    time: '30 seconds'
  },
  {
    id: 13,
    subject: 'Biology',
    topic: 'Human Biology',
    difficulty: 'Easy',
    year: 2014,
    question: 'Which hormone is responsible for lowering blood glucose levels by promoting its uptake into body cells?',
    options: [
      'Glucagon',
      'Adrenaline',
      'Insulin',
      'Thyroxine'
    ],
    correctAnswer: 'Insulin',
    explanation: 'Insulin is secreted by the beta cells of the islets of Langerhans in the pancreas. It lowers blood glucose levels by assisting the transport of glucose into body cells and converting excess glucose into glycogen in the liver.',
    incorrectExplanations: {
      'Glucagon': 'Glucagon raises blood glucose levels by triggering the breakdown of glycogen into glucose in the liver.',
      'Adrenaline': 'Adrenaline prepares the body for "fight or flight" and raises glucose levels for immediate energy, but does not lower it.',
      'Thyroxine': 'Thyroxine is produced by the thyroid gland and regulates the basal metabolic rate, not immediate blood sugar regulation.'
    },
    reference: 'Grade 11 Biology Textbook, Unit 5: Coordination and Control',
    hint: 'This hormone is critical for diabetes management and is produced by the pancreas when blood sugar is high.',
    time: '20 seconds'
  },

  // ENGLISH
  {
    id: 14,
    subject: 'English',
    topic: 'Grammar',
    difficulty: 'Easy',
    year: 2016,
    question: 'Complete the sentence: If I _______ his phone number, I would have called him yesterday.',
    options: [
      'had known',
      'knew',
      'know',
      'have known'
    ],
    correctAnswer: 'had known',
    explanation: 'This is a Type 3 (Third) Conditional sentence, which describes unreal past events. The structure is: If + past perfect (had known), would have + past participle (would have called). "Yesterday" indicates a past context, making the third conditional mandatory.',
    incorrectExplanations: {
      'knew': 'This is the simple past, used in Type 2 Conditionals for hypothetical present/future states (e.g., "If I knew, I would call him today").',
      'know': 'This is the present tense, used in Type 1 or Zero Conditionals.',
      'have known': 'This is the present perfect, which does not fit standard conditional tense matching rules.'
    },
    reference: 'Grade 12 English Syllabus, Unit on Conditionals',
    hint: 'Look at "would have called" in the main clause. It indicates you need a past perfect tense in the conditional clause.',
    time: '20 seconds'
  },
  {
    id: 15,
    subject: 'English',
    topic: 'Vocabulary',
    difficulty: 'Easy',
    year: 2015,
    question: 'Choose the correct preposition: She has been living in Addis Ababa _______ 2018.',
    options: [
      'for',
      'since',
      'during',
      'at'
    ],
    correctAnswer: 'since',
    explanation: '"Since" is used to denote a specific starting point in time (2018), while "for" is used to describe a duration or period of time (e.g., "for 6 years"). "She has been living..." is in the present perfect continuous tense, which often pairs with "since" or "for".',
    incorrectExplanations: {
      'for': 'This would require a span of time, such as "for eight years," not a specific starting calendar year like 2018.',
      'during': 'While "during" refers to a time block, it is not used as the preposition of origin/start with perfect tenses.',
      'at': '"At" is used for specific times of day or localized points, not starting points for elapsed years.'
    },
    reference: 'Grade 11/12 English, Tenses and Prepositions',
    hint: 'Identify if 2018 is a specific starting point or a duration of time.',
    time: '15 seconds'
  },
  {
    id: 16,
    subject: 'English',
    topic: 'Word Order',
    difficulty: 'Medium',
    year: 2016,
    question: 'Identify the correct word order for the descriptive adjectives: She bought a _______ table.',
    options: [
      'beautiful round wooden brown',
      'beautiful round brown wooden',
      'wooden beautiful round brown',
      'brown beautiful round wooden'
    ],
    correctAnswer: 'beautiful round brown wooden',
    explanation: 'The standard English order of adjectives is: Opinion (beautiful) -> Size -> Age -> Shape (round) -> Color (brown) -> Origin -> Material (wooden) -> Purpose. Following this hierarchy (Opinion, Shape, Color, Material) gives "beautiful round brown wooden".',
    incorrectExplanations: {
      'beautiful round wooden brown': 'This places Material (wooden) before Color (brown). In English grammar, color comes before material.',
      'wooden beautiful round brown': 'This incorrectly places the Material (wooden) at the very start, which should be reserved for the Opinion (beautiful).',
      'brown beautiful round wooden': 'This places the Color (brown) before the Opinion (beautiful) and Shape (round).'
    },
    reference: 'Grade 12 English Grammar, Adjective Ordering Guidelines',
    hint: 'Remember the acronym royal order of adjectives: Opinion, Size, Physical Quality, Shape, Age, Color, Origin, Material.',
    time: '30 seconds'
  },

  // ICT
  {
    id: 17,
    subject: 'ICT',
    topic: 'Networking',
    difficulty: 'Easy',
    year: 2015,
    question: 'Which of the following IP addresses represents a private IPv4 address often used in local area networks (LAN)?',
    options: [
      '8.8.8.8',
      '192.168.1.1',
      '256.100.0.1',
      '12.0.0.1'
    ],
    correctAnswer: '192.168.1.1',
    explanation: 'According to RFC 1918, the address range 192.168.0.0 to 192.168.255.255 is reserved for private local networks. Address 8.8.8.8 is a public DNS IP owned by Google, 256.100.0.1 is invalid because IP octets cannot exceed 255.',
    incorrectExplanations: {
      '8.8.8.8': 'This is a public IP address (Google\'s Public DNS resolver), not a private address.',
      '256.100.0.1': 'This is an invalid IP address. IPv4 octets must only range between 0 and 255.',
      '12.0.0.1': 'This is a public Class A address registered to AT&T, not a designated private LAN subnet.'
    },
    reference: 'Grade 12 ICT Textbook, Unit 2: Computer Networks',
    hint: 'Look for the address commonly seen on home routers or office networks starting with 192.',
    time: '25 seconds'
  },
  {
    id: 18,
    subject: 'ICT',
    topic: 'Web Design',
    difficulty: 'Easy',
    year: 2016,
    question: 'Which HTML tag is used to create a hyperlink to another web page?',
    options: [
      '&lt;link&gt;',
      '&lt;a&gt;',
      '&lt;href&gt;',
      '&lt;hlink&gt;'
    ],
    correctAnswer: '<a>',
    explanation: 'The anchor tag &lt;a&gt; along with the href attribute is used in HTML to define hyperlinks. Example: &lt;a href="url"&gt;Text&lt;/a&gt;. The &lt;link&gt; tag, on the other hand, is used to link external stylesheets or assets, not for direct user-clickable hyperlinks.',
    incorrectExplanations: {
      '<link>': 'The <link> tag is used to define relationships with external resources (like loading CSS stylesheets), not for inline text hyperlinks.',
      '<href>': 'There is no <href> tag; "href" is an attribute of the <a> (anchor) tag, standing for Hypertext Reference.',
      '<hlink>': 'This is a fictional tag and does not exist in the HTML specification.'
    },
    reference: 'Grade 11/12 ICT, HTML and Web Technologies',
    hint: 'This stands for "anchor" and is the single letter "a".',
    time: '15 seconds'
  },

  // HISTORY
  {
    id: 19,
    subject: 'History',
    topic: 'Ethiopian History',
    difficulty: 'Medium',
    year: 2015,
    question: 'In which year did the historic Battle of Adwa take place, resulting in an Ethiopian victory over the Italian forces?',
    options: [
      '1889',
      '1896',
      '1935',
      '1941'
    ],
    correctAnswer: '1896',
    explanation: 'The Battle of Adwa took place on March 1, 1896 (Yekatit 23, 1888 Ethiopian Calendar). Ethiopian forces under Emperor Menelik II and Empress Taytu Betul defeated the invading Italian army, securing Ethiopian sovereignty. This is a vital milestone in modern African history.',
    incorrectExplanations: {
      '1889': 'This is the year the Treaty of Wuchale was signed, and also the year Emperor Menelik II ascended to the imperial throne, preceding the battle by 7 years.',
      '1935': 'This is the year Italy launched its second, fascist invasion of Ethiopia under Benito Mussolini.',
      '1941': 'This is the year of the liberation of Addis Ababa, marking the end of the Italian occupation during World War II.'
    },
    reference: 'Grade 12 History Textbook, Unit on the Patriotic Resistance and Sovereignty',
    hint: 'It occurred in the late 19th century, exactly 4 years before the turn of the century.',
    time: '20 seconds'
  },
  {
    id: 20,
    subject: 'History',
    topic: 'African Decolonization',
    difficulty: 'Medium',
    year: 2016,
    question: 'Which conference in 1884-1885 laid down the ground rules for the partition and colonization of Africa by European powers?',
    options: [
      'The Berlin Conference',
      'The Versailles Conference',
      'The Brussels Conference',
      'The London Conference'
    ],
    correctAnswer: 'The Berlin Conference',
    explanation: 'The Berlin Conference of 1884-1885, organized by Otto von Bismarck, regulated European colonization and trade in Africa during the Scramble for Africa. It formalized the partition of the continent, with only Ethiopia and Liberia successfully remaining independent.',
    incorrectExplanations: {
      'The Versailles Conference': 'This conference was held in 1919 after World War I to write the treaties ending the war, notably the Treaty of Versailles.',
      'The Brussels Conference': 'The Brussels Conference of 1890 was related to slavery abolition, but did not partition the continent of Africa.',
      'The London Conference': 'The London conferences were various historical meetings but none were responsible for the "Scramble for Africa" partition.'
    },
    reference: 'Grade 12 History Textbook, Unit on Colonization and Partition of Africa',
    hint: 'This conference was hosted by the Chancellor of Germany in Germany\'s capital.',
    time: '20 seconds'
  },

  // GEOGRAPHY
  {
    id: 21,
    subject: 'Geography',
    topic: 'Drainage Systems',
    difficulty: 'Medium',
    year: 2016,
    question: 'Which of the following rivers is the longest and drains into the Mediterranean Sea, with its main source being Lake Tana in Ethiopia?',
    options: [
      'The Abbay River (Blue Nile)',
      'The Awash River',
      'The Genale River',
      'The Wabi Shebelle River'
    ],
    correctAnswer: 'The Abbay River (Blue Nile)',
    explanation: 'The Abbay River (known internationally as the Blue Nile) originates from Lake Tana in the Ethiopian Highlands. It merges with the White Nile in Khartoum, Sudan, to form the Nile River, which is the longest river in the world, draining into the Mediterranean Sea. The Abbay contributes over 80% of the Nile\'s total water volume.',
    incorrectExplanations: {
      'The Awash River': 'The Awash is an endorheic (internal drainage) river, meaning it does not reach any ocean, but drains into Lake Abbe near the Djibouti border.',
      'The Genale River': 'The Genale flow southeastwards towards Somalia to join the Dawa, forming the Jubba River which drains into the Indian Ocean.',
      'The Wabi Shebelle River': 'The Wabi Shebelle is the longest river inside Ethiopia, but it flows southeast into Somalia, draining into the Indian Ocean (or drying up in the sand near the Jubba river).'
    },
    reference: 'Grade 12 Geography Textbook, Unit 2: Drainage Systems of Ethiopia',
    hint: 'It is the most famous river in Ethiopian history, also known as the Blue Nile, and the source of the Grand Ethiopian Renaissance Dam (GERD).',
    time: '25 seconds'
  },
  {
    id: 22,
    subject: 'Geography',
    topic: 'Climate Zones',
    difficulty: 'Medium',
    year: 2015,
    question: 'In the traditional climate zoning of Ethiopia, which zone represents the cold highland areas located at altitudes above 3,300 meters?',
    options: [
      'Wurch (Alpine)',
      'Dega (Temperate)',
      'Woina Dega (Sub-tropical)',
      'Kolla (Tropical)'
    ],
    correctAnswer: 'Wurch (Alpine)',
    explanation: 'Traditional climate zones of Ethiopia are based on altitude. "Wurch" represents the afro-alpine climate zone at altitudes above 3,300 meters with temperatures below 10°C. "Dega" is 2,300 - 3,300m (temperate), "Woina Dega" is 1,500 - 2,300m (sub-tropical/warm), and "Kolla" is 500 - 1,500m (hot/semi-arid).',
    incorrectExplanations: {
      'Dega (Temperate)': 'Dega is the highland temperate zone between 2,300 and 3,300 meters above sea level, whereas the question asks for areas above 3,300 meters.',
      'Woina Dega (Sub-tropical)': 'Woina Dega is the middle highlands zone between 1,500 and 2,300 meters, which has moderate temperatures and is heavily populated.',
      'Kolla (Tropical)': 'Kolla is the hot, dry lowland zone between 500 and 1,500 meters altitude.'
    },
    reference: 'Grade 12 Geography Textbook, Unit 3: Climate and Vegetation of Ethiopia',
    hint: 'This is the highest and coldest zone, experiencing frost and extremely cold temperatures, corresponding to Afro-alpine levels.',
    time: '20 seconds'
  },

  // CIVICS
  {
    id: 23,
    subject: 'Civics',
    topic: 'Constitution',
    difficulty: 'Easy',
    year: 2014,
    question: 'When was the current Federal Democratic Republic of Ethiopia (FDRE) Constitution officially adopted?',
    options: [
      '1987',
      '1991',
      '1995',
      '2005'
    ],
    correctAnswer: '1995',
    explanation: 'The current FDRE Constitution was adopted on December 8, 1994, and entered into force on August 21, 1995. It established a federal state structure based on ethnic regions and parliamentary government. Knowing the year of the constitution is a very common Civics matric question.',
    incorrectExplanations: {
      '1987': 'This was the year the PDRE (People\'s Democratic Republic of Ethiopia) constitution was adopted under the Derg military regime.',
      '1991': 'This is the year the EPRDF took power and formed the Transitional Government, but the formal constitution was drafted and implemented later.',
      '2005': 'This was the year of the third national election under the FDRE constitution, but not the year of its adoption.'
    },
    reference: 'Grade 11/12 Civics and Ethical Education, Unit 2: The Ethiopian Constitution',
    hint: 'It entered into force in the mid-1990s, exactly four years after the fall of the Derg regime.',
    time: '20 seconds'
  },
  {
    id: 24,
    subject: 'Civics',
    topic: 'Human Rights',
    difficulty: 'Easy',
    year: 2016,
    question: 'Which of the following is considered a primary democratic right under the FDRE Constitution?',
    options: [
      'Right to life',
      'Right to freedom of assembly and association',
      'Freedom from cruel or degrading treatment',
      'Right to quick judicial hearing'
    ],
    correctAnswer: 'Right to freedom of assembly and association',
    explanation: 'The FDRE constitution splits rights into Human Rights (such as the Right to Life, Prohibition against cruel treatment - Articles 14-28) and Democratic Rights (such as Freedom of Assembly, Right to Vote, and Freedom of Association - Articles 29-44). The right to assemble and associate falls explicitly under democratic political rights.',
    incorrectExplanations: {
      'Right to life': 'This is classified primarily as a fundamental "Human Right" (Article 15), rather than a political "Democratic Right" in the constitutional taxonomy.',
      'Freedom from cruel or degrading treatment': 'This is a fundamental "Human Right" (Article 18) focusing on human dignity.',
      'Right to quick judicial hearing': 'This is a procedural legal right under human/civil rights (Article 19-21) to protect individual liberty.'
    },
    reference: 'Grade 12 Civics and Ethical Education, Unit on Democracy and Human Rights',
    hint: 'Look for the option that represents political participation or freedom to join groups and assemble.',
    time: '20 seconds'
  },

  // ECONOMICS
  {
    id: 25,
    subject: 'Economics',
    topic: 'Microeconomics',
    difficulty: 'Medium',
    year: 2015,
    question: 'According to the law of demand, other things remaining constant, what is the relationship between the price of a commodity and its quantity demanded?',
    options: [
      'Direct (Positive) relationship',
      'Inverse (Negative) relationship',
      'No relationship',
      'Exponential relationship'
    ],
    correctAnswer: 'Inverse (Negative) relationship',
    explanation: 'The Law of Demand states that, ceteris paribus (all other things being equal), as the price of a good increases, the quantity demanded decreases. Conversely, as the price decreases, quantity demanded increases. This creates an inverse or negative relationship, resulting in a downward-sloping demand curve.',
    incorrectExplanations: {
      'Direct (Positive) relationship': 'This describes the Law of Supply, where higher prices encourage producers to supply more commodities.',
      'No relationship': 'Demand is highly sensitive to prices for most standard goods; therefore, a strong causal relationship exists.',
      'Exponential relationship': 'While demand curves can be non-linear, the general law specifies the directional relationship, which is simply inverse.'
    },
    reference: 'Grade 11/12 Economics, Unit 2: Theory of Demand and Supply',
    hint: 'Think about what you do when the price of something you buy increases. Do you buy more or less?',
    time: '20 seconds'
  },
  {
    id: 26,
    subject: 'Economics',
    topic: 'Macroeconomics',
    difficulty: 'Medium',
    year: 2016,
    question: 'What is the term used to describe a sustained increase in the general price level of goods and services in an economy over a period of time?',
    options: [
      'Deflation',
      'Stagflation',
      'Inflation',
      'Depression'
    ],
    correctAnswer: 'Inflation',
    explanation: 'Inflation is defined as a general, continuous, and sustained rise in the average level of prices in an economy. It reduces the purchasing power of money. Deflation is a sustained decrease in prices, and stagflation is a combination of high inflation, slow economic growth, and high unemployment.',
    incorrectExplanations: {
      'Deflation': 'This is the opposite of inflation, representing a sustained decrease in the general price level of goods and services.',
      'Stagflation': 'This is a specific economic situation where inflation is high, economic growth is slow, and unemployment remains consistently high.',
      'Depression': 'This is a severe, prolonged economic downturn characterized by extreme drops in GDP and high unemployment, not just a price level increase.'
    },
    reference: 'Grade 12 Economics Textbook, Unit 5: Inflation and Unemployment',
    hint: 'It is a common macroeconomic concern that lowers the value of money over time.',
    time: '20 seconds'
  }
];

// Helper: map a raw JSON array to Question[]
function mapPremiumQuestions(rawList: any[], idOffset: number): Question[] {
  return rawList.map((q, idx) => {
    const optionA = q.option_a || '';
    const optionB = q.option_b || '';
    const optionC = q.option_c || '';
    const optionD = q.option_d || '';
    const options = [optionA, optionB, optionC, optionD].filter(Boolean);
    const correctLetter = (q.correct_answer || '').toUpperCase();
    const correct =
      correctLetter === 'A' ? optionA :
        correctLetter === 'B' ? optionB :
          correctLetter === 'C' ? optionC : optionD;
    return {
      id: idOffset + idx,
      subject: q.subject || 'General',
      topic: q.topic || 'General',
      difficulty: (q.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
      year: q.year,
      question: q.question,
      options,
      correctAnswer: correct,
      explanation: q.explanation || '',
      incorrectExplanations: Object.fromEntries(
        options.map(option => [option, option === correct ? '' : 'Not correct.'])
      ),
      reference: q.reference || '',
      hint: q.hint || '',
      time: q.estimated_time ? `${q.estimated_time} seconds` : '30 seconds'
    } as Question;
  });
}

export function isPremiumQuestion(question: Pick<Question, 'subject' | 'year'>): boolean {
  const subject = question.subject.toLowerCase();
  const year = question.year;

  return (
    (subject === 'mathematics' && [2014, 2015, 2016].includes(year)) ||
    (subject === 'physics' && [2014, 2015, 2016].includes(year)) ||
    (subject === 'biology' && [2008, 2009, 2010].includes(year)) ||
    subject === 'chemistry'
  );
}

// Premium Math questions: 2014, 2015, 2016 E.C.
const rawPremiumMath = [
  ...((math2014 || []) as any[]).map(q => ({ ...q, year: 2014 })),
  ...((math2015 || []) as any[]).map(q => ({ ...q, year: 2015 })),
  ...((math2016 || []) as any[]).map(q => ({ ...q, year: 2016 }))
].filter(q => q.subject === 'Mathematics');

const mathPremiumQuestions = mapPremiumQuestions(rawPremiumMath, baseQuestions.length + 1);

// Premium Physics questions: 2014, 2015, 2016 E.C.
const rawPremiumPhysics = [
  ...((physics2014 || []) as any[]).map(q => ({ ...q, year: 2014 })),
  ...((physics2015 || []) as any[]).map(q => ({ ...q, year: 2015 })),
  ...((physics2016 || []) as any[]).map(q => ({ ...q, year: 2016 }))
];
const physicsPremiumQuestions = mapPremiumQuestions(rawPremiumPhysics, baseQuestions.length + mathPremiumQuestions.length + 1);

// Premium Biology questions: 2008, 2009, 2010 E.C.
const rawPremiumBiology = [
  ...((biology2008 || []) as any[]).map(q => ({ ...q, year: 2008 })),
  ...((biology2009 || []) as any[]).map(q => ({ ...q, year: 2009 })),
  ...((biology2010 || []) as any[]).map(q => ({ ...q, year: 2010 }))
].filter(q => q.subject === 'Biology');
const biologyPremiumQuestions = mapPremiumQuestions(
  rawPremiumBiology,
  baseQuestions.length + mathPremiumQuestions.length + physicsPremiumQuestions.length + 1
);

// Premium Chemistry questions: 2005, 2014, 2015 E.C.
const rawPremiumChemistry = [
  ...((chemistry2005 || []) as any[]).map(q => ({ ...q, year: 2005 })),
  ...((chemistry2014 || []) as any[]).map(q => ({ ...q, year: 2014 })),
  ...((chemistry2015 || []) as any[]).map(q => ({ ...q, year: 2015 }))
].filter(q => q.subject === 'Chemistry');
const chemistryPremiumQuestions = mapPremiumQuestions(
  rawPremiumChemistry,
  baseQuestions.length + mathPremiumQuestions.length + physicsPremiumQuestions.length + biologyPremiumQuestions.length + 1
);

export const QUESTIONS: Question[] = baseQuestions.concat(
  mathPremiumQuestions,
  physicsPremiumQuestions,
  biologyPremiumQuestions,
  chemistryPremiumQuestions
);
