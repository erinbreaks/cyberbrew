/**
 * ==========================================================================
 * CYBERBREW — MAIN APPLICATION ORCHESTRATOR
 * Coordinates Audio, Canvas, Presets, Focus Timer, Receipt & Persistence
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Visual Canvases
  const weatherCanvas = new WeatherCanvas('rain-canvas');
  const steamCanvas = new SteamCanvas('steam-canvas');

  // 2. State & Session Time
  const sessionStartTime = Date.now();
  let currentPresetKey = 'window-seat';
  let focusCompletedCount = parseInt(localStorage.getItem('cb-focus-sessions') || '0', 10);
  let totalFocusMinutes = parseInt(localStorage.getItem('cb-focus-minutes') || '0', 10);

  // 3. Preset Definitions from Creative Brief
  const presets = {
    'window-seat': {
      name: 'The Window Seat',
      weather: 'rainy',
      time: 'evening',
      quote: '“A warm cup, a rainy window, and all the time in the world.”',
      levels: { rain: 65, espresso: 35, chatter: 25, vinyl: 40, music: 50, fireplace: 0, traffic: 15, wind: 20 }
    },
    'after-hours': {
      name: 'After Hours',
      weather: 'cloudy',
      time: 'midnight',
      quote: '“For the thoughts that only arrive after midnight.”',
      levels: { rain: 10, espresso: 0, chatter: 5, vinyl: 65, music: 55, fireplace: 25, traffic: 10, wind: 40 }
    },
    'sunday-morning': {
      name: 'Sunday Morning',
      weather: 'sunny',
      time: 'morning',
      quote: '“No rush. No plans. Just one more cup.”',
      levels: { rain: 0, espresso: 60, chatter: 45, vinyl: 20, music: 50, fireplace: 0, traffic: 15, wind: 10 }
    },
    'study-table': {
      name: 'The Study Table',
      weather: 'rainy',
      time: 'golden',
      quote: '“Get comfortable. Let the rest of the world wait.”',
      levels: { rain: 50, espresso: 25, chatter: 10, vinyl: 30, music: 60, fireplace: 0, traffic: 0, wind: 15 }
    },
    'somewhere-in-paris': {
      name: 'Somewhere in Paris',
      weather: 'cloudy',
      time: 'golden',
      quote: '“A little daydream, somewhere across the world.”',
      levels: { rain: 20, espresso: 40, chatter: 45, vinyl: 25, music: 55, fireplace: 0, traffic: 30, wind: 10 }
    }
  };

  // 4. Handwritten Quotes Collection
  const quotesList = [
    '“One thing at a time. One sip at a time.”',
    '“You don’t have to figure everything out tonight.”',
    '“Take the long way back to yourself.”',
    '“It’s okay to just be here for a while.”',
    '“Quiet the noise. The coffee is still warm.”',
    '“Notice the rain. Notice your breath.”'
  ];
  let quoteIndex = 0;

  // ------------------------------------------------------------------------
  // Audio Controls & Sliders Synchronization
  // ------------------------------------------------------------------------
  const masterSoundBtn = document.getElementById('master-sound-btn');
  const masterBtnLabel = document.getElementById('master-btn-label');
  const iconPlay = masterSoundBtn ? masterSoundBtn.querySelector('.icon-play') : null;
  const iconPause = masterSoundBtn ? masterSoundBtn.querySelector('.icon-pause') : null;
  const masterSlider = document.getElementById('master-volume-slider');
  const masterVolVal = document.getElementById('master-volume-value');
  const masterMuteBtn = document.getElementById('master-mute-btn');

  function updateAudioPlayState(isPlaying) {
    if (isPlaying) {
      if (masterSoundBtn) masterSoundBtn.classList.add('playing');
      if (masterBtnLabel) masterBtnLabel.textContent = 'Pause';
      if (iconPlay) iconPlay.style.display = 'none';
      if (iconPause) iconPause.style.display = 'block';
    } else {
      if (masterSoundBtn) masterSoundBtn.classList.remove('playing');
      if (masterBtnLabel) masterBtnLabel.textContent = 'Listen';
      if (iconPlay) iconPlay.style.display = 'block';
      if (iconPause) iconPause.style.display = 'none';
    }
  }

  function toggleMasterAudio() {
    if (window.cyberAudio.isPlaying) {
      window.cyberAudio.stop();
      updateAudioPlayState(false);
      showToast('Soundscape Paused');
    } else {
      window.cyberAudio.start();
      updateAudioPlayState(true);
      showToast('Soundscape Playing ☕');
    }
  }

  if (masterSoundBtn) masterSoundBtn.addEventListener('click', toggleMasterAudio);

  // Master Volume Slider
  if (masterSlider) {
    masterSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      window.cyberAudio.setMasterVolume(val / 100);
      if (masterVolVal) masterVolVal.textContent = `${val}%`;
    });
  }

  // Master Mute
  if (masterMuteBtn) {
    masterMuteBtn.addEventListener('click', () => {
      const isMuted = window.cyberAudio.toggleMute();
      masterMuteBtn.classList.toggle('muted', isMuted);
      showToast(isMuted ? 'Muted 🔇' : 'Unmuted 🔊');
    });
  }

  // Individual Channel Sliders
  Object.keys(window.cyberAudio.channels).forEach(channelName => {
    const slider = document.getElementById(`slider-${channelName}`);
    const valText = document.getElementById(`val-${channelName}`);
    const card = document.querySelector(`.sound-track-card[data-channel="${channelName}"]`);

    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        window.cyberAudio.setChannelVolume(channelName, val / 100);
        if (valText) valText.textContent = `${val}%`;
        if (card) {
          if (val > 0) card.classList.add('active');
          else card.classList.remove('active');
        }
      });
    }
  });

  function applyPreset(presetKey) {
    const p = presets[presetKey];
    if (!p) return;
    currentPresetKey = presetKey;

    // Apply audio levels
    Object.keys(p.levels).forEach(channel => {
      const level = p.levels[channel];
      window.cyberAudio.setChannelVolume(channel, level / 100);

      const slider = document.getElementById(`slider-${channel}`);
      const valText = document.getElementById(`val-${channel}`);
      const card = document.querySelector(`.sound-track-card[data-channel="${channel}"]`);

      if (slider) slider.value = level;
      if (valText) valText.textContent = `${level}%`;
      if (card) {
        if (level > 0) card.classList.add('active');
        else card.classList.remove('active');
      }
    });

    // Apply weather & time
    setWeather(p.weather);
    setTimeOfDay(p.time);

    // Update active preset cards
    document.querySelectorAll('.preset-card').forEach(card => {
      if (card.getAttribute('data-preset') === presetKey) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    showToast(`Mood: ${p.name}`);
  }

  // ------------------------------------------------------------------------
  // Weather & Time of Day Setters
  // ------------------------------------------------------------------------
  function setWeather(weather) {
    document.documentElement.setAttribute('data-weather', weather);
    weatherCanvas.setWeather(weather);

    document.querySelectorAll('#weather-selector .pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-weather') === weather);
    });
  }

  function setTimeOfDay(time) {
    document.documentElement.setAttribute('data-time', time);

    document.querySelectorAll('#time-selector .pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-time') === time);
    });
  }

  function setSeating(seating) {
    document.documentElement.setAttribute('data-seating', seating);
    document.querySelectorAll('#seating-selector .pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-seating') === seating);
    });
  }

  // Atmosphere pill listeners
  document.querySelectorAll('#weather-selector .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => setWeather(btn.getAttribute('data-weather')));
  });

  document.querySelectorAll('#time-selector .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => setTimeOfDay(btn.getAttribute('data-time')));
  });

  document.querySelectorAll('#seating-selector .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => setSeating(btn.getAttribute('data-seating')));
  });

  // Preset Card Clicks
  document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => {
      const presetKey = card.getAttribute('data-preset');
      applyPreset(presetKey);
    });
  });

  // ------------------------------------------------------------------------
  // Hero Overlay Screen Actions
  // ------------------------------------------------------------------------
  const heroIntro = document.getElementById('hero-intro');
  const enterBtn = document.getElementById('enter-cafe-btn');

  function enterCafe(presetKey = 'window-seat') {
    if (heroIntro) heroIntro.classList.add('dismissed');
    applyPreset(presetKey);
    window.cyberAudio.start();
    updateAudioPlayState(true);
  }

  if (enterBtn) {
    enterBtn.addEventListener('click', () => enterCafe('window-seat'));
  }

  document.querySelectorAll('[data-quick-preset]').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const preset = chip.getAttribute('data-quick-preset');
      enterCafe(preset);
    });
  });

  // ------------------------------------------------------------------------
  // Navigation & Drawer Panels
  // ------------------------------------------------------------------------
  const panels = {
    mixer: document.getElementById('sound-mixer-panel'),
    presets: document.getElementById('presets-panel'),
    customize: document.getElementById('customize-panel'),
    focus: document.getElementById('focus-panel'),
    receipt: document.getElementById('receipt-overlay')
  };

  function closeAllPanels() {
    Object.keys(panels).forEach(key => {
      if (panels[key]) {
        panels[key].classList.remove('open');
        panels[key].setAttribute('aria-hidden', 'true');
      }
    });
    document.querySelectorAll('.nav-link-btn').forEach(b => b.classList.remove('active'));
    const cafeBtn = document.getElementById('nav-btn-cafe');
    if (cafeBtn) cafeBtn.classList.add('active');
  }

  function togglePanel(panelName) {
    const target = panels[panelName];
    if (!target) return;
    const isOpen = target.classList.contains('open');

    closeAllPanels();

    if (!isOpen) {
      target.classList.add('open');
      target.setAttribute('aria-hidden', 'false');

      const navBtn = document.querySelector(`[data-panel="${panelName}"]`);
      if (navBtn) {
        document.querySelectorAll('.nav-link-btn').forEach(b => b.classList.remove('active'));
        navBtn.classList.add('active');
      }

      if (panelName === 'receipt') {
        updateReceiptData();
      }
    }
  }

  // Nav link clicks
  document.querySelectorAll('.nav-link-btn[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.getAttribute('data-panel');
      togglePanel(panel);
    });
  });

  const navCafeBtn = document.getElementById('nav-btn-cafe');
  if (navCafeBtn) {
    navCafeBtn.addEventListener('click', () => {
      closeAllPanels();
    });
  }

  // Close buttons in panel headers
  document.querySelectorAll('[data-close-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllPanels();
    });
  });

  // Receipt Close
  const recCloseBtn = document.getElementById('receipt-close-btn');
  const recOverlay = document.getElementById('receipt-overlay');
  if (recCloseBtn) recCloseBtn.addEventListener('click', closeAllPanels);
  if (recOverlay) {
    recOverlay.addEventListener('click', (e) => {
      if (e.target === recOverlay) closeAllPanels();
    });
  }

  // ------------------------------------------------------------------------
  // Pomodoro Focus Timer (Accurate Timestamp Delta)
  // ------------------------------------------------------------------------
  let timerDurationMinutes = 25;
  let timerEndTime = null;
  let timerRemainingMs = timerDurationMinutes * 60 * 1000;
  let timerInterval = null;
  let isTimerRunning = false;

  const timerDisplay = document.getElementById('timer-time-display');
  const timerSub = document.getElementById('timer-status-sub');
  const timerStartBtn = document.getElementById('timer-start-btn');
  const timerResetBtn = document.getElementById('timer-reset-btn');
  const timerProgress = document.getElementById('timer-progress');
  const totalCircleLen = 615.75; // 2 * PI * 98

  function updateTimerUI(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (timerDisplay) {
      timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    if (timerProgress) {
      const totalMs = timerDurationMinutes * 60 * 1000;
      const progressFraction = Math.max(0, Math.min(1, ms / totalMs));
      const offset = totalCircleLen * (1 - progressFraction);
      timerProgress.style.strokeDashoffset = offset;
    }
  }

  function startTimer() {
    isTimerRunning = true;
    timerEndTime = Date.now() + timerRemainingMs;
    if (timerStartBtn) timerStartBtn.textContent = 'Pause Session';
    if (timerSub) timerSub.textContent = 'Flowing in calm focus...';

    timerInterval = setInterval(() => {
      const now = Date.now();
      timerRemainingMs = Math.max(0, timerEndTime - now);
      updateTimerUI(timerRemainingMs);

      if (timerRemainingMs <= 0) {
        completeTimer();
      }
    }, 200);
  }

  function pauseTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    if (timerStartBtn) timerStartBtn.textContent = 'Resume Session';
    if (timerSub) timerSub.textContent = 'Session paused';
  }

  function resetTimer() {
    isTimerRunning = false;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    timerRemainingMs = timerDurationMinutes * 60 * 1000;
    updateTimerUI(timerRemainingMs);
    if (timerStartBtn) timerStartBtn.textContent = 'Start Session';
    if (timerSub) timerSub.textContent = 'Ready to settle in';
  }

  function completeTimer() {
    pauseTimer();
    focusCompletedCount++;
    totalFocusMinutes += timerDurationMinutes;

    localStorage.setItem('cb-focus-sessions', focusCompletedCount);
    localStorage.setItem('cb-focus-minutes', totalFocusMinutes);

    updateFocusStats();

    const chimeToggle = document.getElementById('chime-toggle');
    if (chimeToggle && chimeToggle.checked) {
      window.cyberAudio.playChime();
    }

    showToast('Focus Session Complete! 🌿 Time for a quiet pause.');
    if (timerSub) timerSub.textContent = 'Session completed ✨';
  }

  function updateFocusStats() {
    const sNum = document.getElementById('sessions-completed-num');
    const mNum = document.getElementById('minutes-focused-num');
    if (sNum) sNum.textContent = focusCompletedCount;
    if (mNum) mNum.textContent = totalFocusMinutes;
  }

  updateFocusStats();

  if (timerStartBtn) {
    timerStartBtn.addEventListener('click', () => {
      if (isTimerRunning) pauseTimer();
      else startTimer();
    });
  }

  if (timerResetBtn) {
    timerResetBtn.addEventListener('click', resetTimer);
  }

  // Timer mode pills (25m, 5m, 15m)
  document.querySelectorAll('.timer-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.timer-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      timerDurationMinutes = parseInt(btn.getAttribute('data-duration'), 10);
      resetTimer();
    });
  });

  // ------------------------------------------------------------------------
  // Digital Receipt Data Generator
  // ------------------------------------------------------------------------
  function updateReceiptData() {
    const now = new Date();
    const elapsedMinutes = Math.max(1, Math.floor((Date.now() - sessionStartTime) / 60000));

    const recDate = document.getElementById('rec-date');
    const recTime = document.getElementById('rec-time');
    const recPreset = document.getElementById('rec-preset');
    const recWeather = document.getElementById('rec-weather');
    const recTimeOfDay = document.getElementById('rec-time-of-day');
    const recElapsed = document.getElementById('rec-elapsed');
    const recFocus = document.getElementById('rec-focus');
    const recQuote = document.getElementById('rec-quote');

    if (recDate) recDate.textContent = now.toISOString().split('T')[0];
    if (recTime) recTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (recPreset) recPreset.textContent = presets[currentPresetKey].name;
    if (recWeather) {
      const w = document.documentElement.getAttribute('data-weather') || 'rainy';
      recWeather.textContent = w.charAt(0).toUpperCase() + w.slice(1);
    }
    if (recTimeOfDay) {
      const t = document.documentElement.getAttribute('data-time') || 'evening';
      recTimeOfDay.textContent = t.charAt(0).toUpperCase() + t.slice(1);
    }
    if (recElapsed) recElapsed.textContent = `${elapsedMinutes} mins at desk`;
    if (recFocus) recFocus.textContent = `${focusCompletedCount} session${focusCompletedCount === 1 ? '' : 's'}`;
    if (recQuote) recQuote.textContent = quotesList[quoteIndex];
  }

  // ------------------------------------------------------------------------
  // Handwritten Notebook Interaction
  // ------------------------------------------------------------------------
  const quoteElem = document.getElementById('handwritten-quote');
  const nextQuoteBtn = document.getElementById('next-quote-btn');
  const userIntention = document.getElementById('user-intention');
  const intentionHint = document.getElementById('intention-hint');

  if (nextQuoteBtn && quoteElem) {
    nextQuoteBtn.addEventListener('click', () => {
      quoteIndex = (quoteIndex + 1) % quotesList.length;
      quoteElem.style.opacity = '0';
      quoteElem.style.transform = 'translateY(4px)';
      setTimeout(() => {
        quoteElem.textContent = quotesList[quoteIndex];
        quoteElem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        quoteElem.style.opacity = '1';
        quoteElem.style.transform = 'translateY(0)';
      }, 150);
    });
  }

  if (userIntention) {
    const savedIntention = localStorage.getItem('cb-user-intention');
    if (savedIntention) userIntention.value = savedIntention;

    userIntention.addEventListener('input', () => {
      localStorage.setItem('cb-user-intention', userIntention.value);
      if (intentionHint) {
        intentionHint.classList.add('show');
        setTimeout(() => intentionHint.classList.remove('show'), 1600);
      }
    });
  }

  // ------------------------------------------------------------------------
  // Interactive Coffee Cup Sip
  // ------------------------------------------------------------------------
  const coffeeCup = document.getElementById('coffee-cup');
  const sipTooltip = document.getElementById('sip-tooltip');

  if (coffeeCup) {
    coffeeCup.addEventListener('click', () => {
      steamCanvas.boostSteam();
      window.cyberAudio.playChime();
      if (sipTooltip) {
        sipTooltip.classList.add('show');
        setTimeout(() => sipTooltip.classList.remove('show'), 1800);
      }
    });

    coffeeCup.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        coffeeCup.click();
      }
    });
  }

  // ------------------------------------------------------------------------
  // Live Local Time Display
  // ------------------------------------------------------------------------
  function updateLiveClock() {
    const clockDisplay = document.getElementById('live-time-display');
    if (clockDisplay) {
      const now = new Date();
      clockDisplay.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  // ------------------------------------------------------------------------
  // Zen Mode (Hide UI)
  // ------------------------------------------------------------------------
  const zenToggleBtn = document.getElementById('zen-toggle-btn');
  const zenRestoreBtn = document.getElementById('zen-restore-btn');

  function toggleZenMode() {
    const isZen = document.body.classList.toggle('zen-mode');
    if (isZen) {
      closeAllPanels();
      showToast('Zen Mode: Press H to restore interface');
    }
  }

  if (zenToggleBtn) zenToggleBtn.addEventListener('click', toggleZenMode);
  if (zenRestoreBtn) zenRestoreBtn.addEventListener('click', toggleZenMode);

  // ------------------------------------------------------------------------
  // Keyboard Shortcuts
  // ------------------------------------------------------------------------
  document.addEventListener('keydown', (e) => {
    // Avoid triggering when user is typing in intention textarea
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      toggleMasterAudio();
    } else if (e.key === 'm' || e.key === 'M') {
      window.cyberAudio.toggleMute();
      showToast(window.cyberAudio.isMuted ? 'Muted' : 'Unmuted');
    } else if (e.key === 'h' || e.key === 'H') {
      toggleZenMode();
    } else if (e.key === 'f' || e.key === 'F') {
      togglePanel('focus');
    } else if (e.key === 'Escape') {
      closeAllPanels();
    }
  });

  // ------------------------------------------------------------------------
  // Save Settings Locally
  // ------------------------------------------------------------------------
  const saveBtn = document.getElementById('save-settings-btn');
  const saveFeedback = document.getElementById('save-feedback');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const setup = {
        preset: currentPresetKey,
        weather: document.documentElement.getAttribute('data-weather'),
        time: document.documentElement.getAttribute('data-time'),
        seating: document.documentElement.getAttribute('data-seating')
      };
      localStorage.setItem('cb-saved-setup', JSON.stringify(setup));
      if (saveFeedback) {
        saveFeedback.classList.add('show');
        setTimeout(() => saveFeedback.classList.remove('show'), 2000);
      }
      showToast('Custom atmosphere saved as default ✨');
    });
  }

  // Restore saved setup if exists
  const savedSetupStr = localStorage.getItem('cb-saved-setup');
  if (savedSetupStr) {
    try {
      const setup = JSON.parse(savedSetupStr);
      if (setup.weather) setWeather(setup.weather);
      if (setup.time) setTimeOfDay(setup.time);
      if (setup.seating) setSeating(setup.seating);
      if (setup.preset && presets[setup.preset]) currentPresetKey = setup.preset;
    } catch (err) {}
  }
});

// Toast Helper
function showToast(message) {
  const toast = document.getElementById('cyber-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}
