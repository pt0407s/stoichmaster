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
            console.log('User signed in:', user.email || user.id);
            this.updateUIForAuthenticatedUser(user);
            this.syncUserData();
        } else {
            console.log('User signed out');
            this.updateUIForAnonymousUser();
        }
    }
    
    // Authentication Methods
    async signInWithEmail(email, password) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        return data;
    }
    
    async signUpWithEmail(email, password, username) {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username
                }
            }
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        // Create user profile
        if (data.user) {
            await this.createUserProfile(data.user.id, username, email);
        }
        
        return data;
    }
    
    async signInWithGoogle() {
        const { data, error } = await this.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) {
            throw new Error(error.message);
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
                    <button id="googleSignIn" class="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                        <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
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
                    
                    <button id="emailSignIn" class="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                        <i class="fas fa-envelope mr-2"></i>Sign In with Email
                    </button>
                </div>
                
                <button id="closeAuthModal" class="mt-6 text-gray-500 hover:text-gray-700 w-full text-center">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('googleSignIn')?.addEventListener('click', async () => {
            try {
                await this.signInWithGoogle();
                modal.remove();
            } catch (error) {
                alert('Error signing in with Google: ' + error.message);
            }
        });
        
        document.getElementById('anonymousSignIn')?.addEventListener('click', async () => {
            try {
                await this.signInAnonymously();
                modal.remove();
            } catch (error) {
                alert('Error signing in anonymously: ' + error.message);
            }
        });
        
        document.getElementById('emailSignIn')?.addEventListener('click', () => {
            this.showEmailAuthForm();
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
    
    showEmailAuthForm() {
        const authModal = document.getElementById('authModal');
        if (!authModal) return;
        
        const modalContent = authModal.querySelector('div');
        modalContent.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Email Sign In</h2>
            
            <div id="emailAuthTabs" class="flex space-x-4 mb-6">
                <button class="email-auth-tab px-4 py-2 font-medium border-b-2 border-indigo-600 text-indigo-600" data-tab="signin">
                    Sign In
                </button>
                <button class="email-auth-tab px-4 py-2 font-medium text-gray-600" data-tab="signup">
                    Sign Up
                </button>
            </div>
            
            <form id="emailAuthForm" class="space-y-4">
                <div id="usernameField" class="hidden">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input type="text" id="username" class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" id="email" required class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input type="password" id="password" required class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none">
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
        
        document.querySelectorAll('.email-auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                currentTab = e.target.dataset.tab;
                
                document.querySelectorAll('.email-auth-tab').forEach(t => {
                    t.className = 'email-auth-tab px-4 py-2 font-medium text-gray-600';
                });
                e.target.className = 'email-auth-tab px-4 py-2 font-medium border-b-2 border-indigo-600 text-indigo-600';
                
                const usernameField = document.getElementById('usernameField');
                const submitBtn = document.querySelector('#emailAuthForm button[type="submit"]');
                
                if (currentTab === 'signup') {
                    usernameField.classList.remove('hidden');
                    submitBtn.textContent = 'Sign Up';
                } else {
                    usernameField.classList.add('hidden');
                    submitBtn.textContent = 'Sign In';
                }
            });
        });
        
        document.getElementById('emailAuthForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const username = document.getElementById('username')?.value;
            
            try {
                if (currentTab === 'signup') {
                    await this.signUpWithEmail(email, password, username);
                    alert('Sign up successful! Please check your email to verify your account.');
                } else {
                    await this.signInWithEmail(email, password);
                }
                authModal.remove();
            } catch (error) {
                alert('Error: ' + error.message);
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
