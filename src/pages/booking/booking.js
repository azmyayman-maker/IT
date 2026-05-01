document.addEventListener('DOMContentLoaded', function() {

    // --- Payment Method Toggle ---
    window.checkPayment = function() {
        const method = document.getElementById('paymentMethod').value;
        const visaSection = document.getElementById('visa-info');
        visaSection.style.display = (method === 'visa') ? 'block' : 'none';
    };

    // --- Date Restrictions ---
    const dateInput = document.getElementById('resDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
        dateInput.setAttribute('max', '2026-12-31');
    }

    // --- Form Submission ---
    const form = document.getElementById('reservationForm');
    if (form) {
        form.onsubmit = function(e) {
            e.preventDefault();

            const h = document.getElementById('hour').value;
            const m = document.getElementById('minutes').value;
            const p = document.getElementById('ampm').value;

            alert(`Your table has been reserved successfully for ${h}:${m} ${p}!`);
        };
    }
});
