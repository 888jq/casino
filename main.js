// ============ GAME STATE & VARIABLES ============
let slots = [[c1Slot1, c1Slot2, c1Slot3, c1Slot4],
             [c2Slot1, c2Slot2, c2Slot3, c2Slot4],
             [c3Slot1, c3Slot2, c3Slot3, c3Slot4],
             [c4Slot1, c4Slot2, c4Slot3, c4Slot4],
             [c5Slot1, c5Slot2, c5Slot3, c5Slot4]];

const slotsAnimations = [
  ['c1Slot1Roll', 'c1Slot2Roll', 'c1Slot3Roll', 'c1Slot4Roll'],
  ['c2Slot1Roll', 'c2Slot2Roll', 'c2Slot3Roll', 'c2Slot4Roll'],
  ['c3Slot1Roll', 'c3Slot2Roll', 'c3Slot3Roll', 'c3Slot4Roll'],
  ['c4Slot1Roll', 'c4Slot2Roll', 'c4Slot3Roll', 'c4Slot4Roll'],
  ['c5Slot1Roll', 'c5Slot2Roll', 'c5Slot3Roll', 'c5Slot4Roll']];

const slotsReRollAnimations = [
  ['c1Slot1ReRoll', 'c1Slot2ReRoll', 'c1Slot3ReRoll', 'c1Slot4ReRoll'],
  ['c2Slot1ReRoll', 'c2Slot2ReRoll', 'c2Slot3ReRoll', 'c2Slot4ReRoll'],
  ['c3Slot1ReRoll', 'c3Slot2ReRoll', 'c3Slot3ReRoll', 'c3Slot4ReRoll'],
  ['c4Slot1ReRoll', 'c4Slot2ReRoll', 'c4Slot3ReRoll', 'c4Slot4ReRoll'],
  ['c5Slot1ReRoll', 'c5Slot2ReRoll', 'c5Slot3ReRoll', 'c5Slot4ReRoll']];

const slotsPosition = ['slot1Position','slot2Position','slot3Position','slot4Position','slot5Position',
                       'slot6Position','slot7Position','slot8Position','slot9Position','slot10Position',
                       'slot11Position','slot12Position','slot13Position','slot14Position','slot15Position',
                       'slot16Position','slot17Position','slot18Position','slot19Position','slot20Position'];

const red_wildCards = [
  [[c1R1W1, c1R1W2, c1R1W3],[c1R2W1, c1R2W2, c1R2W3],[c1R3W1, c1R3W2, c1R3W3],[c1R4W1, c1R4W2, c1R4W3]],
  [[c2R1W1, c2R1W2, c2R1W3],[c2R2W1, c2R2W2, c2R2W3],[c2R3W1, c2R3W2, c2R3W3],[c2R4W1, c2R4W2, c2R4W3]],
  [[c3R1W1, c3R1W2, c3R1W3],[c3R2W1, c3R2W2, c3R2W3],[c3R3W1, c3R3W2, c3R3W3],[c3R4W1, c3R4W2, c3R4W3]],
  [[c4R1W1, c4R1W2, c4R1W3],[c4R2W1, c4R2W2, c4R2W3],[c4R3W1, c4R3W2, c4R3W3],[c4R4W1, c4R4W2, c4R4W3]],
  [[c5R1W1, c5R1W2, c5R1W3],[c5R2W1, c5R2W2, c5R2W3],[c5R3W1, c5R3W2, c5R3W3],[c5R4W1, c5R4W2, c5R4W3]]];

// ============ GAME STATE ============
let balance = 1000;
let currentWin = 0;
let free_spins = 0;
let betAmount = 2;
let spinInProgress = false;

// Display Elements - Wait for DOM to load
let balanceDisplay, winDisplay, freeSpinsDisplay, betField, spinBtn;

function initDisplay() {
  balanceDisplay = document.getElementById('balanceDisplay');
  winDisplay = document.getElementById('winDisplay');
  freeSpinsDisplay = document.getElementById('freeSpinsDisplay');
  betField = document.getElementById('betField');
  spinBtn = document.getElementById('spinBtn');
  
  // Debug log
  console.log("Display elements initialized:", {
    balanceDisplay: !!balanceDisplay,
    winDisplay: !!winDisplay,
    freeSpinsDisplay: !!freeSpinsDisplay,
    betField: !!betField,
    spinBtn: !!spinBtn
  });
}

// Update display functions
function formatCurrency(value) {
  return '₱' + Number(value).toFixed(2);
}

function updateDisplay() {
  if (!balanceDisplay) initDisplay();
  if (balanceDisplay) balanceDisplay.textContent = formatCurrency(balance);
  if (winDisplay) winDisplay.textContent = formatCurrency(currentWin);
  if (freeSpinsDisplay) freeSpinsDisplay.textContent = free_spins;
  console.log("Updated display - Balance: " + formatCurrency(balance) + ", Win: " + formatCurrency(currentWin) + ", Spins: " + free_spins);
}

// ============ AUDIO / SOUND MANAGER & CONTROLS ============
let audioEnabled = true;
let masterVolume = 0.70; // 70% default

const audioFiles = {
  spinStart: 'sounds/spinStart.mp3',
  spinEnd: 'sounds/spinEnd.mp3',
  cascadeWin: 'sounds/cascadeWin.mp3',
  scatter: 'sounds/scatter.mp3',
  goldenTransform: 'sounds/goldenTransform.mp3',
  bigJoker: 'sounds/bigJoker.mp3',
  freeSpin: 'sounds/freeSpin.mp3',
  buttonClick: 'sounds/buttonClick.mp3',
  // Super Ace specific sounds
  superAce: 'sounds/superAce.mp3',         // one-time super ace (5 Aces) sound
  superAceBig: 'sounds/superAceBig.mp3'    // large super ace/big win anthem
};
const sounds = {};
for (const [k,v] of Object.entries(audioFiles)){
  try{
    const a = new Audio(v);
    a.preload = 'auto';
    a.volume = masterVolume;
    sounds[k] = a;
  }catch(e){ /* ignore */ }
}

// Initialize audio controls
function initAudioControls() {
  const muteBtn = document.getElementById('muteBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeLabel = document.querySelector('.volume-label');
  
  // Load saved preferences from localStorage
  const savedMuted = localStorage.getItem('audioMuted');
  const savedVolume = localStorage.getItem('masterVolume');
  
  if (savedMuted !== null) audioEnabled = savedMuted === 'false';
  if (savedVolume !== null) masterVolume = parseFloat(savedVolume);
  
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      updateMuteButton(muteBtn);
      localStorage.setItem('audioMuted', String(!audioEnabled));
      console.log('Audio ' + (audioEnabled ? 'enabled' : 'disabled'));
    });
    // Set initial button state
    updateMuteButton(muteBtn);
  }
  
  if (volumeSlider) {
    volumeSlider.value = Math.round(masterVolume * 100);
    
    volumeSlider.addEventListener('input', (e) => {
      masterVolume = parseFloat(e.target.value) / 100;
      updateAllVolumes();
      if (volumeLabel) volumeLabel.textContent = Math.round(masterVolume * 100) + '%';
      localStorage.setItem('masterVolume', String(masterVolume));
      console.log('Volume set to ' + Math.round(masterVolume * 100) + '%');
      playSound('cascadeWin'); // preview sound
    });
  }
}

function updateMuteButton(btn) {
  if (!btn) return;
  if (audioEnabled) {
    btn.textContent = '🔊';
    btn.classList.remove('muted');
  } else {
    btn.textContent = '🔇';
    btn.classList.add('muted');
  }
}

function updateAllVolumes() {
  for (const [k, audio] of Object.entries(sounds)) {
    if (audio) audio.volume = masterVolume;
  }
}

function playSound(name){
  if (!audioEnabled) return;
  const s = sounds[name];
  if (s){
    try{ 
      s.currentTime = 0; 
      s.volume = masterVolume;
      s.play().catch(()=>{ beepFallback(name); }); 
      return; 
    } catch(e){ beepFallback(name); }
  }
  // fallback beep for minimal audible feedback
  beepFallback(name);
}

function beepFallback(name='generic', duration=0.06, freq=880, volume=0.04){
  if (!audioEnabled) return;
  try{
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    
    // Vary frequency based on sound type
    if (name === 'superAce' || name === 'superAceBig') freq = 1200;
    else if (name === 'scatter') freq = 750;
    else if (name === 'cascadeWin') freq = 880;
    
    o.frequency.value = freq;
    o.type = 'sine';
    g.gain.value = volume * masterVolume;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    setTimeout(()=>{ o.stop(); ctx.close(); }, duration*1000);
  }catch(e){ }
}

function addWin(amount) {
  currentWin += amount;
  balance += amount;
  updateDisplay();
  console.log("Added win: " + formatCurrency(amount) + " | New Balance: " + formatCurrency(balance) + " | Current Win: " + formatCurrency(currentWin));
  // short sound for wins
  if (amount > 0) playSound('cascadeWin');
}

function deductBet() {
  balance -= betAmount;
  updateDisplay();
  console.log("Deducted bet: " + formatCurrency(betAmount) + " | New Balance: " + formatCurrency(balance));
}

// ============ CARD DEFINITIONS ============
let rollc1L1, rollc1L2, rollc1L3, rollc1L4,
    rollc2L1, rollc2L2, rollc2L3, rollc2L4,
    rollc3L1, rollc3L2, rollc3L3, rollc3L4,
    rollc4L1, rollc4L2, rollc4L3, rollc4L4,
    rollc5L1, rollc5L2, rollc5L3, rollc5L4;
  
let cardNo_c1L1, cardNo_c1L2, cardNo_c1L3, cardNo_c1L4,
    cardNo_c2L1, cardNo_c2L2, cardNo_c2L3, cardNo_c2L4,
    cardNo_c3L1, cardNo_c3L2, cardNo_c3L3, cardNo_c3L4,
    cardNo_c4L1, cardNo_c4L2, cardNo_c4L3, cardNo_c4L4,
    cardNo_c5L1, cardNo_c5L2, cardNo_c5L3, cardNo_c5L4;
  
let slotsRan = [
    [rollc1L1, rollc1L2, rollc1L3, rollc1L4],
    [rollc2L1, rollc2L2, rollc2L3, rollc2L4],
    [rollc3L1, rollc3L2, rollc3L3, rollc3L4],
    [rollc4L1, rollc4L2, rollc4L3, rollc4L4],
    [rollc5L1, rollc5L2, rollc5L3, rollc5L4]];
    
let slotsCardNo = [
    [cardNo_c1L1, cardNo_c1L2, cardNo_c1L3, cardNo_c1L4],
    [cardNo_c2L1, cardNo_c2L2, cardNo_c2L3, cardNo_c2L4],
    [cardNo_c3L1, cardNo_c3L2, cardNo_c3L3, cardNo_c3L4],
    [cardNo_c4L1, cardNo_c4L2, cardNo_c4L3, cardNo_c4L4],
    [cardNo_c5L1, cardNo_c5L2, cardNo_c5L3, cardNo_c5L4]];

// Flags for golden and wild states (5x4)
let goldenFlags = Array.from({length:5}, () => Array(4).fill(false));
let wildFlags = Array.from({length:5}, () => Array(4).fill(false));

// ============ BASELINE MULTIPLIERS (hardcoded per your spec) ============
// Symbol ID mapping: 1:A, 2:K, 3:Q, 4:J, 5:Spade, 6:Club(flower), 7:Heart, 8:Diamond
const BASELINE_MULTIPLIERS = {
  1: {3:0.20, 4:0.40, 5:0.80}, // A
  2: {3:0.15, 4:0.30, 5:0.60}, // K
  3: {3:0.10, 4:0.20, 5:0.40}, // Q
  4: {3:0.05, 4:0.10, 5:0.25}, // J
  5: {3:0.04, 4:0.08, 5:0.20}, // Spade
  6: {3:0.02, 4:0.04, 5:0.10}, // Club (flower)
  7: {3:0.04, 4:0.08, 5:0.20}, // Heart
  8: {3:0.02, 4:0.04, 5:0.10}  // Diamond
};

// Scatter base payout (per-bet)
let scatterMultiplier = 5;

// Cascade multipliers table (cascadeCount starting at 0 for initial spin)
function cascadeMultiplier(cascadeCount, inFreeSpin){
  if (!inFreeSpin){
    if (cascadeCount === 0) return 1;
    if (cascadeCount === 1) return 2;
    if (cascadeCount === 2) return 3;
    return 5; // >=3
  } else {
    // Free spin mapping: initial=2x, 1st=4x,2nd=6x,3rd+=10x
    if (cascadeCount === 0) return 2;
    if (cascadeCount === 1) return 4;
    if (cascadeCount === 2) return 6;
    return 10;
  }
}

// ============ CARD HTML DEFINITIONS ============
const ace = "<img title=\"ace_card\" src=\"cards_images/aceCard.png\">",
      king = "<img title=\"king_card\" src=\"cards_images/kingCard.png\">",
      queen = "<img title=\"queen_card\" src=\"cards_images/queenCard.png\">",
      jack = "<img title=\"jack_card\" src=\"cards_images/jackCard.png\">",
      spade = "<img title=\"spade_card\" src=\"cards_images/spadeCard.png\">",
      flower = "<img title=\"flower_card\" src=\"cards_images/flowerCard.png\">",
      heart = "<img title=\"heart_card\" src=\"cards_images/heartCard.png\">",
      diamond = "<img title=\"diamond_card\" src=\"cards_images/diamondCard.png\">",
      scatter = "<img title=\"scatter\" src=\"cards_images/super-ace-03.png\">",
      cardBack = "<img title=\"scatter\" src=\"cards_images/cardBack.png\">",
      wildCard = "<img title=\"wild\" src=\"cards_images/wild.png\">",
      red_wildCard = "<img title=\"red_wild\" src=\"cards_images/red_wildCard.png\">";
       
const golden_ace = "<img title=\"ace_card\" src=\"cards_images/golden_aceCard.png\">",
      golden_king = "<img title=\"king_card\" src=\"cards_images/golden_kingCard.png\">",
      golden_queen = "<img title=\"queen_card\" src=\"cards_images/golden_queenCard.png\">",
      golden_jack = "<img title=\"jack_card\" src=\"cards_images/golden_jackCard.png\">",
      golden_spade = "<img title=\"spade_card\" src=\"cards_images/golden_spadeCard.png\">",
      golden_flower = "<img title=\"flower_card\" src=\"cards_images/golden_flowerCard.png\">",
      golden_heart = "<img title=\"heart_card\" src=\"cards_images/golden_heartCard.png\">",
      golden_diamond = "<img title=\"diamond_card\" src=\"cards_images/golden_diamondCard.png\">";
       
let random, price, current_Price, total_price, scateerNo, isScatter = false, limit_loop = 100;

const cards = [ace, king, queen, jack, spade, flower, heart, diamond];

let golden_cards = [golden_ace, golden_king, golden_queen, golden_jack,
                golden_spade, golden_flower, golden_heart, golden_diamond];

let columns = [],
    row = [],
    goldenCard_columns = [],
    goldenCard_row = [],
    cardIndex = 0,
    scatterNo = 0;
let spinInterval, isScatter_Ongoing = false;

// Golden spawn chance for reels 2..4 (10% by default)
const GOLDEN_SPAWN_CHANCE = 0.10;

// ============ INITIALIZATION ============
getRandomNum();
// initialize red wild visuals
for (let i = 0; i < red_wildCards.length; i++){
  for (let j = 0; j < red_wildCards[0].length; j++){
    for (let k = 0; k < red_wildCards[0][0].length; k++){
       red_wildCards[i][j][k].innerHTML = "<img title=\"diamond_card\" src=\"cards_images/red_wildCard.png\">";
    }
  }
}

// Initialize display on page load
initDisplay();
updateDisplay();

// ============ EVENT LISTENERS ============
document.addEventListener('DOMContentLoaded', function() {
  initDisplay();
  initAudioControls();
  
  if (spinBtn) {
    spinBtn.addEventListener("click", ()=> {
      // button click sound
      playSound('buttonClick');

      if(spinInProgress) return;
      
      if(balance < betAmount) {
        alert("Insufficient balance! You need at least " + formatCurrency(betAmount));
        return;
      }
      
      betAmount = parseInt(betField.value) || 2;
      if (betAmount < 2) betAmount = 2;
      if (betAmount > 1000) betAmount = 1000;
      betField.value = betAmount;
      
      spinInProgress = true;
      currentWin = 0;
      updateDisplay();
      deductBet();
      
      // Start roll with cascade engine
      roll();
    });
  }
  
  if (betField) {
    betField.addEventListener('change', (e) => {
      betAmount = parseInt(e.target.value) || 2;
      if (betAmount < 2) betAmount = 2;
      if (betAmount > 1000) betAmount = 1000;
      betField.value = betAmount;
    });
  }
});

// ============ GAME LOGIC (Cascade + Golden/Joker rules) ============
function useFreeSpins(){
  if (free_spins <= 0) return;
  free_spins--;
  updateDisplay();
  playSound('freeSpin');
  // Free-spin roll
  roll(true);
}

// Build normalized grid from current state
function buildGrid() {
  const grid = Array.from({length:5}, () => Array(4).fill(null));
  for (let c = 0; c < 5; c++){
    for (let r = 0; r < 4; r++){
      // wildFlags take precedence
      if (wildFlags[c] && wildFlags[c][r]) grid[c][r] = 'WILD';
      else {
        const v = slotsCardNo[c] && slotsCardNo[c][r] !== undefined ? slotsCardNo[c][r] : null;
        if (v === 'WILD') grid[c][r] = 'WILD';
        else if (typeof v === 'number') grid[c][r] = Math.floor(v);
        else grid[c][r] = null;
      }
    }
  }
  return grid;
}

// Evaluate grid for payways wins and scatter. Returns {payout, matchedPositions, goldenMatchedPositions}
function evaluateGrid(grid, comboMultiplier) {
  let payout = 0;
  const matched = [];
  const goldenMatched = [];

  // Scatter handling
  let scatterCount = 0;
  for (let c = 0; c < 5; c++){
    for (let r = 0; r < 4; r++){
      if (grid[c][r] === 9) scatterCount++;
    }
  }
  console.log('DEBUG scatterCount =', scatterCount, 'comboMultiplier =', comboMultiplier);
  if (scatterCount >= 3) {
    const scatterPayout = betAmount * scatterMultiplier * comboMultiplier;
    payout += scatterPayout;
    for (let c = 0; c < 5; c++){
      for (let r = 0; r < 4; r++){
        if (grid[c][r] === 9) matched.push([c,r]);
      }
    }
    console.log('DEBUG scatterPayout =', scatterPayout);
    playSound('scatter');
  }

  // Payways for symbols 1..8
  for (let sym = 1; sym <= 8; sym++){
    const counts = [];
    for (let c = 0; c < 5; c++){
      let cnt = 0;
      for (let r = 0; r < 4; r++){
        const v = grid[c][r];
        if (v === sym || v === 'WILD') cnt++;
      }
      counts.push(cnt);
    }

    // consecutive reels starting from reel 0
    let consec = 0;
    for (let c = 0; c < 5; c++){
      if (counts[c] > 0) consec++;
      else break;
    }
    if (consec >= 3){
      const len = Math.min(consec,5);
      let ways = 1;
      for (let c = 0; c < len; c++) ways *= counts[c];
      const key = len >=5 ? 5 : len; // 3/4/5
      const baseMultiplier = (BASELINE_MULTIPLIERS[sym] && BASELINE_MULTIPLIERS[sym][key]) || 0;
      const win = ways * baseMultiplier * betAmount * comboMultiplier;
      console.log(`DEBUG sym=${sym} counts=${counts} consec=${consec} len=${len} ways=${ways} baseMultiplier=${baseMultiplier} win=${win}`);
      if (win > 0) {
        payout += win;
        // mark matched positions: any cell in first 'len' reels that is sym or WILD
        for (let c = 0; c < len; c++){
          for (let r = 0; r < 4; r++){
            if (grid[c][r] === sym || grid[c][r] === 'WILD') {
              matched.push([c,r]);
              // if it was golden flagged originally, track goldenMatched separately
              if (goldenFlags[c] && goldenFlags[c][r]) goldenMatched.push([c,r]);
            }
          }
        }
        // Play Super Ace sound when hitting 5 Aces in a 5-reel match
        if (sym === 1 && key === 5) {
          try { playSound('superAce'); } catch(e){}
        }
      }
    }
  }

  // remove duplicates in matched
  const uniqueMatched = matched.map(k => k.join(',')).filter((v,i,a)=>a.indexOf(v)===i).map(s=>s.split(',').map(Number));
  const uniqueGolden = goldenMatched.map(k => k.join(',')).filter((v,i,a)=>a.indexOf(v)===i).map(s=>s.split(',').map(Number));

  return { payout, matched: uniqueMatched, goldenMatched: uniqueGolden };
}

// Replace matched (non-golden) positions with new randoms and optionally spawn golden on refill
function replaceMatchedPositions(matchedPositions) {
  for (const [c,r] of matchedPositions){
    // if this position is golden (shouldn't be passed here) skip
    if (goldenFlags[c] && goldenFlags[c][r]) continue;
    wildFlags[c][r] = false; // ensure wild removed when replaced
    // generate new random and update
    const newRandom = Math.floor(Math.random() * 522) + 1; // 1..522
    slotsRan[c][r] = newRandom;
    randomNo_to_cardNo(newRandom, c, r);
    // reset golden flag and maybe spawn new golden if reel in 1..3
    goldenFlags[c][r] = false;
    if (c >= 1 && c <= 3){
      if (Math.random() < GOLDEN_SPAWN_CHANCE) {
        goldenFlags[c][r] = true;
      }
    }
    // update DOM
    const isGolden = !!goldenFlags[c][r];
    if (slots[c] && slots[c][r]) switchRandom(newRandom, slots[c][r], isGolden, wildFlags[c][r]);
  }
}

// Helper to set wild at a position (used by Big Joker / golden transform)
function setWildAt(c,r,source='generic'){
  wildFlags[c][r] = true;
  goldenFlags[c][r] = false; // once wild, not golden
  // update DOM
  if (slots[c] && slots[c][r]) slots[c][r].innerHTML = wildCard;
  // play different sounds depending on source
  if (source === 'golden') playSound('goldenTransform');
  else if (source === 'big') playSound('bigJoker');
  else playSound('cascadeWin');
}

// Main roll (cascadeCount starts at 0)
function roll(isFreeSpin = false){
  console.log("=== SPIN START ===");
  playSound('spinStart');
  // reset wild/golden arrays for a fresh spin
  for (let c=0;c<5;c++){ for (let r=0;r<4;r++){ wildFlags[c][r] = false; goldenFlags[c][r] = false; } }

  getRandomNum();
  // spawn initial goldens on reels 2..4
  for (let c = 1; c <= 3; c++){
    for (let r = 0; r < 4; r++){
      // only non-scatter & non-wild
      const v = slotsCardNo[c] && slotsCardNo[c][r] !== undefined ? slotsCardNo[c][r] : null;
      if (v !== 'WILD' && typeof v === 'number'){
        if (Math.random() < GOLDEN_SPAWN_CHANCE) {
          goldenFlags[c][r] = true;
          // update DOM to show golden
          if (slots[c] && slots[c][r]) switchRandom(slotsRan[c][r], slots[c][r], true, false);
        }
      }
    }
  }

  addAnimation();
  if (spinBtn) spinBtn.disabled = true;
  setTimeout(removeAnimation, 950);

  setTimeout(() => {
    let cascadeCount = 0; // 0 = initial spin
    let totalCascadeWin = 0;
    const maxCascades = 50;

    // initial scatter award
    let initialScatterCount = 0;
    for (let c = 0; c < 5; c++) for (let r = 0; r < 4; r++) if (slotsCardNo[c] && slotsCardNo[c][r] == 9) initialScatterCount++;
    if (initialScatterCount >= 3) {
      free_spins += 5;
      console.log(`🎉 SCATTER triggered on spin: ${initialScatterCount} scatters. Awarded 5 free spins`);
      playSound('freeSpin');
    }

    while (cascadeCount < maxCascades){
      const comboMult = cascadeMultiplier(cascadeCount, isFreeSpin);
      const grid = buildGrid();
      console.log('DEBUG grid at cascade', cascadeCount, grid);
      const res = evaluateGrid(grid, comboMult);
      if (!res || res.payout <= 0) break;

      // apply payout
      addWin(res.payout);
      totalCascadeWin += res.payout;
      console.log(`Cascade ${cascadeCount} win: ${formatCurrency(res.payout)} (mult x${comboMult})`);

      // Handle golden transforms -> Little Joker: goldenMatched become wilds for next cascade
      for (const [c,r] of res.goldenMatched){
        setWildAt(c,r,'golden'); // golden becomes little joker (wild) for next cascade
      }

      // Big Joker: randomly select up to 4 other non-winning, non-wild positions and make them wild
      const candidates = [];
      for (let c=0;c<5;c++) for (let r=0;r<4;r++){
        // skip matched and already wild
        const isMatched = res.matched.some(m => m[0]===c && m[1]===r);
        if (!isMatched && !wildFlags[c][r] && slotsCardNo[c] && typeof slotsCardNo[c][r] === 'number') candidates.push([c,r]);
      }
      // choose up to 4
      const bigCount = Math.min(4, candidates.length);
      for (let k=0;k<bigCount;k++){
        const idx = Math.floor(Math.random() * candidates.length);
        const [cc,rr] = candidates.splice(idx,1)[0];
        setWildAt(cc,rr,'big');
      }

      // Now remove non-golden matched positions (they should have been included in res.matched)
      // Filter out golden matched positions from replacement
      const toReplace = res.matched.filter(([c,r]) => !(goldenFlags[c] && goldenFlags[c][r]));
      if (toReplace.length > 0) replaceMatchedPositions(toReplace);

      cascadeCount++;
    }

    console.log(`✅ SPIN COMPLETE! Total Cascade Win: ${formatCurrency(totalCascadeWin)}`);
    // Play a special superAceBig anthem for very large spins
    try{
      if (totalCascadeWin >= betAmount * 20) playSound('superAceBig');
    }catch(e){}
    playSound('spinEnd');

    if (isFreeSpin && free_spins >= 1){
      setTimeout(() => useFreeSpins(), 700);
    } else {
      if (spinBtn) spinBtn.disabled = false;
      spinInProgress = false;
      updateDisplay();
    }
  }, 950);
}

// ============ ORIGINAL/UTILITY FUNCTIONS ============
function getRandomNum(){
  for (let i = 0; i < slotsRan.length; i++){
    for (let j = 0; j < slotsRan[0].length; j++){
      random = Math.floor(Math.random() * 520) + 1;
      slotsRan[i][j] = random;
      randomNo_to_cardNo(random,i,j);
    }
  }
  for (let i = 0; i < slotsRan.length; i++) {
    for (let j = 0; j < slotsRan[0].length; j++){
      if (slots[i] && slots[i][j]) {
        // show golden if slotsRan indicates golden number (previous behavior)
        const isGoldenFromRandom = (slotsRan[i][j] === 64 || slotsRan[i][j] === 128 || slotsRan[i][j] === 192 || slotsRan[i][j] === 256 || slotsRan[i][j] === 320 || slotsRan[i][j] === 384 || slotsRan[i][j] === 448 || slotsRan[i][j] === 512);
        // if golden from random, set flag
        goldenFlags[i][j] = isGoldenFromRandom;
        switchRandom(slotsRan[i][j], slots[i][j], goldenFlags[i][j], wildFlags[i][j]);
      }
    }
  }
}

function randomNo_to_cardNo(random,column,row){
  if (random <= 63) {
    slotsCardNo[column][row] = 1;
  } else if (random == 64) {
    slotsCardNo[column][row] = 1.5;
  } else if (random <= 127) {
    slotsCardNo[column][row] = 2;
  } else if (random == 128) {
    slotsCardNo[column][row] = 2.5;
  } else if (random <= 191) {
    slotsCardNo[column][row] = 3;
  } else if (random == 192) {
    slotsCardNo[column][row] = 3.5;
  } else if (random <= 255) {
    slotsCardNo[column][row] = 4;
  } else if (random == 256) {
    slotsCardNo[column][row] = 4.5;
  } else if (random <= 319) {
    slotsCardNo[column][row] = 5;
  } else if (random == 320) {
    slotsCardNo[column][row] = 5.5;
  } else if (random <= 383) {
    slotsCardNo[column][row] = 6;
  } else if (random == 384) {
    slotsCardNo[column][row] = 6.5;
  } else if (random <= 447) {
    slotsCardNo[column][row] = 7;
  } else if (random == 448) {
    slotsCardNo[column][row] = 7.5;
  } else if (random <= 511) {
    slotsCardNo[column][row] = 8;
  } else if (random == 512) {
    slotsCardNo[column][row] = 8.5;
  } else if (random <= 520) {
    slotsCardNo[column][row] = 9;
  } else if (random == 521) {
    slotsCardNo[column][row] = "WILD";
  } else if (random == 522) {
    slotsCardNo[column][row] = "WILD";
  }
}

// switchRandom now accepts isGolden and isWild flags to control DOM image
function switchRandom(randomNo, slotName, isGolden=false, isWild=false){
  if (!slotName) return;
  if (isWild) { slotName.innerHTML = wildCard; return; }
  // If flagged golden override with golden image
  if (isGolden){
    // determine base symbol then show golden variant
    if (randomNo <= 63 || randomNo == 64) slotName.innerHTML = golden_ace;
    else if (randomNo <= 127 || randomNo == 128) slotName.innerHTML = golden_king;
    else if (randomNo <= 191 || randomNo == 192) slotName.innerHTML = golden_queen;
    else if (randomNo <= 255 || randomNo == 256) slotName.innerHTML = golden_jack;
    else if (randomNo <= 319 || randomNo == 320) slotName.innerHTML = golden_spade;
    else if (randomNo <= 383 || randomNo == 384) slotName.innerHTML = golden_flower;
    else if (randomNo <= 447 || randomNo == 448) slotName.innerHTML = golden_heart;
    else if (randomNo <= 511 || randomNo == 512) slotName.innerHTML = golden_diamond;
    else if (randomNo <= 520) slotName.innerHTML = scatter; // scatter stays same
    else if (randomNo == 522) slotName.innerHTML = red_wildCard;
    return;
  }

  if (randomNo <= 63) {
    slotName.innerHTML = ace;
  } else if (randomNo == 64) {
    slotName.innerHTML = golden_ace;
  } else if (randomNo <= 127) {
    slotName.innerHTML = king;
  } else if (randomNo == 128) {
    slotName.innerHTML = golden_king;
  } else if (randomNo <= 191) {
    slotName.innerHTML = queen;
  } else if (randomNo == 192) {
    slotName.innerHTML = golden_queen;
  } else if (randomNo <= 255) {
    slotName.innerHTML = jack;
  } else if (randomNo == 256) {
    slotName.innerHTML = golden_jack;
  } else if (randomNo <= 319) {
    slotName.innerHTML = spade;
  } else if (randomNo == 320) {
    slotName.innerHTML = golden_spade;
  } else if (randomNo <= 383) {
    slotName.innerHTML = flower;
  } else if (randomNo == 384) {
    slotName.innerHTML = golden_flower;
  } else if (randomNo <= 447) {
    slotName.innerHTML = heart;
  } else if (randomNo == 448) {
    slotName.innerHTML = golden_heart;
  } else if (randomNo <= 511) {
    slotName.innerHTML = diamond;
  } else if (randomNo == 512) {
    slotName.innerHTML = golden_diamond;
  } else if (randomNo <= 520) {
    slotName.innerHTML = scatter;
  } else if (randomNo == 521) {
    slotName.innerHTML = wildCard;
  } else if (randomNo == 522) {
    slotName.innerHTML = red_wildCard;
  }
}

function flipCard( slotName) {
  if (!slotName) return;
  slotName.innerHTML = cardBack;
}

function addAnimation(){
  for (let i = 0; i < slots.length; i++){
    for (let j = 0; j < slots[0].length; j++){
      if (slots[i] && slots[i][j]) slots[i][j].classList.add(slotsAnimations[i][j])
    }
  }
}

function removeAnimation(){
  if(!isScatter_Ongoing && spinBtn) spinBtn.disabled = false;
  for (let i = 0; i < slots.length; i++){
    for (let j = 0; j < slots[0].length; j++){
      if (slots[i] && slots[i][j]) slots[i][j].classList.remove(slotsAnimations[i][j])
    }
  }
}

function checkScatter(){
  scatterNo = 0;
  for (let i = 0; i < 5; i++){
    for (let j = 0; j < 4; j++){
      if (slotsCardNo[i] && slotsCardNo[i][j] == 9) scatterNo += 1;
    }
  }
  if(scatterNo >= 3 && isScatter === false){
    isScatter = true;
    free_spins += 5; // reduced from 10 for realistic RTP
    let scatterWin = betAmount * scatterMultiplier;
    addWin(scatterWin);
    console.log("🎉 SCATTER! Found " + scatterNo + " scatters! Awarded 5 free spins + " + formatCurrency(scatterWin) + " win!");
    playSound('scatter');
  }
}

// Legacy placeholders (kept for compatibility)
function checkColumn1(){ }
function checkColumn2(){ }
function checkColumn3(){ }
function checkColumn4(){ }
function check3Column_goldenCard_ReRoll(card){ }
function check3ColumnReRoll(card) { }
function checkGoldenCard_ReRoll(card) { }
function checkReRoll(card){ }
function reRoll(){ }
function removeReRollAnimation() { }
function rotateAnimation() { }
