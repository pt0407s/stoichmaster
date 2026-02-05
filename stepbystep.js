// Step-by-Step Mode for StoichMaster
// Guides users through solving the current problem with interactive hints

class StepByStepManager {
    constructor(app) {
        this.app = app;
        this.active = false;
        this.currentStep = 0;
        this.steps = [];
        this.problemType = null;
    }
    
    // Generate step-by-step guidance for current problem
    generateSteps(problem, problemType) {
        this.problemType = problemType;
        this.currentStep = 0;
        this.steps = [];
        
        switch (problemType) {
            case 'stoichiometry':
                this.steps = this.generateStoichiometrySteps(problem);
                break;
            case 'conversion':
                this.steps = this.generateConversionSteps(problem);
                break;
            case 'balancing':
                this.steps = this.generateBalancingSteps(problem);
                break;
        }
        
        return this.steps;
    }
    
    generateStoichiometrySteps(problem) {
        const steps = [];
        
        switch (problem.subtype) {
            case 'mass-to-moles':
                steps.push({
                    instruction: `First, identify the molar mass of ${problem.compound.formula}`,
                    hint: `Look at the "Given Info" section above. The molar mass is ${problem.compound.molarMass.toFixed(3)} g/mol`,
                    expectedAnswer: problem.compound.molarMass,
                    tolerance: 0.01,
                    unit: 'g/mol'
                });
                steps.push({
                    instruction: `Now use the formula: Moles = Mass ÷ Molar Mass`,
                    hint: `Divide ${problem.given.value} g by ${problem.compound.molarMass.toFixed(3)} g/mol`,
                    calculation: `${problem.given.value} ÷ ${problem.compound.molarMass.toFixed(3)}`,
                    expectedAnswer: problem.answer,
                    tolerance: problem.answer * 0.05,
                    unit: 'mol'
                });
                break;
                
            case 'moles-to-mass':
                steps.push({
                    instruction: `First, identify the molar mass of ${problem.compound.formula}`,
                    hint: `Look at the "Given Info" section. The molar mass is ${problem.compound.molarMass.toFixed(3)} g/mol`,
                    expectedAnswer: problem.compound.molarMass,
                    tolerance: 0.01,
                    unit: 'g/mol'
                });
                steps.push({
                    instruction: `Now use the formula: Mass = Moles × Molar Mass`,
                    hint: `Multiply ${problem.given.value} mol by ${problem.compound.molarMass.toFixed(3)} g/mol`,
                    calculation: `${problem.given.value} × ${problem.compound.molarMass.toFixed(3)}`,
                    expectedAnswer: problem.answer,
                    tolerance: problem.answer * 0.05,
                    unit: 'g'
                });
                break;
                
            case 'mass-to-molecules':
                const molesIntermediate = problem.given.value / problem.compound.molarMass;
                steps.push({
                    instruction: `Step 1: Convert mass to moles. What is the molar mass of ${problem.compound.formula}?`,
                    hint: `The molar mass is ${problem.compound.molarMass.toFixed(3)} g/mol`,
                    expectedAnswer: problem.compound.molarMass,
                    tolerance: 0.01,
                    unit: 'g/mol'
                });
                steps.push({
                    instruction: `Now calculate moles: Moles = Mass ÷ Molar Mass`,
                    hint: `${problem.given.value} g ÷ ${problem.compound.molarMass.toFixed(3)} g/mol = ${molesIntermediate.toFixed(3)} mol`,
                    calculation: `${problem.given.value} ÷ ${problem.compound.molarMass.toFixed(3)}`,
                    expectedAnswer: molesIntermediate,
                    tolerance: molesIntermediate * 0.05,
                    unit: 'mol'
                });
                steps.push({
                    instruction: `Step 2: Convert moles to molecules using Avogadro's number (6.022 × 10²³)`,
                    hint: `Multiply ${molesIntermediate.toFixed(3)} mol by 6.022 × 10²³`,
                    calculation: `${molesIntermediate.toFixed(3)} × 6.022e23`,
                    expectedAnswer: problem.answer,
                    tolerance: problem.answer * 0.05,
                    unit: 'molecules'
                });
                break;
                
            case 'moles-to-molecules':
                steps.push({
                    instruction: `Use Avogadro's number to convert moles to molecules`,
                    hint: `Avogadro's number is 6.022 × 10²³ molecules/mol`,
                    expectedAnswer: 6.022e23,
                    tolerance: 0.001e23,
                    unit: 'molecules/mol'
                });
                steps.push({
                    instruction: `Multiply moles by Avogadro's number: ${problem.given.value} mol × 6.022 × 10²³`,
                    hint: `${problem.given.value} × 6.022e23 = ${problem.answer.toExponential(3)}`,
                    calculation: `${problem.given.value} × 6.022e23`,
                    expectedAnswer: problem.answer,
                    tolerance: problem.answer * 0.05,
                    unit: 'molecules'
                });
                break;
        }
        
        return steps;
    }
    
    generateConversionSteps(problem) {
        const steps = [];
        const factor = this.app.conversionFactors[problem.conversion];
        
        steps.push({
            instruction: `Identify the conversion factor for ${problem.conversion}`,
            hint: `To convert ${problem.given.unit} to ${problem.targetUnit}, the factor is ${factor}`,
            expectedAnswer: factor,
            tolerance: Math.abs(factor) * 0.01,
            unit: ''
        });
        
        steps.push({
            instruction: `Multiply the given value by the conversion factor`,
            hint: `${problem.given.value} × ${factor} = ${problem.answer.toExponential(3)}`,
            calculation: `${problem.given.value} × ${factor}`,
            expectedAnswer: problem.answer,
            tolerance: Math.abs(problem.answer) * 0.01,
            unit: problem.targetUnit
        });
        
        return steps;
    }
    
    generateBalancingSteps(problem) {
        const steps = [];
        const equation = problem.equation;
        
        // Parse equation to count atoms
        const parts = equation.equation.split('→');
        const reactants = parts[0].trim();
        const products = parts[1].trim();
        
        steps.push({
            instruction: `Count the atoms on each side of the equation`,
            hint: `Look at the unbalanced equation and identify which elements need balancing`,
            isInfo: true
        });
        
        steps.push({
            instruction: `Start by balancing the most complex molecule first`,
            hint: `Try different coefficients until the number of each atom is equal on both sides`,
            isInfo: true
        });
        
        steps.push({
            instruction: `Enter the correct coefficients to balance the equation`,
            hint: `The correct coefficients are: ${equation.coefficients.join(', ')}`,
            expectedAnswer: equation.coefficients,
            isBalancing: true
        });
        
        return steps;
    }
    
    activate(problemType) {
        if (!this.app.currentProblem) {
            alert('Generate a problem first!');
            return;
        }
        
        this.active = true;
        this.generateSteps(this.app.currentProblem, problemType);
        this.currentStep = 0;
        this.showStepByStepUI();
    }
    
    deactivate() {
        this.active = false;
        this.hideStepByStepUI();
    }
    
    showStepByStepUI() {
        const container = document.getElementById(`${this.problemType}StepByStep`);
        if (!container) return;
        
        container.classList.remove('hidden');
        this.updateStepDisplay();
    }
    
    hideStepByStepUI() {
        const container = document.getElementById(`${this.problemType}StepByStep`);
        if (container) {
            container.classList.add('hidden');
        }
    }
    
    updateStepDisplay() {
        const container = document.getElementById(`${this.problemType}StepByStep`);
        if (!container) return;
        
        const step = this.steps[this.currentStep];
        const isLastStep = this.currentStep === this.steps.length - 1;
        
        let html = `
            <div class="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-blue-800">
                        <i class="fas fa-graduation-cap mr-2"></i>Step ${this.currentStep + 1} of ${this.steps.length}
                    </h3>
                    <button id="${this.problemType}ExitStepByStep" class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-times"></i> Exit Guide
                    </button>
                </div>
                
                <div class="mb-4">
                    <p class="text-blue-900 font-medium mb-2">${step.instruction}</p>
                    ${step.calculation ? `<p class="text-sm text-blue-700 font-mono bg-blue-100 p-2 rounded">Calculate: ${step.calculation}</p>` : ''}
                </div>
        `;
        
        if (!step.isInfo) {
            html += `
                <div class="flex items-center space-x-4 mb-4">
                    <input type="number" 
                           id="${this.problemType}StepInput" 
                           step="any"
                           placeholder="Enter your answer" 
                           class="flex-1 px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none">
                    ${step.unit ? `<span class="text-blue-700 font-medium">${step.unit}</span>` : ''}
                </div>
                
                <div class="flex space-x-3">
                    <button id="${this.problemType}CheckStep" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-check mr-2"></i>Check Answer
                    </button>
                    <button id="${this.problemType}ShowHint" class="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
                        <i class="fas fa-lightbulb mr-2"></i>Show Hint
                    </button>
                </div>
                
                <div id="${this.problemType}StepFeedback" class="hidden mt-4"></div>
            `;
        } else {
            html += `
                <button id="${this.problemType}NextStep" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Continue <i class="fas fa-arrow-right ml-2"></i>
                </button>
            `;
        }
        
        html += `
                <div class="mt-4 text-xs text-blue-600">
                    <i class="fas fa-info-circle mr-1"></i>No XP earned in step-by-step mode
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Add event listeners
        document.getElementById(`${this.problemType}ExitStepByStep`)?.addEventListener('click', () => {
            this.deactivate();
        });
        
        document.getElementById(`${this.problemType}CheckStep`)?.addEventListener('click', () => {
            this.checkStep();
        });
        
        document.getElementById(`${this.problemType}ShowHint`)?.addEventListener('click', () => {
            this.showHint();
        });
        
        document.getElementById(`${this.problemType}NextStep`)?.addEventListener('click', () => {
            this.nextStep();
        });
        
        // Enter key support
        document.getElementById(`${this.problemType}StepInput`)?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkStep();
            }
        });
    }
    
    checkStep() {
        const step = this.steps[this.currentStep];
        const input = document.getElementById(`${this.problemType}StepInput`);
        const feedback = document.getElementById(`${this.problemType}StepFeedback`);
        
        if (!input || !feedback) return;
        
        const userAnswer = parseFloat(input.value);
        
        if (isNaN(userAnswer)) {
            feedback.className = 'bg-red-50 border-l-4 border-red-400 p-3 rounded mt-4';
            feedback.innerHTML = '<p class="text-sm text-red-700">Please enter a valid number</p>';
            feedback.classList.remove('hidden');
            return;
        }
        
        const isCorrect = Math.abs(userAnswer - step.expectedAnswer) <= step.tolerance;
        
        if (isCorrect) {
            feedback.className = 'bg-green-50 border-l-4 border-green-400 p-3 rounded mt-4';
            feedback.innerHTML = `
                <p class="text-sm text-green-700 font-medium">
                    <i class="fas fa-check-circle mr-2"></i>Correct! ${step.expectedAnswer.toExponential ? step.expectedAnswer.toExponential(3) : step.expectedAnswer.toFixed(3)} ${step.unit}
                </p>
            `;
            feedback.classList.remove('hidden');
            
            // Auto-advance after 1.5 seconds
            setTimeout(() => {
                this.nextStep();
            }, 1500);
        } else {
            feedback.className = 'bg-red-50 border-l-4 border-red-400 p-3 rounded mt-4';
            feedback.innerHTML = `
                <p class="text-sm text-red-700">
                    <i class="fas fa-times-circle mr-2"></i>Not quite. Try again or click "Show Hint"
                </p>
            `;
            feedback.classList.remove('hidden');
        }
    }
    
    showHint() {
        const step = this.steps[this.currentStep];
        const feedback = document.getElementById(`${this.problemType}StepFeedback`);
        
        if (!feedback) return;
        
        feedback.className = 'bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mt-4';
        feedback.innerHTML = `
            <p class="text-sm text-yellow-700">
                <i class="fas fa-lightbulb mr-2"></i><strong>Hint:</strong> ${step.hint}
            </p>
        `;
        feedback.classList.remove('hidden');
    }
    
    nextStep() {
        this.currentStep++;
        
        if (this.currentStep >= this.steps.length) {
            this.completeTutorial();
        } else {
            this.updateStepDisplay();
        }
    }
    
    completeTutorial() {
        const container = document.getElementById(`${this.problemType}StepByStep`);
        if (!container) return;
        
        container.innerHTML = `
            <div class="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg mb-6">
                <h3 class="text-lg font-bold text-green-800 mb-3">
                    <i class="fas fa-trophy mr-2"></i>Tutorial Complete!
                </h3>
                <p class="text-green-700 mb-4">
                    Great job! You've completed all the steps. Now try solving problems on your own to earn XP!
                </p>
                <button id="${this.problemType}ExitComplete" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                    <i class="fas fa-check mr-2"></i>Got It!
                </button>
            </div>
        `;
        
        document.getElementById(`${this.problemType}ExitComplete`)?.addEventListener('click', () => {
            this.deactivate();
        });
    }
    
    isActive() {
        return this.active;
    }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StepByStepManager };
}
