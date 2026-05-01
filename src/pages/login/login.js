import { auth, db } from '../../core/scripts/firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {

    var TemporalEngine = {
        init: function () {
            var override = localStorage.getItem('theme_override');
            if (override === 'diurnal' || override === 'nocturnal') {
                this.apply(override);
            } else {
                this.detectAndApply();
            }
            setInterval(this.detectAndApply.bind(this), 60000);
        },
        detectAndApply: function () {
            if (localStorage.getItem('theme_override')) return;
            var hour = new Date().getHours();
            this.apply(hour >= 6 && hour < 18 ? 'diurnal' : 'nocturnal');
        },
        apply: function (mode) {
            document.documentElement.dataset.theme = mode;
        }
    };

    var VideoController = {
        playlist: [
            '../../assets/video/Luxury_Restaurant_Elegant_Interior_Dining.mp4',
            '../../assets/video/Luxury_Restaurant_Entrance_VIP_Arrival.mp4',
            '../../assets/video/Chef_Plates_Gourmet_Levantine_Meal.mp4',
            '../../assets/video/Craft_Cocktail_Pouring_Video_Generated.mp4'
        ],
        currentIndex: 0,
        isTransitioning: false,
        videoA: null,
        videoB: null,
        activeEl: null,
        standbyEl: null,

        init: function () {
            this.videoA = document.getElementById('video-a');
            this.videoB = document.getElementById('video-b');
            if (!this.videoA || !this.videoB) return;

            this.activeEl = this.videoA;
            this.standbyEl = this.videoB;
            this.activeEl.src = this.playlist[0];
            this.activeEl.classList.add('active');

            this.activeEl.addEventListener('ended', this.onVideoEnded.bind(this));
            this.standbyEl.addEventListener('ended', this.onVideoEnded.bind(this));

            this.tryAutoplay(this.activeEl);
            this.setupVisibility();
        },

        tryAutoplay: function (el) {
            var promise = el.play();
            if (promise !== undefined) {
                promise.catch(this.activateFallback.bind(this));
            }
        },

        activateFallback: function () {
            var fallback = document.getElementById('video-fallback');
            if (fallback) fallback.classList.add('active');
            if (this.videoA) this.videoA.style.display = 'none';
            if (this.videoB) this.videoB.style.display = 'none';
        },

        onVideoEnded: function () {
            if (this.isTransitioning) return;
            this.isTransitioning = true;

            this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
            this.standbyEl.src = this.playlist[this.currentIndex];
            this.standbyEl.load();

            var self = this;
            this.standbyEl.addEventListener('canplay', function onReady() {
                self.standbyEl.removeEventListener('canplay', onReady);
                self.standbyEl.play().catch(function () {});

                self.standbyEl.classList.add('active');
                self.activeEl.classList.remove('active');

                var temp = self.activeEl;
                self.activeEl = self.standbyEl;
                self.standbyEl = temp;

                setTimeout(function () {
                    self.isTransitioning = false;
                }, 1600);
            });
        },

        setupVisibility: function () {
            var self = this;
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) {
                    if (self.activeEl) self.activeEl.pause();
                } else {
                    if (self.activeEl) self.activeEl.play().catch(function () {});
                }
            });
        }
    };

    var state = {
        mode: 'login',
        isSubmitting: false,
        isForgotPassword: false,
        showPassword: false
    };

    var els = {
        card: document.getElementById('auth-card'),
        form: document.getElementById('auth-form'),
        heading: document.getElementById('form-heading'),
        email: document.getElementById('input-email'),
        password: document.getElementById('input-password'),
        fullname: document.getElementById('input-fullname'),
        confirmPassword: document.getElementById('input-confirm-password'),
        btnSubmit: document.getElementById('btn-submit'),
        btnText: document.getElementById('btn-text'),
        toggleLink: document.getElementById('toggle-link'),
        toggleText: document.getElementById('toggle-text'),
        forgotLink: document.getElementById('forgot-link'),
        forgotPanel: document.getElementById('forgot-panel'),
        backToLogin: document.getElementById('back-to-login'),
        btnReset: document.getElementById('btn-reset'),
        forgotEmail: document.getElementById('input-forgot-email'),
        forgotSuccess: document.getElementById('forgot-success'),
        togglePassword: document.getElementById('toggle-password'),
        successOverlay: document.getElementById('success-overlay'),
        successTitle: document.getElementById('success-title'),
        successSubtitle: document.getElementById('success-subtitle'),
        formExtras: document.getElementById('form-extras'),
        toastContainer: document.getElementById('toast-container'),
        btnGoogle: document.getElementById('btn-google'),
        btnFacebook: document.getElementById('btn-facebook')
    };

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validateEmail(value) {
        value = value ? value.trim() : '';
        if (!value) return 'Email address is required';
        if (!emailRegex.test(value)) return 'Please enter a valid email';
        return null;
    }

    function validatePassword(value) {
        value = value ? value.trim() : '';
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Must include an uppercase letter';
        if (!/[a-z]/.test(value)) return 'Must include a lowercase letter';
        if (!/[0-9]/.test(value)) return 'Must include a number';
        return null;
    }

    function validateFullName(value) {
        value = value ? value.trim() : '';
        if (!value) return 'Full name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return null;
    }

    function validateConfirmPassword(value) {
        value = value ? value.trim() : '';
        var pass = els.password && els.password.value ? els.password.value.trim() : '';
        if (!value) return 'Please confirm your password';
        if (value !== pass) return 'Passwords do not match';
        return null;
    }

    function showError(inputId, message) {
        var errorEl = document.getElementById('error-' + inputId);
        var inputEl = document.getElementById('input-' + inputId);
        if (errorEl && message) {
            errorEl.textContent = message;
            errorEl.classList.add('visible');
            if (inputEl) {
                inputEl.classList.add('error');
                inputEl.classList.remove('success');
                inputEl.setAttribute('aria-invalid', 'true');
            }
        }
    }

    function clearError(inputId) {
        var errorEl = document.getElementById('error-' + inputId);
        var inputEl = document.getElementById('input-' + inputId);
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
        }
        if (inputEl) {
            inputEl.classList.remove('error');
            inputEl.removeAttribute('aria-invalid');
        }
    }

    function markSuccess(inputId) {
        var inputEl = document.getElementById('input-' + inputId);
        if (inputEl && inputEl.value.trim()) {
            inputEl.classList.add('success');
        }
    }

    function clearAllErrors() {
        ['email', 'password', 'fullname', 'confirm-password'].forEach(function (id) {
            clearError(id);
            var inputEl = document.getElementById('input-' + id);
            if (inputEl) inputEl.classList.remove('success');
        });
    }

    function attachValidation(inputId, validateFn) {
        var inputEl = document.getElementById('input-' + inputId);
        if (!inputEl) return;

        inputEl.addEventListener('blur', function () {
            var err = validateFn(inputEl.value);
            if (err) showError(inputId, err);
            else { clearError(inputId); markSuccess(inputId); }
        });

        inputEl.addEventListener('input', function () {
            if (inputEl.classList.contains('error')) {
                var err = validateFn(inputEl.value);
                if (!err) { clearError(inputId); markSuccess(inputId); }
            }
        });
    }

    attachValidation('email', validateEmail);
    attachValidation('password', validatePassword);
    attachValidation('fullname', validateFullName);
    attachValidation('confirm-password', validateConfirmPassword);

    if (els.password) {
        els.password.addEventListener('input', function () {
            if (els.confirmPassword && els.confirmPassword.value) {
                var err = validateConfirmPassword(els.confirmPassword.value);
                if (err) showError('confirm-password', err);
                else { clearError('confirm-password'); markSuccess('confirm-password'); }
            }
        });
    }

    if (els.toggleLink) {
        els.toggleLink.addEventListener('click', function (e) {
            e.preventDefault();
            clearAllErrors();
            
            // Clear inputs when toggling
            if (els.email) els.email.value = '';
            if (els.password) els.password.value = '';
            if (els.fullname) els.fullname.value = '';
            if (els.confirmPassword) els.confirmPassword.value = '';

            if (state.mode === 'login') {
                state.mode = 'register';
                els.card.classList.add('register-mode');
                els.heading.textContent = 'Join the Circle';
                els.btnText.textContent = 'Create Account';
                els.toggleText.textContent = 'Already a member?';
                els.toggleLink.textContent = 'Sign In';
                if (els.formExtras) els.formExtras.style.display = 'none';
            } else {
                state.mode = 'login';
                els.card.classList.remove('register-mode');
                els.heading.textContent = 'Enter Your Private Lounge';
                els.btnText.textContent = 'Sign In';
                els.toggleText.textContent = "Don't have an account?";
                els.toggleLink.textContent = 'Create Account';
                if (els.formExtras) els.formExtras.style.display = '';
            }
        });
    }

    if (els.form) {
        els.form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (state.isSubmitting) return;

            var errors = [];

            var emailErr = validateEmail(els.email.value);
            if (emailErr) { showError('email', emailErr); errors.push('email'); }
            else { clearError('email'); markSuccess('email'); }

            var passErr = validatePassword(els.password.value);
            if (passErr) { showError('password', passErr); errors.push('password'); }
            else { clearError('password'); markSuccess('password'); }

            if (state.mode === 'register') {
                var nameErr = validateFullName(els.fullname.value);
                if (nameErr) { showError('fullname', nameErr); errors.push('fullname'); }
                else { clearError('fullname'); markSuccess('fullname'); }

                var confirmErr = validateConfirmPassword(els.confirmPassword.value);
                if (confirmErr) { showError('confirm-password', confirmErr); errors.push('confirm-password'); }
                else { clearError('confirm-password'); markSuccess('confirm-password'); }
            }

            if (errors.length > 0) {
                var first = document.getElementById('input-' + errors[0]);
                if (first) first.focus();
                return;
            }

            state.isSubmitting = true;
            els.btnSubmit.classList.add('loading');
            els.btnSubmit.disabled = true;

            if (state.mode === 'register') {
                createUserWithEmailAndPassword(auth, els.email.value, els.password.value)
                    .then(async (userCredential) => {
                        // Update Auth Profile
                        await updateProfile(userCredential.user, {
                            displayName: els.fullname.value
                        });

                        window.location.href = '../home/home.html';
                    })
                    .catch((error) => {
                        showError('email', error.message);
                        state.isSubmitting = false;
                        els.btnSubmit.classList.remove('loading');
                        els.btnSubmit.disabled = false;
                    });
            } else {
                // Login
                signInWithEmailAndPassword(auth, els.email.value, els.password.value)
                    .then((userCredential) => {
                        window.location.href = '../home/home.html';
                    })
                    .catch((error) => {
                        showError('password', 'Invalid email or password');
                        state.isSubmitting = false;
                        els.btnSubmit.classList.remove('loading');
                        els.btnSubmit.disabled = false;
                    });
            }
        });
    }

    if (els.forgotLink) {
        els.forgotLink.addEventListener('click', function (e) {
            e.preventDefault();
            clearAllErrors();
            els.card.classList.add('forgot-mode');
            if (els.forgotSuccess) els.forgotSuccess.classList.remove('visible');
        });
    }

    if (els.backToLogin) {
        els.backToLogin.addEventListener('click', function (e) {
            e.preventDefault();
            els.card.classList.remove('forgot-mode');
            if (els.forgotSuccess) els.forgotSuccess.classList.remove('visible');
        });
    }

    if (els.btnReset) {
        els.btnReset.addEventListener('click', function () {
            var err = validateEmail(els.forgotEmail.value);
            if (err) {
                showError('forgot-email', err);
                return;
            }
            clearError('forgot-email');

            els.btnReset.classList.add('loading');
            els.btnReset.disabled = true;

            setTimeout(function () {
                els.btnReset.classList.remove('loading');
                els.btnReset.disabled = false;
                els.btnReset.style.display = 'none';
                document.getElementById('group-forgot-email').style.display = 'none';
                document.querySelector('.forgot-description').style.display = 'none';
                if (els.forgotSuccess) els.forgotSuccess.classList.add('visible');
            }, 1500);
        });
    }

    if (els.togglePassword) {
        els.togglePassword.addEventListener('click', function () {
            state.showPassword = !state.showPassword;
            els.password.type = state.showPassword ? 'text' : 'password';

            var eyeOpen = els.togglePassword.querySelector('.eye-open');
            var eyeClosed = els.togglePassword.querySelector('.eye-closed');
            if (eyeOpen && eyeClosed) {
                eyeOpen.style.display = state.showPassword ? 'none' : '';
                eyeClosed.style.display = state.showPassword ? '' : 'none';
            }
        });
    }

    function showToast(message) {
        var toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        els.toastContainer.appendChild(toast);

        setTimeout(function () {
            toast.classList.add('out');
            setTimeout(function () {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 2500);
    }

    async function handleSocialLogin(providerName) {
        let provider;
        if (providerName === 'google') {
            provider = new GoogleAuthProvider();
        } else if (providerName === 'facebook') {
            provider = new FacebookAuthProvider();
        }
        
        if (!provider) return;
        
        try {
            const result = await signInWithPopup(auth, provider);
            
            window.location.href = '../home/home.html';
        } catch (error) {
            console.error("Social login error:", error);
            showToast('Authentication failed: ' + error.message);
        }
    }

    var socialBtns = document.querySelectorAll('.social-btn');
    socialBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var provider = btn.dataset.provider;
            btn.classList.add('loading');
            
            handleSocialLogin(provider).finally(() => {
                btn.classList.remove('loading');
            });
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (els.card.classList.contains('forgot-mode')) {
                els.card.classList.remove('forgot-mode');
                if (els.forgotSuccess) els.forgotSuccess.classList.remove('visible');
            }
        }
    });

    TemporalEngine.init();
    VideoController.init();

});
