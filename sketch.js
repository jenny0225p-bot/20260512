let video; // 宣告一個全域變數來儲存攝影機影像
let faceMesh; // faceMesh 模型物件
let faces = []; // 儲存偵測到的臉部結果

function preload() {
  // 初始化 faceMesh 模型
  faceMesh = ml5.faceMesh();
}

function setup() {
  createCanvas(windowWidth, windowHeight); // 建立一個全螢幕的畫布
  video = createCapture(VIDEO); // 擷取攝影機影像
  video.hide(); // 隱藏由 createCapture 預設建立的 HTML 影片元素

  // 開始持續偵測影像中的臉部
  faceMesh.detectStart(video, gotFaces);
}

// 取得偵測結果的回呼函式
function gotFaces(results) {
  faces = results;
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
  fill('#ffff00'); // 黃色
  noStroke();
  
  // 使用 video.elt.videoWidth 獲取攝影機原始解析度，解決座標偏移問題
  let vW = video.elt.videoWidth || 640;
  let vH = video.elt.videoHeight || 480;
  
  let dx = map(pt.x, 0, vW, -imgW / 2, imgW / 2);
  let dy = map(pt.y, 0, vH, -imgH / 2, imgH / 2);

  // 從耳垂位置往下畫三個圓圈
  for (let i = 0; i < 3; i++) {
    circle(dx, dy + (i * 12) + 5, 8); // 微調間距與半徑，使其看起來更像垂吊耳環
  }
}

// 當視窗大小改變時，重新調整畫布大小以保持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

