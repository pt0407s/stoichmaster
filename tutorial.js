// Step-by-Step Tutorial Mode for StoichMaster

class TutorialManager {
    constructor() {
        this.currentStep = 0;
        this.tutorialActive = false;
        this.tutorialType = null;
        this.overlay = null;
    }
    
    // Tutorial definitions
    tutorials = {
        stoichiometry: {
            title: "Stoichiometry Tutorial",
            steps: [
                {
                    title: "Understanding Molar Mass",
                    content: "Every compound has a molar mass (g/mol). This is the mass of one mole of that substance.",
                    example: "For H₂O: H = 1.008 × 2 = 2.016, O = 15.999<br>Total = 18.015 g/mol",
                    highlight: "#stoichGivenInfo"
                },
                {
                    title: "Mass to Moles Conversion",
                    content: "To convert mass to moles, use the formula:<br><strong>Moles = Mass ÷ Molar Mass</strong>",
                    example: "If you have 36 g of H₂O:<br>Moles = 36 g ÷ 18.015 g/mol = 2.0 mol",
                    highlight: "#stoichProblemText"
                },
                {
                    title: "Moles to Mass Conversion",
                    content: "To convert moles to mass, use the formula:<br><strong>Mass = Moles × Molar Mass</strong>",
                    example: "If you have 2.5 mol of H₂O:<br>Mass = 2.5 mol × 18.015 g/mol = 45.04 g",
                    highlight: "#stoichProblemText"
                },
                {
                    title: "Using Avogadro's Number",
                    content: "Avogadro's number (6.022 × 10²³) tells us how many particles are in one mole.",
                    example: "1 mole = 6.022 × 10²³ molecules<br>2 moles = 1.2044 × 10²⁴ molecules",
                    highlight: "#stoichGivenInfo"
                },
                {
                    title: "Mass to Molecules",
                    content: "This is a two-step process:<br>1. Convert mass to moles<br>2. Convert moles to molecules",
                    example: "For 18 g of H₂O:<br>Step 1: 18 g ÷ 18.015 g/mol = 1.0 mol<br>Step 2: 1.0 mol × 6.022×10²³ = 6.022×10²³ molecules",
                    highlight: "#stoichProblemText"
                },
                {
                    title: "Practice Time!",
                    content: "Now try solving the problem on your own. Remember:<br>• Check the units<br>• Use the correct formula<br>• Show your work",
                    example: "You've got this! 💪",
                    highlight: "#stoichAnswer"
                }
            ]
        },
        conversion: {
            title: "Unit Conversion Tutorial",
            steps: [
                {
                    title: "Understanding Conversion Factors",
                    content: "A conversion factor is a ratio that relates two units. Multiply by this factor to convert.",
                    example: "1 kg = 1000 g<br>So the conversion factor from g to kg is 0.001",
                    highlight: "#conversionProblemText"
                },
                {
                    title: "Metric Conversions",
                    content: "Common metric conversions:<br>• 1 kg = 1000 g<br>• 1 g = 1000 mg<br>• 1 L = 1000 mL",
                    example: "To convert 5000 g to kg:<br>5000 g × 0.001 = 5 kg",
                    highlight: "#conversionProblemText"
                },
                {
                    title: "Chemical Unit Conversions",
                    content: "For chemistry-specific units:<br>• 1 mol = 6.022 × 10²³ particles<br>• Use Avogadro's number",
                    example: "To convert 2 mol to molecules:<br>2 mol × 6.022×10²³ = 1.2044×10²⁴ molecules",
                    highlight: "#conversionProblemText"
                },
                {
                    title: "Practice Time!",
                    content: "Now solve the conversion problem. Remember to:<br>• Identify the conversion factor<br>• Multiply correctly<br>• Check your answer makes sense",
                    example: "You can do it! 🎯",
                    highlight: "#conversionAnswer"
                }
            ]
        },
        balancing: {
            title: "Equation Balancing Tutorial",
            steps: [
                {
                    title: "Law of Conservation of Mass",
                    content: "Atoms cannot be created or destroyed. The number of each type of atom must be the same on both sides of the equation.",
                    example: "H₂ + O₂ → H₂O<br>Left: 2 H, 2 O<br>Right: 2 H, 1 O ❌ Not balanced!",
                    highlight: "#balancingEquation"
                },
                {
                    title: "Using Coefficients",
                    content: "Coefficients are numbers placed before compounds to balance the equation. They multiply all atoms in that compound.",
                    example: "2 H₂O means:<br>2 × (2 H + 1 O) = 4 H and 2 O",
                    highlight: "#balancingInputs"
                },
                {
                    title: "Balancing Strategy",
                    content: "1. Count atoms on each side<br>2. Start with the most complex molecule<br>3. Balance one element at a time<br>4. Check your work",
                    example: "For H₂ + O₂ → H₂O:<br>Try: 2 H₂ + 1 O₂ → 2 H₂O<br>Left: 4 H, 2 O | Right: 4 H, 2 O ✓",
                    highlight: "#balancingEquation"
                },
                {
                    title: "Common Patterns",
                    content: "• Combustion: CₓHᵧ + O₂ → CO₂ + H₂O<br>• Synthesis: A + B → AB<br>• Decomposition: AB → A + B",
                    example: "Recognize patterns to balance faster!",
                    highlight: "#balancingEquation"
                },
                {
                    title: "Practice Time!",
                    content: "Balance the equation by entering coefficients. Remember:<br>• Start with 1 if unsure<br>• Balance one element at a time<br>• Check all atoms match",
                    example: "You've got this! ⚖️",
                    highlight: "#balancingInputs"
                }
            ]
        }
    };
    
    startTutorial(type) {
        if (!this.tutorials[type]) {
            console.error('Tutorial type not found:', type);
            return;
        }
        
        this.tutorialType = type;
        this.currentStep = 0;
        this.tutorialActive = true;
        this.showTutorialStep();
    }
    
    showTutorialStep() {
        const tutorial = this.tutorials[this.tutorialType];
        const step = tutorial.steps[this.currentStep];
        
        // Create overlay if it doesn't exist
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'tutorialOverlay';
            this.overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-40';
            document.body.appendChild(this.overlay);
        }
        
        // Remove existing tutorial box
        const existingBox = document.getElementById('tutorialBox');
        if (existingBox) {
            existingBox.remove();
        }
        
        // Create tutorial box
        const tutorialBox = document.createElement('div');
        tutorialBox.id = 'tutorialBox';
        tutorialBox.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4 z-50';
        
        tutorialBox.innerHTML = `
            <div class="mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">${tutorial.title}</h2>
                    <button id="closeTutorial" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="flex items-center space-x-2 mb-4">
                    ${tutorial.steps.map((_, i) => `
                        <div class="flex-1 h-2 rounded-full ${i <= this.currentStep ? 'bg-indigo-600' : 'bg-gray-200'}"></div>
                    `).join('')}
                </div>
                <div class="text-sm text-gray-600">Step ${this.currentStep + 1} of ${tutorial.steps.length}</div>
            </div>
            
            <div class="mb-6">
                <h3 class="text-xl font-bold text-indigo-600 mb-3">${step.title}</h3>
                <div class="text-gray-700 mb-4">${step.content}</div>
                
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <div class="font-semibold text-blue-800 mb-2">
                        <i class="fas fa-lightbulb mr-2"></i>Example:
                    </div>
                    <div class="text-blue-700">${step.example}</div>
                </div>
            </div>
            
            <div class="flex justify-between">
                <button id="prevStep" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors ${this.currentStep === 0 ? 'invisible' : ''}">
                    <i class="fas fa-arrow-left mr-2"></i>Previous
                </button>
                <button id="nextStep" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    ${this.currentStep === tutorial.steps.length - 1 ? 'Finish' : 'Next'} <i class="fas fa-arrow-right ml-2"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(tutorialBox);
        
        // Highlight element if specified
        if (step.highlight) {
            const element = document.querySelector(step.highlight);
            if (element) {
                element.classList.add('ring-4', 'ring-yellow-400', 'ring-opacity-75');
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        
        // Add event listeners
        document.getElementById('closeTutorial')?.addEventListener('click', () => this.endTutorial());
        document.getElementById('prevStep')?.addEventListener('click', () => this.previousStep());
        document.getElementById('nextStep')?.addEventListener('click', () => this.nextStep());
        
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.endTutorial();
            }
        });
    }
    
    nextStep() {
        const tutorial = this.tutorials[this.tutorialType];
        
        // Remove highlight from current step
        const currentStep = tutorial.steps[this.currentStep];
        if (currentStep.highlight) {
            const element = document.querySelector(currentStep.highlight);
            if (element) {
                element.classList.remove('ring-4', 'ring-yellow-400', 'ring-opacity-75');
            }
        }
        
        if (this.currentStep < tutorial.steps.length - 1) {
            this.currentStep++;
            this.showTutorialStep();
        } else {
            this.endTutorial();
        }
    }
    
    previousStep() {
        if (this.currentStep > 0) {
            // Remove highlight from current step
            const tutorial = this.tutorials[this.tutorialType];
            const currentStep = tutorial.steps[this.currentStep];
            if (currentStep.highlight) {
                const element = document.querySelector(currentStep.highlight);
                if (element) {
                    element.classList.remove('ring-4', 'ring-yellow-400', 'ring-opacity-75');
                }
            }
            
            this.currentStep--;
            this.showTutorialStep();
        }
    }
    
    endTutorial() {
        // Remove highlights
        if (this.tutorialType) {
            const tutorial = this.tutorials[this.tutorialType];
            tutorial.steps.forEach(step => {
                if (step.highlight) {
                    const element = document.querySelector(step.highlight);
                    if (element) {
                        element.classList.remove('ring-4', 'ring-yellow-400', 'ring-opacity-75');
                    }
                }
            });
        }
        
        // Remove tutorial elements
        const tutorialBox = document.getElementById('tutorialBox');
        if (tutorialBox) {
            tutorialBox.remove();
        }
        
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        
        this.tutorialActive = false;
        this.currentStep = 0;
        this.tutorialType = null;
    }
    
    isTutorialActive() {
        return this.tutorialActive;
    }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TutorialManager };
}
