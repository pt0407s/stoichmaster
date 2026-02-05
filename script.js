// StoichMaster - Main Application with Supabase, Leaderboard, and Tutorial Integration

class StoichMasterApp {
    constructor() {
        this.totalXP = 0;
        this.streak = 0;
        this.currentProblem = null;
        this.currentDifficulty = 'easy';
        this.problemStartTime = null;
        this.timerInterval = null;
        
        // Initialize managers
        this.rankManager = new RankManager();
        this.statsManager = new StatsManager();
        this.supabaseManager = new SupabaseManager();
        this.tutorialManager = new TutorialManager();
        
        // Load saved XP
        const savedXP = localStorage.getItem('stoichmaster_xp');
        this.totalXP = savedXP ? parseInt(savedXP) : 0;
        
        // Chemical data
        this.compounds = [
            { formula: 'H2O', name: 'water', molarMass: 18.015 },
            { formula: 'CO2', name: 'carbon dioxide', molarMass: 44.01 },
            { formula: 'NH3', name: 'ammonia', molarMass: 17.031 },
            { formula: 'CH4', name: 'methane', molarMass: 16.043 },
            { formula: 'NaCl', name: 'salt', molarMass: 58.44 },
            { formula: 'C6H12O6', name: 'glucose', molarMass: 180.156 },
            { formula: 'H2SO4', name: 'sulfuric acid', molarMass: 98.079 },
            { formula: 'CaCO3', name: 'calcium carbonate', molarMass: 100.087 },
            { formula: 'Fe2O3', name: 'iron(III) oxide', molarMass: 159.687 },
            { formula: 'MgO', name: 'magnesium oxide', molarMass: 40.304 },
            { formula: 'KNO3', name: 'potassium nitrate', molarMass: 101.103 },
            { formula: 'AgNO3', name: 'silver nitrate', molarMass: 169.873 }
        ];
        
        this.balancingEquations = [
            { equation: 'H2 + O2 → H2O', coefficients: [2, 1, 2], formatted: '___ H₂ + ___ O₂ → ___ H₂O' },
            { equation: 'CH4 + O2 → CO2 + H2O', coefficients: [1, 2, 1, 2], formatted: '___ CH₄ + ___ O₂ → ___ CO₂ + ___ H₂O' },
            { equation: 'Fe + O2 → Fe2O3', coefficients: [4, 3, 2], formatted: '___ Fe + ___ O₂ → ___ Fe₂O₃' },
            { equation: 'N2 + H2 → NH3', coefficients: [1, 3, 2], formatted: '___ N₂ + ___ H₂ → ___ NH₃' },
            { equation: 'Ca + O2 → CaO', coefficients: [2, 1, 2], formatted: '___ Ca + ___ O₂ → ___ CaO' },
            { equation: 'Al + O2 → Al2O3', coefficients: [4, 3, 2], formatted: '___ Al + ___ O₂ → ___ Al₂O₃' },
            { equation: 'C3H8 + O2 → CO2 + H2O', coefficients: [1, 5, 3, 4], formatted: '___ C₃H₈ + ___ O₂ → ___ CO₂ + ___ H₂O' },
            { equation: 'Na + Cl2 → NaCl', coefficients: [2, 1, 2], formatted: '___ Na + ___ Cl₂ → ___ NaCl' }
        ];
        
        this.conversionFactors = {
            'g to kg': 0.001,
            'kg to g': 1000,
            'g to mg': 1000,
            'mg to g': 0.001,
            'L to mL': 1000,
            'mL to L': 0.001,
            'mol to molecules': 6.022e23,
            'molecules to mol': 1/6.022e23,
            'atoms to mol': 1/6.022e23,
            'mol to atoms': 6.022e23
        };
        
        this.currentChart = null;
        this.currentStatsPeriod = 'daily';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateRankDisplay();
        this.generateStoichiometryProblem();
        this.displayRanksList();
    }
    
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.closest('.tab-btn').dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.target.closest('.difficulty-btn').dataset.difficulty;
                this.setDifficulty(difficulty);
            });
        });
        
        // Tutorial buttons
        document.getElementById('stoichTutorial')?.addEventListener('click', () => {
            this.tutorialManager.startTutorial('stoichiometry');
        });
        document.getElementById('conversionTutorial')?.addEventListener('click', () => {
            this.tutorialManager.startTutorial('conversion');
        });
        document.getElementById('balancingTutorial')?.addEventListener('click', () => {
            this.tutorialManager.startTutorial('balancing');
        });
        
        // Stoichiometry
        document.getElementById('stoichCheck').addEventListener('click', () => this.checkStoichiometryAnswer());
        document.getElementById('stoichNew').addEventListener('click', () => this.generateStoichiometryProblem());
        document.getElementById('stoichHint').addEventListener('click', () => this.showStoichiometryHint());
        
        // Unit Conversion
        document.getElementById('conversionCheck').addEventListener('click', () => this.checkConversionAnswer());
        document.getElementById('conversionNew').addEventListener('click', () => this.generateConversionProblem());
        document.getElementById('conversionHint').addEventListener('click', () => this.showConversionHint());
        
        // Equation Balancing
        document.getElementById('balancingCheck').addEventListener('click', () => this.checkBalancingAnswer());
        document.getElementById('balancingNew').addEventListener('click', () => this.generateBalancingProblem());
        document.getElementById('balancingHint').addEventListener('click', () => this.showBalancingHint());
        
        // Stats
        document.querySelectorAll('.stats-period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = e.target.dataset.period;
                this.updateStatsChart(period);
            });
        });
        
        document.getElementById('resetStats').addEventListener('click', () => {
            if (this.statsManager.resetStats()) {
                this.updateStatsDisplay();
                alert('All statistics have been reset!');
            }
        });
        
        // Leaderboard
        document.getElementById('refreshLeaderboard')?.addEventListener('click', () => {
            this.loadLeaderboard();
        });
        
        // Enter key support
        ['stoichAnswer', 'conversionAnswer'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const buttonId = id.replace('Answer', 'Check');
                    document.getElementById(buttonId).click();
                }
            });
        });
    }
    
    setDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        document.getElementById('currentDifficulty').textContent = DIFFICULTY_SETTINGS[difficulty].name;
        
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('ring-4', 'ring-white');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('ring-4', 'ring-white');
    }
    
    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.className = 'tab-btn px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-indigo-600 text-white';
            } else {
                btn.className = 'tab-btn px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-gray-100';
            }
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        if (tabName === 'stats') {
            this.updateStatsDisplay();
        } else if (tabName === 'ranks') {
            this.displayRanksList();
        } else if (tabName === 'leaderboard') {
            this.loadLeaderboard();
        } else if (tabName === 'conversion' && !this.currentProblem?.type) {
            this.generateConversionProblem();
        } else if (tabName === 'balancing' && !this.currentProblem?.type) {
            this.generateBalancingProblem();
        }
    }
    
    startTimer(category) {
        this.problemStartTime = Date.now();
        const timerElement = document.getElementById(`${category}Timer`);
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            const elapsed = (Date.now() - this.problemStartTime) / 1000;
            timerElement.textContent = elapsed.toFixed(1) + 's';
        }, 100);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        if (this.problemStartTime) {
            const elapsed = (Date.now() - this.problemStartTime) / 1000;
            this.problemStartTime = null;
            return elapsed;
        }
        return 0;
    }
    
    calculateXP(baseXP, timeTaken) {
        const difficulty = DIFFICULTY_SETTINGS[this.currentDifficulty];
        let xp = baseXP * difficulty.xpMultiplier;
        
        if (timeTaken < 10) {
            xp += difficulty.timeBonus;
        } else if (timeTaken < 20) {
            xp += difficulty.timeBonus * 0.5;
        }
        
        return Math.round(xp);
    }
    
    updatePotentialXP(category) {
        const baseXP = 10;
        const difficulty = DIFFICULTY_SETTINGS[this.currentDifficulty];
        const potentialXP = Math.round(baseXP * difficulty.xpMultiplier + difficulty.timeBonus);
        document.getElementById(`${category}PotentialXP`).textContent = `Up to ${potentialXP} XP`;
    }
    
    // Stoichiometry Methods
    generateStoichiometryProblem() {
        const compound = this.compounds[Math.floor(Math.random() * this.compounds.length)];
        const problemTypes = ['mass-to-moles', 'moles-to-mass', 'mass-to-molecules', 'moles-to-molecules'];
        const problemType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        let problem = {};
        let question = '';
        let givenInfo = '';
        
        const multiplier = this.currentDifficulty === 'easy' ? 1 : 
                          this.currentDifficulty === 'medium' ? 1.5 :
                          this.currentDifficulty === 'hard' ? 2 : 3;
        
        switch (problemType) {
            case 'mass-to-moles':
                const mass1 = (Math.random() * 100 * multiplier + 10).toFixed(2);
                problem = {
                    type: 'stoichiometry',
                    subtype: 'mass-to-moles',
                    given: { value: parseFloat(mass1), unit: 'g' },
                    compound: compound,
                    answer: parseFloat(mass1) / compound.molarMass,
                    answerUnit: 'mol'
                };
                question = `How many moles are in ${mass1} g of ${compound.name} (${compound.formula})?`;
                givenInfo = `Molar mass of ${compound.formula} = ${compound.molarMass.toFixed(3)} g/mol`;
                break;
                
            case 'moles-to-mass':
                const moles1 = (Math.random() * 5 * multiplier + 0.1).toFixed(3);
                problem = {
                    type: 'stoichiometry',
                    subtype: 'moles-to-mass',
                    given: { value: parseFloat(moles1), unit: 'mol' },
                    compound: compound,
                    answer: parseFloat(moles1) * compound.molarMass,
                    answerUnit: 'g'
                };
                question = `What is the mass of ${moles1} mol of ${compound.name} (${compound.formula})?`;
                givenInfo = `Molar mass of ${compound.formula} = ${compound.molarMass.toFixed(3)} g/mol`;
                break;
                
            case 'mass-to-molecules':
                const mass2 = (Math.random() * 50 * multiplier + 5).toFixed(2);
                const moles2 = parseFloat(mass2) / compound.molarMass;
                problem = {
                    type: 'stoichiometry',
                    subtype: 'mass-to-molecules',
                    given: { value: parseFloat(mass2), unit: 'g' },
                    compound: compound,
                    answer: moles2 * 6.022e23,
                    answerUnit: 'molecules'
                };
                question = `How many molecules are in ${mass2} g of ${compound.name} (${compound.formula})?`;
                givenInfo = `Molar mass of ${compound.formula} = ${compound.molarMass.toFixed(3)} g/mol<br>Avogadro's number = 6.022 × 10²³ molecules/mol`;
                break;
                
            case 'moles-to-molecules':
                const moles3 = (Math.random() * 3 * multiplier + 0.1).toFixed(3);
                problem = {
                    type: 'stoichiometry',
                    subtype: 'moles-to-molecules',
                    given: { value: parseFloat(moles3), unit: 'mol' },
                    compound: compound,
                    answer: parseFloat(moles3) * 6.022e23,
                    answerUnit: 'molecules'
                };
                question = `How many molecules are in ${moles3} mol of ${compound.name} (${compound.formula})?`;
                givenInfo = `Avogadro's number = 6.022 × 10²³ molecules/mol`;
                break;
        }
        
        this.currentProblem = problem;
        document.getElementById('stoichProblemText').innerHTML = question;
        document.getElementById('stoichGivenInfo').innerHTML = givenInfo;
        document.getElementById('stoichAnswer').value = '';
        document.getElementById('stoichUnit').value = problem.answerUnit;
        this.hideFeedback('stoich');
        this.startTimer('stoich');
        this.updatePotentialXP('stoich');
    }
    
    checkStoichiometryAnswer() {
        const userAnswer = parseFloat(document.getElementById('stoichAnswer').value);
        const userUnit = document.getElementById('stoichUnit').value;
        
        if (isNaN(userAnswer)) {
            this.showFeedback('stoich', 'Please enter a valid number.', false);
            return;
        }
        
        const timeTaken = this.stopTimer();
        const correctAnswer = this.currentProblem.answer;
        const tolerance = correctAnswer * 0.05;
        
        let isCorrect = false;
        if (userUnit === this.currentProblem.answerUnit) {
            isCorrect = Math.abs(userAnswer - correctAnswer) <= tolerance;
        }
        
        if (isCorrect) {
            const xpEarned = this.calculateXP(10, timeTaken);
            this.handleCorrectAnswer('stoich', xpEarned, timeTaken);
            const explanation = this.generateStoichiometryExplanation();
            document.getElementById('stoichExplanation').innerHTML = explanation;
            document.getElementById('stoichExplanation').classList.remove('hidden');
            
            this.statsManager.recordAnswer(true, 'stoichiometry', this.currentDifficulty, timeTaken, xpEarned);
            this.syncToSupabase();
        } else {
            this.handleIncorrectAnswer('stoich');
            this.statsManager.recordAnswer(false, 'stoichiometry', this.currentDifficulty, timeTaken, 0);
        }
    }
    
    generateStoichiometryExplanation() {
        const problem = this.currentProblem;
        let explanation = `<h4 class="font-bold text-green-800 mb-2">Solution:</h4>`;
        
        switch (problem.subtype) {
            case 'mass-to-moles':
                explanation += `To convert mass to moles:<br>`;
                explanation += `Moles = Mass ÷ Molar Mass<br>`;
                explanation += `Moles = ${problem.given.value} g ÷ ${problem.compound.molarMass.toFixed(3)} g/mol<br>`;
                explanation += `Moles = ${problem.answer.toFixed(3)} mol`;
                break;
                
            case 'moles-to-mass':
                explanation += `To convert moles to mass:<br>`;
                explanation += `Mass = Moles × Molar Mass<br>`;
                explanation += `Mass = ${problem.given.value} mol × ${problem.compound.molarMass.toFixed(3)} g/mol<br>`;
                explanation += `Mass = ${problem.answer.toFixed(3)} g`;
                break;
                
            case 'mass-to-molecules':
                explanation += `To convert mass to molecules:<br>`;
                explanation += `First convert mass to moles: ${problem.given.value} g ÷ ${problem.compound.molarMass.toFixed(3)} g/mol = ${(problem.given.value / problem.compound.molarMass).toFixed(3)} mol<br>`;
                explanation += `Then convert moles to molecules: ${(problem.given.value / problem.compound.molarMass).toFixed(3)} mol × 6.022×10²³ molecules/mol<br>`;
                explanation += `Molecules = ${problem.answer.toExponential(3)}`;
                break;
                
            case 'moles-to-molecules':
                explanation += `To convert moles to molecules:<br>`;
                explanation += `Molecules = Moles × Avogadro's Number<br>`;
                explanation += `Molecules = ${problem.given.value} mol × 6.022×10²³ molecules/mol<br>`;
                explanation += `Molecules = ${problem.answer.toExponential(3)}`;
                break;
        }
        
        return explanation;
    }
    
    showStoichiometryHint() {
        const problem = this.currentProblem;
        let hint = '';
        
        switch (problem.subtype) {
            case 'mass-to-moles':
                hint = "Remember: Moles = Mass ÷ Molar Mass";
                break;
            case 'moles-to-mass':
                hint = "Remember: Mass = Moles × Molar Mass";
                break;
            case 'mass-to-molecules':
                hint = "Two-step process: Mass → Moles → Molecules";
                break;
            case 'moles-to-molecules':
                hint = "Use Avogadro's number: 6.022 × 10²³";
                break;
        }
        
        this.showFeedback('stoich', hint, false, 'hint');
    }
    
    // Unit Conversion Methods
    generateConversionProblem() {
        const conversions = Object.keys(this.conversionFactors);
        const conversion = conversions[Math.floor(Math.random() * conversions.length)];
        const factor = this.conversionFactors[conversion];
        
        const [fromUnit, toUnit] = conversion.split(' to ');
        const multiplier = this.currentDifficulty === 'easy' ? 1 : 
                          this.currentDifficulty === 'medium' ? 10 :
                          this.currentDifficulty === 'hard' ? 100 : 1000;
        const value = (Math.random() * 100 * multiplier + 1).toFixed(2);
        
        const answer = parseFloat(value) * factor;
        
        this.currentProblem = {
            type: 'conversion',
            given: { value: parseFloat(value), unit: fromUnit },
            targetUnit: toUnit,
            answer: answer,
            conversion: conversion
        };
        
        document.getElementById('conversionProblemText').innerHTML = 
            `Convert ${value} ${fromUnit} to ${toUnit}:`;
        document.getElementById('conversionTargetUnit').textContent = toUnit;
        document.getElementById('conversionAnswer').value = '';
        this.hideFeedback('conversion');
        this.startTimer('conversion');
        this.updatePotentialXP('conversion');
    }
    
    checkConversionAnswer() {
        const userAnswer = parseFloat(document.getElementById('conversionAnswer').value);
        
        if (isNaN(userAnswer)) {
            this.showFeedback('conversion', 'Please enter a valid number.', false);
            return;
        }
        
        const timeTaken = this.stopTimer();
        const correctAnswer = this.currentProblem.answer;
        const tolerance = Math.abs(correctAnswer) * 0.01;
        
        const isCorrect = Math.abs(userAnswer - correctAnswer) <= tolerance;
        
        if (isCorrect) {
            const xpEarned = this.calculateXP(10, timeTaken);
            this.handleCorrectAnswer('conversion', xpEarned, timeTaken);
            const explanation = `To convert ${this.currentProblem.given.value} ${this.currentProblem.given.unit} to ${this.currentProblem.targetUnit}:<br>
                Multiply by the conversion factor ${this.conversionFactors[this.currentProblem.conversion]}<br>
                ${this.currentProblem.given.value} × ${this.conversionFactors[this.currentProblem.conversion]} = ${correctAnswer.toExponential(3)} ${this.currentProblem.targetUnit}`;
            document.getElementById('conversionExplanation').innerHTML = explanation;
            document.getElementById('conversionExplanation').classList.remove('hidden');
            
            this.statsManager.recordAnswer(true, 'conversion', this.currentDifficulty, timeTaken, xpEarned);
            this.syncToSupabase();
        } else {
            this.handleIncorrectAnswer('conversion');
            this.statsManager.recordAnswer(false, 'conversion', this.currentDifficulty, timeTaken, 0);
        }
    }
    
    showConversionHint() {
        const factor = this.conversionFactors[this.currentProblem.conversion];
        this.showFeedback('conversion', `Multiply by ${factor}`, false, 'hint');
    }
    
    // Equation Balancing Methods
    generateBalancingProblem() {
        const equation = this.balancingEquations[Math.floor(Math.random() * this.balancingEquations.length)];
        
        this.currentProblem = {
            type: 'balancing',
            equation: equation,
            userCoefficients: new Array(equation.coefficients.length).fill(1)
        };
        
        this.displayBalancingProblem();
        this.hideFeedback('balancing');
        this.startTimer('balancing');
        this.updatePotentialXP('balancing');
    }
    
    displayBalancingProblem() {
        const equation = this.currentProblem.equation;
        const container = document.getElementById('balancingInputs');
        container.innerHTML = '';
        
        const parts = equation.formatted.split('___');
        let html = '';
        
        parts.forEach((part, index) => {
            if (index > 0) {
                html += part;
            }
            
            if (index < parts.length - 1) {
                html += `<input type="number" id="coeff${index}" min="1" max="20" value="1" 
                    class="w-16 px-2 py-1 text-center border-2 border-gray-300 rounded focus:border-indigo-500 focus:outline-none mx-1">`;
            }
        });
        
        container.innerHTML = html;
        
        for (let i = 0; i < equation.coefficients.length; i++) {
            document.getElementById(`coeff${i}`).addEventListener('input', (e) => {
                this.currentProblem.userCoefficients[i] = parseInt(e.target.value) || 1;
            });
        }
    }
    
    checkBalancingAnswer() {
        const userCoeffs = this.currentProblem.userCoefficients;
        const correctCoeffs = this.currentProblem.equation.coefficients;
        
        const normalizedUser = this.normalizeCoefficients(userCoeffs);
        const normalizedCorrect = this.normalizeCoefficients(correctCoeffs);
        
        const isCorrect = JSON.stringify(normalizedUser) === JSON.stringify(normalizedCorrect);
        
        const timeTaken = this.stopTimer();
        
        if (isCorrect) {
            const xpEarned = this.calculateXP(10, timeTaken);
            this.handleCorrectAnswer('balancing', xpEarned, timeTaken);
            const explanation = `Correct! The balanced equation is:<br>
                ${normalizedCorrect.join(' : ')} coefficients balance the equation properly.`;
            document.getElementById('balancingExplanation').innerHTML = explanation;
            document.getElementById('balancingExplanation').classList.remove('hidden');
            
            this.statsManager.recordAnswer(true, 'balancing', this.currentDifficulty, timeTaken, xpEarned);
            this.syncToSupabase();
        } else {
            this.handleIncorrectAnswer('balancing');
            this.statsManager.recordAnswer(false, 'balancing', this.currentDifficulty, timeTaken, 0);
        }
    }
    
    normalizeCoefficients(coeffs) {
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        let overallGcd = coeffs[0];
        
        for (let i = 1; i < coeffs.length; i++) {
            overallGcd = gcd(overallGcd, coeffs[i]);
        }
        
        return coeffs.map(c => c / overallGcd);
    }
    
    showBalancingHint() {
        const hint = `Try balancing one element at a time. Start with the most complex molecule.`;
        this.showFeedback('balancing', hint, false, 'hint');
    }
    
    // Helper Methods
    handleCorrectAnswer(type, xpEarned, timeTaken) {
        this.totalXP += xpEarned;
        this.streak += 1;
        localStorage.setItem('stoichmaster_xp', this.totalXP);
        
        this.statsManager.updateStreak(this.streak);
        this.updateRankDisplay();
        
        const timeBonus = timeTaken < 10 ? ' ⚡ Speed Bonus!' : '';
        this.showFeedback(type, `Correct! +${xpEarned} XP${timeBonus}`, true);
        
        const input = document.getElementById(`${type}Answer`);
        if (input) {
            input.classList.add('correct-answer');
            setTimeout(() => input.classList.remove('correct-answer'), 600);
        }
    }
    
    handleIncorrectAnswer(type) {
        this.streak = 0;
        document.getElementById('streak').textContent = this.streak;
        this.showFeedback(type, 'Incorrect. Try again!', false);
        
        const input = document.getElementById(`${type}Answer`);
        if (input) {
            input.classList.add('incorrect-answer');
            setTimeout(() => input.classList.remove('incorrect-answer'), 600);
        }
    }
    
    showFeedback(type, message, isCorrect, hintType = 'feedback') {
        const feedbackId = `${type}Feedback`;
        const feedbackEl = document.getElementById(feedbackId);
        
        feedbackEl.classList.remove('hidden');
        
        if (hintType === 'hint') {
            feedbackEl.className = 'bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6';
            feedbackEl.innerHTML = `<i class="fas fa-lightbulb text-yellow-600 mr-2"></i>${message}`;
        } else if (isCorrect) {
            feedbackEl.className = 'bg-green-50 border-l-4 border-green-400 p-4 rounded mb-6';
            feedbackEl.innerHTML = `<i class="fas fa-check-circle text-green-600 mr-2"></i>${message}`;
        } else {
            feedbackEl.className = 'bg-red-50 border-l-4 border-red-400 p-4 rounded mb-6';
            feedbackEl.innerHTML = `<i class="fas fa-times-circle text-red-600 mr-2"></i>${message}`;
        }
    }
    
    hideFeedback(type) {
        document.getElementById(`${type}Feedback`).classList.add('hidden');
        document.getElementById(`${type}Explanation`).classList.add('hidden');
    }
    
    updateRankDisplay() {
        const currentRank = this.rankManager.getCurrentRank(this.totalXP);
        const nextRank = this.rankManager.getNextRank(this.totalXP);
        const progress = this.rankManager.getProgressToNextRank(this.totalXP);
        
        document.getElementById('rankName').textContent = currentRank.rank.name;
        document.getElementById('rankName').className = `text-2xl font-bold rank-badge ${currentRank.tier.textColor}`;
        document.getElementById('totalXP').textContent = this.totalXP;
        document.getElementById('streak').textContent = this.streak;
        
        document.getElementById('currentRankText').textContent = `${currentRank.rank.name} (${currentRank.rank.symbol})`;
        
        if (nextRank) {
            document.getElementById('nextRankText').textContent = `Next: ${nextRank.rank.name} (${nextRank.rank.symbol})`;
            document.getElementById('xpProgress').textContent = `${this.totalXP} / ${nextRank.rank.xpRequired} XP`;
            document.getElementById('progressPercent').textContent = `${progress.toFixed(1)}%`;
            document.getElementById('xpBar').style.width = `${progress}%`;
        } else {
            document.getElementById('nextRankText').textContent = 'MAX RANK!';
            document.getElementById('xpProgress').textContent = `${this.totalXP} XP`;
            document.getElementById('progressPercent').textContent = '100%';
            document.getElementById('xpBar').style.width = '100%';
        }
    }
    
    displayRanksList() {
        const container = document.getElementById('ranksList');
        const allTiers = this.rankManager.getAllRanks();
        const currentRank = this.rankManager.getCurrentRank(this.totalXP);
        
        let html = '';
        
        allTiers.forEach((tier, tierIndex) => {
            html += `
                <div class="mb-6">
                    <h3 class="text-xl font-bold mb-4 bg-gradient-to-r ${tier.color} text-white p-3 rounded-lg">
                        Tier ${tierIndex + 1}: ${tier.name}
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            `;
            
            tier.ranks.forEach((rank, rankIndex) => {
                const isUnlocked = this.totalXP >= rank.xpRequired;
                const isCurrent = currentRank.rank.name === rank.name;
                const bgClass = isUnlocked ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gray-100';
                const textClass = isUnlocked ? 'text-green-700' : 'text-gray-400';
                const borderClass = isCurrent ? 'border-4 border-indigo-500' : 'border border-gray-300';
                
                html += `
                    <div class="${bgClass} ${borderClass} rounded-lg p-4 relative">
                        ${isCurrent ? '<div class="absolute top-2 right-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded">CURRENT</div>' : ''}
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-2xl font-bold ${textClass}">${rank.symbol}</div>
                                <div class="text-lg font-semibold ${textClass}">${rank.name}</div>
                                <div class="text-sm text-gray-600">${rank.xpRequired} XP Required</div>
                            </div>
                            <div class="text-3xl">
                                ${isUnlocked ? '🔓' : '🔒'}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    updateStatsDisplay() {
        const stats = this.statsManager.getStats();
        
        document.getElementById('statTotalQuestions').textContent = stats.questionsAnswered.allTime;
        document.getElementById('statAccuracy').textContent = this.statsManager.getAccuracy().toFixed(1) + '%';
        document.getElementById('statBestStreak').textContent = stats.streakRecord;
        
        ['easy', 'medium', 'hard', 'extreme'].forEach(diff => {
            document.getElementById(`stat${diff.charAt(0).toUpperCase() + diff.slice(1)}Correct`).textContent = 
                stats.byDifficulty[diff].correct;
            document.getElementById(`stat${diff.charAt(0).toUpperCase() + diff.slice(1)}Total`).textContent = 
                `/ ${stats.byDifficulty[diff].answered} answered`;
        });
        
        this.updateStatsChart(this.currentStatsPeriod);
    }
    
    updateStatsChart(period) {
        this.currentStatsPeriod = period;
        
        document.querySelectorAll('.stats-period-btn').forEach(btn => {
            if (btn.dataset.period === period) {
                btn.className = 'stats-period-btn bg-indigo-600 text-white px-4 py-2 rounded-lg';
            } else {
                btn.className = 'stats-period-btn bg-gray-200 text-gray-700 px-4 py-2 rounded-lg';
            }
        });
        
        let data;
        let labels;
        
        if (period === 'daily') {
            data = this.statsManager.getDailyStats(7);
            labels = data.map(d => d.date);
        } else if (period === 'weekly') {
            data = this.statsManager.getWeeklyStats(4);
            labels = data.map(d => d.week);
        } else {
            data = this.statsManager.getMonthlyStats(6);
            labels = data.map(d => d.month);
        }
        
        const ctx = document.getElementById('statsChart').getContext('2d');
        
        if (this.currentChart) {
            this.currentChart.destroy();
        }
        
        this.currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Answered',
                        data: data.map(d => d.answered),
                        backgroundColor: 'rgba(99, 102, 241, 0.5)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Correct',
                        data: data.map(d => d.correct),
                        backgroundColor: 'rgba(34, 197, 94, 0.5)',
                        borderColor: 'rgba(34, 197, 94, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    async loadLeaderboard() {
        if (!this.supabaseManager.isAuthenticated()) {
            document.getElementById('leaderboardNotice').classList.remove('hidden');
            document.getElementById('leaderboardContent').classList.add('hidden');
            return;
        }
        
        document.getElementById('leaderboardNotice').classList.add('hidden');
        document.getElementById('leaderboardContent').classList.remove('hidden');
        
        const leaderboard = await this.supabaseManager.getGlobalLeaderboard(100);
        const tableBody = document.getElementById('leaderboardTable');
        
        if (leaderboard.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                        No players yet. Be the first!
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        leaderboard.forEach((player, index) => {
            const accuracy = player.total_questions > 0 
                ? ((player.correct_answers / player.total_questions) * 100).toFixed(1) 
                : '0.0';
            
            const rankClass = index < 3 ? 'bg-yellow-50' : '';
            const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            
            html += `
                <tr class="${rankClass}">
                    <td class="px-4 py-3 text-sm font-medium">${rankIcon} #${index + 1}</td>
                    <td class="px-4 py-3 text-sm font-semibold">${player.username}</td>
                    <td class="px-4 py-3 text-sm">${player.rank}</td>
                    <td class="px-4 py-3 text-sm text-right font-bold text-indigo-600">${player.xp}</td>
                    <td class="px-4 py-3 text-sm text-right">${player.total_questions || 0}</td>
                    <td class="px-4 py-3 text-sm text-right">${accuracy}%</td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
    }
    
    async syncToSupabase() {
        if (this.supabaseManager.isAuthenticated()) {
            const userId = this.supabaseManager.getCurrentUserId();
            const currentRank = this.rankManager.getCurrentRank(this.totalXP);
            const stats = this.statsManager.getStats();
            
            await this.supabaseManager.updateUserXP(userId, this.totalXP, currentRank.rank.name);
            await this.supabaseManager.updateUserStats(userId, stats);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StoichMasterApp();
});
