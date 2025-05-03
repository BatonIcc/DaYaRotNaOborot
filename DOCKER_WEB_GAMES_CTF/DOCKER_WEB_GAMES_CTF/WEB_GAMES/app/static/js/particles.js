function loadScript(url) {
    const script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script)
}

loadScript('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js');

document.addEventListener('DOMContentLoaded', function() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }

    function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = Math.random() * 6 + 2;
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        const delay = Math.random() * 5;
        const duration = Math.random() * 15 + 10;
        const opacity = Math.random() * 0.4 + 0.1;
        const tx = Math.random() * 100 - 50;
        const ty = Math.random() * 100 - 50;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.opacity = opacity;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;

        particlesContainer.appendChild(particle);
    }

    window.addEventListener('resize', function() {
        const particles = document.querySelectorAll('.particle');
        particles.forEach(particle => {
            particle.style.left = `${Math.random() * window.innerWidth}px`;
            particle.style.top = `${Math.random() * window.innerHeight}px`;
        });
    });
});