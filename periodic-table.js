// Interactive Periodic Table UI for AtomLevel Ranks Page

class PeriodicTableUI {
    constructor(rankManager, userXP) {
        this.rankManager = rankManager;
        this.userXP = userXP;
        this.selectedElement = null;
    }
    
    // Generate periodic table HTML
    generatePeriodicTable() {
        const elements = this.rankManager.elements;
        const currentElement = this.rankManager.getCurrentElement(this.userXP);
        
        // Periodic table layout (18 groups, 7 periods + lanthanides/actinides)
        const layout = this.getPeriodicTableLayout();
        
        let html = `
            <div class="periodic-table-container">
                <div class="periodic-table-grid">
        `;
        
        // Generate each cell
        for (let period = 1; period <= 7; period++) {
            for (let group = 1; group <= 18; group++) {
                const element = this.findElementAt(period, group, elements);
                
                if (element) {
                    const isUnlocked = this.userXP >= element.xpRequired;
                    const isCurrent = element.number === currentElement.number;
                    const color = this.rankManager.getCategoryColor(element.category);
                    
                    html += this.generateElementCell(element, isUnlocked, isCurrent, color);
                } else {
                    // Empty cell
                    html += `<div class="periodic-cell empty" style="grid-column: ${group}; grid-row: ${period};"></div>`;
                }
            }
        }
        
        html += `
                </div>
                
                <!-- Lanthanides and Actinides -->
                <div class="lanthanides-actinides">
                    ${this.generateLanthanidesActinides(elements)}
                </div>
                
                <!-- Legend -->
                <div class="periodic-legend">
                    ${this.generateLegend()}
                </div>
            </div>
            
            <!-- Element Details Modal -->
            <div id="elementModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 relative">
                    <button id="closeModal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                    <div id="elementDetails"></div>
                </div>
            </div>
        `;
        
        return html;
    }
    
    // Find element at specific position
    findElementAt(period, group, elements) {
        return elements.find(el => el.period === period && el.group === group);
    }
    
    // Generate individual element cell
    generateElementCell(element, isUnlocked, isCurrent, color) {
        const opacity = isUnlocked ? '1' : '0.4';
        const borderClass = isCurrent ? 'border-4 border-yellow-400 shadow-lg' : 'border border-gray-300';
        const cursorClass = 'cursor-pointer';
        
        return `
            <div class="periodic-cell ${cursorClass} ${borderClass} transition-all duration-200"
                 style="grid-column: ${element.group}; grid-row: ${element.period}; 
                        background-color: ${color}; opacity: ${opacity};"
                 data-element="${element.number}"
                 onclick="periodicTableUI.showElementDetails(${element.number})">
                <div class="text-xs font-bold text-gray-700">${element.number}</div>
                <div class="text-2xl font-bold text-gray-900">${element.symbol}</div>
                <div class="text-xs text-gray-700 truncate">${element.name}</div>
                ${!isUnlocked ? '<div class="text-lg">🔒</div>' : ''}
                ${isCurrent ? '<div class="text-lg">⭐</div>' : ''}
            </div>
        `;
    }
    
    // Generate lanthanides and actinides rows
    generateLanthanidesActinides(elements) {
        let html = '<div class="lanthanides-row">';
        
        // Lanthanides (57-71)
        for (let i = 57; i <= 71; i++) {
            const element = elements[i - 1];
            const isUnlocked = this.userXP >= element.xpRequired;
            const isCurrent = element.number === this.rankManager.getCurrentElement(this.userXP).number;
            const color = this.rankManager.getCategoryColor(element.category);
            
            html += this.generateSmallElementCell(element, isUnlocked, isCurrent, color);
        }
        
        html += '</div><div class="actinides-row">';
        
        // Actinides (89-103)
        for (let i = 89; i <= 103; i++) {
            const element = elements[i - 1];
            const isUnlocked = this.userXP >= element.xpRequired;
            const isCurrent = element.number === this.rankManager.getCurrentElement(this.userXP).number;
            const color = this.rankManager.getCategoryColor(element.category);
            
            html += this.generateSmallElementCell(element, isUnlocked, isCurrent, color);
        }
        
        html += '</div>';
        return html;
    }
    
    // Generate small element cell for lanthanides/actinides
    generateSmallElementCell(element, isUnlocked, isCurrent, color) {
        const opacity = isUnlocked ? '1' : '0.4';
        const borderClass = isCurrent ? 'border-2 border-yellow-400' : 'border border-gray-300';
        const cursorClass = 'cursor-pointer';
        
        return `
            <div class="periodic-cell-small ${cursorClass} ${borderClass} transition-all duration-200"
                 style="background-color: ${color}; opacity: ${opacity};"
                 data-element="${element.number}"
                 onclick="periodicTableUI.showElementDetails(${element.number})">
                <div class="text-xs font-bold">${element.number}</div>
                <div class="text-lg font-bold">${element.symbol}</div>
                ${!isUnlocked ? '<div class="text-sm">🔒</div>' : ''}
            </div>
        `;
    }
    
    // Generate legend
    generateLegend() {
        const categories = [
            { name: 'Alkali Metal', color: CATEGORY_COLORS['alkali-metal'] },
            { name: 'Alkaline Earth', color: CATEGORY_COLORS['alkaline-earth'] },
            { name: 'Transition Metal', color: CATEGORY_COLORS['transition-metal'] },
            { name: 'Post-Transition', color: CATEGORY_COLORS['post-transition'] },
            { name: 'Metalloid', color: CATEGORY_COLORS['metalloid'] },
            { name: 'Nonmetal', color: CATEGORY_COLORS['nonmetal'] },
            { name: 'Halogen', color: CATEGORY_COLORS['halogen'] },
            { name: 'Noble Gas', color: CATEGORY_COLORS['noble-gas'] },
            { name: 'Lanthanide', color: CATEGORY_COLORS['lanthanide'] },
            { name: 'Actinide', color: CATEGORY_COLORS['actinide'] }
        ];
        
        let html = '<div class="flex flex-wrap gap-3 justify-center mt-6">';
        categories.forEach(cat => {
            html += `
                <div class="flex items-center space-x-2">
                    <div class="w-6 h-6 rounded" style="background-color: ${cat.color};"></div>
                    <span class="text-sm text-gray-700">${cat.name}</span>
                </div>
            `;
        });
        html += '</div>';
        
        return html;
    }
    
    // Show element details in modal
    showElementDetails(elementNumber) {
        const element = this.rankManager.elements[elementNumber - 1];
        const isUnlocked = this.userXP >= element.xpRequired;
        const color = this.rankManager.getCategoryColor(element.category);
        
        // Always show full details for educational purposes
        let lockNotice = '';
        if (!isUnlocked) {
            lockNotice = `
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-4">
                    <p class="text-yellow-800 font-medium"><i class="fas fa-lock mr-2"></i>Rank Locked</p>
                    <p class="text-yellow-700 mt-1">Earn <strong>${element.xpRequired - this.userXP} more XP</strong> to unlock this element as your rank!</p>
                </div>
            `;
        } else {
            lockNotice = `
                <div class="bg-green-50 border-l-4 border-green-400 p-4 rounded mb-4">
                    <p class="text-green-800 font-medium"><i class="fas fa-check-circle mr-2"></i>Rank Unlocked!</p>
                    <p class="text-green-700 mt-1">You can use this element as your rank.</p>
                </div>
            `;
        }
        
        document.getElementById('elementDetails').innerHTML = `
            <div class="text-center">
                <div class="inline-block p-6 rounded-xl mb-4" style="background-color: ${color};">
                    <div class="text-sm font-bold text-gray-700">${element.number}</div>
                    <div class="text-6xl font-bold text-gray-900">${element.symbol}</div>
                </div>
                <h2 class="text-3xl font-bold text-gray-800 mb-2">${element.name}</h2>
                <p class="text-lg text-gray-600 mb-4">${element.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                
                ${lockNotice}
                
                <div class="grid grid-cols-2 gap-4 text-left mb-6">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">Atomic Number</div>
                        <div class="text-2xl font-bold text-gray-800">${element.number}</div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">Group</div>
                        <div class="text-2xl font-bold text-gray-800">${element.group}</div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">Period</div>
                        <div class="text-2xl font-bold text-gray-800">${element.period}</div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-600">XP Required</div>
                        <div class="text-2xl font-bold ${isUnlocked ? 'text-green-600' : 'text-orange-600'}">${element.xpRequired}</div>
                    </div>
                </div>
                
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-4 text-left">
                    <div class="font-bold text-blue-800 mb-2">Electron Configuration</div>
                    <div class="text-blue-900 font-mono">${element.electronConfig}</div>
                </div>
                
                <div class="bg-purple-50 border-l-4 border-purple-400 p-4 rounded mb-4 text-left">
                    <div class="font-bold text-purple-800 mb-2">Reactivity</div>
                    <div class="text-purple-900">${element.reactivity}</div>
                </div>
                
                <div class="bg-green-50 border-l-4 border-green-400 p-4 rounded text-left">
                    <div class="font-bold text-green-800 mb-2">Fun Fact</div>
                    <div class="text-green-900">${element.fact}</div>
                </div>
            </div>
        `;
        
        // Show modal
        document.getElementById('elementModal').classList.remove('hidden');
    }
    
    // Close modal
    closeModal() {
        document.getElementById('elementModal').classList.add('hidden');
    }
    
    // Get periodic table layout
    getPeriodicTableLayout() {
        // Standard 18-column periodic table layout
        // This is a simplified version - elements are positioned by their group and period
        return {};
    }
}

// Global instance (will be initialized in script.js)
let periodicTableUI = null;
