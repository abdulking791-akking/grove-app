const STORAGE_KEY = 'grove-habits-v1';
let habits = [];

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    habits = raw ? JSON.parse(raw) : [];
  } catch (e) {
    habits = [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  } catch (e) {
    // storage unavailable, fail silently
  }
}

function addHabit(name) {
  habits.push({ id: Date.now(), name: name, streak: 0, lastDone: null });
  save();
  render();
}

function toggleDone(id) {
  const h = habits.find(function (h) { return h.id === id; });
  if (!h) return;

  const today = todayStr();

  if (h.lastDone === today) {
    h.lastDone = null;
    h.streak = Math.max(0, h.streak - 1);
  } else {
    if (h.lastDone === yesterdayStr()) {
      h.streak += 1;
    } else {
      h.streak = 1;
    }
    h.lastDone = today;
  }

  save();
  render();
}

function deleteHabit(id) {
  habits = habits.filter(function (h) { return h.id !== id; });
  save();
  render();
}

function render() {
  const list = document.getElementById('list');
  const stats = document.getElementById('stats');
  const today = todayStr();

  if (habits.length === 0) {
    list.innerHTML = '<div class="empty">No habits yet — add your first one above.</div>';
    stats.innerHTML = '';
    return;
  }

  list.innerHTML = habits.map(function (h) {
    const done = h.lastDone === today;
    return (
      '<div class="habit">' +
        '<button class="check ' + (done ? 'done' : '') + '" onclick="toggleDone(' + h.id + ')">' + (done ? '✓' : '') + '</button>' +
        '<div class="habit-name ' + (done ? 'done' : '') + '">' + h.name + '</div>' +
        '<div class="streak">' + (h.streak > 0 ? h.streak + ' day' + (h.streak > 1 ? 's' : '') : '') + '</div>' +
        '<button class="del" onclick="deleteHabit(' + h.id + ')">×</button>' +
      '</div>'
    );
  }).join('');

  const doneToday = habits.filter(function (h) { return h.lastDone === today; }).length;
  stats.innerHTML = '<span>' + habits.length + ' habit' + (habits.length !== 1 ? 's' : '') + '</span><span>' + doneToday + ' done today</span>';
}

document.getElementById('addBtn').addEventListener('click', function () {
  const input = document.getElementById('habitInput');
  const val = input.value.trim();
  if (val) {
    addHabit(val);
    input.value = '';
    input.focus();
  }
});

document.getElementById('habitInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    document.getElementById('addBtn').click();
  }
});

load();
render();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(function (err) {
    console.log('Service worker failed:', err);
  });
}