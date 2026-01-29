/**
 * Shared Login Utilities - TopSkill LMS
 * Reusable JavaScript functions for login pages
 */

// Color configuration - matches frontend/lib/colors.ts
const TopSkillColors = {
    primary: '#048181',
    secondary: '#f45c2c',
    textDark: '#366854',
    textMuted: '#64748B',
    borderPrimary: '#CBD5E1',
    bgPrimary: '#FFFFFF',
    bgLight: '#9fbeb2',
};

/**
 * Apply focus styles to input elements
 */
function applyInputFocusStyles() {
    const inputs = document.querySelectorAll('.login-form-input, input[type="text"], input[type="password"], input[type="email"]');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = TopSkillColors.primary;
            this.style.boxShadow = `0 0 0 3px rgba(4, 129, 129, 0.1)`;
        });
        
        input.addEventListener('blur', function() {
            this.style.borderColor = TopSkillColors.borderPrimary;
            this.style.boxShadow = '';
        });
    });
}

/**
 * Apply hover styles to buttons
 */
function applyButtonHoverStyles() {
    const buttons = document.querySelectorAll('.login-button, input[type="submit"]');
    
    buttons.forEach(button => {
        if (!button.disabled) {
            button.addEventListener('mouseenter', function() {
                if (this.classList.contains('login-button') || this.type === 'submit') {
                    this.style.background = TopSkillColors.secondary;
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 6px 20px rgba(244, 92, 44, 0.4)';
                }
            });
            
            button.addEventListener('mouseleave', function() {
                if (this.classList.contains('login-button') || this.type === 'submit') {
                    this.style.background = TopSkillColors.primary;
                    this.style.transform = '';
                    this.style.boxShadow = '0 4px 12px rgba(4, 129, 129, 0.3)';
                }
            });
        }
    });
}

/**
 * Initialize login page enhancements
 */
function initLoginPage() {
    applyInputFocusStyles();
    applyButtonHoverStyles();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoginPage);
} else {
    initLoginPage();
}



