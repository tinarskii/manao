// Implement a network particle effect with connected dots
if (window.innerWidth > 768) {
  const canvas = document.createElement("canvas");
  canvas.classList.add("fixed", "top-0", "left-0", "-z-10", "w-full", "h-full");
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Get primary color from CSS variables for the lines
  const getComputedStyle = window.getComputedStyle(document.documentElement);
  const primaryColor = getComputedStyle.getPropertyValue("--p") || "#570df8";

  const particles = [];
  const particleCount = 50; // Number of particles
  const connectionDistance = 150; // Maximum distance for connecting particles
  const mouseInfluenceRadius = 150; // Radius of mouse influence

  // Mouse position
  let mouseX = null;
  let mouseY = null;

  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      color: "rgba(255, 255, 255, 0.3)",
      speedX: Math.random() * 0.5 - 0.25,
      speedY: Math.random() * 0.5 - 0.25,
      // Add slight randomness to particle properties
      pulseSpeed: 0.05 + Math.random() * 0.05,
      pulseDirection: 1,
      opacity: 0.3 + Math.random() * 0.3,
    });
  }

  // Function to calculate distance between two points
  function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  // Function to draw a connection line between particles
  function drawConnection(p1, p2, distance) {
    // Calculate opacity based on distance (closer = more opaque)
    const maxDistance = connectionDistance;
    const opacity = 1 - distance / maxDistance;

    // Draw the line
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = `rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, ${opacity * 0.5})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Animate particles
  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Process each particle
    particles.forEach((particle) => {
      // Update particle pulse effect
      particle.opacity += particle.pulseDirection * particle.pulseSpeed * 0.01;
      if (particle.opacity > 0.8) {
        particle.pulseDirection = -1;
      } else if (particle.opacity < 0.3) {
        particle.pulseDirection = 1;
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
      ctx.fill();

      // Move particle
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Handle mouse influence if mouse is on canvas
      if (mouseX !== null && mouseY !== null) {
        const dist = distance(particle.x, particle.y, mouseX, mouseY);
        if (dist < mouseInfluenceRadius) {
          // Calculate push force (stronger when closer)
          const force = (1 - dist / mouseInfluenceRadius) * 0.5;
          const angle = Math.atan2(particle.y - mouseY, particle.x - mouseX);
          particle.x += Math.cos(angle) * force;
          particle.y += Math.sin(angle) * force;
        }
      }

      // Wrap around edges with smoother transitions
      if (particle.x < -10) particle.x = canvas.width + 10;
      if (particle.x > canvas.width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = canvas.height + 10;
      if (particle.y > canvas.height + 10) particle.y = -10;

      // Check for connections with other particles
      particles.forEach((otherParticle) => {
        if (particle === otherParticle) return;

        const dist = distance(
          particle.x,
          particle.y,
          otherParticle.x,
          otherParticle.y,
        );
        if (dist < connectionDistance) {
          drawConnection(particle, otherParticle, dist);
        }
      });
    });
  }

  animate();

  // Track mouse position
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Handle mouse leaving canvas
  document.addEventListener("mouseout", () => {
    mouseX = null;
    mouseY = null;
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}
