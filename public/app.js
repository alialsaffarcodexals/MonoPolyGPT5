// MonoPoly MVP - All client-side logic
// (c) MVP for local play. No trademarked assets used. RTL-friendly.

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// ------------ Data Definitions ------------

const COLORS = {
  BROWN: '#7a4a24',
  LIGHT_BLUE: '#68c4ff',
  PINK: '#e58ad4',
  ORANGE: '#ff9b53',
  RED: '#ff5a5a',
  YELLOW: '#ffd257',
  GREEN: '#28d47a',
  DARK_BLUE: '#2aa1ff',
  RAIL: '#9aa7c7',
  UTIL: '#a0e0ff'
};

// Simplified board (40 tiles)
// Names are generic to avoid IP, rents/house costs approximated.
const BOARD = [
  {type:'GO', name:'GO'},
  {type:'PROP', name:'Brown 1', color:'BROWN', cost:60, rent:[2,10,30,90,160,250], houseCost:50, houses:0, owner:null},
  {type:'CHEST', name:'Community Chest'},
  {type:'PROP', name:'Brown 2', color:'BROWN', cost:60, rent:[4,20,60,180,320,450], houseCost:50, houses:0, owner:null},
  {type:'TAX', name:'Income Tax', amount:200},
  {type:'RAIL', name:'Railway E', cost:200, owner:null},
  {type:'PROP', name:'LightBlue 1', color:'LIGHT_BLUE', cost:100, rent:[6,30,90,270,400,550], houseCost:50, houses:0, owner:null},
  {type:'CHANCE', name:'Chance'},
  {type:'PROP', name:'LightBlue 2', color:'LIGHT_BLUE', cost:100, rent:[6,30,90,270,400,550], houseCost:50, houses:0, owner:null},
  {type:'PROP', name:'LightBlue 3', color:'LIGHT_BLUE', cost:120, rent:[8,40,100,300,450,600], houseCost:50, houses:0, owner:null},
  {type:'JAIL', name:'Jail / Just Visiting'},
  {type:'PROP', name:'Pink 1', color:'PINK', cost:140, rent:[10,50,150,450,625,750], houseCost:100, houses:0, owner:null},
  {type:'UTIL', name:'Utility Power', cost:150, owner:null},
  {type:'PROP', name:'Pink 2', color:'PINK', cost:140, rent:[10,50,150,450,625,750], houseCost:100, houses:0, owner:null},
  {type:'PROP', name:'Pink 3', color:'PINK', cost:160, rent:[12,60,180,500,700,900], houseCost:100, houses:0, owner:null},
  {type:'RAIL', name:'Railway N', cost:200, owner:null},
  {type:'PROP', name:'Orange 1', color:'ORANGE', cost:180, rent:[14,70,200,550,750,950], houseCost:100, houses:0, owner:null},
  {type:'CHEST', name:'Community Chest'},
  {type:'PROP', name:'Orange 2', color:'ORANGE', cost:180, rent:[14,70,200,550,750,950], houseCost:100, houses:0, owner:null},
  {type:'PROP', name:'Orange 3', color:'ORANGE', cost:200, rent:[16,80,220,600,800,1000], houseCost:100, houses:0, owner:null},
  {type:'PARK', name:'Free Parking'},
  {type:'PROP', name:'Red 1', color:'RED', cost:220, rent:[18,90,250,700,875,1050], houseCost:150, houses:0, owner:null},
  {type:'CHANCE', name:'Chance'},
  {type:'PROP', name:'Red 2', color:'RED', cost:220, rent:[18,90,250,700,875,1050], houseCost:150, houses:0, owner:null},
  {type:'PROP', name:'Red 3', color:'RED', cost:240, rent:[20,100,300,750,925,1100], houseCost:150, houses:0, owner:null},
  {type:'RAIL', name:'Railway W', cost:200, owner:null},
  {type:'PROP', name:'Yellow 1', color:'YELLOW', cost:260, rent:[22,110,330,800,975,1150], houseCost:150, houses:0, owner:null},
  {type:'PROP', name:'Yellow 2', color:'YELLOW', cost:260, rent:[22,110,330,800,975,1150], houseCost:150, houses:0, owner:null},
  {type:'UTIL', name:'Utility Water', cost:150, owner:null},
  {type:'PROP', name:'Yellow 3', color:'YELLOW', cost:280, rent:[24,120,360,850,1025,1200], houseCost:150, houses:0, owner:null},
  {type:'GOJAIL', name:'Go To Jail'},
  {type:'PROP', name:'Green 1', color:'GREEN', cost:300, rent:[26,130,390,900,1100,1275], houseCost:200, houses:0, owner:null},
  {type:'PROP', name:'Green 2', color:'GREEN', cost:300, rent:[26,130,390,900,1100,1275], houseCost:200, houses:0, owner:null},
  {type:'CHEST', name:'Community Chest'},
  {type:'PROP', name:'Green 3', color:'GREEN', cost:320, rent:[28,150,450,1000,1200,1400], houseCost:200, houses:0, owner:null},
  {type:'RAIL', name:'Railway S', cost:200, owner:null},
  {type:'CHANCE', name:'Chance'},
  {type:'PROP', name:'DarkBlue 1', color:'DARK_BLUE', cost:350, rent:[35,175,500,1100,1300,1500], houseCost:200, houses:0, owner:null},
  {type:'TAX', name:'Luxury Tax', amount:100},
  {type:'PROP', name:'DarkBlue 2', color:'DARK_BLUE', cost:400, rent:[50,200,600,1400,1700,2000], houseCost:200, houses:0, owner:null},
];

const COLOR_GROUPS = {
  BROWN: [1,3],
  LIGHT_BLUE: [6,8,9],
  PINK: [11,13,14],
  ORANGE: [16,18,19],
  RED: [21,23,24],
  YELLOW: [26,27,29],
  GREEN: [31,32,34],
  DARK_BLUE: [39, 37] // note indices: last two props swapped order in array, ensure correct
};

const RAIL_INDICES = [5, 15, 25, 35];
const UTIL_INDICES = [12, 28];

// Chance and Chest decks (subset, shuffled each game)
const CHANCE_CARDS = [
  {t:'MOVE', to:0, txt:'تقدّم إلى GO واحصل على 200$'},
  {t:'GOTOJAIL', txt:'اذهب إلى السجن مباشرةً'},
  {t:'NEAREST_RAIL', txt:'تقدّم إلى أقرب سكة حديد وادفع ضعفي الإيجار إن كانت مملوكة'},
  {t:'NEAREST_UTIL', txt:'تقدّم إلى أقرب مرفق وادفع 10× نتيجة النرد إن كان مملوكًا'},
  {t:'BACK3', txt:'ارجع 3 خانات'},
  {t:'MONEY', amt:50, txt:'البنك يدفع لك أرباحًا 50$'},
  {t:'PAY', amt:15, txt:'ادفع ضريبة 15$'},
  {t:'GET_OUT', txt:'بطاقة خروج من السجن — احتفظ بها'}
];

const CHEST_CARDS = [
  {t:'MOVE', to:0, txt:'تقدّم إلى GO واحصل على 200$'},
  {t:'MONEY', amt:200, txt:'خطأ بنكي لصالحك +200$'},
  {t:'PAY', amt:50, txt:'رسوم الطبيب -50$'},
  {t:'MONEY', amt:100, txt:'عائد بوليصة تأمين الحياة +100$'},
  {t:'PAY', amt:100, txt:'رسوم المستشفى -100$'},
  {t:'MONEY', amt:20, txt:'استرداد ضرائب +20$'},
  {t:'GET_OUT', txt:'بطاقة خروج من السجن — احتفظ بها'},
  {t:'GOTOJAIL', txt:'اذهب إلى السجن مباشرةً'}
];

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ------------ State ------------
const state = {
  started:false,
  players:[], // {id,name,color,cash,pos,inJail,jailTries,getOutCards,isBot,bankrupt:false}
  turn:0,
  doublesCount:0,
  dice:[0,0],
  chance:[],
  chest:[],
  lastAction:null,
};

const START_CASH = 1500;

// ------------ UI Setup ------------
function initSetup(){
  const cfgWrap = $('#players-config');
  cfgWrap.innerHTML = '';
  const count = parseInt($('#player-count').value,10);
  for(let i=0;i<count;i++){
    const row = document.createElement('div');
    row.className = 'cfg';
    row.innerHTML = `
      <input class="select" id="pname-${i}" placeholder="اسم اللاعب ${i+1}" value="${['سراج','لين','مها','وليد'][i] || ('لاعب '+(i+1))}"/>
      <select class="select" id="ptype-${i}">
        <option value="human" ${i===0 ? 'selected':''}>بشري</option>
        <option value="bot" ${i>0 ? 'selected':''}>بوت</option>
      </select>
    `;
    cfgWrap.appendChild(row);
  }
}
$('#player-count').addEventListener('change', initSetup);
initSetup();

$('#toggle-help').addEventListener('click', ()=> $('#help').classList.toggle('hidden'));

$('#start-game').addEventListener('click', startGame);

function startGame(){
  const count = parseInt($('#player-count').value,10);
  state.players = [];
  for(let i=0;i<count;i++){
    const name = $('#pname-'+i).value.trim() || ('لاعب '+(i+1));
    const type = $('#ptype-'+i).value;
    state.players.push({
      id:i,
      name,
      color:['#00ffc6','#5cc4ff','#ffc06b','#ff7aa5'][i],
      cash:START_CASH,
      pos:0,
      inJail:false,
      jailTries:0,
      getOutCards:0,
      isBot: type==='bot',
      bankrupt:false
    });
  }
  state.turn = 0;
  state.doublesCount = 0;
  state.chance = shuffle(CHANCE_CARDS);
  state.chest = shuffle(CHEST_CARDS);
  state.started = true;
  $('#setup').classList.add('hidden');
  $('#controls').classList.remove('hidden');
  $('#build-panel').classList.add('hidden');
  $('#help').classList.add('hidden');
  logClear();
  renderBoard();
  renderSidebar();
  updateTurnIndicator();
  botIfNeeded();
}

// ------------ Rendering ------------
function renderBoard(){
  const board = $('#board');
  board.innerHTML = '';
  // Build 11x11 grid with corner/edges populated by BOARD order clockwise
  // Map indices to grid positions
  const positions = indexToGridPositions();
  for(let i=0;i<121;i++){
    const cell = document.createElement('div');
    // Check if this index corresponds to a tile
    const idx = positions.findIndex(p=>p.gridIndex===i);
    if(idx>=0){
      const tileIndex = positions[idx].tileIndex;
      const tile = BOARD[tileIndex];
      cell.className = 'tile';
      const stripe = document.createElement('div');
      stripe.className = 'stripe';
      if(tile.type==='PROP'){
        stripe.style.background = COLORS[tile.color] || '#999';
      }else if(tile.type==='RAIL'){
        stripe.style.background = COLORS.RAIL;
      }else if(tile.type==='UTIL'){
        stripe.style.background = COLORS.UTIL;
      }else{
        stripe.style.background = 'linear-gradient(90deg,#223163,#1b2a57)';
      }
      const name = document.createElement('span');
      name.className='name';
      name.textContent = tile.name;
      cell.appendChild(stripe);
      cell.appendChild(name);

      // owner dot
      if(tile.owner!=null){
        const dot = document.createElement('div');
        dot.className = 'owner-dot';
        dot.style.background = state.players[tile.owner].color;
        cell.appendChild(dot);
      }
      // houses/hotel
      if(tile.type==='PROP' && tile.houses>0){
        const hs = document.createElement('div');
        hs.className='houses';
        const isHotel = tile.houses===5;
        const count = isHotel?1:tile.houses;
        for(let j=0;j<count;j++){
          const h = document.createElement('div');
          h.className = isHotel? 'hotel':'house';
          hs.appendChild(h);
        }
        cell.appendChild(hs);
      }
      // players on this tile
      const playersHere = state.players.filter(p=>!p.bankrupt && p.pos===tileIndex);
      playersHere.forEach(ph=>{
        const pp = document.createElement('div');
        pp.className = 'player ' + ('p'+ph.id);
        pp.title = ph.name;
        cell.appendChild(pp);
      });

    }else{
      cell.style.visibility='hidden';
    }
    board.appendChild(cell);
  }
}

function indexToGridPositions(){
  // Return mapping of 40 tiles to 11x11 grid cell indexes (0..120)
  // Bottom row left->right: 0..10 (tiles 0..10)
  // Right col bottom->top: 11..20 (tiles 11..20)
  // Top row right->left: 21..31 (tiles 21..30)
  // Left col top->bottom: 32..41 (tiles 31..39) (note 40th doesn't exist; 0 already used)
  const arr = [];
  const gridIndex = (r,c)=> r*11 + c;

  // bottom row
  for(let c=10;c>=0;c--){
    arr.push({tileIndex: 10 - c, gridIndex: gridIndex(10,c)});
  }
  // right col (excluding bottom and top corners)
  for(let r=9;r>=1;r--){
    arr.push({tileIndex: 10 + (10 - r), gridIndex: gridIndex(r,10)});
  }
  // top row
  for(let c=9;c>=0;c--){
    arr.push({tileIndex: 20 + (9 - c), gridIndex: gridIndex(0,c)});
  }
  // left col
  for(let r=1;r<=9;r++){
    arr.push({tileIndex: 30 + (r - 1), gridIndex: gridIndex(r,0)});
  }
  return arr;
}

function renderSidebar(){
  const log = $('#log');
  const info = state.players.map(p=>{
    const status = p.bankrupt ? '<span class="bankrupt">مفلس</span>' : `$${p.cash}`;
    return `<div class="player-card"><div><b style="color:${p.color}">■</b> ${p.name}</div><div>${status}</div></div>`;
  }).join('');
  log.insertAdjacentHTML('afterbegin', `<div class="sidebar-group">${info}</div>`);
  // Controls state
  const cur = currentPlayer();
  $('#btn-roll').disabled = false;
  $('#btn-buy').disabled = true;
  $('#btn-skip').disabled = true;
  $('#btn-end').disabled = true;
  if(cur.isBot || cur.bankrupt || !state.started) {
    $('#btn-roll').disabled = true;
    $('#btn-buy').disabled = true;
    $('#btn-skip').disabled = true;
    $('#btn-end').disabled = true;
  }
}

function updateTurnIndicator(){
  const cur = currentPlayer();
  $('#turn-indicator').textContent = `الدور: ${cur ? cur.name : '-'}`;
  $('#dice-indicator').textContent = `النرد: ${state.dice[0]||'-'} + ${state.dice[1]||'-'}`;
}

// ------------ Logging ------------
function logClear(){
  $('#log').innerHTML = '';
}
function logMsg(msg){
  const el = document.createElement('div');
  el.innerHTML = msg;
  $('#log').prepend(el);
}

// ------------ Game Flow ------------
function currentPlayer(){ return state.players[state.turn]; }

$('#btn-roll').addEventListener('click', onRoll);
$('#btn-buy').addEventListener('click', onBuy);
$('#btn-skip').addEventListener('click', onSkip);
$('#btn-end').addEventListener('click', endTurn);
$('#btn-build').addEventListener('click', ()=>{
  $('#build-panel').classList.toggle('hidden');
  renderBuildPanel();
});

function onRoll(){
  const p = currentPlayer();
  if(!p || p.bankrupt) return;
  if(p.inJail){
    // Try for doubles, else option to pay 50 (auto-pay on 3rd try)
    const d1 = 1 + Math.floor(Math.random()*6);
    const d2 = 1 + Math.floor(Math.random()*6);
    state.dice = [d1,d2];
    updateTurnIndicator();
    if(d1===d2){
      p.inJail = false;
      p.jailTries = 0;
      logMsg(`🎲 ${p.name} خرج من السجن بالدبل (${d1}+${d2}) ويتحرك ${d1+d2} خانات.`);
      movePlayer(p, d1+d2, true);
      state.doublesCount = 1; // counts as first double
    }else{
      p.jailTries++;
      if(p.getOutCards>0){
        // auto use card
        p.getOutCards--;
        p.inJail = false;
        p.jailTries = 0;
        logMsg(`🔑 ${p.name} استخدم بطاقة الخروج من السجن.`);
        // still no move this turn; allow roll again?
        enableEndOnly();
      }else if(p.jailTries>=3){
        // auto pay 50
        changeCash(p, -50);
        p.inJail=false; p.jailTries=0;
        logMsg(`💸 ${p.name} دفع 50$ للخروج بعد 3 محاولات. تحرك الآن.`);
      }else{
        logMsg(`🚫 ${p.name} فشل في الخروج (${d1}+${d2}). محاولات: ${p.jailTries}/3`);
        enableEndOnly();
        return;
      }
      if(!p.inJail){
        const steps = d1 + d2;
        movePlayer(p, steps, true);
      }
    }
    return;
  }

  const d1 = 1 + Math.floor(Math.random()*6);
  const d2 = 1 + Math.floor(Math.random()*6);
  state.dice = [d1,d2];
  updateTurnIndicator();
  const sum = d1 + d2;

  if(d1===d2){
    state.doublesCount++;
    logMsg(`🎲 ${p.name} حصل على دبل (${d1}+${d2}) ويتحرك ${sum}. الدبل المتتالي: ${state.doublesCount}`);
    if(state.doublesCount>=3){
      sendToJail(p, '3 دبلات متتالية');
      enableEndOnly();
      return;
    }
  }else{
    state.doublesCount=0;
  }

  movePlayer(p, sum, true);
}

function movePlayer(p, steps, fromRoll=false){
  const before = p.pos;
  p.pos = (p.pos + steps) % BOARD.length;
  renderBoard();
  // Pass GO
  if(before > p.pos){
    changeCash(p, +200);
    logMsg(`💰 ${p.name} مرّ عبر GO واستلم 200$`);
  }
  const tile = BOARD[p.pos];
  handleTile(p, tile, fromRoll);
}

function handleTile(p, tile, fromRoll){
  if(tile.type==='GO'){
    // nothing
    enableEndOnly();
  }else if(tile.type==='PROP'){
    if(tile.owner==null){
      logMsg(`🏠 ${p.name} وصل إلى ملكية فارغة: <b>${tile.name}</b> — سعرها $${tile.cost}`);
      $('#btn-buy').disabled = false;
      $('#btn-skip').disabled = false;
      $('#btn-end').disabled = true;
    }else if(tile.owner === p.id){
      logMsg(`🏠 ${p.name} وصل إلى ملكيته: <b>${tile.name}</b>.`);
      enableEndOnly();
    }else{
      const rent = calcRent(tile, state.players[tile.owner]);
      takeRent(p, tile.owner, rent, tile.name);
      enableEndOnly();
    }
  }else if(tile.type==='RAIL'){
    if(tile.owner==null){
      logMsg(`🚆 ${p.name} وصل إلى سكة حديد: <b>${tile.name}</b> — سعرها $${tile.cost}`);
      $('#btn-buy').disabled = false;
      $('#btn-skip').disabled = false;
      $('#btn-end').disabled = true;
    }else if(tile.owner===p.id){
      logMsg(`🚆 ${p.name} وصل إلى سكة يملكها: <b>${tile.name}</b>.`);
      enableEndOnly();
    }else{
      const owned = countRails(tile.owner);
      const rentTable = [0,25,50,100,200];
      const rent = rentTable[owned];
      takeRent(p, tile.owner, rent, tile.name);
      enableEndOnly();
    }
  }else if(tile.type==='UTIL'){
    if(tile.owner==null){
      logMsg(`⚙️ ${p.name} وصل إلى مرفق: <b>${tile.name}</b> — سعرها $${tile.cost}`);
      $('#btn-buy').disabled = false;
      $('#btn-skip').disabled = false;
      $('#btn-end').disabled = true;
    }else if(tile.owner===p.id){
      logMsg(`⚙️ ${p.name} وصل إلى مرفق يملكه.`);
      enableEndOnly();
    }else{
      const utilOwned = countUtils(tile.owner);
      const mult = utilOwned>=2 ? 10 : 4;
      const diceSum = state.dice[0]+state.dice[1];
      const rent = diceSum * mult;
      takeRent(p, tile.owner, rent, tile.name);
      enableEndOnly();
    }
  }else if(tile.type==='TAX'){
    changeCash(p, -tile.amount);
    logMsg(`💸 ${p.name} دفع ضريبة ${tile.name}: $${tile.amount}`);
    enableEndOnly();
  }else if(tile.type==='JAIL'){
    logMsg(`🛏️ ${p.name} في خانة السجن (زيارة فقط).`);
    enableEndOnly();
  }else if(tile.type==='GOJAIL'){
    sendToJail(p, 'أمر الذهاب إلى السجن');
    enableEndOnly();
  }else if(tile.type==='PARK'){
    logMsg(`🅿️ ${p.name} توقّف في انتظار مجاني.`);
    enableEndOnly();
  }else if(tile.type==='CHANCE'){
    drawCard(p, 'CHANCE');
  }else if(tile.type==='CHEST'){
    drawCard(p, 'CHEST');
  }
}

function enableEndOnly(){
  $('#btn-buy').disabled = true;
  $('#btn-skip').disabled = true;
  $('#btn-end').disabled = false;
  $('#btn-roll').disabled = true;
}

function onBuy(){
  const p = currentPlayer();
  const tile = BOARD[p.pos];
  if(tile.owner!=null) return;
  if(p.cash < tile.cost){
    logMsg(`❌ ${p.name} لا يملك ما يكفي للشراء.`);
    enableEndOnly();
    return;
  }
  changeCash(p, -tile.cost);
  tile.owner = p.id;
  logMsg(`✅ ${p.name} اشترى <b>${tile.name}</b> مقابل $${tile.cost}`);
  $('#btn-buy').disabled = true;
  $('#btn-skip').disabled = true;
  $('#btn-end').disabled = false;
  renderBoard();
  renderBuildPanel(); // ownership may unlock builds
}

function onSkip(){
  $('#btn-buy').disabled = true;
  $('#btn-skip').disabled = true;
  $('#btn-end').disabled = false;
}

function endTurn(){
  // If doubles, allow extra roll for same player
  if(state.dice[0]===state.dice[1] && !currentPlayer().inJail){
    logMsg(`♻️ دبل — يحصل ${currentPlayer().name} على رمية إضافية.`);
    $('#btn-roll').disabled = false;
    $('#btn-end').disabled = true;
    return;
  }

  // next player
  const alive = state.players.filter(p=>!p.bankrupt).length;
  if(alive<=1){
    const winner = state.players.find(p=>!p.bankrupt);
    logMsg(`🏆 الفائز: <b>${winner ? winner.name : 'لا أحد'}</b>`);
    $('#btn-roll').disabled = true;
    $('#btn-buy').disabled = true;
    $('#btn-skip').disabled = true;
    $('#btn-end').disabled = true;
    return;
  }

  let n = state.players.length;
  do{
    state.turn = (state.turn + 1) % n;
  }while(state.players[state.turn].bankrupt);

  state.doublesCount = 0;
  state.dice=[0,0];
  updateTurnIndicator();
  renderSidebar();
  botIfNeeded();
}

function botIfNeeded(){
  const p = currentPlayer();
  if(!p || !p.isBot || p.bankrupt) return;
  // Simple bot: roll after 800ms, then auto-buy if afford and sensible
  setTimeout(()=>{
    onRoll();
    setTimeout(()=>{
      const tile = BOARD[p.pos];
      const canBuy = (tile.type==='PROP' || tile.type==='RAIL' || tile.type==='UTIL') && tile.owner==null;
      if(canBuy){
        const afford = p.cash > tile.cost + 150; // keep cushion
        if(afford) onBuy();
        else onSkip();
      }
      setTimeout(()=> endTurn(), 600);
    }, 600);
  }, 800);
}

// ------------ Rent & Money ------------
function changeCash(player, delta){
  player.cash += delta;
  renderSidebar();
  if(player.cash<0){
    // Bankruptcy in MVP: immediate bankruptcy; properties return to bank
    logMsg(`💥 ${player.name} أفلس! تؤول ممتلكاته للبنك.`);
    player.bankrupt = true;
    for(const t of BOARD){
      if(t.owner===player.id){
        t.owner = null;
        if(t.type==='PROP'){ t.houses=0; }
      }
    }
    renderBoard();
  }
}

function takeRent(payer, ownerId, amount, tileName){
  if(payer.bankrupt) return;
  logMsg(`💸 ${payer.name} يدفع إيجار <b>${tileName}</b>: $${amount} إلى ${state.players[ownerId].name}`);
  changeCash(payer, -amount);
  if(!payer.bankrupt){
    changeCash(state.players[ownerId], +amount);
  }
}

function countRails(ownerId){
  return RAIL_INDICES.filter(i=>BOARD[i].owner===ownerId).length;
}
function countUtils(ownerId){
  return UTIL_INDICES.filter(i=>BOARD[i].owner===ownerId).length;
}

function ownsFullSet(ownerId, color){
  const indices = COLOR_GROUPS[color] || [];
  return indices.length>0 && indices.every(i=>BOARD[i].owner===ownerId);
}

function calcRent(tile, owner){
  if(tile.type!=='PROP') return 0;
  const hasSet = ownsFullSet(owner.id, tile.color);
  const houses = tile.houses||0;
  if(houses===0){
    // base rent, doubled if owns full set
    const base = tile.rent[0];
    return hasSet? base*2 : base;
  }else{
    // houses 1..4, hotel 5
    return tile.rent[houses];
  }
}

// ------------ Build Manager ------------
function renderBuildPanel(){
  const me = currentPlayer();
  const wrap = $('#build-list');
  wrap.innerHTML='';
  if(!me) return;
  // List properties owned by me where I own full set
  const myProps = BOARD.map((t,i)=>({...t, i})).filter(t=>t.type==='PROP' && t.owner===me.id);
  const groups = {};
  myProps.forEach(p=>{
    (groups[p.color] = groups[p.color] || []).push(p);
  });
  const entries = Object.entries(groups).filter(([color, props])=> ownsFullSet(me.id, color));
  if(entries.length===0){
    wrap.innerHTML = '<div class="build-item"><div>لا توجد مجموعات مكتملة للبناء.</div></div>';
    return;
  }
  // Ensure even-building rule: can't build more than +1 of min within group
  for(const [color, props] of entries){
    const minH = Math.min(...props.map(p=>p.houses||0));
    const maxH = Math.max(...props.map(p=>p.houses||0));
    // UI rows per property
    props.sort((a,b)=>a.i-b.i).forEach(prop=>{
      const canBuild = (prop.houses<5) && (prop.houses<=minH); // even rule
      const price = prop.houseCost;
      const row = document.createElement('div');
      row.className='build-item';
      row.innerHTML = `
        <div>
          <b style="color:${COLORS[color]}">■</b> ${prop.name}
          <div class="meta">منازل: ${prop.houses||0} ${prop.houses===5?'(فندق)':''} — تكلفة البناء: $${price}</div>
        </div>
        <button class="secondary btn-build" data-idx="${prop.i}" ${canBuild?'':'disabled'}>إضافة منزل</button>
        <button class="ghost btn-sell" data-idx="${prop.i}" ${(prop.houses>0)?'':'disabled'}>بيع منزل</button>
      `;
      wrap.appendChild(row);
    });
  }
  $$('.btn-build').forEach(b=> b.addEventListener('click', onBuildHouse));
  $$('.btn-sell').forEach(b=> b.addEventListener('click', onSellHouse));
}

function onBuildHouse(e){
  const idx = parseInt(e.currentTarget.dataset.idx,10);
  const prop = BOARD[idx];
  const me = currentPlayer();
  if(me.cash < prop.houseCost){
    logMsg(`❌ ${me.name} لا يملك ما يكفي للبناء على ${prop.name}.`);
    return;
  }
  if(prop.houses>=5) return;
  // even rule check
  const grp = COLOR_GROUPS[prop.color].map(i=>BOARD[i]);
  const minH = Math.min(...grp.map(p=>p.houses||0));
  if((prop.houses||0) > minH) {
    logMsg(`⚠️ يجب البناء بالتساوي ضمن المجموعة.`);
    return;
  }
  changeCash(me, -prop.houseCost);
  prop.houses = (prop.houses||0) + 1;
  if(prop.houses===5){
    logMsg(`🏨 ${me.name} بنى فندقًا على ${prop.name}.`);
  }else{
    logMsg(`🏠 ${me.name} بنى منزلًا (${prop.houses}) على ${prop.name}.`);
  }
  renderBoard();
  renderBuildPanel();
}

function onSellHouse(e){
  const idx = parseInt(e.currentTarget.dataset.idx,10);
  const prop = BOARD[idx];
  const me = currentPlayer();
  if((prop.houses||0)<=0) return;
  // even rule: cannot sell to create >1 difference; allow selling from max
  const grp = COLOR_GROUPS[prop.color].map(i=>BOARD[i]);
  const maxH = Math.max(...grp.map(p=>p.houses||0));
  if(prop.houses < maxH){
    logMsg(`⚠️ يجب البيع بالتساوي ضمن المجموعة (ابدأ من الأعلى).`);
    return;
  }
  // receive half house cost on sale
  prop.houses--;
  const refund = Math.floor(prop.houseCost/2);
  changeCash(me, +refund);
  if(prop.houses===4){
    logMsg(`🏠 تم بيع الفندق وتحويله إلى 4 منازل على ${prop.name}. استرجاع $${refund}.`);
  }else{
    logMsg(`↩️ ${me.name} باع منزلًا من ${prop.name}. استرجاع $${refund}.`);
  }
  renderBoard();
  renderBuildPanel();
}

// ------------ Cards (Chance/Chest) ------------
function drawCard(p, type){
  const deck = (type==='CHANCE') ? state.chance : state.chest;
  if(deck.length===0){
    if(type==='CHANCE') state.chance = shuffle(CHANCE_CARDS);
    else state.chest = shuffle(CHEST_CARDS);
  }
  const card = deck.shift();
  logMsg(`📜 ${p.name} سحب بطاقة: <i>${card.txt}</i>`);
  applyCard(p, card, type);
}

function applyCard(p, card, type){
  switch(card.t){
    case 'MOVE':
      moveTo(p, card.to, true);
      break;
    case 'GOTOJAIL':
      sendToJail(p, 'بطاقة');
      break;
    case 'NEAREST_RAIL':
      {
        const next = findNextOf(p.pos, RAIL_INDICES);
        moveTo(p, next, true);
        const tile = BOARD[next];
        if(tile.owner!=null && tile.owner!==p.id){
          const owned = countRails(tile.owner);
          const rentTable = [0,25,50,100,200];
          const rent = rentTable[owned]*2;
          takeRent(p, tile.owner, rent, tile.name + ' (ضعف)');
        }
      }
      break;
    case 'NEAREST_UTIL':
      {
        const next = findNextOf(p.pos, UTIL_INDICES);
        moveTo(p, next, true);
        const tile = BOARD[next];
        if(tile.owner!=null && tile.owner!==p.id){
          const diceSum = state.dice[0]+state.dice[1] || (2+Math.floor(Math.random()*10));
          const utilOwned = countUtils(tile.owner);
          const mult = utilOwned>=2 ? 10 : 4;
          const rent = diceSum * mult;
          takeRent(p, tile.owner, rent, tile.name);
        }
      }
      break;
    case 'BACK3':
      movePlayer(p, -3, false);
      break;
    case 'MONEY':
      changeCash(p, +card.amt);
      break;
    case 'PAY':
      changeCash(p, -card.amt);
      break;
    case 'GET_OUT':
      p.getOutCards++;
      break;
  }
  enableEndOnly();
}
function moveTo(p, index, collectGo){
  const before = p.pos;
  p.pos = index;
  if(collectGo && before > index){
    changeCash(p, +200);
    logMsg(`💰 ${p.name} مرّ عبر GO واستلم 200$`);
  }
  renderBoard();
  const tile = BOARD[p.pos];
  handleTile(p, tile, false);
}

function sendToJail(p, reason){
  p.pos = 10; // Jail tile index
  p.inJail = true;
  p.jailTries = 0;
  state.doublesCount = 0;
  renderBoard();
  logMsg(`🚔 ${p.name} إلى السجن (${reason}).`);
}

function findNextOf(from, indices){
  let dist = 1;
  while(dist<41){
    const idx = (from + dist) % BOARD.length;
    if(indices.includes(idx)) return idx;
    dist++;
  }
  return from;
}
