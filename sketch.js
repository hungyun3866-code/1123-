let words = [
  // 建議至少有 10 個單字
  { english: "serendipity", chinese: "意外的驚喜；緣分" },
  { english: "ephemeral", chinese: "短暫的；瞬息的" },
  { english: "ubiquitous", chinese: "無所不在的" },
  { english: "mellifluous", chinese: "聲音甜美流暢的" },
  { english: "petrichor", chinese: "下雨時泥土的氣味" },
  { english: "ineffable", chinese: "難以言喻的" },
  { english: "languid", chinese: "疲倦的；無精打采的" },
  { english: "resplendent", chinese: "華麗輝煌的" },
  { english: "solitude", chinese: "孤獨；獨居" },
  { english: "synthesis", chinese: "綜合；合成" },
  { english: "vicarious", chinese: "間接感受到的" },
  { english: "ruminate", chinese: "沉思；反覆思考" }
];

let gameState = 'startScreen';    // 【修改】初始狀態設為開始畫面
let currentWord;               
let startTime;                 
let options = [];              
let correctOptionIndex = -1;
let resultMessage = "";
let questionType = 'E_to_C';

let score = 0;                  
let questionCount = 0;          
const MAX_QUESTIONS = 10;       
let availableWords = [];        

const MEMORIZE_DURATION = 4000; 
const QUESTION_DURATION = 5000; 

function setup() {
  createCanvas(800, 600);
  textSize(32);
  textAlign(CENTER, CENTER);
  // 遊戲狀態初始化為 'startScreen'，等待玩家點擊按鈕
}

// 初始化遊戲狀態，開始新的一局 (被開始按鈕觸發)
function startGame() {
  score = 0;
  questionCount = 0;
  
  let numToSelect = min(MAX_QUESTIONS, words.length);
  let shuffledWords = shuffle([...words]);
  availableWords = shuffledWords.slice(0, numToSelect);
  
  selectNewWord();
}

// 選擇新的單字
function selectNewWord() {
  if (questionCount >= MAX_QUESTIONS || availableWords.length === 0) {
    gameState = 'gameOver';
    return;
  }
  
  questionCount++; 
  currentWord = availableWords.pop(); 
  
  questionType = random() < 0.5 ? 'E_to_C' : 'C_to_E'; 
  gameState = 'memorize';
  startTime = millis();
  resultMessage = "";
  
  generateOptions(currentWord);
}

function generateOptions(correctWord) {
  // 略... (選項生成邏輯不變)
  options = [];
  let correctText;
  let allWordsForOptions; 

  if (questionType === 'E_to_C') {
    correctText = correctWord.chinese;
    allWordsForOptions = words.map(word => word.chinese);
  } else {
    correctText = correctWord.english;
    allWordsForOptions = words.map(word => word.english);
  }

  options.push(correctText);
  let wrongOptions = allWordsForOptions.filter(text => text !== correctText);
  
  while (options.length < 4 && wrongOptions.length > 0) {
    let randomIndex = floor(random(wrongOptions.length));
    options.push(wrongOptions[randomIndex]);
    wrongOptions.splice(randomIndex, 1);
  }
  
  options = shuffle(options);
  correctOptionIndex = options.findIndex(option => option === correctText);
}

function draw() {
  background(220);

  if (gameState === 'startScreen') { // 【新增】處理開始畫面狀態
    drawStartScreen();
  } else if (gameState === 'memorize') {
    drawMemorizeScreen();
  } else if (gameState === 'question') {
    drawQuestionScreen();
  } else if (gameState === 'result') {
    drawResultScreen();
  } else if (gameState === 'gameOver') {
    drawGameOverScreen();
  }
}

// 【新增】繪製開始畫面
function drawStartScreen() {
  fill(0);
  textSize(50);
  text("💡 單字記憶挑戰賽", width / 2, height / 2 - 150);
  
  // 規則提示
  textSize(24);
  fill(100);
  text(`遊戲規則：共 ${MAX_QUESTIONS} 題`, width / 2, height / 2 - 50);
  text(`記憶 4 秒，作答 5 秒。答對 +1，答錯/超時 -1。`, width / 2, height / 2 - 10);

  // 繪製開始按鈕
  let buttonWidth = 300;
  let buttonHeight = 80;
  let x = width / 2 - buttonWidth / 2;
  let y = height / 2 + 50;

  fill(50, 150, 50); // 綠色按鈕
  rect(x, y, buttonWidth, buttonHeight, 15);

  fill(255);
  textSize(36);
  text("開始遊戲", width / 2, y + buttonHeight / 2);
}

function drawMemorizeScreen() {
  // 略... (記憶畫面邏輯不變)
  let elapsedTime = millis() - startTime;
  drawScoreboard();

  if (elapsedTime < MEMORIZE_DURATION) {
    fill(0);
    textSize(48);
    text(currentWord.english, width / 2, height / 2 - 50);
    textSize(32);
    text(currentWord.chinese, width / 2, height / 2 + 30);
    
    let remainingTime = ceil((MEMORIZE_DURATION - elapsedTime) / 1000);
    textSize(18);
    fill(100);
    text(`記憶倒數: ${remainingTime} 秒`, width / 2, height - 50);
    
  } else {
    gameState = 'question';
    startTime = millis();
  }
}

function drawQuestionScreen() {
  // 略... (問題畫面邏輯不變)
  let elapsedTime = millis() - startTime;
  drawScoreboard();

  if (elapsedTime > QUESTION_DURATION) {
    checkTimeout();
    return;
  }

  fill(0);
  textSize(32);
  let questionText;
  if (questionType === 'E_to_C') {
    questionText = `請問 "${currentWord.english}" 的中文意思是什麼?`;
  } else {
    questionText = `請問 "${currentWord.chinese}" 對應的英文單字是什麼?`;
  }
  text(questionText, width / 2, 100);

  // 繪製選項按鈕
  let buttonWidth = 300;
  let buttonHeight = 60;
  let startY = 200;
  let spacing = 20;

  for (let i = 0; i < options.length; i++) {
    let x = width / 2 - buttonWidth / 2;
    let y = startY + i * (buttonHeight + spacing);
    fill(255); stroke(0); rect(x, y, buttonWidth, buttonHeight, 10);
    fill(0);
    textSize(questionType === 'C_to_E' ? 24 : 20); 
    text(options[i], width / 2, y + buttonHeight / 2);
  }
  
  let remainingTime = ceil((QUESTION_DURATION - elapsedTime) / 1000);
  if (remainingTime < 0) remainingTime = 0;
  
  textSize(20);
  fill(200, 0, 0);
  text(`作答倒數: ${remainingTime} 秒`, width / 2, height - 50);
}

function drawResultScreen() {
  // 略... (結果畫面邏輯不變)
  drawScoreboard(); 

  fill(0);
  textSize(40);
  text(resultMessage, width / 2, height / 2 - 50);
  
  textSize(24);
  text(`正確答案: ${currentWord.english} -> ${currentWord.chinese}`, width / 2, height / 2 + 20);

  let buttonWidth = 200;
  let buttonHeight = 50;
  let x = width / 2 - buttonWidth / 2;
  let y = height - 100;
  
  fill(0, 150, 255);
  rect(x, y, buttonWidth, buttonHeight, 10);
  
  fill(255);
  textSize(24);
  text(questionCount === MAX_QUESTIONS ? "查看結果" : "下一題", width / 2, y + buttonHeight / 2);
}

function drawGameOverScreen() {
  // 略... (遊戲結束畫面邏輯不變)
  fill(0);
  textSize(50);
  text("遊戲結束！", width / 2, height / 2 - 100);
  
  textSize(36);
  fill(score >= 0 ? 0 : 200, 0, 0); 
  text(`最終分數: ${score} 分`, width / 2, height / 2);

  let buttonWidth = 250;
  let buttonHeight = 60;
  let x = width / 2 - buttonWidth / 2;
  let y = height - 100;
  
  fill(50, 200, 50); 
  rect(x, y, buttonWidth, buttonHeight, 10);
  
  fill(255);
  textSize(28);
  text("再玩一次", width / 2, y + buttonHeight / 2);
}

function drawScoreboard() {
  // 略... (分數板邏輯不變)
  textSize(20);
  fill(50);
  
  textAlign(RIGHT, TOP);
  text(`分數: ${score}`, width - 20, 20);
  
  textAlign(LEFT, TOP);
  text(`第 ${questionCount} / ${MAX_QUESTIONS} 題`, 20, 20);
  
  textAlign(CENTER, CENTER); 
}

// 【修改】處理滑鼠點擊事件，新增 'startScreen' 狀態的按鈕邏輯
function mousePressed() {
  if (gameState === 'startScreen') {
    // 檢查是否點擊了「開始遊戲」按鈕
    let buttonWidth = 300;
    let buttonHeight = 80;
    let x = width / 2 - buttonWidth / 2;
    let y = height / 2 + 50;
    
    if (mouseX > x && mouseX < x + buttonWidth &&
        mouseY > y && mouseY < y + buttonHeight) {
      startGame(); // 點擊按鈕後開始遊戲
    }
  } else if (gameState === 'question') {
    // 略... (處理選項點擊)
    let buttonWidth = 300;
    let buttonHeight = 60;
    let startY = 200;
    let spacing = 20;

    for (let i = 0; i < options.length; i++) {
      let x = width / 2 - buttonWidth / 2;
      let y = startY + i * (buttonHeight + spacing);

      if (mouseX > x && mouseX < x + buttonWidth &&
          mouseY > y && mouseY < y + buttonHeight) {
        
        checkAnswer(i);
        break;
      }
    }
  } else if (gameState === 'result') {
    // 略... (處理下一題/查看結果按鈕)
    let buttonWidth = 200;
    let buttonHeight = 50;
    let x = width / 2 - buttonWidth / 2;
    let y = height - 100;
    
    if (mouseX > x && mouseX < x + buttonWidth &&
        mouseY > y && mouseY < y + buttonHeight) {
      selectNewWord(); 
    }
  } else if (gameState === 'gameOver') {
    // 略... (處理再玩一次按鈕)
     let buttonWidth = 250;
     let buttonHeight = 60;
     let x = width / 2 - buttonWidth / 2;
     let y = height - 100;
     
     if (mouseX > x && mouseX < x + buttonWidth &&
         mouseY > y && mouseY < y + buttonHeight) {
       startGame(); 
     }
  }
}

// 檢查玩家選擇的答案
function checkAnswer(chosenIndex) {
  gameState = 'result';
  if (chosenIndex === correctOptionIndex) {
    resultMessage = "✅ 恭喜你！回答正確！ (+1 分)";
    score++; 
  } else {
    resultMessage = "❌ 很遺憾，回答錯誤。 (-1 分)";
    score--; 
  }
}

// 處理超時的邏輯
function checkTimeout() {
  gameState = 'result';
  resultMessage = "⏰ 時間到！很遺憾，作答超時。 (-1 分)";
  score--; 
}

// 打亂陣列函式
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex != 0) {
    randomIndex = floor(random(currentIndex));
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}