export interface Question {
  id: string;
  subtopic_code: string;
  subtopic_title: string;
  tier: 1 | 2 | 3;
  tier_name: string;
  type: 'conceptual_anchor' | 'scaffolded_math' | 'exam_trap_derivation';
  question_text: string;
  hints: {
    scaffolding_tip: string;
    exponent_breakdown?: string;
  };
  markscheme_criteria: {
    id: 'groundwork' | 'manipulation' | 'precision';
    title: string;
    mark: string;
    description: string;
    math: string;
    examinerTip: string;
    badge: 'Groundwork' | 'Manipulation' | 'Precision';
  }[];
  // Simulated hand-written solutions for each tab comparison
  solutions: {
    perfect: {
      steps: {
        id: 'groundwork' | 'manipulation' | 'precision';
        title: string;
        formula: string;
        explanation: string;
      }[];
    };
    defective: {
      steps: {
        id: 'groundwork' | 'manipulation' | 'precision';
        title: string;
        formula: string;
        explanation: string;
        pitfallDesc: string;
      }[];
    };
  };
}

export const questionBank: Question[] = [
  // 1. TOPIC_6_1 (Circular Motion Dynamics)
  {
    id: "q_6_1_1",
    subtopic_code: "TOPIC_6_1",
    subtopic_title: "Circular Motion Dynamics",
    tier: 1,
    tier_name: "Tier 1: Conceptual Anchor",
    type: "conceptual_anchor",
    question_text: "An object pivots in a horizontal circle at a constant tangential speed. Prove conceptually why a non-zero net force is mandatory for this motion despite the speed remaining perfectly constant, and evaluate how the centripetal acceleration matches this force.",
    hints: {
      scaffolding_tip: "Think about the vector nature of velocity. Acceleration is defined as the rate of change of velocity, not rate of change of speed. A changing vector direction means a non-zero acceleration exists."
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Velocity Vector Definition",
        mark: "1m",
        description: "State that velocity is a vector quantity consisting of both magnitude and direction.",
        math: "\\vec{v} = v\\hat{u}",
        examinerTip: "Never use speed and velocity interchangeably in a Paper 2 descriptive response.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Rate of Change of Direction",
        mark: "1m",
        description: "Explain how direction is continuously rotating, producing a continuously changing velocity vector.",
        math: "\\Delta\\vec{v} \\neq 0",
        examinerTip: "Specify that the vector change is pointing radially inwards, hence centripetal.",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Newton's Second Law Linkage",
        mark: "1m",
        description: "Link this acceleration to Newton's Second Law (F = ma), stating that a radial force is required to maintain it.",
        math: "\\vec{F}_{net} = m\\vec{a}_c",
        examinerTip: "Conclude by noting that the speed stays constant because force is perpendicular to displacement, performing zero work.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "v is constant, but direction changes continuously.",
            explanation: "Velocity is a vector. Since the path is circular, the direction of motion is constantly changing at every infinitesimal moment."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "Δv ≠ 0 ⇒ acceleration high-lighted centrally",
            explanation: "Because the direction of the velocity vector is changing, there must be a acceleration directed radially inward: a_c = v²/r."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "F_net = m · a_c = m v² / r (W = F · d · cos(90°) = 0)",
            explanation: "By Newton's Second Law, this inward acceleration requires a net centripetal force. This force does no work because it is perpendicular to motion."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "v = constant, so a = dv/dt = 0",
            explanation: "Candidate wrongly states acceleration is zero because 'speed is constant'. Fatal vector misconception.",
            pitfallDesc: "Confused speed with velocity magnitude, missing centripetal acceleration definition."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "F_centrifugal = m v² / r outwards",
            explanation: "Candidate starts treating 'centrifugal force' as a real outward force pushing the object. High-risk physics trap.",
            pitfallDesc: "Introduces non-inertial fictitious centrifugal force instead of real centripetal force inward."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "No vector diagram, concludes net force = 0",
            explanation: "Incorrectly concludes that since speed is constant, the forces must balance to zero. Candidate loses all marks representation.",
            pitfallDesc: "Failed to justify that a perpendicular force does not alter the kinetic energy but changes momentum direction."
          }
        ]
      }
    }
  },
  {
    id: "q_6_1_2",
    subtopic_code: "TOPIC_6_1",
    subtopic_title: "Circular Motion Dynamics",
    tier: 2,
    tier_name: "Tier 2: Scaffolded Math",
    type: "scaffolded_math",
    question_text: "A satellite research capsule of mass 800 kg travels in a circular orbit at a constant radius of R = 1.6 * 10^7 meters from the center of a celestial body. The required centripetal acceleration to sustain this path is a_c = 2.5 m s^-2. Calculate the speed v of the satellite and the net centripetal force F_c required.",
    hints: {
      scaffolding_tip: "Map out the parameters: m = 800 kg, r = 1.6 * 10^7 m, and a_c = 2.5 m s^-2. Equate centripetal acceleration to v^2/r.",
      exponent_breakdown: "1. v² = a_c * r = 2.5 * (1.6 * 10⁷) = 4.0 * 10⁷. \n2. Express as 40 * 10⁶ to make taking the square root trivial: \n3. v = √(40 * 10⁶) = √40 * 10³ ≈ 6.32 * 10³ m s⁻¹. \n4. F_c = m * a_c = 800 * 2.5 = 2000 N."
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Radial Acceleration Equality",
        mark: "1m",
        description: "Equate centripetal acceleration to the ratio of velocity squared over radius.",
        math: "a_c = \\frac{v^2}{r}",
        examinerTip: "Rearrange the equation for v before plugging in raw values to ensure transparency.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Root Evaluation & Exponents",
        mark: "1m",
        description: "Carry out the square root calculation of scientific notation correctly: v = \\sqrt{4.0 \\times 10^7} = 6320 m s^-1.",
        math: "v = \\sqrt{a_c r} = 6.32 \\times 10^3\\text{ m s}^{-1}",
        examinerTip: "Forgetting to take the square root of the velocity value is a classic high-stress paper trap.",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Centripetal Force Evaluation",
        mark: "1m",
        description: "Apply Newton's Second Law to calculate the net required centripetal force F_c = m * a_c.",
        math: "F_c = m a_c = 2000\\text{ N}",
        examinerTip: "Provide answers with proper SI units (m s^-1 and N) and 3 significant figures.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "a_c = v² / r ⇒ v² = a_c · r",
            explanation: "Declare the core formula for circular acceleration and rearrange to express velocity as the target."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "v = √(2.5 · 1.6 · 10⁷) = √(4.0 · 10⁷) = 6324.5 m/s",
            explanation: "Execute exponent mathematics correctly, obtaining 6.32 × 10³ m s⁻¹ at three significant figures."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "F_c = m · a_c = 800 kg · 2.5 m s⁻² = 2000 N",
            explanation: "Calculate centripetal force by multiplying mass and centripetal acceleration as requested."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "v = a_c · r = 2.5 · 1.6 · 10⁷",
            explanation: "Candidate omitted the exponent 'v²' and solved for linear velocity erroneously without taking roots.",
            pitfallDesc: "Algebraic slip: Forgot that acceleration is proportional to the square of velocity."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "v = 4.0 · 10⁷ m/s",
            explanation: "Enormous speed obtained due to the lack of radical extraction. Candidate ignored physical plausibility.",
            pitfallDesc: "Omitted the radical completely, resulting in speed exceeding the speed of light."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "F_c = 800 · 4.0 · 10⁷ = 3.2 · 10¹⁰ N",
            explanation: "Computed a nonsensical centripetal force using the skewed velocity value, demonstrating no review of units.",
            pitfallDesc: "Compounded previous algebraic errors, completing calculations with unverified exponents."
          }
        ]
      }
    }
  },
  {
    id: "q_6_1_3",
    subtopic_code: "TOPIC_6_1",
    subtopic_title: "Circular Motion Dynamics",
    tier: 3,
    tier_name: "Tier 3: Handwritten Exam Derivation",
    type: "exam_trap_derivation",
    question_text: "A vehicle of mass m travels around a banked curve of radius r on a frictionless road inclined at an angle θ to the horizontal. Derive a rigorous expression for the safe speed v at which the vehicle can navigate the curve without slipping up or down, showing all steps explicitly.",
    hints: {
      scaffolding_tip: "Draw a free-body diagram. Note that without friction, the only forces are the normal force F_N acting perpendicular to the incline, and the weight mg acting downwards.",
      exponent_breakdown: "1. Vertical balance (no acceleration vertically): F_N cosθ = mg.\n2. Horizontal centripetal acceleration (provided by the horizontal component of the normal force): F_N sinθ = mv²/r.\n3. Divide: (F_N sinθ) / (F_N cosθ) = (mv²/r) / (mg).\n4. tanθ = v² / (rg) ⇒ v = √(rg tanθ)."
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Vertical Force Balance",
        mark: "1m",
        description: "Establish the vertical static balance of forces: normal force vertical component must equal weight.",
        math: "F_N \\cos\\theta = m g",
        examinerTip: "Drawing a precise free-body diagram prevents fatal cosine and sine transposition mistakes.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Centripetal Component Inequality",
        mark: "1m",
        description: "Equate the horizontal radial component of the normal force to the centripetal force formula.",
        math: "F_N \\sin\\theta = \\frac{m v^2}{r}",
        examinerTip: "Understand that the centripetal force is NOT an independent force; it is provided entirely by F_N's component.",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Division & Radical Isolation",
        mark: "1m",
        description: "Divide the equations to eliminate F_N and m, and take the square root to isolate v: v = \\sqrt{r g \\tan\\theta}.",
        math: "v = \\sqrt{r g \\tan\\theta}",
        examinerTip: "Note that the mass m cancels completely, meaning safe speed is entirely independent of vehicle mass.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "Vertical balance: F_N · cos(θ) = m · g",
            explanation: "The normal force acts perpendicular to the inclined track. Since there is zero vertical motion, the vertical component resolves as F_N cosθ = mg."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "Horizontal force: F_N · sin(θ) = m·v² / r",
            explanation: "The horizontal component of the normal force points directly towards the center of curvature, acting as the centripetal force: F_N sinθ = mv²/r."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "tan(θ) = v² / (r · g) ⇒ v = √(r · g · tan(θ))",
            explanation: "By dividing the centripetal equation by the vertical static equation, we cancel F_N and m, giving tanθ = v² / (rg), which isolates to v = √(rg tanθ)."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "F_N = m · g · cos(θ)",
            explanation: "Candidate falsely assumed the normal force acts of magnitude mg cosθ as if it were a static flat inclined box.",
            pitfallDesc: "Applied inclined-plane static equilibrium, ignoring that the car is accelerating radially."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "F_centripetal = m · g · sin(θ) = m · v² / r",
            explanation: "Equated centripetal force directly to a ramp component of gravity. This is a severe model-coupling mistake.",
            pitfallDesc: "Assuming gravitational force pushes the car horizontally onto its circular trajectory."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "v = √(r · g · sin(θ))",
            explanation: "Isolated speed under false assumptions. Final units are mathematically proper but physical parameters are completely wrong.",
            pitfallDesc: "Obtained a flawed relation that fails to reflect required normal constraints."
          }
        ]
      }
    }
  },

  // 2. TOPIC_6_2 (Newton's Law of Gravitation)
  {
    id: "q_6_2_1",
    subtopic_code: "TOPIC_6_2",
    subtopic_title: "Newton's Law of Gravitation",
    tier: 1,
    tier_name: "Tier 1: Conceptual Anchor",
    type: "conceptual_anchor",
    question_text: "According to Newton's universal law of gravitation, the force between two spherical point masses is inversely proportional to the square of their separation. If an astronaut is orbiting Earth in a stable circular space station, explain why they feel completely weightless despite being subject to strong gravitational attraction.",
    hints: {
      scaffolding_tip: "Think about free fall. Is there any normal contact force pushing up against the astronaut inside the spacecraft?"
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Define Gravitational Field Existence",
        mark: "1m",
        description: "State that a strong gravitational force still acts on both the astronaut and the station.",
        math: "F_g = \\frac{G M m}{r^2} \\neq 0",
        examinerTip: "Avoid saying 'there is no gravity in space'. At 400km altitude, Earth's gravity is actually about 90% of sea level.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Co-acceleration / Free Fall Concept",
        mark: "1m",
        description: "Explain that both the astronaut and the shuttle accelerate downward at the exact same rate: the local g.",
        math: "a_{astronaut} = a_{station} = g",
        examinerTip: "Use the term 'common acceleration' or 'unhindered free fall' to convince examiners.",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Absence of Normal Reaction Force",
        mark: "1m",
        description: "State that apparent weight is determined by the normal contact force (reaction force R), which becomes zero.",
        math: "R = 0",
        examinerTip: "Underline that weightlessness is 'apparent weightlessness' due to the lack of supporting normal compression.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "F_g = G M m / r² ≈ 0.90 · g_Earth",
            explanation: "A robust gravitational field still exists. The gravitational force represents the centripetal pull maintaining the orbit of both satellite and astronaut."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "a_astronaut = a_station = g_local = G M_Earth / r²",
            explanation: "Both astronaut and ship fall together with identical acceleration, as they are in the exact same circular trajectory."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "R = 0 (Normal contact reaction force vanishes)",
            explanation: "Sensation of weight requires a mechanical compression (normal surface force). Without a boundary pushing back, apparent weight is zero."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "g = 0 in space vacuum",
            explanation: "Candidate falsely says weightlessness happens because gravity is zero in space. Critical examiner failure.",
            pitfallDesc: "Widespread misconception: assumes distance to space instantly cancels planetary gravity."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "Shuttle shields astronaut from gravity",
            explanation: "Candidate claims the space station's metal hull 'shields' the astronaut from gravitational pull. Highly unphysical.",
            pitfallDesc: "Assumed electromagnetic shielding principles apply to gravitational forces."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "Astronaut floats because of zero pressure",
            explanation: "Incorrectly claims that weightlessness is caused by atmospheric vacuum, showing a failure to grasp basic Newtonian mechanics.",
            pitfallDesc: "Attributed weightlessness to cabin vacuum pressure instead of free fall dynamics."
          }
        ]
      }
    }
  },
  {
    id: "q_6_2_2",
    subtopic_code: "TOPIC_6_2",
    subtopic_title: "Newton's Law of Gravitation",
    tier: 2,
    tier_name: "Tier 2: Scaffolded Math",
    type: "scaffolded_math",
    question_text: "Determine the magnitude of the mutual gravitational pull between the Earth (mass M = 6.0 * 10^24 kg) and a spacecraft of mass m = 2.0 * 10^3 kg orbiting at an altitude exactly equal to Earth's radius (R_Earth = 6.4 * 10^6 meters). (Use G = 6.7 * 10^-11 N m^2 kg^-2).",
    hints: {
      scaffolding_tip: "Be extremely cautious with the separation distance 'r'. Altitude is given as equal to Earth's radius, meaning the distance from the center of the Earth is r = R_Earth + R_Earth = 2 * R_Earth.",
      exponent_breakdown: "1. Total radius r = 2 * R_Earth = 12.8 * 10⁶ m = 1.28 * 10⁷ m.\n2. r² = (1.28 * 10⁷)² = 1.64 * 10¹⁴ m².\n3. Product G * M * m = (6.7 * 10⁻¹¹) * (6.0 * 10²⁴) * (2.0 * 10³) = 80.4 * 10¹⁶.\n4. Divide: F_g = (80.4 * 10¹⁶) / (1.64 * 10¹⁴) = 49.0 * 10² ≈ 4900 N."
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Define Dynamic Center Distance",
        mark: "1m",
        description: "Specify distance r as the sum of Earth's radius plus altitude: r = 2 * R_Earth = 1.28 * 10^7 meters.",
        math: "r = R_E + R_E = 1.28 \\times 10^7\\text{ m}",
        examinerTip: "Never use altitude directly as the radius. Gravity acts between planetary centers.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Formulate Newton's Gravitational Law",
        mark: "1m",
        description: "Apply universal formula F = GMm/r² with specified parameters.",
        math: "F_g = \\frac{G M m}{(2R_E)^2}",
        examinerTip: "Writing out the variables before plugging in coordinates secures part marks even if arithmetic fails.",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Execute scientific exponent division",
        mark: "1m",
        description: "Evaluate the quotient with correct exponents, yielding 4.9 x 10^3 N (or 4900 N) at 2 significant figures.",
        math: "F_g = 4.90 \\times 10^3\\text{ N}",
        examinerTip: "Confirm standard rounding bounds and write down units explicitly to maximize score potential.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "r = R_Earth + altitude_Earth = 2 R_Earth = 1.28 × 10⁷ m",
            explanation: "Establish that gravitational separation must be computed central to planetary bodies, so r = 2 × 6.4 × 10⁶ = 1.28 × 10⁷ m."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "F_g = G · M · m / r²",
            explanation: "Declare Newton's force expression and plug in variables after establishing the actual radius squared."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "F_g = (6.7 · 10⁻¹¹) · (6.0 · 10²⁴) · (2000) / (1.28 · 10⁷)² = 4902 N",
            explanation: "Evaluate the product and check decimal fractions to secure 4.90 × 10³ N (3 s.f.)."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "r = 6.4 · 10⁶ m",
            explanation: "Candidate utilized Earth's radius or altitude directly without adding the center displacement. High risk.",
            pitfallDesc: "Omitted the altitude addition, estimating gravity at sea level instead of orbit."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "F_g = (6.7 · 10⁻¹¹) · (6.0 · 10²⁴) · (2000) / (6.4 · 10⁶)²",
            explanation: "Substituted wrong distance to the gravitational equation, ignoring center-of-mass definitions.",
            pitfallDesc: "Substituted raw radii directly, leading to a force that is 4x too large."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "F_g = 19600 N",
            explanation: "Obtained 1.96 x 10^4 N. This is mathematically correct for the wrong radius, but results in a 0 marks accuracy deduction.",
            pitfallDesc: "Missed the double-distance scaling, producing an erroneous gravitational force."
          }
        ]
      }
    }
  },
  {
    id: "q_6_2_3",
    subtopic_code: "TOPIC_6_2",
    subtopic_title: "Newton's Law of Gravitation",
    tier: 3,
    tier_name: "Tier 3: Handwritten Exam Derivation",
    type: "exam_trap_derivation",
    question_text: "Derive a comprehensive expression showing how the local gravitational acceleration g_local varies as a function of altitude h above the surface of a spherical planet of mass M and radius R. State how this reduces at sea level.",
    hints: {
      scaffolding_tip: "A test object of mass m at altitude h is attracted with force F = GMm/r² where r = R + h. Equate this to weight F = m*g_local.",
      exponent_breakdown: "1. Force of gravity: F_g = GMm / (R + h)².\n2. Force by acceleration: F_g = m * g_local.\n3. m * g_local = GMm / (R + h)².\n4. Cancel mass m: g_local = GM / (R + h)².\n5. At surface (h = 0): g_surface = GM / R²."
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Test Mass Formulation",
        mark: "1m",
        description: "Introduce a conceptual test mass m and equate its local weight to Newton's universal gravitational force.",
        math: "m g_{local} = \\frac{G M m}{r^2}",
        examinerTip: "Never define g without explaining the physical role of the test mass m being pulled.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Altitude Insertion & Cancelation",
        mark: "1m",
        description: "Cancel test mass m, and substitute r = R + h explicitly to show dependency on radial height.",
        math: "g_{local} = \\frac{G M}{(R + h)^2}",
        examinerTip: "Ensure 'R' represents planetary radius and 'h' represents height above surface, avoiding lowercase r clutter.",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Surface Boundary Limit",
        mark: "1m",
        description: "Evaluate the limit where h = 0, proving g_surface = GM/R² as the standard sea-level constant.",
        math: "g_{surface} = \\frac{G M}{R^2}",
        examinerTip: "Emphasize that planetary field strength falls off inversely with the square of the total center distance.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "Equate test mass pulled force: m · g_local = G M m / r²",
            explanation: "Define gravitational field strength g_local as force per unit test mass: g = F/m. Thus, the pull on test mass m is mg_local."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "Cancel test mass: g_local = G M / (R + h)²",
            explanation: "Cancel m from both sides. Distance from center r is planetary radius R plus altitude h. Substituting r gives g_local = GM / (R + h)²."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "Where altitude h = 0: g_surface = G M / R²",
            explanation: "At sea level, the altitude h is zero. The equation reduces to the familiar g_surface = GM / R², confirming inverse-square behavior."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "g_local = g · h",
            explanation: "Candidate incorrectly claims field strength increases proportionally with height. Complete failure of physics logic.",
            pitfallDesc: "Assumed direct linear relationship with altitude rather than inverse-square center separation."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "g = G · M / h²",
            explanation: "Substituted altitude h alone for distance, which implies field strength would go to infinity at the planet's surface.",
            pitfallDesc: "Omitted surface radius, leading to mathematical singularities at h = 0."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "g = 9.81 / h²",
            explanation: "Substituted sea level constants into an altitude scale blindly, demonstrating a failure to handle basic algebraic variables.",
            pitfallDesc: "Hardcoded earth metrics, missing planetary variables completely."
          }
        ]
      }
    }
  },

  // 3. TOPIC_10_1 (Gravitational Potential & escape velocity)
  {
    id: "q_10_1_1",
    subtopic_code: "TOPIC_10_1",
    subtopic_title: "Gravitational Potential",
    tier: 1,
    tier_name: "Tier 1: Conceptual Anchor",
    type: "conceptual_anchor",
    question_text: "The absolute gravitational potential V_g is defined as the work done per unit mass in bringing a small test mass from infinity to a point in the field. Explain conceptually why V_g must be a negative scalar quantity everywhere, and describe what absolute potential of zero physically means.",
    hints: {
      scaffolding_tip: "Think about the direction of the gravitational force. Since gravity is always attractive, do you need to do work, or does gravity do work on the mass as it approaches?"
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Attractive Force Definition",
        mark: "1m",
        description: "State that the gravitational force is strictly attractive, acting in the direction of the massive body.",
        math: "\\vec{F}_g = -\\frac{GMm}{r^2}\\vec{e}_r",
        examinerTip: "Explain that an attractive force does work ON the mass as it enters the field, releasing potential energy.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Work Allocation from Infinity",
        mark: "1m",
        description: "Work must be done by an external force AGAINST the attractive field to escape, meaning we must input energy to pull it to infinity.",
        math: "\\int F_{ext} dr > 0",
        examinerTip: "Note that since infinity is defined as the reference potential of zero, points closer must have negative potential energy.",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Scalar Nature Explanation",
        mark: "1m",
        description: "Clarify that potential is defined as work (energy) per mass, which possesses no spatial direction (scalar).",
        math: "V_g \\in \\mathbb{R}^-",
        examinerTip: "Emphasize that zero potential is located at infinite separation where gravitational pull ceases entirely.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "Gravitation is strictly attractive.",
            explanation: "As gravity pulls a mass inward, the field does positive work. This means the system loses potential energy as the mass gets closer."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "W_ext = - ∫ F_g dr < 0 (from infinity)",
            explanation: "Because the field draws the mass in, an external agent must do negative work to bring it in. Thus, potential is negative relative to infinity."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "V_g is potential, a scalar. V_g(∞) = 0 J/kg.",
            explanation: "At infinity, separation is absolute. Potential reaches its high ceiling of zero. Closer points are negative."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "V_g is negative because gravity pulls down.",
            explanation: "Candidate claims 'negative means down'. Complete failure to distinguish vectors from energy scaling scalars.",
            pitfallDesc: "Attributed vector directions to scalar energy potentials."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "Zero potential means zero gravity.",
            explanation: "Falsely points out that an absolute potential of zero means gravity is absent, completely missing the infinity boundary definition.",
            pitfallDesc: "Confused gravitational force magnitude with global energy potential references."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "V_g = -G M / r is negative because constant G is negative.",
            explanation: "Claimed that constant G carries a negative sign, illustrating a complete lack of basic mathematical understanding.",
            pitfallDesc: "Inverted physical constants to force negative algebraic outcomes."
          }
        ]
      }
    }
  },
  {
    id: "q_10_1_2",
    subtopic_code: "TOPIC_10_1",
    subtopic_title: "Gravitational Potential",
    tier: 2,
    tier_name: "Tier 2: Scaffolded Math",
    type: "scaffolded_math",
    question_text: "Calculate the escape velocity v_esc from the surface of a celestial body of mass M = 3.2 * 10^23 kg and surface radius R = 2.4 * 10^6 meters. (Use G = 6.7 * 10^-11 N m^2 kg^-2).",
    hints: {
      scaffolding_tip: "Equate kinetic energy when launched to the gain in gravitational potential energy to reach infinity: E_total = 0. Use v_esc = √(2GM/R).",
      exponent_breakdown: "1. 2GM = 2 * (6.7 * 10⁻¹¹) * (3.2 * 10²³) = 42.88 * 10¹².\n2. Divide by radius R: (42.88 * 10¹²) / (2.4 * 10⁶) = 17.87 * 10⁶.\n3. Take root: v_esc = √(17.87 * 10⁶) = √17.87 * 10³ ≈ 4.23 * 10³ m s⁻¹ = 4230 m s⁻¹."
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Energy Conservation Formulation",
        mark: "1m",
        description: "State that for escape, total final mechanical energy at infinity must be at least zero.",
        math: "E_k + E_p = 0 \\implies \\frac{1}{2}m v_{esc}^2 - \\frac{G M m}{R} = 0",
        examinerTip: "Always start kinetic and potential allocations with their explicit sum before simplifying.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Speed Expression Derivation",
        mark: "1m",
        description: "Cancel satellite mass m and isolate v_esc: v_esc = \\sqrt{2GM/R}.",
        math: "v_{esc} = \\sqrt{\\frac{2 G M}{R}}",
        examinerTip: "Explicitly highlight that orbital mass m has no influence over the escape requirements.",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Decimal & Exponent Evaluation",
        mark: "1m",
        description: "Run the arithmetic accurately, getting 4.2 x 10^3 m s^-1 (or 4230 m s^-1) with proper SI units.",
        math: "v_{esc} = 4.23 \\times 10^3\\text{ m s}^{-1}",
        examinerTip: "Check that the final velocity is expressed in m s^-1, not km h^-1 unless asked.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "½ m v_esc² - G M m / R = 0",
            explanation: "Set the total energy equal to zero at the boundary of infinity. The initial kinetic energy must balance the negative potential energy."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "v_esc = √(2 G M / R)",
            explanation: "Cancel the mass m of the escaping object from both terms and isolate velocity, justifying that escape is independent of mass."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "v_esc = √(2 · 6.7 · 10⁻¹¹ · 3.2 · 10²³ / 2.4 · 10⁶) = 4227 m/s",
            explanation: "Complete the numerical solution with proper scientific notation to obtain 4.23 × 10³ m s⁻¹ (to 3 s.f.)."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "½ m v² = m g r",
            explanation: "The candidate equated kinetic energy to mgh, ignoring the varying strength of gravitational force over large distances.",
            pitfallDesc: "Used flat-earth static potential energy mgh instead of universal field potential energy -GMm/r."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "v = √(G M / R)",
            explanation: "Omitted the coefficient of 2 in the radical formula, confusing orbital speed with escape speed.",
            pitfallDesc: "Omitted the kinetic multiplier, confusing orbital speed equations with escape speed thresholds."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "v = 2990 m/s",
            explanation: "Yielded ~2.99 x 10^3 m/s due to missing the factor of 2. Results are incorrect, losing precision marks.",
            pitfallDesc: "Obtained a lower velocity threshold, which is insufficient to escape planetary gravitational bonds."
          }
        ]
      }
    }
  },
  {
    id: "q_10_1_3",
    subtopic_code: "TOPIC_10_1",
    subtopic_title: "Gravitational Potential",
    tier: 3,
    tier_name: "Tier 3: Handwritten Exam Derivation",
    type: "exam_trap_derivation",
    question_text: "Derive the exact formula for escape velocity from first principles, integrating the work done against a varying gravitational force from the planet's surface R to infinity.",
    hints: {
      scaffolding_tip: "Integrate gravitational force: W = ∫ F dr from R to infinity. Note that force is GMm/r².",
      exponent_breakdown: "1. Force: F = GMm/r².\n2. Work = ∫ [R to ∞] (GMm / r²) dr = GMm * [-1/r] [R to ∞] = GMm / R.\n3. Keep kinetic energy: ½ m v² = GMm / R.\n4. Solve: v = √(2GM/R)."
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Work Integration Definiton",
        mark: "1m",
        description: "Express the minimum work required to move mass m to infinity as the integral of gravitational force from R to infinity.",
        math: "W_g = \\int_{R}^{\\infty} \\frac{G M m}{r^2} dr",
        examinerTip: "Using integration proves true foundational mathematical knowledge in Paper 2.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Execute Definite Integral",
        mark: "1m",
        description: "Solve the calculus integration to yield the gravitational potential energy transfer GMm/R.",
        math: "W_g = G M m \\left[ -\\frac{1}{r} \\right]_{R}^{\\infty} = \\frac{G M m}{R}",
        examinerTip: "Demonstrate that the limits evaluated at infinity yield zero, and the boundary at R yields -1/R (subtracted).",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Equate to Kinetic Energy",
        mark: "1m",
        description: "Equate this work done to the initial kinetic energy and isolate v to get v = \\sqrt{2GM/R}.",
        math: "v_{esc} = \\sqrt{\\frac{2 G M}{R}}",
        examinerTip: "Explicitly highlight the cancellation of satellite mass, demonstrating Keplerian scaling.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "W = ∫_R^∞ [G M m / r²] dr",
            explanation: "The mechanical work required to lift an object is the integral of the pulling force against a varying radial separation."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "W = G M m [-1/r]_R^∞ = G M m / R",
            explanation: "Integrate 1/r² to get -1/r. Evaluating from R to infinity is GMm/R, which represents the total potential well depth."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "½ m v_esc² = G M m / R ⇒ v_esc = √(2 G M / R)",
            explanation: "Set launch kinetic energy equal to this radial binding work to isolate the required escape speed."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "W = Force · distance = [G M m / r²] · R",
            explanation: "The candidate multiplied force directly by r, ignoring that the gravitational force drops off as distance increases.",
            pitfallDesc: "Assumed static force over an dynamic infinite range, neglecting basic calculus parameters."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "kinetic energy = G M m",
            explanation: "Omitted orbital velocity parameters and attempted to balance energy with a force product directly.",
            pitfallDesc: "Dimensional incompatibility: balanced kinetic energy against raw mass coefficients."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "v = 0, trapped forever",
            explanation: "Concluded incorrectly that escaping is impossible since gravity reaches infinity, showing a lack of understanding of limits.",
            pitfallDesc: "Flawed physical intuition: assumed an infinite integral must evaluate to infinite required energy."
          }
        ]
      }
    }
  },

  // 4. TOPIC_10_2 (Orbital Motion & Kepler's 3rd Law)
  {
    id: "q_10_2_1",
    subtopic_code: "TOPIC_10_2",
    subtopic_title: "Orbital Motion",
    tier: 1,
    tier_name: "Tier 1: Conceptual Anchor",
    type: "conceptual_anchor",
    question_text: "For a satellite in a stable circular orbit around a planet, state the distinct mechanical formulas for its Kinetic Energy (E_k), Gravitational Potential Energy (E_p), and Total Mechanical Energy (E_total). Contrast their absolute magnitudes and explain why total mechanical energy must be negative.",
    hints: {
      scaffolding_tip: "Start by equating centripetal force and gravity to express v² in terms of GM/r. This unlocks kinetic energy E_k = ½mv²."
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Expression of kinetic energy",
        mark: "1m",
        description: "Derive kinetic energy in terms of Keplerian metrics using centripetal force balance.",
        math: "E_k = \\frac{G M m}{2 r}",
        examinerTip: "Notice that kinetic energy is always positive, and represents exactly half the potential magnitude.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Expression of potential energy",
        mark: "1m",
        description: "Express universal gravitational potential energy as negative, relative to infinity.",
        math: "E_p = -\\frac{G M m}{r}",
        examinerTip: "Keep the negative sign! In circular orbits, potential energy is twice as large as kinetic energy in magnitude.",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Summation of total energy",
        mark: "1m",
        description: "Add kinetic and potential energy to find total mechanical energy. Show that E_total = -GMm/(2r).",
        math: "E_{total} = E_k + E_p = -\\frac{G M m}{2 r}",
        examinerTip: "Explain that negative total energy means the satellite is gravitationally bound to the planet and cannot escape.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "F_c = F_g ⇒ m v²/r = G M m / r² ⇒ E_k = ½ m v² = G M m / (2r)",
            explanation: "The centripetal force is supplied by gravity. Rearrange this balance to express kinetic energy as a positive potential fraction."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "E_p = - G M m / r",
            explanation: "Declare potential energy as negative everywhere relative to infinity, representing a bound state."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "E_total = E_k + E_p = G M m / (2r) - G M m / r = - G M m / (2r)",
            explanation: "Adding both terms shows the total mechanical energy is negative. This negative sign confirms the satellite is trapped in local orbit."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "E_k = m · g · h",
            explanation: "The candidate incorrectly assigned standard potential notation to kinetic energy, confusing force parameters.",
            pitfallDesc: "Substituted static surface energy expressions instead of orbital kinetic metrics."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "E_p = + G M m / r",
            explanation: "Assigned positive signs to potential energy, signifying a system that repels rather than attracts.",
            pitfallDesc: "Omitted negative notation on potential equations, implying infinite repulsion."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "E_total = G M m / 1.5r",
            explanation: "Added variables in an physically impossible way, producing a positive total energy result which violates orbital mechanics.",
            pitfallDesc: "Computed positive total energy, indicating a planet-escaping system."
          }
        ]
      }
    }
  },
  {
    id: "q_10_2_2",
    subtopic_code: "TOPIC_10_2",
    subtopic_title: "Orbital Motion",
    tier: 2,
    tier_name: "Tier 2: Scaffolded Math",
    type: "scaffolded_math",
    question_text: "Calculate the orbital speed v of a tracking probe in circular orbit around Jupiter (mass M = 1.9 * 10^27 kg) at an orbital radius of r = 8.0 * 10^7 meters. (Use G = 6.7 * 10^-11 N m^2 kg^-2).",
    hints: {
      scaffolding_tip: "Equate the centripetal and gravitational forces as the starting groundwork, then isolate velocity: v = √(GM/r).",
      exponent_breakdown: "1. Keplerian quotient: G * M = (6.7 * 10⁻¹¹) * (1.9 * 10²⁷) = 12.73 * 10¹⁶.\n2. Divide by radius r: (12.73 * 10¹⁶) / (8.0 * 10⁷) = 1.59 * 10⁹ = 15.9 * 10⁸.\n3. Take root: v = √(15.9 * 10⁸) = √15.9 * 10⁴ ≈ 3.99 * 10⁴ m s⁻¹ = 39,900 m s⁻¹."
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Planetary Force Integration",
        mark: "1m",
        description: "Equate centripetal force to planetary gravitation.",
        math: "\\frac{m v^2}{r} = \\frac{G M m}{r^2}",
        examinerTip: "Show the cancellation of the probe mass m clearly on paper.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Algebraic Isolation of Speed",
        mark: "1m",
        description: "Isolate the velocity parameter to get v = \\sqrt{GM/r}.",
        math: "v = \\sqrt{\\frac{G M}{r}}",
        examinerTip: "Avoid putting numbers inside the radical until the algebraic variables are completely isolated.",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Calculate Numerical Value",
        mark: "1m",
        description: "Execute scientific exponent division correctly, yielding 4.0 x 10^4 m s^-1 at 2 significant figures.",
        math: "v = 3.99 \\times 10^4\\text{ m s}^{-1}",
        examinerTip: "Rounding is vital. 3.99 x 10^4 is appropriate; check that your units are correct.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "m v² / r = G M m / r²",
            explanation: "State that the gravitational pull supplies the required centripetal force for circular orbits."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "v = √(G M / r)",
            explanation: "Cancel the satellite mass m from both sides and multiply by r to isolate velocity squared before taking the root."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "v = √(6.7 · 10⁻¹¹ · 1.9 · 10²⁷ / 8.0 · 10⁷) = 39906 m/s",
            explanation: "Carry out the square root calculation of the scientific fraction to yield 3.99 × 10⁴ m s⁻¹."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "v = G M / r²",
            explanation: "Candidate wrote the formula for gravitational field strength g instead of orbital speed v. Serious physics mismatch.",
            pitfallDesc: "Substituted field strength equations in place of velocity expressions."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "v = (6.7 · 10⁻¹¹) · (1.9 · 10²⁷) / (8.0 · 10⁷)²",
            explanation: "Tried to calculate speed utilizing raw field equations, leading to incorrect powers of ten.",
            pitfallDesc: "Divided by squared radius directly, neglecting radical requirements."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "v = 19.8 m/s",
            explanation: "Obtained a tiny velocity of 19.8 m s^-1 due to incorrect formula usage, failing to realize a planet-scaling speed must be massive.",
            pitfallDesc: "Calculated highly implausible planetary speed without reviewing orders of magnitude."
          }
        ]
      }
    }
  },
  {
    id: "q_10_2_3",
    subtopic_code: "TOPIC_10_2",
    subtopic_title: "Orbital Motion",
    tier: 3,
    tier_name: "Tier 3: Handwritten Exam Derivation",
    type: "exam_trap_derivation",
    question_text: "Derive Kepler's Third Law of planetary motion (T^2 is proportional to r^3) from Newtonian mechanics for a circular orbit of radius r around a central mass M, defining all physical constants explicitly.",
    hints: {
      scaffolding_tip: "Equate centripetal force to universal gravitational force. Then replace the linear speed 'v' in terms of period: v = 2*pi*r/T.",
      exponent_breakdown: "1. Balance: m v²/r = GMm/r² ⇒ v² = GM/r.\n2. Sub v = 2πr/T: (2πr / T)² = GM / r.\n3. Expand: 4π²r² / T² = GM / r.\n4. Rearrange: T² = (4π² / GM) * r³."
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Orbital Balance Equating",
        mark: "1m",
        description: "Equate centripetal force to Newton's universal gravitational force.",
        math: "\\frac{m v^2}{r} = \\frac{G M m}{r^2} \\implies v^2 = \\frac{G M}{r}",
        examinerTip: "Stating this basic mechanical equality is mandatory for any orbital proof in Paper 2.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Period velocity substitution",
        mark: "1m",
        description: "Substitute the circular motion period relation v = 2pi*r/T into the velocity squared expression.",
        math: "\\left(\\frac{2\\pi r}{T}\\right)^2 = \\frac{G M}{r}",
        examinerTip: "Be careful to square all terms inside the parentheses (especially 2 to 4 and pi to pi^2).",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Keplerian Constant Isolation",
        mark: "1m",
        description: "Rearrange the equation algebraically to isolate T² and show T² = (4pi²/GM) * r³.",
        math: "T^2 = \\left(\\frac{4\\pi^2}{G M}\\right) r^3",
        examinerTip: "Conclude by stating that 4pi²/GM is a constant for the given central body, satisfying the proportionality.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "F_centripetal = F_gravity ⇒ m v² / r = G M m / r² ⇒ v² = G M / r",
            explanation: "Declare that gravity acting on the planet/satellite provides the centripetal force. Cancel mass m of the orbiter."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "v = 2 π r / T ⇒ (2 π r / T)² = G M / r ⇒ 4 π² r² / T² = G M / r",
            explanation: "The velocity of a circular orbit relates to period T by v = 2πr/T. Substitute this expression and expand it cleanly on paper."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "T² = (4 π² / G M) · r³ ⇒ T² ∝ r³ (since 4π²/GM is constant)",
            explanation: "Rearrange to group the constants on one side: T² = (4π²/GM) r³. This mathematically derives Kepler's Third Law."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "v = ω · r",
            explanation: "The candidate introduced angular frequency but did not state any relating force equilibrium, preventing any progress.",
            pitfallDesc: "Wrote circular motion variables without establishing gravitational source forces."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "4 π r² / T² = G M / r",
            explanation: "Made an algebraic typo while squaring: writing 2² as 2 rather than 4, and omitting pi squared completely.",
            pitfallDesc: "Failed to square coefficients in the period substitution (wrote 2π instead of 4π²)."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "T = r³ / G M",
            explanation: "Incorrectly grouped the constants without the squared term of the period, concluding with mismatched dimensional metrics.",
            pitfallDesc: "Obtained a dimensionally incorrect relation violating orbital physics."
          }
        ]
      }
    }
  },

  // 5. TOPIC_10_3 (Equipotential Surfaces)
  {
    id: "q_10_3_1",
    subtopic_code: "TOPIC_10_3",
    subtopic_title: "Equipotential Surfaces",
    tier: 1,
    tier_name: "Tier 1: Conceptual Anchor",
    type: "conceptual_anchor",
    question_text: "Equipotential lines represent coordinates of equal gravitational potential. Contrast the work done moving a mass along a single circular contour versus moving a mass radially between two distinct contours, and justify the work value using dot product definitions.",
    hints: {
      scaffolding_tip: "Work is W = F * d * cosθ. For a path along an equipotential, how does the direction of the force vector compare to the travel vector?"
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Gravitational perpendicularity definition",
        mark: "1m",
        description: "State that gravitational field lines (and force) are always perpendicular to equipotential surfaces at every intersection.",
        math: "d\\vec{r} \\cdot \\vec{g} = 0",
        examinerTip: "Remember that potential is a constant on the surface, so potential difference along a contour is zero.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Work equation along contour",
        mark: "1m",
        description: "Show that since force is perpendicular to displacement (theta = 90 deg), work along an equipotential line is zero.",
        math: "W = \\vec{F} \\cdot \\Delta\\vec{r} = F \\Delta r \\cos(90^\\circ) = 0\\text{ J}",
        examinerTip: "Use the relation dW = m * dVg. Since dVg = 0, work done must also be zero.",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Work equation between contours",
        mark: "1m",
        description: "Justify that moving between distinct surfaces changes potential (Vg unequal), requiring a proportional work input: W = m * delta_Vg.",
        math: "W = m \\Delta V_g \\neq 0",
        examinerTip: "Highlight that this work done is independent of the path taken, as gravity is a conservative field.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "g is perpendicular to equipotential surfaces.",
            explanation: "Gravitational field lines act along the steepest descent, making them perpendicular to the constant potential lines at all times."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "Along contour: ΔV_g = 0 ⇒ W = m · ΔV_g = 0 J",
            explanation: "Because potential is constant on the contour, the potential difference is zero. Work done along the curve is exactly zero."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "Between contours: W = m · (V_final - V_initial) ≠ 0 J",
            explanation: "Moving radially between surfaces changes potential, requiring work: W = mΔV. Crucially, this work is independent of the path shape."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "Equipotential means equal gravity.",
            explanation: "Candidate falsely stated that equipotential means the gravitational force is identical everywhere. Vital field error.",
            pitfallDesc: "Confused equal potential energy regions with absolute field force magnitudes."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "W = F · d along a circle = F · 2 π r",
            explanation: "Tried to calculate non-zero work along the circle by multiplying circular perimeter by force, representing a basic vector failure.",
            pitfallDesc: "Failed to account for the dot product angle theta, calculating circular path limits incorrectly."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "W depends on rocket arc shape",
            explanation: "Incorrectly claimed that path deviation increases energy cost, showing a failure to grasp conservative fields.",
            pitfallDesc: "Assumed friction-like path dependencies apply to gravitational energy transfers."
          }
        ]
      }
    }
  },
  {
    id: "q_10_3_2",
    subtopic_code: "TOPIC_10_3",
    subtopic_title: "Equipotential Surfaces",
    tier: 2,
    tier_name: "Tier 2: Scaffolded Math",
    type: "scaffolded_math",
    question_text: "A cargo probe of mass m = 400 kg is moved from a low orbit equipotential surface where V_initial = -6.0 * 10^7 J kg^-1 to a higher synchronous shelf where V_final = -2.5 * 10^7 J kg^-1. Calculate the work done on the probe to execute this adjustment.",
    hints: {
      scaffolding_tip: "Work done in a potential field is W = m * ΔV_g = m * (V_final - V_initial). Be extremely careful with the negative signs of planetary potentials.",
      exponent_breakdown: "1. Potential difference: ΔV = V_final - V_initial = (-2.5 * 10⁷) - (-6.0 * 10⁷).\n2. ΔV = (-2.5 + 6.0) * 10⁷ = 3.5 * 10⁷ J kg⁻¹.\n3. Multiply by mass: Work = m * ΔV = 400 * (3.5 * 10⁷).\n4. Work = 1400 * 10⁷ = 1.4 * 10¹⁰ Joules."
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Work-Potential Definition",
        mark: "1m",
        description: "State that the mechanical work done equals the mass of the probe times the gravitational potential change.",
        math: "W_g = m (V_{final} - V_{initial})",
        examinerTip: "Always formulate V_final minus V_initial to prevent sign errors on mechanical work outputs.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Navigate Double Negatives",
        mark: "1m",
        description: "Show step-by-step subtraction of negative indices: -2.5*10^7 - (-6.0*10^7) = 3.5*10^7 J kg^-1.",
        math: "\\Delta V_g = 3.5 \\times 10^7\\text{ J kg}^{-1}",
        examinerTip: "Double-check that subtracting a bigger negative potential leads to a net positive increase in energy.",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Product scaling with units",
        mark: "1m",
        description: "Multiply to find total work done: W_g = 1.4 x 10^10 J. Include proper SI units (J or MJ/GJ).",
        math: "W_g = 1.40 \\times 10^{10}\\text{ J}",
        examinerTip: "Represent your solution in standard scientific notation with 3 significant figures.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "W = m · (V_final - V_initial)",
            explanation: "Formulate that work equals mass multiplied by the change in absolute potential."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "ΔV = (-2.5 · 10⁷) - (-6.0 · 10⁷) = 3.5 · 10⁷ J kg⁻¹",
            explanation: "Evaluate the potential difference accurately, resolving double negative signs to get a positive potential change."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "W = 400 · (3.5 · 10⁷) = 1.40 × 10¹⁰ J",
            explanation: "Execute final calculations to obtain 1.40 × 10¹⁰ J (or 14 GJ) of required work."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "W = m · (V_initial - V_final)",
            explanation: "The candidate reversed the order of subtraction, resulting in negative work, which would represent descent.",
            pitfallDesc: "Reversed potential coordinates, predicting negative work for lifting."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "ΔV = -2.5 · 10⁷ + 6.0 · 10⁷ = -8.5 · 10⁷ J kg⁻¹",
            explanation: "Performed addition error on negative values, treating the brackets incorrectly.",
            pitfallDesc: "Incorrect arithmetic with negative coefficients, producing a skewed potential potential difference."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "W = -3.4 · 10¹⁰ J",
            explanation: "Obtained a negative work value, which violates orbital principles for climbing heights.",
            pitfallDesc: "Concluded with negative metrics, defying basic thermodynamic energy conservation."
          }
        ]
      }
    }
  },
  {
    id: "q_10_3_3",
    subtopic_code: "TOPIC_10_3",
    subtopic_title: "Equipotential Surfaces",
    tier: 3,
    tier_name: "Tier 3: Handwritten Exam Derivation",
    type: "exam_trap_derivation",
    question_text: "Let R be planetary radius. Derive the total work done needed to lift a satellite of mass m from planetary orbit r = 2R to r = 4R from first principles. Express final answer in terms of surface gravity surface parameter g_surface, and planetary radius R.",
    hints: {
      scaffolding_tip: "Work is change in potential energy ΔE_p. E_p = -GMm/r. Replace GM with g_surface * R².",
      exponent_breakdown: "1. Potential difference: ΔE_p = [-GMm / 4R] - [-GMm / 2R].\n2. ΔE_p = GMm / (4R) = (GM/R²) * (mR) / 4.\n3. Since g_surface = GM/R².\n4. Work = ¼ m * g_surface * R."
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Universal Potential Difference",
        mark: "1m",
        description: "Specify the mechanical potential well shift using gravitational potential formulation.",
        math: "\\Delta E_p = -\\frac{G M m}{4R} - \\left(-\\frac{G M m}{2R}\\right)",
        examinerTip: "Always write potential energy terms with negative notation to indicate a binding well.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Expression Multiplication Simplification",
        mark: "1m",
        description: "Combine factors algebraically to yield kinetic/potential bounds: ΔE_p = GMm / (4R).",
        math: "\\Delta E_p = \\frac{G M m}{4R}",
        examinerTip: "Double-check your fractions: -1/4 + 1/2 = +1/4.",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Surface Gravity Translation",
        mark: "1m",
        description: "Substitute g_surface = GM/R² to achieve final parameter scale: Work = m * g_surface * R / 4.",
        math: "W_g = \\frac{1}{4} m g_{surface} R",
        examinerTip: "Translate universal variables into local observable metrics (g and R) as requested.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "ΔE_p = E_p(4R) - E_p(2R) = [-G M m / 4R] - [-G M m / 2R]",
            explanation: "Determine work as the difference in planetary gravitational potential energy between both given levels."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "ΔE_p = G M m [ -¼ + ½ ] / R = G M m / (4R)",
            explanation: "Carry out fractional calculations carefully, simplifying terms to combine mass coefficients to GMm / (4R)."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "Since g_surface = G M / R² ⇒ G M = g_surface · R² ⇒ Work = ¼ m g_surface R",
            explanation: "Express the product GM in terms of local surface field parameter g_surface, yielding ¼ mg_surface R as required."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "Work = F · d = [G M m / (2R)²] · 2R",
            explanation: "Used static force values over the entire orbit adjustments, yielding simplified flat-plane coordinates.",
            pitfallDesc: "Used a constant force model over a wide varying radial path."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "Work = G M m / 8R",
            explanation: "Failed to evaluate subtraction on negative denominators, resulting in excessive radial leakage values.",
            pitfallDesc: "Fractional error: evaluated -1/4 - (-1/2) as -1/8 or similar."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "Work = m · g_surface · 2R",
            explanation: "Wrote linear distance metrics directly, losing correct physical parameters on orbital integration structures.",
            pitfallDesc: "Left final formula with incorrect dimensions violating gravity fields."
          }
        ]
      }
    }
  },

  // 6. TOPIC_10_4 (Field Strength vs. Potential Gradient)
  {
    id: "q_10_4_1",
    subtopic_code: "TOPIC_10_4",
    subtopic_title: "Field Strength & Potential Gradient",
    tier: 1,
    tier_name: "Tier 1: Conceptual Anchor",
    type: "conceptual_anchor",
    question_text: "The relationship between gravitational field strength g and potential V_g is represented as g = -dV_g/dr. Explain conceptually why a negative sign is mandatory in this derivative, and describe what the steepness of a potential gradient represents physically.",
    hints: {
      scaffolding_tip: "Think about the direction of mechanical motion. Does a mass naturally accelerate toward higher potential or lower potential?"
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Define field strength direction",
        mark: "1m",
        description: "State that gravitational field strength (g) is a vector pointing in the direction of forces, attracting masses inward.",
        math: "\\vec{g} = -\\vec{\\nabla} V_g",
        examinerTip: "Field direction is defined as the accelerating direction of a positive test mass.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Negative Potential Slope Relation",
        mark: "1m",
        description: "Justify that masses naturally slide down potential gradients (from high potential to low potential).",
        math: "\\Delta V_g < 0 \\implies a_r < 0",
        examinerTip: "Thus, the negative sign is necessary to ensure the vector g points in the direction of decreasing potential.",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Gradient Steepness Concept",
        mark: "1m",
        description: "Conclude that the potential gradient steepness (slope) directly determines the magnitude of local field strength.",
        math: "|\\vec{g}| = \\frac{dV_g}{dr}",
        examinerTip: "Closer equipotential lines indicate a steeper gradient, meaning a stronger gravitational attractive force.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "g acts in the direction of local gravitational force.",
            explanation: "Field strength g represents the attractive force acting on unit test mass. It points inward, towards the planet."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "Potential decreases inward, so slope dV/dr is positive outward.",
            explanation: "As radius r increases, potential V_g becomes less negative (increases). Thus slope dV_g/dr is positive outward. To match the inward force, we must invert this slope: g = -dV/dr."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "Steepness = |g| (closer lines indicate a stronger field)",
            explanation: "The rate of change of potential with distance represents field capacity: a steeper potential gradient means a much stronger spatial pull."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "g is negative because gravity is negative energy.",
            explanation: "Candidate confused acceleration vectors with scalar potentials, assuming 'g' is a negative energy coefficient.",
            pitfallDesc: "Attributed energy scaling properties directly to coordinate accelerations."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "dV/dr is always negative.",
            explanation: "Claimed potential decreases with distance, missing that potential becomes closer to zero (increases) at larger radii.",
            pitfallDesc: "Confused absolute negative numbers with slopes, asserting potential falls off."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "Slope means rocket escape slope",
            explanation: "Attributed the word 'gradient' to physical launch profiles on surface terrain, demonstrating no field awareness.",
            pitfallDesc: "Treated field potentials as physical hill slopes, ignoring field mechanics."
          }
        ]
      }
    }
  },
  {
    id: "q_10_4_2",
    subtopic_code: "TOPIC_10_4",
    subtopic_title: "Field Strength & Potential Gradient",
    tier: 2,
    tier_name: "Tier 2: Scaffolded Math",
    type: "scaffolded_math",
    question_text: "In a certain region of space, the gravitational potential changes uniformly from V_1 = -5.4 * 10^7 J kg^-1 to V_2 = -5.0 * 10^7 J kg^-1 over a radial distance of exactly 8.0 * 10^5 meters. Determine the magnitude of the gravitational field strength g in this region.",
    hints: {
      scaffolding_tip: "Average field strength is related to potential gradient by g = -ΔV_g / Δr. Work with positive magnitude calculations: g = |(V_2 - V_1) / Δr|.",
      exponent_breakdown: "1. Potential change: ΔV = V_2 - V_1 = (-5.0 * 10⁷) - (-5.4 * 10⁷) = +0.4 * 10⁷ J kg⁻¹ = 4.0 * 10⁶ J kg⁻¹.\n2. Delta r: Δr = 8.0 * 10⁵ m.\n3. Divide indices: g = (4.0 * 10⁶) / (8.0 * 10⁵).\n4. Evaluate coefficient: 4.0 / 8.0 = 0.5. Evaluate powers: 10⁶ / 10⁵ = 10¹.\n5. Answer: g = 0.5 * 10 = 5.0 m s⁻² (or N kg⁻¹)."
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Potential Gradient Equation",
        mark: "1m",
        description: "Formulate the field strength in terms of potential difference over distance.",
        math: "g = -\\frac{\\Delta V_g}{\\Delta r}",
        examinerTip: "Placing absolute values around potential difference isolates magnitude checks seamlessly.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Process Potential Difference Indices",
        mark: "1m",
        description: "Calculate potential shift correctly: -5.0*10^7 - (-5.4*10^7) = 4.0*10^6 J kg^-1.",
        math: "\\Delta V_g = 4.0 \\times 10^6\\text{ J kg}^{-1}",
        examinerTip: "A positive potential difference indicates that the final state has higher potential energy.",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Calculated Field Value",
        mark: "1m",
        description: "Evaluate dry division to arrive at g = 5.0 m s^-2 (or N kg^-1) with proper SI units.",
        math: "g = 5.00\\text{ N kg}^{-1}",
        examinerTip: "Both N kg^-1 and s^-2 represent valid field units. Ensure you record units on paper.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "g = - ΔV_g / Δr",
            explanation: "State the potential gradient relation: gravitational field strength is equal to negative change in potential over distance."
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "ΔV = (-5.0 · 10⁷) - (-5.4 · 10⁷) = 4.0 · 10⁶ J kg⁻¹",
            explanation: "Subtract initial potential from final potential carefully, resolving negatives to get +4.0 × 10⁶ J kg⁻¹."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "g = - (4.0 · 10⁶ J kg⁻¹) / (8.0 · 10⁵ m) = -5.0 m/s² (Magnitude = 5.0 m s⁻²)",
            explanation: "Perform the arithmetic division: 4.0 × 10⁶ / 8.0 × 10⁵ = 5.0. Conclude with proper SI unit of N kg⁻¹ or m s⁻²."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "g = V · r",
            explanation: "Candidate multiplied potential by distance instead of dividing, showing a complete dimensional mismatch.",
            pitfallDesc: "Multiplied potential by separation rather than determining local steepness gradients."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "g = -5.4 · 10⁷ · 8.0 · 10⁵",
            explanation: "Applied incorrect variables and multiplied massive scientific decimals without verification.",
            pitfallDesc: "Executed massive multiplication, producing an unphysical field magnitude."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "g = 4.32 · 10¹³ N/kg",
            explanation: "Obtained a field strength many orders of magnitude larger than a black hole, demonstrating zero physical checks.",
            pitfallDesc: "Concluded with a massive value violating basic physical limits."
          }
        ]
      }
    }
  },
  {
    id: "q_10_4_3",
    subtopic_code: "TOPIC_10_4",
    subtopic_title: "Field Strength & Potential Gradient",
    tier: 3,
    tier_name: "Tier 3: Handwritten Exam Derivation",
    type: "exam_trap_derivation",
    question_text: "Show by integration of the gravitational force over an infinitesimal range dr that the potential gradient formulation dV_g / dr is mathematically equivalent to the local field strength. Declare boundary values.",
    hints: {
      scaffolding_tip: "Define work done on test mass m as dW = -F_g * dr. Also define work in terms of potential difference as dW = m * dV_g.",
      exponent_breakdown: "1. Work: dW = -F_g * dr (against field).\n2. Force: F_g = m * g.\n3. Substitute: dW = -m * g * dr.\n4. Equate to potential difference: m * dV_g = -m * g * dr.\n5. Cancel mass m: dV_g = -g * dr ⇒ g = -dV_g/dr."
    },
    markscheme_criteria: [
      {
        id: "groundwork",
        title: "Work-Force Definition",
        mark: "1m",
        description: "Formulate work done on test mass m against attracting field: dW = -F_g * dr.",
        math: "dW = -F dr",
        examinerTip: "The negative sign signifies that work acts against the radial gravitational attractive force.",
        badge: "Groundwork"
      },
      {
        id: "manipulation",
        title: "Mass Potential Equivalence",
        mark: "1m",
        description: "Equate the mechanical work expression to change in potential energy dW = m * dVg.",
        math: "m dV_g = -m g_{local} dr",
        examinerTip: "Recognizing that potential acts as energy per unit mass is critical to linking both definitions.",
        badge: "Manipulation"
      },
      {
        id: "precision",
        title: "Derivative Isolation Check",
        mark: "1m",
        description: "Cancel test mass m and isolate derivative: g = -dVg/dr.",
        math: "g_{local} = -\\frac{dV_g}{dr}",
        examinerTip: "Underline that the field strength works in the direction of steepest potential decline.",
        badge: "Precision"
      }
    ],
    solutions: {
      perfect: {
        steps: [
          {
            id: "groundwork",
            title: "Groundwork Step",
            formula: "dW = - F_g · dr",
            explanation: "Define work done dW to move a test mass m through an infinitesimal radial distance dr against an attractive gravitational force F_"
          },
          {
            id: "manipulation",
            title: "Manipulation Step",
            formula: "dW = m · dV_g and F_g = m · g_local",
            explanation: "Substitute mechanical force F_g = mg_local, and equate the work to potential energy definition dW = m dV_g: m dV_g = -m g_local dr."
          },
          {
            id: "precision",
            title: "Precision Step",
            formula: "Cancel test mass: dV_g = - g_local · dr ⇒ g_local = - dV_g / dr",
            explanation: "Cancel the mass parameter m of our test body. Rearranging isolates the derivative, proving g = -dV_g/dr."
          }
        ]
      },
      defective: {
        steps: [
          {
            id: "groundwork",
            title: "Defective Attempt",
            formula: "g = ∫ V dr",
            explanation: "The candidate integrated potential instead of differentiating, reversing the correct mathematical calculus.",
            pitfallDesc: "Incorrect calculus: integrated a potential function instead of finding derivatives."
          },
          {
            id: "manipulation",
            title: "Defective Attempt",
            formula: "dV = -G M / r²",
            explanation: "Confused the potential formulation with field strength directly during substitution, leading to circular math errors.",
            pitfallDesc: "Substituted equations incorrectly, compounding radial terms."
          },
          {
            id: "precision",
            title: "Defective Attempt",
            formula: "g = dV · dr",
            explanation: "Multiplied by dr parameter instead of formulating quotients, failing to arrive at potential gradient steepness.",
            pitfallDesc: "Incorrect algebraic division, violating basic dimensional criteria."
          }
        ]
      }
    }
  }
];
