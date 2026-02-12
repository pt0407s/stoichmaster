// Periodic Table Rank Manager for AtomLevel
// Uses elements.js data for element-based progression

class PeriodicRankManager {
    constructor() {
        // ELEMENTS is loaded from elements.js
        this.elements = typeof ELEMENTS !== 'undefined' ? ELEMENTS : [];
    }
    
    // Get current element based on XP
    getCurrentElement(xp) {
        let currentElement = this.elements[0]; // Start with Hydrogen
        
        for (let i = 0; i < this.elements.length; i++) {
            if (xp >= this.elements[i].xpRequired) {
                currentElement = this.elements[i];
            } else {
                break;
            }
        }
        
        return currentElement;
    }
    
    // Get next element to unlock
    getNextElement(xp) {
        const current = this.getCurrentElement(xp);
        const nextIndex = current.number; // Next atomic number (0-indexed array)
        
        if (nextIndex < this.elements.length) {
            return this.elements[nextIndex];
        }
        
        return null; // Max rank reached
    }
    
    // Get progress to next element
    getProgressToNext(xp) {
        const current = this.getCurrentElement(xp);
        const next = this.getNextElement(xp);
        
        if (!next) {
            return {
                current: current,
                next: null,
                progress: 100,
                xpNeeded: 0,
                xpProgress: 0
            };
        }
        
        const xpIntoCurrentRank = xp - current.xpRequired;
        const xpNeededForNext = next.xpRequired - current.xpRequired;
        const progress = (xpIntoCurrentRank / xpNeededForNext) * 100;
        
        return {
            current: current,
            next: next,
            progress: Math.min(progress, 100),
            xpNeeded: next.xpRequired - xp,
            xpProgress: xp - current.xpRequired,
            xpTotal: xpNeededForNext
        };
    }
    
    // Check if element is unlocked
    isElementUnlocked(elementNumber, xp) {
        const element = this.elements[elementNumber - 1];
        return xp >= element.xpRequired;
    }
    
    // Get all unlocked elements
    getUnlockedElements(xp) {
        return this.elements.filter(el => xp >= el.xpRequired);
    }
    
    // Get category color for element
    getCategoryColor(category) {
        return CATEGORY_COLORS[category] || '#cccccc';
    }
    
    // Format element display
    formatElementDisplay(element) {
        return {
            number: element.number,
            symbol: element.symbol,
            name: element.name,
            color: this.getCategoryColor(element.category),
            category: element.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
        };
    }
}

// Difficulty settings remain the same
const DIFFICULTY_SETTINGS = {
    easy: {
        name: "Easy",
        xpMultiplier: 1,
        timeBonus: 5,
        color: "bg-green-500",
        icon: "fa-smile"
    },
    medium: {
        name: "Medium",
        xpMultiplier: 1.5,
        timeBonus: 10,
        color: "bg-yellow-500",
        icon: "fa-meh"
    },
    hard: {
        name: "Hard",
        xpMultiplier: 2,
        timeBonus: 15,
        color: "bg-orange-500",
        icon: "fa-frown"
    },
    extreme: {
        name: "Extreme",
        xpMultiplier: 3,
        timeBonus: 25,
        color: "bg-red-500",
        icon: "fa-skull"
    }
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PeriodicRankManager, DIFFICULTY_SETTINGS };
}
