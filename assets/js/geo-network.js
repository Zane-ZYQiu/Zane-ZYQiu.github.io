(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  var canvas = document.createElement('canvas');
  canvas.id = 'geo-network';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);

  var ctx = canvas.getContext('2d');
  var width = 0;
  var height = 0;
  var nodes = [];
  var mouse = { x: -9999, y: -9999, active: false };
  var rafId = 0;
  var accent1 = '82, 173, 200';
  var accent2 = '124, 108, 240';

  function readAccentColors() {
    var styles = getComputedStyle(document.documentElement);
    accent1 = (styles.getPropertyValue('--accent-1-rgb') || accent1).trim();
    accent2 = (styles.getPropertyValue('--accent-2-rgb') || accent2).trim();
  }

  function nodeCount() {
    var area = width * height;
    var count = Math.floor(area / 18000);
    return Math.max(28, Math.min(count, 70));
  }

  function initNodes() {
    var count = nodeCount();
    nodes = [];
    for (var i = 0; i < count; i += 1) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24,
        r: Math.random() * 1.2 + 0.6
      });
    }
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initNodes();
  }

  function linkDistance() {
    return Math.min(140, Math.max(80, width * 0.08));
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);

    var maxDist = linkDistance();
    var mouseDist = maxDist * 1.2;
    var i;
    var j;
    var n;
    var dx;
    var dy;
    var dist;
    var force;

    for (i = 0; i < nodes.length; i += 1) {
      n = nodes[i];
      if (mouse.active) {
        dx = mouse.x - n.x;
        dy = mouse.y - n.y;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseDist && dist > 0.5) {
          force = (1 - dist / mouseDist) * 0.03;
          n.vx += (dx / dist) * force;
          n.vy += (dy / dist) * force;
        }
      }

      n.vx *= 0.986;
      n.vy *= 0.986;
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < -24) n.x = width + 24;
      else if (n.x > width + 24) n.x = -24;
      if (n.y < -24) n.y = height + 24;
      else if (n.y > height + 24) n.y = -24;
    }

    ctx.lineWidth = 0.75;
    for (i = 0; i < nodes.length; i += 1) {
      for (j = i + 1; j < nodes.length; j += 1) {
        dx = nodes[i].x - nodes[j].x;
        dy = nodes[i].y - nodes[j].y;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.strokeStyle = 'rgba(' + accent1 + ', ' + ((1 - dist / maxDist) * 0.14) + ')';
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    if (mouse.active) {
      for (i = 0; i < nodes.length; i += 1) {
        dx = mouse.x - nodes[i].x;
        dy = mouse.y - nodes[i].y;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseDist) {
          ctx.strokeStyle = 'rgba(' + accent2 + ', ' + ((1 - dist / mouseDist) * 0.22) + ')';
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(nodes[i].x, nodes[i].y);
          ctx.stroke();
        }
      }
    }

    for (i = 0; i < nodes.length; i += 1) {
      n = nodes[i];
      ctx.fillStyle = 'rgba(' + accent1 + ', 0.22)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (mouse.active) {
      ctx.fillStyle = 'rgba(' + accent2 + ', 0.18)';
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = window.requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', function (event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
  }, { passive: true });
  document.addEventListener('mouseleave', function () {
    mouse.active = false;
  });

  var themeObserver = new MutationObserver(readAccentColors);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  readAccentColors();
  resize();
  rafId = window.requestAnimationFrame(tick);

  window.addEventListener('beforeunload', function () {
    window.cancelAnimationFrame(rafId);
    themeObserver.disconnect();
  });
})();
