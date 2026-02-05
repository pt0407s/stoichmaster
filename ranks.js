// Rank System for StoichMaster

const RANK_SYSTEM = {
    tiers: [
        {
            name: "The Noble Gases (Inert)",
            color: "from-gray-400 to-gray-600",
            textColor: "text-gray-700",
            ranks: [
                { name: "Helium", xpRequired: 0, symbol: "He" },
                { name: "Neon", xpRequired: 100, symbol: "Ne" },
                { name: "Argon", xpRequired: 250, symbol: "Ar" },
                { name: "Krypton", xpRequired: 500, symbol: "Kr" }
            ]
        },
        {
            name: "The Metalloids (Semi-Reactive)",
            color: "from-amber-400 to-amber-600",
            textColor: "text-amber-700",
            ranks: [
                { name: "Boron", xpRequired: 800, symbol: "B" },
                { name: "Silicon", xpRequired: 1200, symbol: "Si" },
                { name: "Germanium", xpRequired: 1700, symbol: "Ge" },
                { name: "Antimony", xpRequired: 2300, symbol: "Sb" }
            ]
        },
        {
            name: "The Halogens (Highly Reactive)",
            color: "from-green-400 to-green-600",
            textColor: "text-green-700",
            ranks: [
                { name: "Iodine", xpRequired: 3000, symbol: "I" },
                { name: "Bromine", xpRequired: 3800, symbol: "Br" },
                { name: "Chlorine", xpRequired: 4700, symbol: "Cl" },
                { name: "Fluorine", xpRequired: 5700, symbol: "F" }
            ]
        },
        {
            name: "The Alkaline Earths (Radical)",
            color: "from-blue-400 to-blue-600",
            textColor: "text-blue-700",
            ranks: [
                { name: "Beryllium", xpRequired: 6800, symbol: "Be" },
                { name: "Magnesium", xpRequired: 8000, symbol: "Mg" },
                { name: "Calcium", xpRequired: 9300, symbol: "Ca" },
                { name: "Barium", xpRequired: 10700, symbol: "Ba" }
            ]
        },
        {
            name: "The Alkali Metals (Explosive)",
            color: "from-red-400 to-red-600",
            textColor: "text-red-700",
            ranks: [
                { name: "Lithium", xpRequired: 12200, symbol: "Li" },
                { name: "Sodium", xpRequired: 13800, symbol: "Na" },
                { name: "Potassium", xpRequired: 15500, symbol: "K" },
                { name: "Cesium", xpRequired: 17300, symbol: "Cs" }
            ]
        },
        {
            name: "The Super-Actives (Master)",
            color: "from-purple-400 to-purple-600",
            textColor: "text-purple-700",
            ranks: [
                { name: "Francium", xpRequired: 20000, symbol: "Fr" }
            ]
        }
    ]
};

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

class RankManager {
    constructor() {
        this.ranks = RANK_SYSTEM;
    }
    
    getCurrentRank(xp) {
        let currentRank = this.ranks.tiers[0].ranks[0];
        let tierIndex = 0;
        let rankIndex = 0;
        
        for (let t = 0; t < this.ranks.tiers.length; t++) {
            for (let r = 0; r < this.ranks.tiers[t].ranks.length; r++) {
                const rank = this.ranks.tiers[t].ranks[r];
                if (xp >= rank.xpRequired) {
                    currentRank = rank;
                    tierIndex = t;
                    rankIndex = r;
                }
            }
        }
        
        return {
            rank: currentRank,
            tier: this.ranks.tiers[tierIndex],
            tierIndex,
            rankIndex
        };
    }
    
    getNextRank(xp) {
        const current = this.getCurrentRank(xp);
        const currentTier = current.tierIndex;
        const currentRankIndex = current.rankIndex;
        
        if (currentRankIndex + 1 < this.ranks.tiers[currentTier].ranks.length) {
            return {
                rank: this.ranks.tiers[currentTier].ranks[currentRankIndex + 1],
                tier: this.ranks.tiers[currentTier]
            };
        }
        
        if (currentTier + 1 < this.ranks.tiers.length) {
            return {
                rank: this.ranks.tiers[currentTier + 1].ranks[0],
                tier: this.ranks.tiers[currentTier + 1]
            };
        }
        
        return null;
    }
    
    getProgressToNextRank(xp) {
        const nextRank = this.getNextRank(xp);
        if (!nextRank) {
            return 100;
        }
        
        const current = this.getCurrentRank(xp);
        const currentXP = current.rank.xpRequired;
        const nextXP = nextRank.rank.xpRequired;
        const progress = ((xp - currentXP) / (nextXP - currentXP)) * 100;
        
        return Math.min(100, Math.max(0, progress));
    }
    
    getAllRanks() {
        return this.ranks.tiers;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RankManager, DIFFICULTY_SETTINGS, RANK_SYSTEM };
}
