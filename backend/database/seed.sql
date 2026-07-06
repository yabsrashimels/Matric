-- Seed data for Ethio Matric Learning Platform
-- Note: Passwords: "password123" is $2a$10$X87XvL2kYmreRExK7G5Z.OlyY9b7gR7X3T3hC3E6KbyXy9S9i7A9K
--       Admin password "Yeabsra@123" is $2b$10$bfk1jhG3cgyJyGqzt4oxjeMLQ7dr7WH6sCAxTxZvS3RdzYCr/G9cO

-- 1. Insert Plans
INSERT INTO plans (id, name, price, description, is_active) VALUES
(1, 'Free', 0.0, 'Access to select Grade 12 Matric subjects (Biology and Chemistry) with basic review explanations.', true),
(2, 'Premium', 100.0, 'Unlock all subjects, detailed explanations, exam metrics, and comprehensive progress reports for life.', true),
(3, 'Advanced', 500.0, 'All-inclusive lifetime pass to every subject, topic, past papers, custom mock exams, and premium math/physics expressions.', true);

-- 2. Insert Subjects (Associated with plans: Biology/Chemistry Free, Math/English Premium, Physics Advanced)
INSERT INTO subjects (id, name, description, icon, color, plan_id) VALUES
(1, 'Mathematics', 'Grade 12 Mathematics (Natural and Social science streams)', 'Calculator', '#078930', 2),
(2, 'Physics', 'Grade 12 Physics: Mechanics, Electromagnetism, Quantum Physics', 'Zap', '#DA121A', 3),
(3, 'Chemistry', 'Grade 12 Chemistry: Physical, Inorganic, Organic Chemistry', 'FlaskConical', '#FCDD09', 1),
(4, 'Biology', 'Grade 12 Biology: Cell Biology, Genetics, Ecology, Evolution', 'Dna', '#2563eb', 1),
(5, 'English', 'Grade 12 English: Grammar, Vocabulary, Reading, Writing skills', 'BookOpen', '#7c3aed', 2);

-- 3. Insert Topics (Mapped to Subjects, plan_id matching or inheriting)
INSERT INTO topics (id, subject_id, name, plan_id) VALUES
-- Mathematics (Subject 1)
(1, 1, 'Sequences and Series', 2),
(2, 1, 'Introduction to Calculus', 2),
(3, 1, 'Vectors and Matrices', 2),
(4, 1, 'Complex Numbers', 2),
-- Physics (Subject 2)
(5, 2, 'Rotational Dynamics', 3),
(6, 2, 'Electrostatics and Electric Current', 3),
(7, 2, 'Electromagnetic Induction', 3),
(8, 2, 'Atomic and Nuclear Physics', 3),
-- Chemistry (Subject 3)
(9, 3, 'Chemical Kinetics', 1),
(10, 3, 'Chemical Equilibrium', 1),
(11, 3, 'Electrochemistry', 1),
(12, 3, 'Organic Chemistry', 1),
-- Biology (Subject 4)
(13, 4, 'Biomolecules', 1),
(14, 4, 'Cell Division', 1),
(15, 4, 'Genetics and Heredity', 1),
(16, 4, 'Ecology', 1),
-- English (Subject 5)
(17, 5, 'Tenses and Voices', 2),
(18, 5, 'Relative Clauses', 2),
(19, 5, 'Conditional Sentences', 2),
(20, 5, 'Direct and Indirect Speech', 2);

-- 4. Insert Questions (Tagged with appropriate plan_id corresponding to subject)
INSERT INTO questions (id, subject_id, topic_id, year, difficulty, question, option_a, option_b, option_c, option_d, correct_answer, explanation, reference, hint, estimated_time, plan_id) VALUES
-- Subject 1: Mathematics (Premium, Plan ID 2)
(1, 1, 1, 2023, 'Easy', 'What is the 10th term of the arithmetic sequence: 3, 7, 11, 15, ...?', '35', '39', '43', '47', 'B', 'The arithmetic sequence has a first term a1 = 3 and common difference d = 4. The nth term formula is an = a1 + (n-1)d. Thus, a10 = 3 + (10-1)*4 = 3 + 36 = 39.', 'Grade 12 Maths Text Book, Chapter 1', 'Recall the formula for the nth term of an arithmetic progression.', 45, 2),
(2, 1, 1, 2022, 'Medium', 'Find the sum of the infinite geometric series: 8 + 4 + 2 + 1 + ...', '15', '16', '12', 'Infinity', 'B', 'This is an infinite geometric series with first term a = 8 and common ratio r = 1/2. Since |r| < 1, the sum S = a / (1 - r) = 8 / (1 - 0.5) = 8 / 0.5 = 16.', 'Grade 12 Maths Text Book, Chapter 1', 'Use the infinite sum formula S = a / (1-r).', 60, 2),
(3, 1, 2, 2023, 'Hard', 'What is the limit of (sin(3x)) / x as x approaches 0?', '0', '1', '3', 'Does not exist', 'C', 'Using the standard limit lim(x->0) sin(kx)/x = k, or applying LHopitals Rule: the derivative of sin(3x) is 3cos(3x) and derivative of x is 1. Evaluated at x=0, 3cos(0)/1 = 3.', 'Grade 12 Maths Text Book, Chapter 2', 'Apply LHopitals Rule or standard trigonometric limit theorems.', 90, 2),
(4, 1, 2, 2021, 'Medium', 'What is the derivative of f(x) = x^3 - 5x^2 + 4x - 7 at x = 2?', '0', '-4', '4', '2', 'B', 'The derivative is f(x) = 3x^2 - 10x + 4. Evaluating at x = 2: f(2) = 3(4) - 10(2) + 4 = 12 - 20 + 4 = -4.', 'Grade 12 Maths Text Book, Chapter 2', 'Differentiate term-by-term and substitute x = 2.', 60, 2),
(5, 1, 3, 2022, 'Easy', 'What is the determinant of the 2x2 matrix [[4, 2], [1, 3]]?', '14', '10', '12', '8', 'B', 'The determinant of a 2x2 matrix [[a, b], [c, d]] is ad - bc. Here, (4 * 3) - (2 * 1) = 12 - 2 = 10.', 'Grade 12 Maths Text Book, Chapter 3', 'Multiply main diagonal elements and subtract the product of off-diagonal elements.', 30, 2),
(6, 1, 3, 2023, 'Medium', 'If vector A = 2i + 3j - k and vector B = i - j + 2k, what is the dot product A.B?', '-3', '1', '-1', '3', 'A', 'The dot product is given by AxBx + AyBy + AzBz. Here, (2*1) + (3*-1) + (-1*2) = 2 - 3 - 2 = -3.', 'Grade 12 Maths Text Book, Chapter 3', 'Sum the products of the corresponding components.', 45, 2),
(7, 1, 4, 2022, 'Medium', 'What is the polar form of the complex number z = 1 + i?', 'sqrt(2)(cos(pi/4) + i sin(pi/4))', '2(cos(pi/4) + i sin(pi/4))', 'sqrt(2)(cos(pi/2) + i sin(pi/2))', '2(cos(pi/2) + i sin(pi/2))', 'A', 'The modulus r = sqrt(1^2 + 1^2) = sqrt(2). The argument theta = arctan(1/1) = pi/4. Therefore, the polar form is r(cos(theta) + i sin(theta)) = sqrt(2)(cos(pi/4) + i sin(pi/4)).', 'Grade 12 Maths Text Book, Chapter 4', 'Determine the modulus first, then find the angle in the first quadrant.', 60, 2),
(8, 1, 4, 2021, 'Hard', 'Solve for x and y in the equation: (x + yi)(2 - i) = 5 + 5i.', 'x = 1, y = 3', 'x = 1, y = 2', 'x = 2, y = 3', 'x = 3, y = 1', 'A', 'Divide both sides by (2 - i): x + yi = (5 + 5i) / (2 - i) = (5 + 5i)(2 + i) / ((2 - i)(2 + i)) = (10 + 5i + 10i - 5) / (4 + 1) = (5 + 15i) / 5 = 1 + 3i. Thus, x = 1 and y = 3.', 'Grade 12 Maths Text Book, Chapter 4', 'Isolate x + yi by multiplying by the conjugate of (2-i).', 90, 2),
(9, 1, 1, 2020, 'Easy', 'In a geometric sequence, if the first term is 5 and the common ratio is 2, what is the 4th term?', '20', '40', '80', '10', 'B', 'The nth term of a geometric sequence is an = a1 * r^(n-1). For n=4, a4 = 5 * 2^3 = 5 * 8 = 40.', 'Grade 12 Maths Chapter 1', 'Multiply 5 by the common ratio three times.', 30, 2),
(10, 1, 2, 2024, 'Hard', 'Find the area of the region bounded by the curve y = x^2 and the line y = 4.', '16/3', '32/3', '8', '12', 'B', 'The intersection points are x^2 = 4 => x = -2 and x = 2. The area is the integral from -2 to 2 of (4 - x^2) dx = [4x - x^3/3] from -2 to 2 = (8 - 8/3) - (-8 + 8/3) = 16/3 - (-16/3) = 32/3.', 'Grade 12 Calculus, Chapter 5', 'Set up the definite integral of upper function minus lower function.', 120, 2),

-- Subject 2: Physics (Advanced, Plan ID 3)
(11, 2, 5, 2023, 'Medium', 'An object of mass 2 kg moves in a circle of radius 3 m with a constant speed of 6 m/s. What is the centripetal force acting on the object?', '12 N', '24 N', '36 N', '4 N', 'B', 'The centripetal force is given by Fc = mv^2 / r. Plugging in the values: Fc = (2 * 6^2) / 3 = (2 * 36) / 3 = 72 / 3 = 24 N.', 'Grade 12 Physics, Chapter 1', 'Use the centripetal force equation: F = mv^2/r.', 50, 3),
(12, 2, 5, 2022, 'Hard', 'A uniform solid sphere of mass 4 kg and radius 0.5 m rolls without slipping. What is its moment of inertia about an axis passing through its center?', '0.2 kg m^2', '0.4 kg m^2', '0.5 kg m^2', '0.1 kg m^2', 'A', 'The moment of inertia of a solid sphere is I = (2/5) * M * R^2. Substituting the values: I = 0.4 * 4 * (0.5)^2 = 1.6 * 0.25 = 0.4 * 0.5 = 0.2 kg m^2.', 'Grade 12 Physics, Chapter 1', 'Recall the inertia formula for a solid sphere: (2/5)MR^2.', 75, 3),
(13, 2, 6, 2023, 'Easy', 'According to Coulombs Law, if the distance between two charges is doubled, the electrostatic force between them is:', 'Doubled', 'Halved', 'Quadrupled', 'Reduced to one-quarter', 'D', 'Coulombs Law states F = k * (q1 * q2) / r^2. If distance r becomes 2r, the force becomes F_new = F / 2^2 = F / 4.', 'Grade 12 Physics, Chapter 2', 'The force is inversely proportional to the square of the distance.', 30, 3),
(14, 2, 6, 2022, 'Medium', 'A resistor of resistance 10 ohms is connected to a 120 V power source. How much current flows through the resistor?', '12 A', '1.2 A', '1200 A', '10 A', 'A', 'According to Ohms Law, V = I * R, so I = V / R. Thus, I = 120 / 10 = 12 A.', 'Grade 12 Physics, Chapter 2', 'Ohms Law states Current = Voltage / Resistance.', 30, 3),
(15, 2, 7, 2021, 'Medium', 'The principal device that works on the principle of electromagnetic induction to convert mechanical energy into electrical energy is:', 'Electric Motor', 'Transformer', 'Galvanometer', 'AC Generator', 'D', 'An AC generator converts mechanical energy into electrical energy using Faraday\'s law of electromagnetic induction.', 'Grade 12 Physics, Chapter 3', 'Think about electricity generation vs. electricity consumption.', 45, 3),
(16, 2, 7, 2023, 'Hard', 'A coil of 200 turns is placed in a magnetic field that changes at a rate of 0.5 T/s. If the cross-sectional area of the coil is 0.1 m^2, what is the magnitude of the induced EMF?', '10 V', '20 V', '5 V', '2 V', 'A', 'Faraday\'s Law of induction states EMF = -N * (dPhi/dt) = -N * A * (dB/dt). EMF magnitude = 200 * 0.1 * 0.5 = 10 V.', 'Grade 12 Physics, Chapter 3', 'Apply Faradays Law: EMF = N * A * (dB/dt).', 80, 3),
(17, 2, 8, 2022, 'Easy', 'Which of the following radioactive emissions has the highest penetrating power?', 'Alpha particles', 'Beta particles', 'Gamma rays', 'Neutron emissions', 'C', 'Gamma rays are electromagnetic waves with zero charge and mass, giving them the highest penetrating power among common nuclear emissions.', 'Grade 12 Physics, Chapter 4', 'Penetrating power increases as charge and mass decrease.', 30, 3),
(18, 2, 8, 2023, 'Hard', 'The half-life of a radioactive isotope is 10 days. How much of a 100 g sample remains after 30 days?', '50 g', '25 g', '12.5 g', '6.25 g', 'C', '30 days represent 3 half-lives (30/10 = 3). After 1 half-life: 50g. After 2: 25g. After 3: 12.5g.', 'Grade 12 Physics, Chapter 4', 'Halve the sample mass recursively for each half-life period.', 60, 3),
(19, 2, 5, 2020, 'Easy', 'What is the SI unit of torque?', 'Newton per meter', 'Newton-second', 'Newton-meter', 'Joule per second', 'C', 'Torque is force times perpendicular distance, so the SI unit is Newton-meter (N m).', 'Grade 12 Physics, Chapter 1', 'Torque = Force x Distance.', 20, 3),
(20, 2, 6, 2024, 'Medium', 'Three resistors of 3 ohms, 6 ohms, and 9 ohms are connected in parallel. What is the equivalent resistance?', '18 ohms', '1.63 ohms', '0.61 ohms', '3 ohms', 'B', 'For parallel resistors, 1/Req = 1/3 + 1/6 + 1/9 = 6/18 + 3/18 + 2/18 = 11/18. Req = 18/11 = 1.63 ohms.', 'Grade 12 Physics, Chapter 2', 'Use the parallel reciprocal sum formula.', 60, 3),

-- Subject 3: Chemistry (Free, Plan ID 1)
(21, 3, 9, 2023, 'Medium', 'For a first-order chemical reaction, what happens to the half-life when the initial concentration of the reactant is doubled?', 'It is doubled', 'It is halved', 'It remains unchanged', 'It is quadrupled', 'C', 'The half-life of a first-order reaction is given by t_1/2 = ln(2) / k, which is independent of the initial concentration. Thus, it remains unchanged.', 'Grade 12 Chemistry, Chapter 1', 'Review the half-life equations for zero, first, and second-order reactions.', 60, 1),
(22, 3, 9, 2022, 'Hard', 'If the rate constant of a reaction is 3.5 x 10^-3 L mol^-1 s^-1, what is the order of the reaction?', 'Zero order', 'First order', 'Second order', 'Third order', 'C', 'The units of a rate constant are M^(1-n) s^-1 where n is the reaction order. For second order (n=2), units are M^-1 s^-1, which is L mol^-1 s^-1.', 'Grade 12 Chemistry, Chapter 1', 'Deduce the order of reaction from the unit of rate constant (k).', 75, 1),
(23, 3, 10, 2023, 'Easy', 'According to Le Chatelier\'s Principle, what happens to the equilibrium of an exothermic reaction when the temperature is increased?', 'Shift to the right', 'Shift to the left', 'No shift occurs', 'Catalyst is consumed', 'B', 'An exothermic reaction releases heat. Increasing temperature is like adding a product, causing the equilibrium to shift to the left to absorb the excess heat.', 'Grade 12 Chemistry, Chapter 2', 'Treat heat as a product in exothermic reactions.', 40, 1),
(24, 3, 10, 2021, 'Medium', 'For the reaction N2(g) + 3H2(g) <=> 2NH3(g), what is the correct equilibrium constant expression (Kc)?', 'Kc = [NH3]^2 / ([N2][H2]^3)', 'Kc = ([N2][H2]^3) / [NH3]^2', 'Kc = [NH3] / ([N2][H2])', 'Kc = [NH3]^2 / ([N2] + 3[H2])', 'A', 'The equilibrium constant Kc is the ratio of products to reactants, with each raised to the power of their stoichiometric coefficients. Thus, Kc = [NH3]^2 / ([N2][H2]^3).', 'Grade 12 Chemistry, Chapter 2', 'Products over reactants, raised to the power of their coefficients.', 45, 1),
(25, 3, 11, 2022, 'Hard', 'During the electrolysis of aqueous copper(II) sulfate using inert electrodes, what substance is discharged at the anode?', 'Copper metal', 'Hydrogen gas', 'Oxygen gas', 'Sulfur dioxide', 'C', 'At the anode, water is oxidized in preference to sulfate ions (due to its lower standard oxidation potential), yielding oxygen gas and hydrogen ions: 2H2O -> O2 + 4H+ + 4e-.', 'Grade 12 Chemistry, Chapter 3', 'Compare discharge potentials of water and sulfate ions.', 90, 1),
(26, 3, 11, 2023, 'Easy', 'In an electrochemical cell, oxidation always takes place at the:', 'Anode', 'Cathode', 'Salt bridge', 'Voltmeter', 'A', 'Oxidation is the loss of electrons, which always occurs at the anode in both galvanic (voltaic) and electrolytic cells.', 'Grade 12 Chemistry, Chapter 3', 'Remember the mnemonic: "An Ox, Red Cat" (Anode Oxidation, Reduction Cathode).', 30, 1),
(27, 3, 12, 2022, 'Medium', 'What is the IUPAC name for the organic compound CH3-CH2-CH(OH)-CH3?', 'Butan-1-ol', 'Butan-2-ol', 'Propan-2-ol', '2-Methylpropan-1-ol', 'B', 'The carbon chain has 4 carbons (butane) with a hydroxyl group (-OH) on the second carbon. Thus, the IUPAC name is Butan-2-ol.', 'Grade 12 Chemistry, Chapter 4', 'Identify the longest continuous carbon chain containing the principal functional group.', 45, 1),
(28, 3, 12, 2023, 'Hard', 'Which of the following types of hydrocarbons undergoes substitution reactions rather than addition reactions?', 'Alkenes', 'Alkynes', 'Alkanes', 'Dienes', 'C', 'Alkanes are saturated hydrocarbons and contain only single carbon-carbon bonds, meaning they can only undergo substitution reactions.', 'Grade 12 Chemistry, Chapter 4', 'Saturated hydrocarbons undergo substitution, while unsaturated ones undergo addition.', 60, 1),
(29, 3, 9, 2020, 'Easy', 'Which of the following factors increases the rate of a chemical reaction by lowering activation energy?', 'Increasing temperature', 'Adding a catalyst', 'Increasing pressure', 'Increasing concentration', 'B', 'A catalyst provides an alternative reaction pathway with a lower activation energy, thereby increasing the rate of reaction.', 'Grade 12 Chemistry, Chapter 1', 'A catalyst changes the activation energy barrier.', 30, 1),
(30, 3, 10, 2024, 'Medium', 'What is the pH of a 0.01 M strong acid HCl solution?', '1', '2', '3', '7', 'B', 'Since HCl is a strong acid, it dissociates completely. [H+] = 0.01 M = 10^-2 M. pH = -log[H+] = -log(10^-2) = 2.', 'Grade 12 Chemistry, Chapter 2', 'Use the pH formula: pH = -log[H+].', 40, 1),

--Subject 4: Biology (Free, Plan ID 1)
(31, 4, 13, 2023, 'Easy', 'Which biomolecule is the primary direct source of quick metabolic energy for living organisms?', 'Proteins', 'Lipids', 'Carbohydrates', 'Nucleic Acids', 'C', 'Carbohydrates, specifically glucose, are the primary and most accessible source of immediate cellular energy in respiration.', 'Grade 12 Biology, Chapter 1', 'Think about sugars and starches.', 25, 1),
(32, 4, 13, 2022, 'Medium', 'Proteins are polymers composed of which repeating monomer units?', 'Nucleotides', 'Fatty acids', 'Monosaccharides', 'Amino acids', 'D', 'Proteins (polypeptides) are synthesized from chains of amino acids linked together by peptide bonds.', 'Grade 12 Biology, Chapter 1', 'There are 20 standard structural units that build up proteins.', 30, 1),
(33, 4, 14, 2023, 'Hard', 'During which specific phase of mitosis do sister chromatids separate and move towards opposite poles of the cell?', 'Prophase', 'Metaphase', 'Anaphase', 'Telophase', 'C', 'During anaphase, the centromeres split and sister chromatids are pulled apart to opposite ends of the cell by spindle fibers.', 'Grade 12 Biology, Chapter 2', 'A for Anaphase, A for "Apart".', 45, 1),
(34, 4, 14, 2021, 'Easy', 'In which type of cell division does the chromosome number remain unchanged (forming identical diploid cells)?', 'Mitosis', 'Meiosis', 'Binary Fission', 'Budding', 'A', 'Mitosis is equational division that results in two daughter cells with the exact same number of chromosomes as the parent cell.', 'Grade 12 Biology, Chapter 2', 'Think about body (somatic) cells vs. gametes (sex cells).', 30, 1),
(35, 4, 15, 2023, 'Medium', 'In Mendel\'s monohybrid cross of tall (Tt) and dwarf (tt) pea plants, what is the expected phenotypic ratio of the offspring?', '3 tall : 1 dwarf', '1 tall : 1 dwarf', 'All tall', '9 tall : 3 dwarf', 'B', 'A cross of Tt x tt yields offspring genotypes Tt and tt in a 1:1 ratio. Phenotypically, half will be tall and half will be dwarf.', 'Grade 12 Biology, Chapter 3', 'Perform a simple 2x2 Punnett square.', 45, 1),
(36, 4, 15, 2022, 'Hard', 'Which of the following nitrogenous bases is found in RNA but NOT in DNA?', 'Thymine', 'Uracil', 'Adenine', 'Cytosine', 'B', 'Uracil is a pyrimidine base that pairs with adenine in RNA, replacing the thymine found in DNA.', 'Grade 12 Biology, Chapter 3', 'RNA replaces one of the primary pyrimidines with a closely related one.', 30, 1),
(37, 4, 16, 2023, 'Medium', 'The interaction between two species where one species benefits while the other is neither helped nor harmed is known as:', 'Mutualism', 'Commensalism', 'Parasitism', 'Amensalism', 'B', 'Commensalism is a symbiotic relationship in which one species benefits (+0) and the other is unaffected.', 'Grade 12 Biology, Chapter 4', 'A positive-neutral interaction (+/0).', 35, 1),
(38, 4, 16, 2021, 'Easy', 'Which organisms occupy the first trophic level in all terrestrial ecosystems?', 'Herbivores', 'Decomposers', 'Primary Producers (Plants)', 'Carnivores', 'C', 'Autotrophs or primary producers (green plants) synthesize organic molecules from inorganic materials and form the base level of food webs.', 'Grade 12 Biology, Chapter 4', 'They harvest energy directly from sunlight.', 20, 1),
(39, 4, 13, 2020, 'Easy', 'Which of the following bonds connects amino acids in a polypeptide chain?', 'Glycosidic bond', 'Ester bond', 'Peptide bond', 'Phosphodiester bond', 'C', 'The linkage between the carboxyl group of one amino acid and the amino group of another is a peptide bond.', 'Grade 12 Biology, Chapter 1', 'Proteins are also known as polypeptides.', 30, 1),
(40, 4, 15, 2024, 'Hard', 'If a child has blood group O, which of the following parental blood group combinations is NOT possible?', 'A and B', 'A and O', 'AB and O', 'B and B', 'C', 'To have blood group O, a child must be homozygous recessive (ii). An AB parent only has alleles I^A or I^B, meaning they cannot pass on the recessive allele "i". Hence, an AB parent cannot have an O child.', 'Grade 12 Biology, Chapter 3', 'An AB individual cannot pass on an "O" (i) allele.', 60, 1),

-- Subject 5: English (Premium, Plan ID 2)
(41, 5, 17, 2023, 'Easy', 'Choose the correct verb form: "By the time the teacher arrived, the students ___ the classroom."', 'left', 'have left', 'had left', 'leaving', 'C', 'The past perfect tense "had left" is used to show an action that completed before another past action (the teacher\'s arrival).', 'Grade 12 English, Chapter 1', 'The older of two past events takes the past perfect tense.', 30, 2),
(42, 5, 17, 2022, 'Medium', 'Change the sentence to passive voice: "The chef prepared a delicious meal."', 'A delicious meal is prepared by the chef.', 'A delicious meal was prepared by the chef.', 'A delicious meal has been prepared by the chef.', 'A delicious meal was preparing by the chef.', 'B', 'In simple past, passive voice uses "was/were + past participle". "A delicious meal was prepared by the chef" is correct.', 'Grade 12 English, Chapter 1', 'Object + was/were + past participle + by subject.', 30, 2),
(43, 5, 18, 2023, 'Easy', 'Fill in the blank: "The man ___ car was stolen went to the police station."', 'who', 'whose', 'whom', 'which', 'B', 'The relative pronoun "whose" indicates possession (the car of the man).', 'Grade 12 English, Chapter 2', 'Choose the relative pronoun indicating possession.', 25, 2),
(44, 5, 18, 2021, 'Medium', 'Complete the sentence: "Addis Ababa, ___ is the capital city of Ethiopia, is expanding rapidly."', 'which', 'where', 'that', 'who', 'A', '"Which" is used to introduce non-defining relative clauses describing things or cities. Note that "that" cannot be used in non-defining clauses surrounded by commas.', 'Grade 12 English, Chapter 2', 'Use "which" for non-defining clauses referencing non-human nouns.', 40, 2),
(45, 5, 19, 2023, 'Hard', 'Complete the Conditional Type 3 sentence: "If you ___ studied harder, you ___ passed the exam."', 'had / would have', 'have / will', 'would have / had', 'did / would', 'A', 'Conditional Type 3 represents hypothetical past events. The structure is: If + past perfect, would + have + past participle.', 'Grade 12 English, Chapter 3', 'Hypothetical past uses Past Perfect in the if-clause and Would Have in the main clause.', 45, 2),
(46, 5, 19, 2022, 'Easy', 'Identify the correct conditional structure: "If it rains tomorrow, we ___ go to the park."', 'would not', 'won\'t', 'had not', 'didn\'t', 'B', 'This is a First Conditional (real/possible future). Structure: If + simple present, will/won\'t + base verb.', 'Grade 12 English, Chapter 3', 'A conditional clause in simple present is followed by a main clause in simple future.', 30, 2),
(47, 5, 20, 2023, 'Medium', 'Convert to indirect speech: She said, "I am studying English now."', 'She said that she is studying English then.', 'She said that she was studying English then.', 'She said that I was studying English now.', 'She said she has been studying English now.', 'B', 'In indirect speech, present continuous "am studying" shifts to past continuous "was studying", and "now" shifts to "then".', 'Grade 12 English, Chapter 4', 'Shift present continuous to past continuous and "now" to "then".', 45, 2),
(48, 5, 20, 2021, 'Hard', 'Convert to indirect speech: The doctor asked, "Have you taken your medicine?"', 'The doctor asked if I had taken my medicine.', 'The doctor asked that I have taken my medicine.', 'The doctor asked whether I took my medicine.', 'The doctor asked did you take your medicine.', 'A', 'For yes/no questions, we use "if/whether", and shift present perfect "have taken" to past perfect "had taken". Pronoun "your" shifts to "my".', 'Grade 12 English, Chapter 4', 'Use "if" and shift present perfect to past perfect.', 60, 2),
(49, 5, 17, 2020, 'Easy', 'Identify the correct tense: "She has been working in the hospital since 2018."', 'Present Perfect', 'Past Perfect Continuous', 'Present Perfect Continuous', 'Present Continuous', 'C', 'The structure "has/have + been + -ing verb" is the Present Perfect Continuous tense.', 'Grade 12 English, Chapter 1', 'Focus on "has been" combined with the "-ing" participle.', 20, 2),
(50, 5, 19, 2024, 'Medium', 'Complete the sentence: "If I were you, I ___ accept the job offer."', 'will', 'would', 'shall', 'had', 'B', 'This is a Second Conditional (hypothetical present). Structure: If + simple past (subjunctive), would + base verb.', 'Grade 12 English, Chapter 3', 'Hypothetical present uses simple past/were in the if-clause and would in the main.', 30, 2);

-- 5. Insert Sample Users
-- Fixed administrator: yabsrashimels531@gmail.com / Yeabsra@123
-- student@matricprep.com / password123
INSERT INTO users (id, uuid, first_name, last_name, email, password, grade, school, region, role, phone_number, status) VALUES
(1, '3b2e5910-4f51-4b13-91b5-680fae419b4a', 'Yeabsra', 'Shimels', 'yabsrashimels531@gmail.com', '$2b$10$bfk1jhG3cgyJyGqzt4oxjeMLQ7dr7WH6sCAxTxZvS3RdzYCr/G9cO', 12, 'Admin High School', 'Addis Ababa', 'admin', '+251911111111', 'active'),
(2, 'e7d8f36a-2081-42e1-889a-096cf5d6911c', 'Abel', 'Kebede', 'student@matricprep.com', '$2a$10$X87XvL2kYmreRExK7G5Z.OlyY9b7gR7X3T3hC3E6KbyXy9S9i7A9K', 12, 'Menelik II School', 'Addis Ababa', 'student', '+251912345678', 'active'),
(3, 'a12bc34d-56ef-78gh-90ij-klmnopqrstuv', 'Solomon', 'Tekle', 'free_student@matricprep.com', '$2a$10$X87XvL2kYmreRExK7G5Z.OlyY9b7gR7X3T3hC3E6KbyXy9S9i7A9K', 12, 'Bole High School', 'Addis Ababa', 'student', '+251900000000', 'active');

-- 6. Insert User Memberships
INSERT INTO user_memberships (user_id, plan_id, status) VALUES
(1, 3, 'active'),  -- Admin has Advanced plan
(2, 2, 'active'),  -- Abel has Premium plan
(3, 1, 'active');  -- Solomon has Free plan

-- 7. Insert Language Preferences
INSERT INTO language_preferences (user_id, language) VALUES
(1, 'en'),
(2, 'en'),
(3, 'am');

-- 8. Insert Sample Mock Exams
INSERT INTO mock_exams (id, title, duration, total_questions, plan_id) VALUES
(1, 'National Math Matric Prototype 2024', 120, 10, 2),
(2, 'Grade 12 Comprehensive Physics Exam', 90, 8, 3);

-- 9. Insert Mock Exam Questions Mapping
INSERT INTO mock_exam_questions (mock_exam_id, question_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
(2, 11), (2, 12), (2, 13), (2, 14), (2, 15), (2, 16), (2, 17), (2, 18);

-- 10. Insert Initial Student Progress (to make stats dashboard display beautifully immediately)
INSERT INTO progress (user_id, subject_id, completed_questions, correct_answers, wrong_answers, accuracy) VALUES
(2, 1, 5, 4, 1, 80.00),
(2, 2, 4, 3, 1, 75.00),
(2, 3, 3, 2, 1, 66.67);

-- 11. Insert Some Bookmarks for testing
INSERT INTO bookmarks (user_id, question_id) VALUES
(2, 3), -- Math limit question bookmarked
(2, 12); -- Physics sphere question bookmarked

-- 12. Insert Some User Answers
INSERT INTO user_answers (user_id, question_id, selected_answer, is_correct) VALUES
(2, 1, 'B', true),
(2, 2, 'B', true),
(2, 3, 'A', false), -- Incorrectly answered
(2, 4, 'B', true),
(2, 5, 'B', true);

-- 13. Insert Some Exam Results
INSERT INTO exam_results (user_id, mock_exam_id, score, percentage) VALUES
(2, 1, 8, 80.00);

-- 14. Insert Some Payment Requests (one approved, one pending)
INSERT INTO payment_requests (id, user_id, plan_id, payment_method, reference_number, screenshot_url, status) VALUES
(1, 2, 2, 'Telebirr', 'TXN918237128', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=200', 'Approved'),
(2, 3, 2, 'CBE Birr', 'CBE881920391', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=200', 'Pending');

-- 15. Insert Payment Receipts
INSERT INTO payment_receipts (payment_request_id, user_id, plan_id, amount, payment_method, reference_number) VALUES
(1, 2, 2, 100.0, 'Telebirr', 'TXN918237128');

-- 16. Insert Admin & User Notifications
INSERT INTO notifications (user_id, type, message, is_read) VALUES
(NULL, 'registration', 'New student Abel Kebede (student@matricprep.com) has registered from Addis Ababa region.', true),
(NULL, 'payment_submitted', 'New payment request of 100 ETB submitted by Solomon Tekle via CBE Birr.', false),
(2, 'payment_approved', 'Congratulations! Your payment of 100 ETB for the Premium plan has been approved. You now have lifetime Premium access.', false);

-- 17. Insert Activity Logs
INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES
(1, 'Admin Login', 'Administrator logged in from dashboard portal.', '127.0.0.1'),
(2, 'Solve Question', 'User solved Math Question #1 correctly.', '127.0.0.1');

-- 18. Insert Login History
INSERT INTO login_history (user_id, ip_address, user_agent) VALUES
(1, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
(2, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
