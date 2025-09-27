// quick references
const sceneHouse = document.getElementById('scene-house');
const sceneHeads = document.getElementById('scene-heads');
const door = document.getElementById('door');
const knight = document.getElementById('knight');
const axe = document.getElementById('axe');
const heads = document.querySelectorAll('.head');
const headsWrapper = document.querySelector('.heads-wrapper');

let animating = false;

/* ------------------ Knight hover swap ------------------ */
if (knight) {
  const normal = 'assets/knight-forward.png';
  const turned = 'assets/knight-turn.png';
  knight.addEventListener('mouseenter', () => { knight.src = turned; });
  knight.addEventListener('mouseleave', () => { knight.src = normal; });
}

/* ------------------ Heads hover swap ------------------ */
heads.forEach(h => {
  const closed = h.getAttribute('src');
  const open = h.dataset.open;
  h.addEventListener('mouseenter', () => { if (open) h.src = open; });
  h.addEventListener('mouseleave', () => { h.src = closed; });
});

/* ------------------ Axe goes back to house ------------------ */
if (axe) {
  axe.addEventListener('click', () => {
    // hide heads scene, show house scene
    sceneHeads.classList.remove('active');
    sceneHeads.setAttribute('aria-hidden', 'true');
    sceneHouse.classList.add('active');
    sceneHouse.setAttribute('aria-hidden', 'false');
    // remove enter animation
    headsWrapper.classList.remove('enter');
  });
}

/* ------------------ Click door: zoom animation then show heads ------------------ */
if (door) {
  door.addEventListener('click', () => {
    if (animating) return;
    zoomIntoElement(door, () => {
      // show heads scene after zoom
      sceneHouse.classList.remove('active');
      sceneHouse.setAttribute('aria-hidden', 'true');
      sceneHeads.classList.add('active');
      sceneHeads.setAttribute('aria-hidden', 'false');

      // small delay so layout paints, then animate heads in
      requestAnimationFrame(() => {
        void headsWrapper.offsetWidth;
        headsWrapper.classList.add('enter');
      });
    });
  });
}

/* ---------- Zoom helper that clones source element and scales it to cover viewport ---------- */
function zoomIntoElement(sourceEl, onComplete) {
  animating = true;
  const rect = sourceEl.getBoundingClientRect();

  // create overlay and clone
  const overlay = document.createElement('div');
  overlay.className = 'zoom-overlay';
  overlay.style.opacity = '0';

  const clone = sourceEl.cloneNode(true);
  clone.className = 'zoom-clone';

  // set clone absolute position to match source
  clone.style.left = rect.left + 'px';
  clone.style.top = rect.top + 'px';
  clone.style.width = rect.width + 'px';
  clone.style.height = rect.height + 'px';

  overlay.appendChild(clone);
  document.body.appendChild(overlay);

  // force reflow
  void clone.offsetWidth;

  // fade overlay in
  overlay.style.opacity = '1';

  // compute center translation and scale to cover viewport
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const translateX = (window.innerWidth / 2) - centerX;
  const translateY = (window.innerHeight / 2) - centerY;
  const scaleX = window.innerWidth / rect.width;
  const scaleY = window.innerHeight / rect.height;
  const scale = Math.max(scaleX, scaleY) * 1.05;

  // animate clone to center & scale
  requestAnimationFrame(() => {
    clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  });

  // when transform ends -> remove overlay & call callback
  const onEnd = (e) => {
    if (e.propertyName !== 'transform') return;
    clone.removeEventListener('transitionend', onEnd);

    // cleanup and callback after a short delay for the white flash
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      animating = false;
      if (typeof onComplete === 'function') onComplete();
    }, 90);
  };
  clone.addEventListener('transitionend', onEnd);

  // safety timeout if transitionend doesn't fire
  setTimeout(() => {
    if (animating) {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      animating = false;
      if (typeof onComplete === 'function') onComplete();
    }
  }, 1500);
}

/* ------------------ Debug: warn if images didn't load ------------------ */
window.addEventListener('load', () => {
  document.querySelectorAll('img').forEach(img => {
    if (img.naturalWidth === 0) {
      console.warn('Image failed to load (check filename/path):', img.src);
    }
  });
});

// Utility to show one scene and hide others
function showScene(sceneId) {
  document.querySelectorAll('.scene').forEach(scene => {
    scene.classList.remove('active');
    scene.setAttribute('aria-hidden', 'true');
  });
  const scene = document.getElementById(sceneId);
  if (scene) {
    scene.classList.add('active');
    scene.setAttribute('aria-hidden', 'false');
  }
}

// Add click listeners to each head
document.querySelector('.head[alt="Deer head"]').addEventListener('click', () => {
  showScene('scene-deer');
});
document.querySelector('.head[alt="Boar head"]').addEventListener('click', () => {
  showScene('scene-boar');
});
document.querySelector('.head[alt="Fox head"]').addEventListener('click', () => {
  showScene('scene-fox');
});

// Add click listeners to each axe to go back to heads scene
document.getElementById('axe-deer').addEventListener('click', () => {
  showScene('scene-heads');
});
document.getElementById('axe-boar').addEventListener('click', () => {
  showScene('scene-heads');
});
document.getElementById('axe-fox').addEventListener('click', () => {
  showScene('scene-heads');
});
