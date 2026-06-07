function navigateToInnerLink(event) {
    const container = event.currentTarget || event.target;
    if (!container) return;

    const link = container.querySelector('a');
    if (!link || !link.href) return;

    console.log(`Navigating to: ${link.href}`);

    event.preventDefault();
    window.location.href = link.href;
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    Array.from(navItems).forEach(item => {
        item.addEventListener('click', navigateToInnerLink);
    });
}

setupNavigation();