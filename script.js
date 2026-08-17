const targetWord = "DATE";
const letters = [...document.querySelectorAll('.letter-box input')];
const puzzleCard = document.getElementById('puzzleCard');
const questionCard = document.getElementById('questionCard');
const dateCard = document.getElementById('dateCard');
const checkWordBtn = document.getElementById('checkWordBtn');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const questionArea = document.getElementById('questionArea');
const dateForm = document.getElementById('dateForm');
const successMessage = document.getElementById('successMessage');
const attemptHistory = document.getElementById('attemptHistory');
const currentMonthLabel = document.getElementById('currentMonthLabel');
const calendarGrid = document.getElementById('calendarGrid');
const selectedDateInput = document.getElementById('selectedDateInput');
const selectedDateText = document.getElementById('selectedDateText');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const timeHourInput = document.getElementById('timeHourInput');
const timeMinuteInput = document.getElementById('timeMinuteInput');
const timeInput = document.getElementById('timeInput');

let attemptList = [];
let currentMonthDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedDate = null;

function validateLetters() {
  return letters.every((input) => input.value.trim() !== '');
}

function getGuess() {
  return letters.map((input) => input.value.trim().toUpperCase()).join('');
}

function renderAttemptHistory() {
  attemptHistory.innerHTML = '';

  if (attemptList.length === 0) {
    attemptHistory.classList.add('hidden');
    return;
  }

  attemptHistory.classList.remove('hidden');

  attemptList.forEach((attempt) => {
    const attemptCard = document.createElement('div');
    attemptCard.className = 'attempt-card';

    const lettersMarkup = attempt.guess
      .split('')
      .map((letter, index) => {
        const status = attempt.result[index];
        const stateClass = status === 'correct' ? 'letter-good' : status === 'partial' ? 'letter-partial' : 'letter-bad';
        return `<span class="${stateClass}">${letter}</span>`;
      })
      .join('');

    attemptCard.innerHTML = lettersMarkup;
    attemptHistory.appendChild(attemptCard);
  });
}

function applyColorFeedback() {
  const guess = getGuess();
  const result = Array(guess.length).fill('bad');
  const letterCounts = {};

  for (let i = 0; i < targetWord.length; i += 1) {
    const letter = targetWord[i];
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  }

  for (let i = 0; i < guess.length; i += 1) {
    if (guess[i] === targetWord[i]) {
      result[i] = 'correct';
      letterCounts[guess[i]] -= 1;
    }
  }

  for (let i = 0; i < guess.length; i += 1) {
    if (result[i] === 'correct') continue;
    if (targetWord.includes(guess[i]) && letterCounts[guess[i]] > 0) {
      result[i] = 'partial';
      letterCounts[guess[i]] -= 1;
    }
  }

  letters.forEach((input, index) => {
    const box = input.parentElement;
    box.classList.remove('correct', 'incorrect', 'partial');

    const letter = input.value.trim().toUpperCase();
    if (!letter) return;

    if (result[index] === 'correct') {
      box.classList.add('correct');
      return;
    }

    if (result[index] === 'partial') {
      box.classList.add('partial');
      return;
    }

    box.classList.add('incorrect');
  });

  attemptList.push({ guess, result });
  renderAttemptHistory();

  if (guess === targetWord) {
    puzzleCard.classList.add('hidden');
    questionCard.classList.remove('hidden');
  }
}

letters.forEach((input, index) => {
  input.addEventListener('input', (event) => {
    const value = event.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 1).toUpperCase();
    event.target.value = value;

    if (value && index < letters.length - 1) {
      letters[index + 1].focus();
    }
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace' && !input.value && index > 0) {
      letters[index - 1].focus();
    }
  });
});

checkWordBtn.addEventListener('click', () => {
  if (!validateLetters()) {
    alert('Remplis bien les 4 cases avant de vérifier.');
    return;
  }

  applyColorFeedback();
});

function moveNoButton() {
  const rect = questionArea.getBoundingClientRect();
  const maxX = Math.max(rect.width - noBtn.offsetWidth - 18, 0);
  const maxY = Math.max(rect.height - noBtn.offsetHeight - 18, 0);

  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  noBtn.style.position = 'absolute';
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

noBtn.addEventListener('mouseenter', moveNoButton);
noBtn.addEventListener('pointerenter', moveNoButton);
noBtn.addEventListener('touchstart', (event) => {
  event.preventDefault();
  moveNoButton();
}, { passive: false });
noBtn.addEventListener('click', (event) => {
  event.preventDefault();
  moveNoButton();
});

yesBtn.addEventListener('click', () => {
  questionCard.classList.add('hidden');
  dateCard.classList.remove('hidden');
});

function formatDateForDisplay(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function updateSelectedDateDisplay() {
  if (!selectedDate) {
    selectedDateText.textContent = 'Aucune date sélectionnée';
    selectedDateInput.value = '';
    return;
  }

  selectedDateText.textContent = `Date choisie : ${formatDateForDisplay(selectedDate)}`;
  selectedDateInput.value = selectedDate.toISOString().split('T')[0];
}

function renderCalendar() {
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDay = firstDayOfMonth.getDay();
  const totalDaysInMonth = lastDayOfMonth.getDate();
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  currentMonthLabel.textContent = new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric'
  }).format(currentMonthDate);

  const cells = [];

  for (let i = startDay - 1; i >= 0; i -= 1) {
    const dayNumber = totalDaysInPrevMonth - i;
    cells.push({ day: dayNumber, isCurrentMonth: false, isMuted: true });
  }

  for (let day = 1; day <= totalDaysInMonth; day += 1) {
    cells.push({ day, isCurrentMonth: true, isMuted: false });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length % 7, isCurrentMonth: false, isMuted: true });
  }

  calendarGrid.innerHTML = '';

  cells.forEach((cell) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'calendar-day';

    if (cell.isMuted) {
      button.classList.add('is-muted');
    }

    const currentDate = new Date(year, month, cell.day);
    currentDate.setHours(0, 0, 0, 0);

    if (cell.isCurrentMonth && currentDate >= today) {
      button.disabled = false;
      if (selectedDate && selectedDate.getTime() === currentDate.getTime()) {
        button.classList.add('is-selected');
      }

      if (currentDate.getTime() === today.getTime()) {
        button.classList.add('is-today');
      }

      button.textContent = cell.day;
      button.addEventListener('click', () => {
        selectedDate = currentDate;
        renderCalendar();
        updateSelectedDateDisplay();
      });
    } else {
      button.classList.add('is-muted');
      button.disabled = true;
      button.textContent = cell.day;
    }

    calendarGrid.appendChild(button);
  });
}

prevMonthBtn.addEventListener('click', () => {
  currentMonthDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1);
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentMonthDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1);
  renderCalendar();
});

function updateTimeValue() {
  if (!timeHourInput.value || !timeMinuteInput.value) {
    timeInput.value = '';
    return;
  }

  timeInput.value = `${timeHourInput.value}:${timeMinuteInput.value}`;
}

timeHourInput.addEventListener('change', updateTimeValue);
timeMinuteInput.addEventListener('change', updateTimeValue);

dateForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!selectedDate) {
    alert('Choisis un jour dans le calendrier avant de valider.');
    return;
  }

  const timeValue = timeInput.value;
  const activityValue = document.getElementById('activityInput').value;

  if (!timeValue || !activityValue) {
    alert('Ajoute aussi une heure et une activité.');
    return;
  }

  const payload = {
    date: selectedDate.toISOString().split('T')[0],
    time: timeValue,
    activity: activityValue
  };

  successMessage.textContent = `C'est parfait ! On se voit le ${formatDateForDisplay(selectedDate)} à ${timeValue} pour ${activityValue}.`;
  successMessage.classList.remove('hidden');

  fetch('/api/date', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l’envoi');
      }

      console.log('Mail envoyé avec succès', data);
    })
    .catch((error) => {
      console.error('Erreur:', error);
      successMessage.textContent = 'La date est bien enregistrée, mais l’envoi du mail a échoué. Vérifie la configuration email.';
    })
    .finally(() => {
      dateForm.reset();
      timeInput.value = '';
      selectedDate = null;
      updateSelectedDateDisplay();
      renderCalendar();
    });
});

renderAttemptHistory();
renderCalendar();
updateSelectedDateDisplay();
