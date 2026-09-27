/* ═══════════════════════════════════════
   FILMSTRIP — Best Works interaction
═══════════════════════════════════════ */
function initFilmstrip() {
  const scene   = document.getElementById('filmstrip-scene');
  const track   = document.getElementById('filmstrip-track');
  if (!scene || !track) return;

  const frames      = [...track.querySelectorAll('.film-frame')];
  const dragHint    = document.getElementById('film-drag-hint');
  const bgTitle     = document.getElementById('film-bg-title');
  const activeInfo  = document.getElementById('film-active-info');
  const infoNum     = document.getElementById('film-info-num');
  const infoTitle   = document.getElementById('film-info-title');
  const infoCat     = document.getElementById('film-info-category');
  const viewCta     = document.getElementById('film-view-cta');
  const viewBtn     = document.getElementById('film-view-btn');
  const activeIdxEl = document.getElementById('film-active-idx');
  const progressFill= document.getElementById('film-progress-fill');

  let isDragging = false, startMouseX = 0, startX = 0;
  let currentX = 0, targetX = 0;
  let prevActiveIdx = -1, hasMoved = false;

  const getFrameW = () => {
    const f = frames[0];
    const s = getComputedStyle(f);
    return f.offsetWidth + parseFloat(s.marginLeft) + parseFloat(s.marginRight);
  };

  const getBounds = () => ({
    min: -(frames.length - 1) * getFrameW(),
    max: 0
  });

  const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));

  const getActiveIdx = () => {
    const fw = getFrameW();
    return Math.round(clamp(-currentX / fw, 0, frames.length - 1));
  };

  // Centre first frame
  function positionTrack() {
    const sceneW  = scene.offsetWidth;
    const frameW  = frames[0].offsetWidth;
    const marginL = parseFloat(getComputedStyle(frames[0]).marginLeft);
    const offset  = (sceneW / 2) - (frameW / 2) - marginL;
    track.style.paddingLeft  = offset + 'px';
    track.style.paddingRight = offset + 'px';
  }
  positionTrack();
  window.addEventListener('resize', positionTrack);

  function showUI() {
    if (hasMoved) return;
    hasMoved = true;
    if (dragHint) {
      dragHint.style.opacity = '0';
      setTimeout(() => dragHint.classList.add('hidden'), 500);
    }
    if (activeInfo) activeInfo.classList.add('visible');
    if (viewCta)    viewCta.classList.add('visible');
  }

  function updateActive() {
    const idx = getActiveIdx();
    if (idx === prevActiveIdx) return;
    prevActiveIdx = idx;

    frames.forEach((f, i) => f.classList.toggle('active', i === idx));

    const frame    = frames[idx];
    const num      = String(frame.dataset.idx).padStart(2, '0');
    const title    = frame.dataset.title    || '';
    const category = frame.dataset.category || '';
    const href     = frame.dataset.href     || '#';
    const ghost    = frame.dataset.ghost    || 'WORKS';

    if (infoNum)   infoNum.textContent    = '— ' + num;
    if (infoTitle) infoTitle.textContent  = title;
    if (infoCat)   infoCat.textContent    = category;
    if (viewBtn)   viewBtn.href           = href;
    if (activeIdxEl) activeIdxEl.textContent = num;
    if (bgTitle) {
      bgTitle.style.opacity   = '0';
      setTimeout(() => {
        bgTitle.textContent     = ghost;
        bgTitle.style.opacity   = '1';
        bgTitle.style.transform = `translateX(${-idx * 40}px)`;
      }, 200);
    }
    if (progressFill) {
      progressFill.style.width = ((idx / (frames.length - 1)) * 100) + '%';
    }
  }

  // Snap after drag
  function snap() {
    const fw  = getFrameW();
    const idx = Math.round(clamp(-targetX / fw, 0, frames.length - 1));
    targetX   = -idx * fw;
  }

  // Drag start
  const onDown = (x) => {
    isDragging  = true;
    startMouseX = x;
    startX      = currentX;
    showUI();
  };
  const onMove = (x) => {
    if (!isDragging) return;
    const { min, max } = getBounds();
    let next = startX + (x - startMouseX);
    if      (next > max) next = max + (next - max) * 0.1;
    else if (next < min) next = min + (next - min) * 0.1;
    targetX = next;
  };
  const onUp = () => {
    if (!isDragging) return;
    isDragging = false;
    snap();
  };

  track.addEventListener('mousedown',  e => onDown(e.clientX));
  window.addEventListener('mousemove', e => onMove(e.clientX));
  window.addEventListener('mouseup',   onUp);
  track.addEventListener('touchstart', e => onDown(e.touches[0].clientX), { passive: true });
  window.addEventListener('touchmove', e => { if (isDragging) onMove(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend',  onUp);

  // Use GSAP ScrollTrigger for natural scrolling if available
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: '#featured',
      start: 'top top',
      end: () => '+=' + (frames.length * window.innerWidth * 0.4),
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        if (!isDragging) {
          const { min } = getBounds();
          targetX = min * self.progress;
          showUI();
        }
      }
    });
  } else {
    // Fallback: Wheel scroll trap
    scene.addEventListener('wheel', e => {
      e.preventDefault();
      const { min, max } = getBounds();
      targetX = clamp(targetX - e.deltaY * 1.4, min, max);
      clearTimeout(scene._wheelSnap);
      scene._wheelSnap = setTimeout(snap, 80);
      showUI();
    }, { passive: false });
  }

  // RAF loop
  (function raf() {
    currentX += (targetX - currentX) * 0.085;
    track.style.transform = `translateX(${currentX}px)`;
    updateActive();
    requestAnimationFrame(raf);
  })();

  // Init: activate first frame
  frames[0] && frames[0].classList.add('active');
  if (bgTitle) bgTitle.style.transition = 'opacity .3s, transform .8s cubic-bezier(.16,1,.3,1)';
}

function initConsoleEasterEgg() {
  const style1 = 'color: #ffffff; font-size: 24px; font-weight: bold; background: #0B0B0B; padding: 10px; border-radius: 5px;';
  const style2 = 'color: #aaaaaa; font-size: 12px; margin-top: 10px;';
  
  console.log('%cGAURAV.', style1);
  console.log('%cDesigned & Built by Gaurav\\nSay hello: gauravp1566@gmail.com', style2);
}

document.addEventListener('DOMContentLoaded', () => {
  initConsoleEasterEgg();
  initClock();
  prepareSplitText();
  
  const preloader = document.getElementById('preloader');
  if (preloader) {
    initPreloader();
  } else {
    initGSAPAnimations();
  }

  initFullscreenMenu();
  initPlayground();
  initSmoothScroll();
  initCustomCursor();
  initThemeToggle();
  initMagneticButtons();
  init3DTilt();
  initParallaxImages();
  initSpotlight();
  initScrambleText();
  initScrollSkew();
  initSoundEffects();
  initCustomScrollbar();
  init3DCarousel();
  initHeroCanvas();
  initFilmstrip();
});


function initClock() {
  const clockEls = document.querySelectorAll('.clock-time');
  const clockShortEls = document.querySelectorAll('.clock-time-short');
  
  if (!clockEls.length && !clockShortEls.length) return;

  function updateClock() {
    const now = new Date();
    const optionsFull = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true };
    const optionsShort = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false };
    const timeStrFull = now.toLocaleTimeString('en-US', optionsFull);
    const timeStrShort = now.toLocaleTimeString('en-US', optionsShort);

    clockEls.forEach(el => el.textContent = timeStrFull);
    clockShortEls.forEach(el => el.textContent = timeStrShort);
  }

  updateClock();
  setInterval(updateClock, 1000);
}

function prepareSplitText() {
  const splitElements = document.querySelectorAll('.split-text');
  
  splitElements.forEach(el => {
    // If it's already split, don't do it again
    if (el.querySelector('.word')) return;

    const text = el.innerText;
    el.innerHTML = ''; 
    const lines = text.split('\n');
    
    lines.forEach((line, lineIndex) => {
      const words = line.split(' ');
      
      words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        
        const chars = word.split('');
        chars.forEach(char => {
          const charSpan = document.createElement('span');
          charSpan.className = 'char';
          charSpan.innerHTML = char === ' ' ? '&nbsp;' : char;
          wordSpan.appendChild(charSpan);
        });
        
        el.appendChild(wordSpan);
        
        if (wordIndex < words.length - 1) {
          const spaceSpan = document.createElement('span');
          spaceSpan.className = 'char';
          spaceSpan.innerHTML = '&nbsp;';
          el.appendChild(spaceSpan);
        }
      });
      
      if (lineIndex < lines.length - 1) {
        el.appendChild(document.createElement('br'));
      }
    });
  });
}

function initGSAPAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    initFallbackReveal();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // 1. Text Reveal Animations (Cool Character Stagger)
  const splitTexts = document.querySelectorAll('.split-text');
  splitTexts.forEach(el => {
    const chars = el.querySelectorAll('.char');
    gsap.to(chars, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      stagger: 0.02,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%", // Trigger slightly earlier so it feels smoother
        toggleActions: "play none none none"
      }
    });
  });

  // 2. Standard Reveals
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach(el => {
    let delayVal = 0;
    if (el.classList.contains('reveal-delay-1')) delayVal = 0.1;
    if (el.classList.contains('reveal-delay-2')) delayVal = 0.2;
    if (el.classList.contains('reveal-delay-3')) delayVal = 0.3;

    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      delay: delayVal,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        toggleActions: "play none none none"
      }
    });
  });

  // Cool Hero Image Subtle Zoom Effect
  const heroImg = document.querySelector('.hero__image');
  if (heroImg) {
    gsap.fromTo(heroImg, {
      scale: 1.05
    }, {
      scale: 1,
      duration: 2,
      ease: "power2.out"
    });
  }
}

function initFallbackReveal() {
  const elements = document.querySelectorAll('.reveal, .split-text .char');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  elements.forEach(el => observer.observe(el));
}

function initFullscreenMenu() {
  const menuBtn = document.getElementById('menu-toggle');
  const closeBtn = document.getElementById('menu-close');
  const overlay = document.getElementById('fullscreen-menu');
  const menuBg = document.getElementById('menu-bg');
  const links = document.querySelectorAll('.fullscreen-menu__link');

  if (!menuBtn || !overlay) return;

  menuBtn.addEventListener('click', () => {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  const closeMenu = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  links.forEach(link => {
    // Navigate and close
    link.addEventListener('click', closeMenu);
    
    // Hover reveal images
    link.addEventListener('mouseenter', () => {
      const imgPath = link.getAttribute('data-image');
      if (imgPath && menuBg) {
        menuBg.style.backgroundImage = `url(${imgPath})`;
        menuBg.style.opacity = '1';
      }
    });
    link.addEventListener('mouseleave', () => {
      if (menuBg) {
        menuBg.style.opacity = '0';
      }
    });
  });
}

function initPlayground() {
  const canvas = document.querySelector('.playground-canvas');
  if (!canvas) return; // Only run on playground page

  const items = document.querySelectorAll('.draggable-item');
  let zIndex = 10;

  items.forEach(item => {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    // Set initial random position and rotation
    const randomX = Math.random() * (window.innerWidth - 300);
    const randomY = Math.random() * (window.innerHeight - 400);
    const randomRotate = (Math.random() - 0.5) * 30; // -15 to +15 deg
    
    item.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
    item.setAttribute('data-x', randomX);
    item.setAttribute('data-y', randomY);
    item.setAttribute('data-rot', randomRotate);

    item.addEventListener('mousedown', (e) => {
      isDragging = true;
      item.style.zIndex = ++zIndex;
      
      // Remove transition for instant drag follow
      item.style.transition = 'none';

      startX = e.clientX;
      startY = e.clientY;
      initialX = parseFloat(item.getAttribute('data-x'));
      initialY = parseFloat(item.getAttribute('data-y'));
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const currentX = e.clientX - startX;
      const currentY = e.clientY - startY;

      const newX = initialX + currentX;
      const newY = initialY + currentY;
      const rot = item.getAttribute('data-rot');

      item.style.transform = `translate(${newX}px, ${newY}px) rotate(${rot}deg)`;
      item.setAttribute('data-x', newX);
      item.setAttribute('data-y', newY);
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        // Restore transition for smooth hover effects
        item.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.2s ease';
      }
    });
  });
}

function initSmoothScroll() {
  // Load Lenis script dynamically so it applies to all pages
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/lenis@1.1.13/dist/lenis.min.js';
  script.onload = () => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    // Request Animation Frame loop for Lenis
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync with GSAP ScrollTrigger if it exists
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    // Anchor Links Smooth Scroll via Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          lenis.scrollTo(target, { offset: 0 });
        }
      });
    });
  };
  document.head.appendChild(script);
}

function initCustomCursor() {
  // Only initialize on devices with a mouse
  if (window.matchMedia("(pointer: coarse)").matches) return;

  document.body.classList.add('has-custom-cursor');

  const dot = document.createElement('div');
  dot.classList.add('custom-cursor-dot');
  
  const ring = document.createElement('div');
  ring.classList.add('custom-cursor-ring');

  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediate update for dot
    dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
  });

  // Smooth follow for ring using requestAnimationFrame
  const speed = 0.15;
  function animateRing() {
    ringX += (mouseX - ringX) * speed;
    ringY += (mouseY - ringY) * speed;
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover states
  const interactables = document.querySelectorAll('a, button, .clickable');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('active');
      dot.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('active');
      dot.classList.remove('active');
    });
  });
}

function initMagneticButtons() {
  // Select elements to apply the magnetic effect
  const magnets = document.querySelectorAll('.contact__button, .top-bar__menu, .hero__social-group a, .about__social, .contact__social-link');
  
  magnets.forEach(magnet => {
    magnet.addEventListener('mousemove', (e) => {
      const rect = magnet.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      if (typeof gsap !== 'undefined') {
        gsap.to(magnet, {
          x: x * 0.35, // Adjusts how far it follows the mouse
          y: y * 0.35,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    });

    magnet.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        // Snaps back into place with a subtle spring effect
        gsap.to(magnet, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.3)"
        });
      }
    });
  });
}

function initPreloader() {
  const preloader = document.getElementById('preloader');
  const counter = document.getElementById('preloader-counter');
  
  if (!preloader || !counter) return;

  // Prevent scrolling during load
  document.body.style.overflow = 'hidden';

  let progress = 0;
  
  function updateCounter() {
    // Random increment for a more organic feel
    progress += Math.floor(Math.random() * 10) + 2;
    if (progress > 100) progress = 100;
    
    counter.textContent = progress + '%';

    if (progress < 100) {
      setTimeout(updateCounter, Math.random() * 40 + 10);
    } else {
      // Done loading
      if (typeof gsap !== 'undefined') {
        gsap.to(counter, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        });
        
        gsap.to(preloader, {
          yPercent: -100,
          duration: 1.2,
          ease: "expo.inOut",
          delay: 0.3,
          onComplete: () => {
            preloader.style.display = 'none';
            document.body.style.overflow = '';
            
            // Start the reveal animations only after the preloader finishes sliding up
            initGSAPAnimations();
            
            if (typeof ScrollTrigger !== 'undefined') {
              ScrollTrigger.refresh();
            }
          }
        });
      } else {
        preloader.style.display = 'none';
        document.body.style.overflow = '';
        initGSAPAnimations();
      }
    }
  }

  // Start the loading sequence
  updateCounter();
}

function init3DTilt() {
  // Select all project and experience cards
  const cards = document.querySelectorAll('.featured__card, .portfolio__card, .experience-card, .service-item__project, .project-more__card');
  
  // Disable on touch devices
  if (window.matchMedia("(pointer: coarse)").matches) return;
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; 
      const y = e.clientY - rect.top; 
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation (max 12 degrees)
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;
      
      if (typeof gsap !== 'undefined') {
        gsap.to(card, {
          rotationX: rotateX,
          rotationY: rotateY,
          transformPerspective: 1000,
          scale: 1.03, // Slight zoom for emphasis
          zIndex: 10,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    });

    card.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          zIndex: 1,
          duration: 1.2,
          ease: "elastic.out(1, 0.4)"
        });
      }
    });
  });
}

function initParallaxImages() {
  const cards = document.querySelectorAll('.featured__card, .portfolio__card, .experience-card, .service-item__project, .project-more__card');
  
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  cards.forEach(card => {
    // Ensure the container can clip the oversized image
    card.style.overflow = 'hidden';
    card.style.transform = 'translateZ(0)'; // Forces border-radius clipping in Safari
    
    // Some anchor tags default to inline, which breaks overflow
    if (window.getComputedStyle(card).display === 'inline') {
      card.style.display = 'block';
    }
    
    const img = card.querySelector('img');
    
    if (img) {
      // Scale up slightly instead of forcing height to preserve the natural aspect ratio
      // This prevents the images from looking excessively cropped or "big"
      img.style.width = '100%';
      img.style.objectFit = 'cover';
      img.style.margin = '0';
      
      gsap.fromTo(img, {
        yPercent: -4,
        scale: 1.08 // Only 8% zoom to preserve aesthetics
      }, {
        yPercent: 4,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    } else if (card.style.backgroundImage) {
      // Parallax for cards using background-image instead of <img>
      card.style.backgroundSize = 'cover';
      
      gsap.fromTo(card, {
        backgroundPosition: '50% 0%'
      }, {
        backgroundPosition: '50% 100%',
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }
  });
}

function initSpotlight() {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const spotlight = document.createElement('div');
  spotlight.classList.add('mouse-spotlight');
  document.body.appendChild(spotlight);

  let spotX = window.innerWidth / 2;
  let spotY = window.innerHeight / 2;
  let mouseX = spotX;
  let mouseY = spotY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth follow using requestAnimationFrame
  const speed = 0.12;
  function animateSpotlight() {
    spotX += (mouseX - spotX) * speed;
    spotY += (mouseY - spotY) * speed;
    spotlight.style.transform = `translate(calc(${spotX}px - 50%), calc(${spotY}px - 50%))`;
    requestAnimationFrame(animateSpotlight);
  }
  animateSpotlight();
}

function initThemeToggle() {
  const toggleBtn = document.createElement('button');
  toggleBtn.classList.add('theme-toggle', 'magnetic'); 
  
  const sunSvg = `<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  const moonSvg = `<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

  // Set initial state
  const isCurrentlyDark = document.documentElement.getAttribute('data-theme') !== 'light';
  toggleBtn.innerHTML = isCurrentlyDark ? sunSvg : moonSvg;
  document.body.appendChild(toggleBtn);

  toggleBtn.addEventListener('click', (e) => {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const nextTheme = isDark ? 'light' : 'dark';

    // Update button icon immediately
    toggleBtn.innerHTML = isDark ? moonSvg : sunSvg;

    const x = e.clientX;
    const y = e.clientY;
    document.documentElement.style.setProperty('--click-x', `${x}px`);
    document.documentElement.style.setProperty('--click-y', `${y}px`);

    if (!document.startViewTransition) {
      document.documentElement.setAttribute('data-theme', nextTheme);
      return;
    }

    document.documentElement.classList.remove('dark-to-light', 'light-to-dark');
    document.documentElement.classList.add(isDark ? 'dark-to-light' : 'light-to-dark');

    document.startViewTransition(() => {
      document.documentElement.setAttribute('data-theme', nextTheme);
      if (window.playWoosh) window.playWoosh();
    });
  });
}

function initScrambleText() {
  const chars = '!<>-_\\/[]{}—=+*^?#_';
  const elements = document.querySelectorAll('.nav__link, .btn__text, .footer-bottom a');

  if (window.matchMedia("(pointer: coarse)").matches) return;

  elements.forEach(el => {
    if (el.children.length > 0 && !el.textContent.trim()) return;
    
    const originalText = el.textContent.trim();
    if (!originalText) return;
    
    el.addEventListener('mouseenter', () => {
      let iteration = 0;
      clearInterval(el.dataset.scrambleInterval);
      
      el.dataset.scrambleInterval = setInterval(() => {
        el.textContent = originalText
          .split('')
          .map((letter, index) => {
            if(index < iteration) return originalText[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');
        
        if(iteration >= originalText.length) { 
          clearInterval(el.dataset.scrambleInterval);
          el.textContent = originalText;
        }
        
        iteration += 1 / 3;
      }, 30);
    });
  });
}

function initScrollSkew() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia("(pointer: coarse)").matches) return;
  
  let proxy = { skew: 0 };
  let skewSetter = gsap.quickSetter(".featured__card, .portfolio__card, .experience-card, .project-more__card", "skewY", "deg");
  let clamp = gsap.utils.clamp(-8, 8); 
  
  ScrollTrigger.create({
    onUpdate: (self) => {
      let skew = clamp(self.getVelocity() / -200); 
      if (Math.abs(skew) > Math.abs(proxy.skew)) {
        proxy.skew = skew;
        gsap.to(proxy, {
          skew: 0, 
          duration: 0.8, 
          ease: "power3", 
          overwrite: true, 
          onUpdate: () => skewSetter(proxy.skew)
        });
      }
    }
  });
  
  gsap.set(".featured__card, .portfolio__card, .experience-card, .project-more__card", {
    transformOrigin: "center center", 
    force3D: true
  });
}

function initSoundEffects() {
  let audioCtx = null;
  let isUnlocked = false;
  
  // Unlock audio context on first click anywhere
  document.addEventListener('click', () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    isUnlocked = true;
  }, { once: true });
  
  function playTick() {
    if (!isUnlocked || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05); 
    
    gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime); // Very quiet tick
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03); 
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }
  
  function playWoosh() {
    if (!isUnlocked || !audioCtx) return;
    
    const bufferSize = audioCtx.sampleRate * 0.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(500, audioCtx.currentTime);
    bandpass.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.3);
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
    
    noise.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noise.start();
  }

  const hoverElements = document.querySelectorAll('a, button, .magnetic');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      playTick();
    });
  });
  
  window.playWoosh = playWoosh;
}

function initCustomScrollbar() {
  // Native scrollbars are better for touch devices
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const track = document.createElement('div');
  track.classList.add('custom-scrollbar-track');
  
  const thumb = document.createElement('div');
  thumb.classList.add('custom-scrollbar-thumb');
  
  track.appendChild(thumb);
  document.body.appendChild(track);

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // Animate the line height from 0 to 100% based on scroll progress
    gsap.to(thumb, {
      height: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: true
      }
    });

    // Make it glow/brighten while the user is actively scrolling
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      track.classList.add('is-scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        track.classList.remove('is-scrolling');
      }, 500); // Fades out half a second after scroll stops
    }, { passive: true });
  }
}

function init3DCarousel() {
  const ring     = document.getElementById('carouselRing');
  const dotsWrap = document.getElementById('carouselDots');
  const btnPrev  = document.getElementById('carouselPrev');
  const btnNext  = document.getElementById('carouselNext');
  if (!ring) return;

  const cards   = Array.from(ring.querySelectorAll('.carousel-3d__card'));
  const total   = cards.length;
  let current   = 0;
  let autoTimer = null;

  // Radius of the orbit in px (Z-depth)
  const radius = 460;

  // Build dot indicators
  const dots = cards.map((_, i) => {
    const d = document.createElement('button');
    d.className = 'carousel-3d__dot';
    d.setAttribute('aria-label', `Go to project ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
    return d;
  });

  function updateCarousel() {
    cards.forEach((card, i) => {
      // Angle offset from current
      const offset = i - current;
      // Wrap-around: keep offset in range -total/2 .. total/2
      const angle  = ((offset + total) % total) * (360 / total);
      const deg    = angle > 180 ? angle - 360 : angle; // keep shortest path

      // Position on the circle
      const theta = (deg * Math.PI) / 180;
      const z     = Math.cos(theta) * radius;
      const x     = Math.sin(theta) * radius;
      const scale = 0.55 + 0.45 * ((z + radius) / (2 * radius));
      const opacity = 0.3 + 0.7 * ((z + radius) / (2 * radius));
      const blur  = Math.max(0, 3 - 3 * ((z + radius) / (2 * radius)));

      card.style.transform  = `translateX(${x}px) translateZ(${z}px) scale(${scale})`;
      card.style.opacity    = opacity;
      card.style.filter     = blur > 0 ? `blur(${blur.toFixed(1)}px)` : 'none';
      card.style.zIndex     = Math.round(scale * 10);
      card.style.pointerEvents = i === current ? 'auto' : 'none';

      // Active class
      card.classList.toggle('is-active', i === current);
      const link = card.querySelector('a');
      if (link) link.setAttribute('tabindex', i === current ? '0' : '-1');
    });

    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  function goTo(idx) {
    current = ((idx % total) + total) % total;
    updateCarousel();
    resetAuto();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    autoTimer = setInterval(next, 3200);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  if (btnNext) btnNext.addEventListener('click', next);
  if (btnPrev) btnPrev.addEventListener('click', prev);

  // Touch / drag swipe
  let touchStartX = null;
  ring.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  ring.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX = null;
  }, { passive: true });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });

  updateCarousel();
  startAuto();
}

function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  
  // Mouse tracking
  let mouse = { x: -1000, y: -1000 };
  
  window.addEventListener('mousemove', (e) => {
    if (window.scrollY < window.innerHeight) {
      mouse.x = e.clientX;
      mouse.y = e.clientY + window.scrollY;
    }
  });

  window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = document.getElementById('hero').offsetHeight;
    initParticles();
  }

  function initParticles() {
    particles = [];
    const particleCount = window.innerWidth > 768 ? 100 : 40;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.5 + 0.5,
        opacityMultiplier: Math.random() * 0.5 + 0.1
      });
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    
    // Dynamic theme color
    const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
    const rgb = isLightMode ? '0, 0, 0' : '255, 255, 255';
    
    // Draw particles
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      
      let dx = mouse.x - p.x;
      let dy = mouse.y - p.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 150) {
        p.x -= (dx / dist) * 1;
        p.y -= (dy / dist) * 1;
      }
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb}, ${p.opacityMultiplier})`;
      ctx.fill();
      
      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j];
        let dx2 = p.x - p2.x;
        let dy2 = p.y - p2.y;
        let dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        
        if (dist2 < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${rgb}, ${0.15 - (dist2 / 120) * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
      
      if (dist < 180) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${rgb}, ${0.3 - (dist / 180) * 0.3})`;
        ctx.lineWidth = 1;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
    
    requestAnimationFrame(render);
  }

  window.addEventListener('resize', resize);
  resize();
  render();
}

/* --- SCRAMBLE TEXT ON SCROLL --- */
(function() {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@.:/_!?#%&*';
  
  function scramble(el) {
    const target = el.dataset.text;
    const len = target.length;
    let frame = 0;
    const totalFrames = 28;
    
    if (el._scrambleTimer) clearInterval(el._scrambleTimer);
    
    el._scrambleTimer = setInterval(() => {
      let out = '';
      const progress = frame / totalFrames;
      
      for (let i = 0; i < len; i++) {
        if (target[i] === ' ') {
          out += ' ';
        } else if (i < Math.floor(progress * len)) {
          out += target[i]; // resolved
        } else {
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      
      el.textContent = out;
      frame++;
      
      if (frame > totalFrames) {
        clearInterval(el._scrambleTimer);
        el.textContent = target;
      }
    }, 40);
  }

  function initScramble() {
    const section = document.querySelector('.glitch-contact');
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger each scramble-text element
          const els = section.querySelectorAll('.scramble-text');
          els.forEach((el, i) => {
            setTimeout(() => scramble(el), i * 120);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.15 });

    observer.observe(section);

    // Re-scramble email on hover
    const emailEl = section.querySelector('.glitch-contact__email .scramble-text');
    if (emailEl) {
      section.querySelector('.glitch-contact__email').addEventListener('mouseenter', () => {
        scramble(emailEl);
      });
    }

    // Re-scramble socials on hover
    section.querySelectorAll('.glitch-contact__socials a.scramble-text').forEach(a => {
      a.addEventListener('mouseenter', () => scramble(a));
    });
  }

  document.addEventListener('DOMContentLoaded', initScramble);
})();
