let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft;
let selectedTopic;
let selectedDifficulty;
let selectedQuestionCount;
let selectedQuestions;
let currentUser = null;

// Database of registered users
const registeredUsers = {
    'user1': 'password1',
    'test': 'test123',
    'admin': 'admin123'
};

const loginScreen = document.getElementById('login-screen');
const signupScreen = document.getElementById('signup-screen');
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const nextButton = document.getElementById('next-btn');
const timerElement = document.getElementById('timer');
const questionCounterElement = document.getElementById('question-counter');
const homeScreen = document.getElementById('home-screen');
const homeStartBtn = document.getElementById('home-start-btn');
const navHome = document.getElementById('nav-home');
const navLogin = document.getElementById('nav-login');
const navLearn = document.getElementById('nav-learn');

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Check if user exists and password is correct
    if (registeredUsers.hasOwnProperty(username) && registeredUsers[username] === password) {
        currentUser = username;
        loginScreen.style.display = 'none';
        showScreen('home-screen');
        document.getElementById('login-form').reset();
        updateNavAuth();
    } else {
        alert('Invalid username or password. Please try again or sign up for a new account.');
    }
});

document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    
    if (!username || !email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Check if username already exists
    if (registeredUsers.hasOwnProperty(username)) {
        alert('Username already exists. Please choose a different username.');
        return;
    }
    
    // Register new user
    registeredUsers[username] = password;
    alert('Account created successfully! Please login with your credentials.');
    signupScreen.style.display = 'none';
    loginScreen.style.display = 'block';
    document.getElementById('signup-form').reset();
});

document.getElementById('signup-toggle').addEventListener('click', function(e) {
    e.preventDefault();
    loginScreen.style.display = 'none';
    signupScreen.style.display = 'block';
});

document.getElementById('login-toggle').addEventListener('click', function(e) {
    e.preventDefault();
    signupScreen.style.display = 'none';
    loginScreen.style.display = 'block';
});

// Utility: show one screen and hide all others
function showScreen(id) {
    const screens = [homeScreen, loginScreen, signupScreen, startScreen, quizScreen, resultScreen, document.getElementById('learn-page')];
    screens.forEach(s => { if (s) s.style.display = 'none'; });
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
    if (id === 'home-screen') {
        document.body.classList.add('home-active');
    } else {
        document.body.classList.remove('home-active');
    }
}

function updateNavAuth() {
    if (!navLogin) return;
    if (currentUser) {
        navLogin.textContent = 'Logout';
    } else {
        navLogin.textContent = 'Login';
    }
}

if (homeStartBtn) {
    homeStartBtn.addEventListener('click', function() {
        showScreen('start-screen');
    });
}

if (navHome) {
    navHome.addEventListener('click', function(e) {
        e.preventDefault();
        showScreen('home-screen');
    });
}

if (navLearn) {
    navLearn.addEventListener('click', function(e) {
        e.preventDefault();
        showScreen('learn-page');
    });
}
const learnBackBtn = document.getElementById('learn-back');
const learnToQuizBtn = document.getElementById('learn-to-quiz');

if (learnBackBtn) {
    learnBackBtn.addEventListener('click', function() {
        showScreen('learn-page');
    });
}
if (learnToQuizBtn) {
    learnToQuizBtn.addEventListener('click', function() {
        showScreen('start-screen');
    });
}

if (navLogin) {
    navLogin.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentUser) {
            currentUser = null;
            updateNavAuth();
            showScreen('home-screen');
        } else {
            showScreen('login-screen');
        }
    });
}

showScreen('home-screen');
updateNavAuth();

document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);

function startQuiz() {
    selectedTopic = document.getElementById('topic').value;
    selectedDifficulty = document.getElementById('difficulty').value;
    selectedQuestionCount = parseInt(document.getElementById('question-count').value);
    
    const availableQuestions = quizData[selectedTopic][selectedDifficulty];
    
    if (availableQuestions.length === 0) {
        alert('No questions available for the selected topic and difficulty.');
        return;
    }
    
    selectedQuestions = availableQuestions.sort(() => 0.5 - Math.random()).slice(0, selectedQuestionCount);

    function rotateOptionsForQuestion(q, r) {
        const opts = q.options.slice();
        const n = opts.length;
        if (n <= 1 || (r % n) === 0) return Object.assign({}, q);
        const shift = ((r % n) + n) % n;
        const rotated = opts.slice(shift).concat(opts.slice(0, shift));
        const correctText = q.options[q.answer];
        const newAnswer = rotated.indexOf(correctText);
        return { question: q.question, options: rotated, answer: newAnswer };
    }

    selectedQuestions = selectedQuestions.map((q, idx) => rotateOptionsForQuestion(q, idx % 4));
    
    currentQuestionIndex = 0;
    score = 0;
    
    startScreen.style.display = 'none';
    quizScreen.style.display = 'block';
    resultScreen.style.display = 'none';
    
    timeLeft = parseFloat(document.getElementById('time-limit').value) * 60;
    
    showQuestion();
    updateTimer();
    timer = setInterval(updateTimer, 1000);
}

function showQuestion() {
    if (currentQuestionIndex >= selectedQuestions.length) {
        endQuiz();
        return;
    }

    const currentQuestion = selectedQuestions[currentQuestionIndex];
    
    questionElement.textContent = currentQuestion.question;
    questionCounterElement.textContent = `${currentQuestionIndex + 1} of ${selectedQuestions.length}`;
    
    optionsElement.innerHTML = '';
    
    for (let i = 0; i < currentQuestion.options.length; i++) {
        const option = currentQuestion.options[i];
        const button = document.createElement('button');
        button.classList.add('option-btn');
        
        button.textContent = option;
        
        button.addEventListener('click', function() {
            selectAnswer(i);
        });
        
        optionsElement.appendChild(button);
    }
    
    nextButton.style.display = 'none';
}

function selectAnswer(selectedIndex) {
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    const optionButtons = optionsElement.querySelectorAll('.option-btn');
    
    optionButtons.forEach((button, index) => {
        button.disabled = true;
        
        if (index === currentQuestion.answer) {
            button.classList.add('correct');
        }
    });
    
    if (selectedIndex !== currentQuestion.answer) {
        optionButtons[selectedIndex].classList.add('wrong');
    }
    
    if (selectedIndex === currentQuestion.answer) {
        score++;
    }
    
    questionCounterElement.textContent = `${currentQuestionIndex + 1} of ${selectedQuestions.length}`;
    
    nextButton.style.display = 'block';
    if (currentQuestionIndex === selectedQuestions.length - 1) {
        nextButton.textContent = 'Finish';
    } else {
        nextButton.textContent = 'Next';
    }
}

nextButton.addEventListener('click', function() {
    currentQuestionIndex++;
    showQuestion();
});

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 0) {
        endQuiz();
    } else {
        timeLeft--;
    }
}

function endQuiz() {
    clearInterval(timer);
    
    const percentage = Math.round((score / selectedQuestions.length) * 100);
    
    document.getElementById('final-score').textContent = `${score} out of ${selectedQuestions.length}`;
    document.getElementById('percentage').textContent = percentage + '%';
    
    quizScreen.style.display = 'none';
    resultScreen.style.display = 'block';
}

document.getElementById('restart-btn').addEventListener('click', function() {
    resultScreen.style.display = 'none';
    startScreen.style.display = 'block';
});