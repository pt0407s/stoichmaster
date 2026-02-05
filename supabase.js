// Supabase Client and Authentication Manager

class SupabaseManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.init();
    }
    
    async init() {
        // Initialize Supabase client
        if (typeof SUPABASE_CONFIG === 'undefined' || !SUPABASE_CONFIG.url || SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') {
            console.warn('Supabase not configured. Please update config.js with your Supabase credentials.');
            return;
        }
        
        this.supabase = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        
        // Check for existing session
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            this.onAuthStateChange(session.user);
        }
        
        // Listen for auth changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            this.currentUser = session?.user || null;
            this.onAuthStateChange(this.currentUser);
        });
    }
    
    onAuthStateChange(user) {
        if (user) {
            const username = user.user_metadata?.username || user.user_metadata?.display_name || 'User';
            console.log('User signed in:', username);
            this.updateUIForAuthenticatedUser(user);
            this.syncUserData();
        } else {
            console.log('User signed out');
            this.updateUIForAnonymousUser();
        }
    }
    
    // Validation Methods
    validateUsername(username) {
        // Min 5 characters, max 18 characters
        if (username.length < 5 || username.length > 18) {
            return { valid: false, error: 'Username must be 5-18 characters long' };
        }
        
        // No spaces
        if (username.includes(' ')) {
            return { valid: false, error: 'Username cannot contain spaces' };
        }
        
        // Only alphanumeric, _, ., -
        const usernameRegex = /^[a-zA-Z0-9._-]+$/;
        if (!usernameRegex.test(username)) {
            return { valid: false, error: 'Username can only contain letters, numbers, _, ., and -' };
        }
        
        return { valid: true };
    }
    
    validatePassword(password) {
        // Min 8 characters, max 18 characters
        if (password.length < 8 || password.length > 18) {
            return { valid: false, error: 'Password must be 8-18 characters long' };
        }
        
        // No spaces
        if (password.includes(' ')) {
            return { valid: false, error: 'Password cannot contain spaces' };
        }
        
        // Only alphanumeric, _, ., -, @, $, %
        const passwordRegex = /^[a-zA-Z0-9._\-@$%]+$/;
        if (!passwordRegex.test(password)) {
            return { valid: false, error: 'Password can only contain letters, numbers, _, ., -, @, $, and %' };
        }
        
        return { valid: true };
    }
    
    // Authentication Methods
    async signUpWithUsername(username, password) {
        // Validate username
        const usernameValidation = this.validateUsername(username);
        if (!usernameValidation.valid) {
            throw new Error(usernameValidation.error);
        }
        
        // Validate password
        const passwordValidation = this.validatePassword(password);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.error);
        }
        
        // Check if username already exists
        const { data: existingUser } = await this.supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .single();
        
        if (existingUser) {
            throw new Error('Username already taken');
        }
        
        // Create a synthetic email for Supabase auth (username@stoichmaster.local)
        const syntheticEmail = `${username}@stoichmaster.local`;
        
        const { data, error } = await this.supabase.auth.signUp({
            email: syntheticEmail,
            password: password,
            options: {
                data: {
                    username: username,
                    display_name: username
                }
            }
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        // Create user profile
        if (data.user) {
            await this.createUserProfile(data.user.id, username, null);
        }
        
        return data;
    }
    
    async signInWithUsername(username, password) {
        // Validate username format
        const usernameValidation = this.validateUsername(username);
        if (!usernameValidation.valid) {
            throw new Error(usernameValidation.error);
        }
        
        // Convert username to synthetic email
        const syntheticEmail = `${username}@stoichmaster.local`;
        
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: syntheticEmail,
            password: password
        });
        
        if (error) {
            throw new Error('Invalid username or password');
        }
        
        return data;
    }
    
    async signInAnonymously() {
        // Generate anonymous username
        const anonUsername = `Guest_${Math.random().toString(36).substring(2, 8)}`;
        
        const { data, error } = await this.supabase.auth.signInAnonymously({
            options: {
                data: {
                    username: anonUsername
                }
            }
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        if (data.user) {
            await this.createUserProfile(data.user.id, anonUsername, null);
        }
        
        return data;
    }
    
    async signOut() {
        const { error } = await this.supabase.auth.signOut();
        if (error) {
            throw new Error(error.message);
        }
    }
    
    // User Profile Management
    async createUserProfile(userId, username, email) {
        const { error } = await this.supabase
            .from('users')
            .insert({
                id: userId,
                username: username,
                email: email,
                xp: 0,
                rank: 'Helium',
                created_at: new Date().toISOString()
            });
        
        if (error && error.code !== '23505') { // Ignore duplicate key error
            console.error('Error creating profile:', error);
        }
    }
    
    async getUserProfile(userId) {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) {
            // If profile doesn't exist, return null (not an error)
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error('Error fetching profile:', error);
            return null;
        }
        
        return data;
    }
    
    async updateUserXP(userId, xp, rank) {
        const { error } = await this.supabase
            .from('users')
            .update({ 
                xp: xp,
                rank: rank,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        
        if (error) {
            console.error('Error updating XP:', error);
        }
    }
    
    async updateUserStats(userId, stats) {
        const { error } = await this.supabase
            .from('users')
            .update({
                total_questions: stats.questionsAnswered.allTime,
                correct_answers: stats.correctAnswers.allTime,
                best_streak: stats.streakRecord,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        
        if (error) {
            console.error('Error updating stats:', error);
        }
    }
    
    // Leaderboard Methods
    async getGlobalLeaderboard(limit = 100) {
        const { data, error } = await this.supabase
            .from('users')
            .select('username, xp, rank, total_questions, correct_answers')
            .order('xp', { ascending: false })
            .limit(limit);
        
        if (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
        
        return data;
    }
    
    async getUserRank(userId) {
        // Get user's position in leaderboard
        const { data, error } = await this.supabase
            .rpc('get_user_rank', { user_id: userId });
        
        if (error) {
            console.error('Error fetching user rank:', error);
            return null;
        }
        
        return data;
    }
    
    // Sync local data to Supabase
    async syncUserData() {
        if (!this.currentUser) return;
        
        // Get local XP and stats
        const localXP = parseInt(localStorage.getItem('stoichmaster_xp') || '0');
        const localStats = JSON.parse(localStorage.getItem('stoichmaster_stats') || '{}');
        
        // Get remote data
        const remoteProfile = await this.getUserProfile(this.currentUser.id);
        
        if (remoteProfile) {
            // Merge data (use highest XP)
            const finalXP = Math.max(localXP, remoteProfile.xp || 0);
            
            // Update remote if local is higher
            if (localXP > (remoteProfile.xp || 0)) {
                const rankManager = new RankManager();
                const currentRank = rankManager.getCurrentRank(finalXP);
                await this.updateUserXP(this.currentUser.id, finalXP, currentRank.rank.name);
                
                if (localStats.questionsAnswered) {
                    await this.updateUserStats(this.currentUser.id, localStats);
                }
            }
            
            // Update local if remote is higher
            if ((remoteProfile.xp || 0) > localXP) {
                localStorage.setItem('stoichmaster_xp', remoteProfile.xp.toString());
            }
        } else {
            // Profile doesn't exist, create it
            const username = this.currentUser.user_metadata?.username || this.currentUser.user_metadata?.display_name || 'User';
            await this.createUserProfile(this.currentUser.id, username, this.currentUser.email);
            
            // Upload local data if exists
            if (localXP > 0) {
                const rankManager = new RankManager();
                const currentRank = rankManager.getCurrentRank(localXP);
                await this.updateUserXP(this.currentUser.id, localXP, currentRank.rank.name);
                
                if (localStats.questionsAnswered) {
                    await this.updateUserStats(this.currentUser.id, localStats);
                }
            }
        }
    }
    
    // UI Update Methods
    updateUIForAuthenticatedUser(user) {
        const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
        
        // Update auth button
        const authContainer = document.getElementById('authContainer');
        if (authContainer) {
            authContainer.innerHTML = `
                <div class="flex items-center space-x-3">
                    <span class="text-sm text-gray-700">👤 ${username}</span>
                    <button id="signOutBtn" class="text-sm text-red-600 hover:text-red-700">
                        Sign Out
                    </button>
                </div>
            `;
            
            document.getElementById('signOutBtn')?.addEventListener('click', () => this.signOut());
        }
        
        // Show leaderboard tab
        const leaderboardTab = document.querySelector('[data-tab="leaderboard"]');
        if (leaderboardTab) {
            leaderboardTab.classList.remove('hidden');
        }
    }
    
    updateUIForAnonymousUser() {
        const authContainer = document.getElementById('authContainer');
        if (authContainer) {
            authContainer.innerHTML = `
                <button id="signInBtn" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    <i class="fas fa-sign-in-alt mr-2"></i>Sign In
                </button>
            `;
            
            document.getElementById('signInBtn')?.addEventListener('click', () => this.showAuthModal());
        }
    }
    
    showAuthModal() {
        // Create and show authentication modal
        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Sign In to StoichMaster</h2>
                
                <div class="space-y-4">
                    <button id="usernameSignIn" class="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                        <i class="fas fa-user mr-2"></i>Sign In with Username
                    </button>
                    
                    <div class="relative">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-gray-300"></div>
                        </div>
                        <div class="relative flex justify-center text-sm">
                            <span class="px-2 bg-white text-gray-500">Or</span>
                        </div>
                    </div>
                    
                    <button id="anonymousSignIn" class="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                        <i class="fas fa-user-secret mr-2"></i>Continue as Guest
                    </button>
                </div>
                
                <button id="closeAuthModal" class="mt-6 text-gray-500 hover:text-gray-700 w-full text-center">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('usernameSignIn')?.addEventListener('click', () => {
            this.showUsernameAuthForm();
        });
        
        document.getElementById('anonymousSignIn')?.addEventListener('click', async () => {
            try {
                await this.signInAnonymously();
                modal.remove();
            } catch (error) {
                alert('Error signing in anonymously: ' + error.message);
            }
        });
        
        document.getElementById('closeAuthModal')?.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    showUsernameAuthForm() {
        const authModal = document.getElementById('authModal');
        if (!authModal) return;
        
        const modalContent = authModal.querySelector('div');
        modalContent.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Username Sign In</h2>
            
            <div id="usernameAuthTabs" class="flex space-x-4 mb-6">
                <button class="username-auth-tab px-4 py-2 font-medium border-b-2 border-indigo-600 text-indigo-600" data-tab="signin">
                    Sign In
                </button>
                <button class="username-auth-tab px-4 py-2 font-medium text-gray-600" data-tab="signup">
                    Sign Up
                </button>
            </div>
            
            <form id="usernameAuthForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input type="text" id="username" required class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" placeholder="5-18 characters">
                    <p class="text-xs text-gray-500 mt-1">Letters, numbers, _, ., - only (no spaces)</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input type="password" id="password" required class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" placeholder="8-18 characters">
                    <p class="text-xs text-gray-500 mt-1">Letters, numbers, _, ., -, @, $, % only (no spaces)</p>
                </div>
                
                <div id="errorMessage" class="hidden bg-red-50 border-l-4 border-red-400 p-3 rounded">
                    <p class="text-sm text-red-700"></p>
                </div>
                
                <button type="submit" class="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                    Sign In
                </button>
            </form>
            
            <button id="backToAuth" class="mt-6 text-gray-500 hover:text-gray-700 w-full text-center">
                ← Back
            </button>
        `;
        
        let currentTab = 'signin';
        
        document.querySelectorAll('.username-auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                currentTab = e.target.dataset.tab;
                
                document.querySelectorAll('.username-auth-tab').forEach(t => {
                    t.className = 'username-auth-tab px-4 py-2 font-medium text-gray-600';
                });
                e.target.className = 'username-auth-tab px-4 py-2 font-medium border-b-2 border-indigo-600 text-indigo-600';
                
                const submitBtn = document.querySelector('#usernameAuthForm button[type="submit"]');
                const errorMessage = document.getElementById('errorMessage');
                
                if (currentTab === 'signup') {
                    submitBtn.textContent = 'Sign Up';
                } else {
                    submitBtn.textContent = 'Sign In';
                }
                
                errorMessage.classList.add('hidden');
            });
        });
        
        document.getElementById('usernameAuthForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');
            const errorText = errorMessage.querySelector('p');
            
            try {
                errorMessage.classList.add('hidden');
                
                if (currentTab === 'signup') {
                    await this.signUpWithUsername(username, password);
                    alert('Sign up successful! You can now sign in.');
                } else {
                    await this.signInWithUsername(username, password);
                }
                authModal.remove();
            } catch (error) {
                errorText.textContent = error.message;
                errorMessage.classList.remove('hidden');
            }
        });
        
        document.getElementById('backToAuth')?.addEventListener('click', () => {
            authModal.remove();
            this.showAuthModal();
        });
    }
    
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    getCurrentUserId() {
        return this.currentUser?.id;
    }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SupabaseManager };
}
