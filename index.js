const express = require('express'); // Express 웹 서버 모듈
const cors = require("cors"); // CORS 설정을 위한 모듈
const mysql = require("mysql"); // MySQL 연결을 위한 모듈
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.port || 8080;

// CORS 옵션 설정
let corsOptions = {
  origin: "http://localhost:3000", // 프론트엔드 주소
  credential: true, // 쿠키 등 인증 정보 허용
};

// 미들웨어 설정
app.use(cors(corsOptions));
app.use(express.json()); // JSON 요청 본문 파싱
app.use(bodyParser.urlencoded({ extended: true })); // HTML form 데이터 파싱

// MySQL 연결 풀 생성
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "bbs",
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});


// ------------------------ 📋 게시글 목록 조회 (페이징 포함) ------------------------
app.get("/list", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.size) || 10;
  const offset = (page - 1) * limit;

  const listQuery = `
    SELECT BOARD_ID, BOARD_TITLE, REGISTER_ID, DATE_FORMAT(REGISTER_DATE, '%Y-%m-%d') AS REGISTER_DATE
    FROM BOARD
    ORDER BY BOARD_ID DESC
    LIMIT ? OFFSET ?;
  `;

  const countQuery = `SELECT COUNT(*) AS totalCount FROM BOARD;`;

  db.query(countQuery, (err, countResult) => {
    if (err) {
      res.status(500).json({ error: "카운트 조회 실패" });
      return;
    }

    const totalCount = countResult[0].totalCount;

    db.query(listQuery, [limit, offset], (err, listResult) => {
      if (err) {
        res.status(500).json({ error: "목록 조회 실패" });
        return;
      }

      res.json({
        data: listResult,
        totalCount: totalCount,
      });
    });
  });
});


// ------------------------ 📄 게시글 상세 조회 ------------------------
app.post("/detail", (req, res) => {
  const id = req.body.id;

  const sqlQuery = `
    SELECT BOARD_ID, BOARD_TITLE, BOARD_CONTENT
    FROM BOARD
    WHERE BOARD_ID = ?;
  `;

  db.query(sqlQuery, [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: "상세 조회 실패" });
      return;
    }
    res.send(result);
  });
});


// ------------------------ 📝 게시글 작성 ------------------------
app.post("/insert", (req, res) => {
  const title = req.body.title;
  const content = req.body.title; // ⚠️ 이 부분은 title을 content로 잘못 사용 중 (버그)

  const sqlQuery = `
    INSERT INTO BOARD (BOARD_TITLE, BOARD_CONTENT, REGISTER_ID)
    VALUES (?, ?, '진히')
  `;

  db.query(sqlQuery, [title, content], (err, result) => {
    if (err) {
      res.status(500).json({ error: "글 작성 실패" });
      return;
    }
    res.send(result);
  });
});


// ------------------------ ✏️ 게시글 수정 ------------------------
app.post("/update", (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const content = req.body.content;

  const sqlQuery = `
    UPDATE BOARD
    SET BOARD_TITLE = ?, BOARD_CONTENT = ?, UPDATER_ID = '진희'
    WHERE BOARD_ID = ?;
  `;

  db.query(sqlQuery, [title, content, id], (err, result) => {
    if (err) {
      console.error("데이터베이스 수정 중 에러 발생", err);
      return res.status(500).send("내부 오류 또는 쿼리 오류");
    }
    res.send(result);
  });
});


// ------------------------ ❌ 게시글 삭제 ------------------------
app.post("/delete", (req, res) => {
  const idList = req.body.boardIdList;

  if (!Array.isArray(idList) || idList.length === 0) {
    return res.status(400).send("Invalid boardIdList");
  }

  const placeholders = idList.map(() => '?').join(',');
  const sqlQuery = `
    DELETE FROM BOARD
    WHERE BOARD_ID IN (${placeholders});
  `;

  db.query(sqlQuery, idList, (err, result) => {
    if (err) {
      console.error("데이터베이스 삭제 중 에러 발생", err);
      return res.status(500).send("내부 오류 또는 쿼리 오류");
    }
    res.send(result);
  });
});


// ------------------------ 🔁 서버 확인용 테스트 코드 (주석 처리됨) ------------------------
/*
app.get("/", (req, res) => {
  const sqlQuery = "INSERT INTO requested (rowno) VALUES (1)";
  db.query(sqlQuery, (err, result) => {
    res.send("성공");
  });
});
*/
