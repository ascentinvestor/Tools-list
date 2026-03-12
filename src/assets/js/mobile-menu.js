/* Mobile hamburger menu toggle — fixes the non-functional mobile nav */
document.addEventListener('DOMContentLoaded', function () {
    const btn = document.querySelector('.menu-btn button');
    const nav = document.querySelector('.nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', function () {
        const isOpen = nav.classList.contains('nav-open');
        if (isOpen) {
            nav.classList.remove('nav-open');
            nav.style.display = '';
            btn.setAttribute('aria-expanded', 'false');
        } else {
            nav.classList.add('nav-open');
            nav.style.display = 'flex';
            nav.style.flexDirection = 'column';
            nav.style.position = 'absolute';
            nav.style.top = '100%';
            nav.style.left = '0';
            nav.style.right = '0';
            nav.style.background = 'white';
            nav.style.padding = '1rem';
            nav.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            nav.style.zIndex = '40';
            btn.setAttribute('aria-expanded', 'true');
        }
    });

    /* Close menu when a nav link is clicked */
    nav.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
            nav.classList.remove('nav-open');
            nav.style.display = '';
            btn.setAttribute('aria-expanded', 'false');
        });
    });
});
