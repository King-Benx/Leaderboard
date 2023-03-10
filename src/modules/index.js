import '../styles/style.scss';
// Initialize DOM elements of interest
const tableBody = document.getElementById('table-body');
const formName = document.getElementById('name');
const formScore = document.getElementById('score');
const sumbitButton = document.getElementById('submit');
const form = document.getElementById('form');
const refreshButton = document.getElementById('refresh-btn');
// Initialize app data
let GAME_ID = null;
const BASE_URL = 'https://us-central1-js-capstone-backend.cloudfunctions.net/api/';

// This function creates a single child table data node
const singleView = (name, score) => {
  const row = document.createElement('tr');
  const data = document.createElement('td');
  data.innerHTML = `${name}: ${score}`;
  row.append(data);
  tableBody.append(row);
};

// This sets up the game and keeps track of it
const createGame = async () => {
  const localData = localStorage.getItem('leaderboardGameId');
  if (localData) {
    GAME_ID = localData;
  }
  if (!localData) {
    GAME_ID = await fetch(`${BASE_URL}games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Leaderboard Game',
      }),
    }).then((res) => res.json()).then((data) => data.result.split(' ')[3]);
    localStorage.setItem('leaderboardGameId', GAME_ID);
  }
};

// This populates the DOM with updated content
const updateViews = (data) => {
  tableBody.innerHTML = '';
  for (let i = 0; i < data?.length; i += 1) {
    const { user, score } = data[i];
    singleView(user, score);
  }
};

// This fetches updated data from the api
const refresh = async () => {
  await fetch(`${BASE_URL}games/${GAME_ID}/scores`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => res.json()).then((data) => updateViews(data.result));
};

// This handles creation of new records
sumbitButton.addEventListener('click', async (e) => {
  e.preventDefault();
  const user = formName.value;
  const score = formScore.value;
  await fetch(`${BASE_URL}games/${GAME_ID}/scores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user,
      score,
    }),
  }).then(() => {
    form.reset();
    refresh();
  });
});

// Triggers a refresh of data;
refreshButton.addEventListener('click', () => refresh());

// Initializes the application
const initialize = async () => {
  form.reset();
  await createGame();
  await refresh();
};

document.addEventListener('DOMContentLoaded', () => initialize());