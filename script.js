/**
 * Bien Landing Page JavaScript
 * Handles form submissions, animations, and interactions
 */

// Supabase configuration
const SUPABASE_URL = 'https://tkhlmscolbaldgvwkyix.supabase.co';
const SUPABASE_KEY = 'sb_publishable_m9EMVaUqKidgqtHamKdQOw_eCOlVy9O';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', function() {
    // Form handling
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.stat-card, .step, .pillar, .fit-card, .agency-card'
    );

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Add staggered delay to grouped elements
    document.querySelectorAll('.steps .step').forEach((step, index) => {
        step.style.transitionDelay = `${index * 0.1}s`;
    });

    document.querySelectorAll('.problem-stats .stat-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.15}s`;
    });

    document.querySelectorAll('.science-pillars .pillar').forEach((pillar, index) => {
        pillar.style.transitionDelay = `${index * 0.1}s`;
    });
});

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();

    if (!isValidEmail(email)) {
        showFormError(emailInput, 'Please enter a valid email address');
        return;
    }

    // Disable form during submission
    emailInput.disabled = true;
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Joining...';

    try {
        const { error } = await supabase
            .from('waitlist')
            .insert({ email });

        if (error) {
            // Handle duplicate email
            if (error.code === '23505') {
                showFormError(emailInput, 'This email is already on the waitlist');
            } else {
                showFormError(emailInput, 'Something went wrong. Please try again.');
                console.error('Supabase error:', error);
            }
            emailInput.disabled = false;
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }

        showFormSuccess(form, emailInput, submitBtn);
        emailInput.value = '';
        emailInput.disabled = false;
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    } catch (err) {
        console.error('Submission error:', err);
        showFormError(emailInput, 'Something went wrong. Please try again.');
        emailInput.disabled = false;
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show form error message
 */
function showFormError(input, message) {
    // Remove existing error
    const existingError = input.parentElement.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }

    // Add error styling
    input.style.borderColor = 'var(--color-error-500)';

    // Create error message
    const error = document.createElement('p');
    error.className = 'form-error';
    error.textContent = message;
    error.style.cssText = `
        color: var(--color-error-500);
        font-size: var(--font-size-xs);
        margin-top: var(--space-sm);
        margin-bottom: 0;
    `;

    input.parentElement.appendChild(error);

    // Remove error on input
    input.addEventListener('input', function() {
        input.style.borderColor = '';
        const errorEl = input.parentElement.querySelector('.form-error');
        if (errorEl) {
            errorEl.remove();
        }
    }, { once: true });
}

/**
 * Show form success message
 */
function showFormSuccess(form, input, button) {
    // Create success message
    const formGroup = form.querySelector('.form-group');
    const successMsg = document.createElement('div');
    successMsg.className = 'form-success';
    successMsg.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>You're on the list! We'll be in touch soon.</span>
    `;
    successMsg.style.cssText = `
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-lg) var(--space-xl);
        background: var(--color-success-100);
        color: var(--color-success-500);
        border-radius: var(--radius-md);
        font-size: var(--font-size-sm);
        animation: fadeInUp 0.3s ease-out;
    `;

    // Hide form group and show success
    formGroup.style.display = 'none';
    form.insertBefore(successMsg, formGroup);

    // Hide the form note if present
    const formNote = form.querySelector('.form-note, .form-privacy');
    if (formNote) {
        formNote.style.display = 'none';
    }
}

// Add CSS for animate-in class
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);
