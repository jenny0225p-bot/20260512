let video; // 宣告一個全域變數來儲存攝影機影像
let faceMesh; // faceMesh 模型物件
let faces = []; // 儲存偵測到的臉部結果
let handPose; // handPose 模型物件
let hands = []; // 儲存手勢偵測結果
let earringImages = []; // 儲存五種耳環圖片
let currentImgIndex = 0; // 當前選擇的耳環索引

function preload() {
  // 初始化 faceMesh 模型
  faceMesh = ml5.faceMesh();
  // 初始化 handPose 模型
  handPose = ml5.handPose();

  // 讀取指定的五種耳環圖片
  earringImages[0] = loadImage('pic/acc/acc1_ring.png');
  earringImages[1] = loadImage('pic/acc/acc2_pearl.png');
  earringImages[2] = loadImage('pic/acc/acc3_tassel.png');
  earringImages[3] = loadImage('pic/acc/acc4_jade.png');
  earringImages[4] = loadImage('pic/acc/acc5_phoenix.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight); // 建立一個全螢幕的畫布
  video = createCapture(VIDEO); // 擷取攝影機影像
  video.hide(); // 隱藏由 createCapture 預設建立的 HTML 影片元素

  // 開始持續偵測影像中的臉部
  faceMesh.detectStart(video, gotFaces);
  // 開始持續偵測影像中的手勢
  handPose.detectStart(video, gotHands);
}

// 取得偵測結果的回呼函式
function gotFaces(results) {
  faces = results;
}

// 取得手勢偵測結果的回呼函式
function gotHands(results) {
  hands = results;
}

function draw() {
  background('#dfa89e'); // 設定畫布背景顏色為 dfa89e

  // 在置中上方加上文字
  fill(255); // 白色文字
  noStroke();
  textSize(24);
  textAlign(CENTER, TOP);
  text("414730159彭宥蓁", width / 2, 20);
  textSize(18);
  text("作品為影像辨識_耳環臉譜", width / 2, 55);

  // 偵測手勢手指數量來切換耳環
  if (hands.length > 0) {
    let hand = hands[0];
    let count = 0;
    // 偵測食指、中指、無名指、小指 (比較指尖與第二關節的 Y 座標)
    if (hand.keypoints[8].y < hand.keypoints[6].y) count++;
    if (hand.keypoints[12].y < hand.keypoints[10].y) count++;
    if (hand.keypoints[16].y < hand.keypoints[14].y) count++;
    if (hand.keypoints[20].y < hand.keypoints[18].y) count++;
    // 偵測大拇指 (判斷與手掌中心的距離是否展開)
    if (dist(hand.keypoints[4].x, hand.keypoints[4].y, hand.keypoints[0].x, hand.keypoints[0].y) > 
        dist(hand.keypoints[3].x, hand.keypoints[3].y, hand.keypoints[0].x, hand.keypoints[0].y) * 1.2) count++;

    // 若手指數量為 1-5，則切換對應圖片
    if (count >= 1 && count <= 5) currentImgIndex = count - 1;
  }

  // 計算影像應顯示的寬高，為畫布的 50%
  let imgW = width * 0.5;
  let imgH = height * 0.5;

  // 確保攝影機影像已載入後才進行繪製
  if (video.loadedmetadata) {
    push(); // 儲存目前的繪圖狀態
    translate(width / 2, height / 2); // 移動到畫布中心
    scale(-1, 1); // 左右顛倒（鏡像）
    image(video, -imgW / 2, -imgH / 2, imgW, imgH); 

    // 繪製耳垂上的三個黃色圓圈（耳環效果）
    if (faces.length > 0) {
      let face = faces[0];
      // 根據 TensorFlow 官方 Mesh Map：132 為左耳垂，361 為右耳垂
      let leftLobe = face.keypoints[132]; 
      let rightLobe = face.keypoints[361];

      if (leftLobe) drawEarring(leftLobe, imgW, imgH);
      if (rightLobe) drawEarring(rightLobe, imgW, imgH);
    }
    pop(); 
  }
}

function drawEarring(pt, imgW, imgH) {
  // 使用 video.elt.videoWidth 獲取攝影機原始解析度，解決座標偏移問題
  let vW = video.elt.videoWidth || 640;
  let vH = video.elt.videoHeight || 480;
  
  let dx = map(pt.x, 0, vW, -imgW / 2, imgW / 2);
  let dy = map(pt.y, 0, vH, -imgH / 2, imgH / 2);
  
  // 比率位移：往外移動影像寬度的 3%，往上移動影像高度的 2%
  // dx 為負代表畫面左邊(右耳)，往外即是減少 dx；dx 為正代表畫面右邊(左耳)，往外即是增加 dx
  dx += (dx < 0 ? -1 : 1) * (imgW * 0.03);
  dy -= (imgH * 0.02);

  // 繪製耳環圖片
  push();
  imageMode(CENTER);
  // 依影像比例設定耳環大小 (寬度為影像 6%, 高度為影像 10%)，並繪製當前選中的圖片
  image(earringImages[currentImgIndex], dx, dy, imgW * 0.06, imgH * 0.1); 
  pop();
}

// 當視窗大小改變時，重新調整畫布大小以保持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
