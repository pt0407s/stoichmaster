// Stats and Analytics Manager for StoichMaster

class StatsManager {
    constructor() {
        this.stats = this.loadStats();
    }
    
    loadStats() {
        const defaultStats = {
            questionsAnswered: {
                allTime: 0,
                daily: {},
                weekly: {},
                monthly: {}
            },
            correctAnswers: {
                allTime: 0,
                daily: {},
                weekly: {},
                monthly: {}
            },
            totalXP: 0,
            averageTime: 0,
            totalTime: 0,
            byDifficulty: {
                easy: { answered: 0, correct: 0, xp: 0 },
                medium: { answered: 0, correct: 0, xp: 0 },
                hard: { answered: 0, correct: 0, xp: 0 },
                extreme: { answered: 0, correct: 0, xp: 0 }
            },
            byCategory: {
                stoichiometry: { answered: 0, correct: 0 },
                conversion: { answered: 0, correct: 0 },
                balancing: { answered: 0, correct: 0 }
            },
            streakRecord: 0,
            lastPlayed: null
        };
        
        const saved = localStorage.getItem('stoichmaster_stats');
        return saved ? JSON.parse(saved) : defaultStats;
    }
    
    saveStats() {
        localStorage.setItem('stoichmaster_stats', JSON.stringify(this.stats));
    }
    
    recordAnswer(isCorrect, category, difficulty, timeTaken, xpEarned) {
        const now = new Date();
        const dateKey = this.getDateKey(now);
        const weekKey = this.getWeekKey(now);
        const monthKey = this.getMonthKey(now);
        
        this.stats.questionsAnswered.allTime++;
        if (isCorrect) {
            this.stats.correctAnswers.allTime++;
        }
        
        if (!this.stats.questionsAnswered.daily[dateKey]) {
            this.stats.questionsAnswered.daily[dateKey] = 0;
            this.stats.correctAnswers.daily[dateKey] = 0;
        }
        this.stats.questionsAnswered.daily[dateKey]++;
        if (isCorrect) {
            this.stats.correctAnswers.daily[dateKey]++;
        }
        
        if (!this.stats.questionsAnswered.weekly[weekKey]) {
            this.stats.questionsAnswered.weekly[weekKey] = 0;
            this.stats.correctAnswers.weekly[weekKey] = 0;
        }
        this.stats.questionsAnswered.weekly[weekKey]++;
        if (isCorrect) {
            this.stats.correctAnswers.weekly[weekKey]++;
        }
        
        if (!this.stats.questionsAnswered.monthly[monthKey]) {
            this.stats.questionsAnswered.monthly[monthKey] = 0;
            this.stats.correctAnswers.monthly[monthKey] = 0;
        }
        this.stats.questionsAnswered.monthly[monthKey]++;
        if (isCorrect) {
            this.stats.correctAnswers.monthly[monthKey]++;
        }
        
        this.stats.byDifficulty[difficulty].answered++;
        if (isCorrect) {
            this.stats.byDifficulty[difficulty].correct++;
            this.stats.byDifficulty[difficulty].xp += xpEarned;
        }
        
        this.stats.byCategory[category].answered++;
        if (isCorrect) {
            this.stats.byCategory[category].correct++;
        }
        
        this.stats.totalTime += timeTaken;
        this.stats.averageTime = this.stats.totalTime / this.stats.questionsAnswered.allTime;
        
        if (isCorrect) {
            this.stats.totalXP += xpEarned;
        }
        
        this.stats.lastPlayed = now.toISOString();
        
        this.saveStats();
    }
    
    updateStreak(currentStreak) {
        if (currentStreak > this.stats.streakRecord) {
            this.stats.streakRecord = currentStreak;
            this.saveStats();
        }
    }
    
    getDateKey(date) {
        return date.toISOString().split('T')[0];
    }
    
    getWeekKey(date) {
        const year = date.getFullYear();
        const week = this.getWeekNumber(date);
        return `${year}-W${week}`;
    }
    
    getMonthKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
    
    getDailyStats(days = 7) {
        const result = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const key = this.getDateKey(date);
            
            result.push({
                date: key,
                answered: this.stats.questionsAnswered.daily[key] || 0,
                correct: this.stats.correctAnswers.daily[key] || 0
            });
        }
        
        return result;
    }
    
    getWeeklyStats(weeks = 4) {
        const result = [];
        const now = new Date();
        
        for (let i = weeks - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - (i * 7));
            const key = this.getWeekKey(date);
            
            result.push({
                week: key,
                answered: this.stats.questionsAnswered.weekly[key] || 0,
                correct: this.stats.correctAnswers.weekly[key] || 0
            });
        }
        
        return result;
    }
    
    getMonthlyStats(months = 6) {
        const result = [];
        const now = new Date();
        
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);
            const key = this.getMonthKey(date);
            
            result.push({
                month: key,
                answered: this.stats.questionsAnswered.monthly[key] || 0,
                correct: this.stats.correctAnswers.monthly[key] || 0
            });
        }
        
        return result;
    }
    
    getAccuracy() {
        if (this.stats.questionsAnswered.allTime === 0) return 0;
        return (this.stats.correctAnswers.allTime / this.stats.questionsAnswered.allTime) * 100;
    }
    
    getStats() {
        return this.stats;
    }
    
    resetStats() {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
            localStorage.removeItem('stoichmaster_stats');
            this.stats = this.loadStats();
            return true;
        }
        return false;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StatsManager };
}
