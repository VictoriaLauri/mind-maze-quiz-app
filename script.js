//DOM Elements
const nameInput = document.querySelector('.username');
const submitName = document.querySelector('.submit-name');
const nameInputContainer = document.querySelector('.name-input');
const instructions = document.querySelector('.instructions');
const questionContainer = document.querySelector('.question-container');
const summary = document.querySelector('.summary');
const counter = document.querySelector('.counter');

//declare global variables
let userName = '';
let selectedQuestions = [];
let currentQuestionIndex = 0;
let score = 0; //number of correct answers
const maxQuestions = 7;

const startGame = () => {
  // Get the value of the name input field
  userName = nameInput.value.trim();
  //validate user input
  if (userName === '') {
    alert('Please type which name you want to use');
    return;
  }

  localStorage.setItem('userName', userName);

  loadInstructions();
};

userName = localStorage.getItem('userName') || "my friend";

const loadInstructions = () => {
  // Hide the name input related elements
  nameInputContainer.style.display = 'none';
  instructions.innerHTML = ''; 

  // Create Instructions Content
  const instructionsHeader = document.createElement('h2');
  instructionsHeader.innerText = 'Instructions';
  const instructionsText = document.createElement('p');
  instructionsText.innerText = `Welcome to The Mind Maze, ${userName}!
  This is a fun trivia quiz to test your general knowledge and enjoy your time playing.
  You will be asked ${maxQuestions} questions in total, and you can choose an answer to each question by selecting one of the multiple options and pressing the "Submit your answer" button.
  The correct answer will be revealed once you have submitted your answer.
  You will receive a gold star for each correct answer. Good luck!`;

  // Append the instruction element to instructions container
  instructions.appendChild(instructionsHeader);
  instructions.appendChild(instructionsText);

  // Create a play button element
  const startButton = document.createElement('button');
  startButton.innerText = "Let's Play!";
  startButton.classList.add('start-button');

  // Append the button element to instructions container
  instructions.appendChild(startButton);

  startButton.addEventListener('click', loadQuestions);
};

// Load questions from JSON file
async function loadQuestions() {
  try {
    const response = await fetch('./questions.json');
    const allQuestions = await response.json();
    //the aim is to have random questions which do not repeat in one game
    selectedQuestions = shuffleArray(allQuestions).slice(0, maxQuestions);

    generateQuestion();
  } catch (error) {
    console.error('Error loading questions:', error);
  }
}

//shuffle array using Fisher-Yates algorithm to randomize the order of questions
const shuffleArray = (array) => {
  let shuffledArray = array.slice(); //work with a shallow copy
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

const generateQuestion = () => {
  instructions.style.display = 'none';
  questionContainer.style.display = 'block';
  questionContainer.innerHTML = '';

  if (currentQuestionIndex >= maxQuestions) {
    loadFeedback();
    return;
  }

  const questionData = selectedQuestions[currentQuestionIndex];

  const questionText = document.createElement('h2');
  questionText.innerText = `Question ${currentQuestionIndex + 1} of ${maxQuestions}: 
  ${questionData.question}`;
  questionContainer.appendChild(questionText);

  const form = document.createElement('form');
  form.id = "question-form";

  questionData.options.forEach((option, index) => {
    const radioContainer = document.createElement('div');
    radioContainer.classList.add('radio-option');

    const radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.id = `option-${index}`;
    radioInput.name = 'answer';
    radioInput.value = option;
    
    const radioLabel = document.createElement('label');
    radioLabel.setAttribute('for', `option-${index}`);
    radioLabel.innerText = option;

    radioContainer.appendChild(radioInput);
    radioContainer.appendChild(radioLabel);
    form.appendChild(radioContainer);
  })

  const answerButton = document.createElement('button');
  answerButton.type = 'button';
  answerButton.innerText = 'Submit Answer';
  answerButton.classList.add('answer-button');
  form.appendChild(answerButton);

  questionContainer.appendChild(form);

  answerButton.addEventListener('click', checkAnswer);
};

//add icons depending on whether the answer is correct or not
const updateCounter = (isCorrect) => {
  // Create a wrapper for the icon and number
  const iconWrapper = document.createElement('div');
  iconWrapper.style.display = 'flex';
  iconWrapper.style.flexDirection = 'column';
  iconWrapper.style.alignItems = 'center';
  iconWrapper.style.margin = '0 2px'; // Add space between icons

  // Create the icon element
  const icon = document.createElement('i');
  if (isCorrect) {
    icon.classList.add('fas', 'fa-star', 'correct'); // Add yellow star
    icon.style.color = 'gold';
  } else {
    icon.classList.add('fas', 'fa-times', 'incorrect'); // Add red cross
    icon.style.color = 'red';
  }

  // Create the number element
  const number = document.createElement('span');
  number.textContent = currentQuestionIndex + 1; 
  number.style.fontSize = '0.8rem'; // Smaller font size for the number
  number.style.marginTop = '5px'; // Add spacing between the icon and the number

  // Append the icon and number to the wrapper
  iconWrapper.appendChild(icon);
  iconWrapper.appendChild(number);

  // Append the wrapper to the counter element
  counter.appendChild(iconWrapper);
};

const checkAnswer = () => {
  const selectedAnswer = document.querySelector('input[name="answer"]:checked');

  if(!selectedAnswer) {
    alert('Please select an answer');
    return;
  }

  const userAnswer = selectedAnswer.value;
  const correctAnswer = selectedQuestions[currentQuestionIndex].correctAnswer;

  if (userAnswer === correctAnswer) {
    score++;
    updateCounter(true);
    alert(`This is the correct Answer! Well done, ${userName}!`);
  } else {
    updateCounter(false);
    alert(`Oops! The correct answer is: ${correctAnswer}. Keep going, ${userName}!`);
  }

  currentQuestionIndex++;

  if (currentQuestionIndex < maxQuestions) {
    generateQuestion();
  } else {
    loadFeedback();
  }
}

const loadFeedback = () => {
  summary.innerHTML = '';
  questionContainer.innerHTML = '';
  questionContainer.style.display = 'none';

  const feedbackHeader = document.createElement('h2');
  feedbackHeader.innerText = 'Game Over!';
  summary.appendChild(feedbackHeader);

  const feedbackText = document.createElement('p');
  feedbackText.innerText = `Congratulations, ${userName}! You have completed the quiz.
  You got ${score} out of ${maxQuestions} questions correct.`;
  summary.appendChild(feedbackText);

  const restartButton = document.createElement('button');
  restartButton.innerText = 'Play Again';
  restartButton.classList.add('restart-button');
  summary.appendChild(restartButton);

  // Clear the saved name from localStorage
  localStorage.removeItem('userName');

  restartButton.addEventListener('click', restart);
}

const restart = () => {
  selectedQuestions = [];
  currentQuestionIndex = 0;
  score = 0;
  userName = '';
  instructions.innerHTML = '';
  counter.innerHTML = '';
  summary.innerHTML = '';
  nameInput.value = '';
  nameInputContainer.style.display = 'flex';
  questionContainer.style.display = 'none';
}

submitName.addEventListener('click', startGame);

nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    startGame();
  }
});