/* ---------- Question bank: 3 subjects x 10 each ---------- */
const questionBank = {
  math: [
    {q: "If f(x)=x^2, what is f'(2)?", options:["2","4","1","0"], answer:0},
    {q: "What is the value of 7 choose 2?", options:["21","42","14","7"], answer:0},
    {q: "Solve: 2x+3=11", options:["3","4","5","2"], answer:1},
    {q: "Integral of 1/x dx is:", options:["ln|x|","1/x","x","e^x"], answer:0},
    {q: "Value of cos(0) is", options:["0","1","-1","undefined"], answer:1},
    {q: "LCM of 6 and 8 is", options:["24","48","12","6"], answer:0},
    {q: "Square root of 144 is", options:["10","11","12","14"], answer:2},
    {q: "If a sequence is arithmetic with first=2 and d=3, 3rd term?", options:["5","8","11","2"], answer:0},
    {q: "Number of degrees in a triangle", options:["90","180","360","270"], answer:1},
    {q: "Derivative of sin x is", options:["cos x","-cos x","tan x","-sin x"], answer:0}
  ],
  phy: [
    {q: "SI unit of force is", options:["Joule","Newton","Watt","Pascal"], answer:1},
    {q: "Acceleration due to gravity on Earth (approx)", options:["9.8 m/s^2","10 m/s^2","8 m/s^2","9 m/s^2"], answer:0},
    {q: "Which law: F=ma?", options:["Newton I","Newton II","Newton III","Conservation of momentum"], answer:1},
    {q: "Light travels fastest in", options:["Vacuum","Water","Glass","Air"], answer:0},
    {q: "Unit of electric current", options:["Volt","Ampere","Ohm","Coulomb"], answer:1},
    {q: "Ohm's law: V = I R; what is R?", options:["V/I","VI","I/V","V+I"], answer:0},
    {q: "Frequency is reciprocal of", options:["Wavelength","Time period","Speed","Amplitude"], answer:1},
    {q: "Sound needs which medium?", options:["No medium","Vacuum","Material medium","None"], answer:2},
    {q: "Unit of energy", options:["Newton","Watt","Joule","Pascal"], answer:2},
    {q: "Speed of light approx (m/s)", options:["3e8","3e6","3e5","3e7"], answer:0}
  ],
  chem: [
    {q: "Water chemical formula", options:["H2O","O2","CO2","HO2"], answer:0},
    {q: "pH of neutral water at 25°C", options:["7","0","14","1"], answer:0},
    {q: "Atomic number of Carbon", options:["6","12","14","8"], answer:0},
    {q: "Which gas is released in photosynthesis?", options:["CO2","O2","N2","H2"], answer:1},
    {q: "NaCl is common", options:["Salt","Sugar","Acid","Base"], answer:0},
    {q: "Avogadro's number approx", options:["6.02e23","3.14","9.8","1.6e-19"], answer:0},
    {q: "pH less than 7 means", options:["Neutral","Basic","Acidic","Alkaline"], answer:2},
    {q: "Atomic mass approx of H", options:["1","2","4","12"], answer:0},
    {q: "Covalent bond involves", options:["Electron sharing","Electron transfer","Protons","Neutrons"], answer:0},
    {q: "Chemical symbol of Gold", options:["Au","Ag","Gd","Go"], answer:0}
  ]
};

/* ---------- Build flat test array (30 q) ---------- */
let test = [];
['math','phy','chem'].forEach(sub=>{
  questionBank[sub].forEach((q,i)=> test.push({subject:sub,qIndex:i,state:'not-visited',selected:null}));
});

let current = 0;
let timerSeconds = 60*60;
let timerInterval = null;
let user = '';

/* ---------- Elements ---------- */
const frontPage = document.getElementById('frontPage'); // NEW: Get the front page wrapper
const loginBox = document.getElementById('loginBox');
const startBtn = document.getElementById('startBtn');
const testArea = document.getElementById('testArea');
const qIndexEl = document.getElementById('qIndex');
const qTotalEl = document.getElementById('qTotal');
const qText = document.getElementById('questionText');
const optionsList = document.getElementById('optionsList');
const qSubjectEl = document.getElementById('qSubject');
const qStatusEl = document.getElementById('qStatus');
const paletteContainer = document.getElementById('paletteContainer');
const summaryInfo = document.getElementById('summaryInfo');
const topTimer = document.getElementById('topTimer');
const topName = document.getElementById('topName');

const resName = document.getElementById('resName');
const resScore = document.getElementById('resScore');
const resBreakdown = document.getElementById('resBreakdown');
const resultArea = document.getElementById('resultArea');

qTotalEl.textContent = test.length;

/* ---------- Login/start ---------- */
startBtn.addEventListener('click', ()=>{
  const name = document.getElementById('username').value.trim();
  const pwd = document.getElementById('password').value.trim();
  if(!name || !pwd){ alert('Please enter name and password (demo).'); return; }
  user = name;
  topName.textContent = user;
  loginBox.style.display = 'none';
  testArea.style.display = 'flex';
  // NEW: Remove background image when test starts
  frontPage.style.backgroundImage = 'none';
  frontPage.style.minHeight = 'auto'; // Reset height for test mode
  document.body.style.backgroundColor = '#fafafa'; // Reset body background

  buildPalette(); renderSummary();
  updateQuestion();
  startTimer();
});

/* ---------- Timer ---------- */
function startTimer(){
  updateTimerText();
  timerInterval = setInterval(()=>{
    timerSeconds--;
    if(timerSeconds<=0){ clearInterval(timerInterval); submitTest(); }
    updateTimerText();
  },1000);
}
function updateTimerText(){
  const mm = String(Math.floor(timerSeconds/60)).padStart(2,'0');
  const ss = String(timerSeconds%60).padStart(2,'0');
  topTimer.textContent = mm + ':' + ss;
}

/* ---------- Palette & summary ---------- */
function buildPalette(){
  let html = '';
  test.forEach((t, idx)=>{
    const num = String(idx+1).padStart(2,'0');
    const cls = t.state==='answered' ? 'answered' : t.state==='marked' ? 'marked' : t.state==='not-answered' ? 'not-answered' : 'not-visited';
    html += `<div class="pbtn ${cls}" data-idx="${idx}">${num}</div>`;
  });
  paletteContainer.innerHTML = html;
  paletteContainer.querySelectorAll('.pbtn').forEach(btn=>{
    btn.addEventListener('click', ()=>{ gotoQuestion(Number(btn.dataset.idx)); });
  });
}

function renderSummary(){
  const counts = {answered:0,marked:0,'not-visited':0,'not-answered':0};
  test.forEach(t=> counts[t.state]++);
  summaryInfo.innerHTML = `
    Answered: <strong>${counts.answered}</strong> &nbsp; &nbsp;
    Marked: <strong>${counts.marked}</strong> &nbsp; &nbsp;
    Not Visited: <strong>${counts['not-visited']}</strong> &nbsp; &nbsp;
    Not Answered: <strong>${counts['not-answered']}</strong>
  `;
}

/* ---------- Question rendering & interactions ---------- */
function updateQuestion(){
  const t = test[current];
  // If first ever visiting, change not-visited -> not-answered
  if(t.state === 'not-visited') t.state = 'not-answered';
  qIndexEl.textContent = current+1;
  qSubjectEl.textContent = ({math:'Mathematics',phy:'Physics',chem:'Chemistry'})[t.subject];
  qStatusEl.textContent = `Status: ${ t.state.replace('-',' ') }`;
  const q = questionBank[t.subject][t.qIndex];
  qText.textContent = q.q;

  // options
  optionsList.innerHTML = '';
  q.options.forEach((opt,i)=>{
    const div = document.createElement('div');
    div.className = 'opt' + (t.selected===i ? ' selected' : '');
    const label = document.createElement('span'); label.className='label'; label.textContent = String.fromCharCode(65+i);
    const text = document.createElement('div'); text.className='text'; text.textContent = opt;
    div.appendChild(label); div.appendChild(text);
    div.addEventListener('click', ()=>{
      t.selected = i; t.state = 'answered';
      buildPalette(); renderSummary(); updateQuestion();
    });
    optionsList.appendChild(div);
  });

  // rebuild palette so right panel shows current colours
  buildPalette(); renderSummary();
}

/* ---------- Navigation ---------- */
function gotoQuestion(idx){
  current = idx;
  updateQuestion();
}
document.getElementById('nextBtn').addEventListener('click', ()=>{ if(current < test.length-1) current++; updateQuestion(); });
document.getElementById('backBtn').addEventListener('click', ()=>{ if(current > 0) current--; updateQuestion(); });

/* ---------- Control buttons ---------- */
document.getElementById('saveNext').addEventListener('click', ()=>{
  const t = test[current];
  t.state = (t.selected===null) ? 'not-answered' : 'answered';
  if(current < test.length-1) current++;
  updateQuestion();
});
document.getElementById('saveMark').addEventListener('click', ()=>{
  const t = test[current];
  t.state = 'marked';
  if(current < test.length-1) current++;
  updateQuestion();
});
document.getElementById('markNext').addEventListener('click', ()=>{
  const t = test[current];
  t.state = 'marked';
  if(current < test.length-1) current++;
  updateQuestion();
});
document.getElementById('clearResp').addEventListener('click', ()=>{
  const t = test[current];
  t.selected = null;
  t.state = 'not-answered';
  updateQuestion();
});
document.getElementById('endBtn').addEventListener('click', ()=>{ if(confirm('End & submit test?')) submitTest(); });
document.getElementById('submitBtn').addEventListener('click', ()=>{ if(confirm('Submit the test?')) submitTest(); });

/* ---------- Tabs behavior ---------- */
document.getElementById('tabMath').addEventListener('click', ()=>{
  // jump to first math q (index 0)
  document.querySelectorAll('.subject-btn').forEach(b=>b.classList.add('inactive'));
  document.getElementById('tabMath').classList.remove('inactive');
  gotoQuestion(0);
});
document.getElementById('tabPhy').addEventListener('click', ()=>{
  document.querySelectorAll('.subject-btn').forEach(b=>b.classList.add('inactive'));
  document.getElementById('tabPhy').classList.remove('inactive');
  gotoQuestion(10);
});
document.getElementById('tabChem').addEventListener('click', ()=>{
  document.querySelectorAll('.subject-btn').forEach(b=>b.classList.add('inactive'));
  document.getElementById('tabChem').classList.remove('inactive');
  gotoQuestion(20);
});

/* ---------- Submit & scoring ---------- */
function submitTest(){
  clearInterval(timerInterval);
  // score: 1 for correct selected, 0 otherwise (keeps it simple)
  let score = 0;
  const breakdown = {math:0,phy:0,chem:0};
  test.forEach((t, idx)=>{
    const q = questionBank[t.subject][t.qIndex];
    if(t.selected !== null && t.selected === q.answer){
      score++;
      breakdown[t.subject]++;
    }
  });
  showResult(score, breakdown);
}

function showResult(score, breakdown){
  testArea.style.display = 'none';
  resultArea.style.display = 'block';
  resName.textContent = user;
  resScore.textContent = score + ' / ' + test.length;
  resBreakdown.innerHTML = `
    <div>Mathematics: ${breakdown.math} / 10</div>
    <div>Physics: ${breakdown.phy} / 10</div>
    <div>Chemistry: ${breakdown.chem} / 10</div>
  `;
}

/* ---------- Restart ---------- */
document.getElementById('restart').addEventListener('click', ()=> location.reload());

/* ---------- Initialize small: show initial counts ---------- */
(function init(){
  // leave login visible
  renderSummary();
})();
