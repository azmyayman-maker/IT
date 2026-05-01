document.addEventListener('DOMContentLoaded', function() {

    // --- 1. Mobile Menu Toggle ---
    const menuBtn = document.querySelector('#mobile-menu');
    const navList = document.querySelector('nav ul');

    if (menuBtn && navList) {
        menuBtn.addEventListener('click', function() {
            navList.classList.toggle('active');
            menuBtn.classList.toggle('is-active');
        });
    }

    // --- 2. Dynamic Menu Content ---
    const menuContent = document.getElementById('menu-content');
    const hour = new Date().getHours();
    const isMorning = (hour >= 9 && hour < 15);

    if (menuContent) {
        if (isMorning) {
            menuContent.innerHTML = `
                <h2>قائمة الإفطار</h2>
                <ul>
                    <li>بيض مع خبز - 10 جنيه</li>
                    <li>فول مدمس - 8 جنيه</li>
                    <li>قهوة - 5 جنيه</li>
                </ul>
            `;
        } else {
            menuContent.innerHTML = `
                <h2>قائمة الغداء والعشاء</h2>
                <h3>الغداء</h3>
                <ul>
                    <li>كشري - 15 جنيه</li>
                    <li>ملوخية - 20 جنيه</li>
                </ul>
                <h3>العشاء</h3>
                <ul>
                    <li>مشاوي - 30 جنيه</li>
                    <li>سمك - 25 جنيه</li>
                </ul>
            `;
        }
    }
});
