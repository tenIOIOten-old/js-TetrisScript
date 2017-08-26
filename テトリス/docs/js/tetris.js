const COLS = 10, ROWS = 20;  // 盤面のマスの数
let board = [];  // 盤面の状態を保持する変数
let lose;  // 一番うえまで積み重なっちゃったフラグ
let interval;  // ゲームタイマー保持用変数
let current; // 現在操作しているブロック
let currentX, currentY; // 現在操作しているブロックのいち
// ブロックのパターン
let shapes = [
  [ 1, 1, 1, 1 ],
  [ 2, 2, 0, 0,
    2, 2 ],
  [ 0, 3, 3, 0,
    3, 3 ],
  [ 3, 3, 0, 0,
    0, 3, 3 ],
  [ 4, 4, 4, 0,
    4 ],
  [ 5, 5, 5, 0,
    0, 0, 5 ],
  [ 0, 7, 0, 0,
    7, 7, 7 ]
];

// shapesからランダムにブロックのパターンを出力し、盤面の一番上へセットする
function newShape() {
  let id = Math.floor( Math.random() * shapes.length );  // ランダムにインデックスを出す
  let shape = shapes[ id ];
  // パターンを操作ブロックへセットする
  current = [];
  for ( let y = 0; y < 4; ++y ) {
    current[ y ] = [];
    for ( let x = 0; x < 4; ++x ) {
      let i = 4 * y + x;
      if ( typeof shape[ i ] != 'undefined' && shape[ i ] ) {
        current[ y ][ x ] = id + 1;
      }
      else {
        current[ y ][ x ] = 0;
      }
    }
  }
  // ブロックを盤面の上のほうにセットする
  currentX = 5;
  currentY = 0;
}

// 盤面を空にする
function init() {
  for ( let y = 0; y < ROWS; ++y ) {
    board[ y ] = [];
    for ( let x = 0; x < COLS; ++x ) {
      board[ y ][ x ] = 0;
    }
  }
}

// newGameで指定した秒数毎に呼び出される関数。
// 操作ブロックを下の方へ動かし、
// 操作ブロックが着地したら消去処理、ゲームオーバー判定を行う
function tick() {
  // １つ下へ移動する
  if ( valid( 0, 1 ) ) {
    ++currentY;
  }
  // もし着地していたら(１つしたにブロックがあったら)
  else {
    freeze();  // 操作ブロックを盤面へ固定する
    clearLines();  // ライン消去処理
    if (lose) {
      // もしゲームオーバなら最初から始める
      clearInterval(interval);
      return false;
    }
    // 新しい操作ブロックをセットする
    newShape();
  }
}

// 操作ブロックを盤面にセットする関数
function freeze() {
  for ( let y = 0; y < 4; ++y ) {
    for ( let x = 0; x < 4; ++x ) {
      if ( current[ y ][ x ] ) {
        board[ y + currentY ][ x + currentX ] = current[ y ][ x ];
      }
    }
  }
}

// 操作ブロックを回す処理
function rotate( current ) {
  let newCurrent = [];
  for ( let y = 0; y < 4; ++y ) {
    newCurrent[ y ] = [];
    for ( let x = 0; x < 4; ++x ) {
      newCurrent[ y ][ x ] = current[ 3 - x ][ y ];
    }
  }
  return newCurrent;
}

// 一行が揃っているか調べ、揃っていたらそれらを消す
function clearLines() {
  for ( let y = ROWS - 1; y >= 0; --y ) {
    let rowFilled = true;
    // 一行が揃っているか調べる
    for ( let x = 0; x < COLS; ++x ) {
      if ( board[ y ][ x ] == 0 ) {
        rowFilled = false;
        break;
      }
    }
    // もし一行揃っていたら, サウンドを鳴らしてそれらを消す。
    if ( rowFilled ) {
      // その上にあったブロックを一つずつ落としていく
      for ( let yy = y; yy > 0; --yy ) {
        for ( let x = 0; x < COLS; ++x ) {
          board[ yy ][ x ] = board[ yy - 1 ][ x ];
        }
      }
      ++y;  // 一行落としたのでチェック処理を一つ下へ送る
    }
  }
}


// キーボードが押された時に呼び出される関数
function keyPress( key ) {
  switch ( key ) {
  case 'left':
    if ( valid( -1 ) ) {
      --currentX;  // 左に一つずらす
    }
    break;
  case 'right':
    if ( valid( 1 ) ) {
      ++currentX;  // 右に一つずらす
    }
    break;
  case 'down':
    if ( valid( 0, 1 ) ) {
      ++currentY;  // 下に一つずらす
    }
    break;
  case 'rotate':
    // 操作ブロックを回す
    let rotated = rotate( current );
    if ( valid( 0, 0, rotated ) ) {
      current = rotated;  // 回せる場合は回したあとの状態に操作ブロックをセットする
    }
    break;
  case 'start':
    newGame();
    console.log('start')
    setInterval( render, 30 );
    break;
  }

}

// 指定された方向に、操作ブロックを動かせるかどうかチェックする
// ゲームオーバー判定もここで行う
function valid( offsetX, offsetY, newCurrent ) {
  offsetX = offsetX || 0;
  offsetY = offsetY || 0;
  offsetX = currentX + offsetX;
  offsetY = currentY + offsetY;
  newCurrent = newCurrent || current;
  for ( let y = 0; y < 4; ++y ) {
    for ( let x = 0; x < 4; ++x ) {
      if ( newCurrent[ y ][ x ] ) {
        if ( typeof board[ y + offsetY ] == 'undefined'
             || typeof board[ y + offsetY ][ x + offsetX ] == 'undefined'
             || board[ y + offsetY ][ x + offsetX ]
             || x + offsetX < 0
             || y + offsetY >= ROWS
             || x + offsetX >= COLS ) {
               if (offsetY == 1 && offsetX-currentX == 0 && offsetY-currentY == 1){
                 console.log('game over');
                 lose = true; // もし操作ブロックが盤面の上にあったらゲームオーバーにする
               }
               return false;
             }
      }
    }
  }
  return true;
}

// 盤面と操作ブロックを描画する
function render() {
    let elTrs = document.getElementById('body').children
    for (let i = 0; i < elTrs.length; i++) {
        let elTds = elTrs.item(i).children
        for (let j = 0; j < elTds.length; j++) {
            let elTd = elTds.item(j) // tdタグそれぞれに対する処理
            elTd.classList.remove(
                "tetrisI",
                "tetrisO",
                "tetrisZ",
                "tetrisS",
                "tetrisL",
                "tetrisJ",
                "tetrisT",
                "default"
            ); // まずはクラスをすべてなしにする
            switch (board[i][j]) {
                case 1:
                    elTd.classList.add("tetrisI"); // 数字の時にはクラスを割り振る
                    break;
                case 2:
                    elTd.classList.add("tetrisO"); 
                    break;
                case 3:
                    elTd.classList.add("tetrisZ"); 
                    break;
                case 4:
                    elTd.classList.add("tetrisS"); 
                    break;
                case 5:
                    elTd.classList.add("tetrisL"); 
                    break;
                case 6:
                    elTd.classList.add("tetrisJ"); 
                    break;
                case 7:
                    elTd.classList.add("tetrisT"); 
                    break;
                default:
                    elTd.classList.add("default"); // それ以外の時にはdefaultクラスを割り振る
            }
                  //　currentの領域に来たらcurrentに描画処理をする
            if(4>i-currentY&&i-currentY>=0&&j-currentX>=0&&4>j-currentX){
            switch (current[i-currentY][j-currentX]) {
                case 1:
                    elTd.classList.add("tetrisI"); 
                    break;
                case 2:
                    elTd.classList.add("tetrisO"); 
                    break;
                case 3:
                    elTd.classList.add("tetrisZ"); 
                    break;
                case 4:
                    elTd.classList.add("tetrisS"); 
                    break;
                case 5:
                    elTd.classList.add("tetrisL"); 
                    break;
                case 6:
                    elTd.classList.add("tetrisJ"); 
                    break;
                case 7:
                    elTd.classList.add("tetrisT"); 
                    break;
            }
            }
        }
    }
}

function newGame() {
  clearInterval(interval);  // ゲームタイマーをクリア
  init();  // 盤面をまっさらにする
  newShape();  // 新しいブロックをセットする
  lose = false;　//　負けのフラグをfalseに
  interval = setInterval( tick, 750 );  // 250ミリ秒ごとにtickという関数を呼び出す
}
document.body.onkeydown = function( e ) {
  // キーに名前をセットする
  const keys = {
    37: 'left',
    39: 'right',
    40: 'down',
    38: 'rotate',
    32: 'start'
  };

  if ( typeof keys[ e.keyCode ] != 'undefined' ) {
    // セットされたキーの場合はtetris.jsに記述された処理を呼び出す
    keyPress( keys[ e.keyCode ] );
    // 描画処理を行う
    render();
  }
};