import React, { useState, useEffect, useCallback } from "react";
import { Form, Button, Container, Row, Col, ButtonGroup } from "react-bootstrap";
import Axios from "axios";

// 컴포넌트에 전달되는 Props 타입 정의
interface IProps {
  isModifyMode: boolean; // 수정 모드 여부
  boardId: number;       // 수정할 게시글 ID
  handleCancel: () => void; // 취소 버튼 클릭 시 동작
}

// 함수형 컴포넌트
const Write: React.FC<IProps> = ({ isModifyMode, boardId, handleCancel }) => {
  const [title, setTitle] = useState("");     // 제목 입력 상태
  const [content, setContent] = useState(""); // 내용 입력 상태

  // 제목 또는 내용 입력 변경 시 상태 업데이트
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "title") setTitle(value);
    else if (name === "content") setContent(value);
  };

  // 글 작성 함수 (POST /insert)
  const write = () => {
    Axios.post("http://localhost:8080/insert", { title, content })
      .then(() => {
        setTitle("");
        setContent("");
        handleCancel(); // 작성 후 폼 초기화 및 화면 닫기
      })
      .catch((e) => console.error(e));
  };

  // 글 수정 함수 (POST /update)
  const update = () => {
    Axios.post("http://localhost:8080/update", { title, content, id: boardId })
      .then(() => {
        setTitle("");
        setContent("");
        handleCancel(); // 수정 후 폼 초기화 및 화면 닫기
      })
      .catch((e) => console.error(e));
  };

  // 수정 모드일 경우 게시글 상세 정보 불러오기
  const detail = useCallback(() => {
    Axios.get(`http://localhost:8080/detail?id=${boardId}`)
      .then((res) => {
        if (res.data.length > 0) {
          setTitle(res.data[0].BOARD_TITLE);
          setContent(res.data[0].BOARD_CONTENT);
        }
      })
      .catch((e) => console.error(e));
  }, [boardId]);

  // 컴포넌트 마운트 또는 수정 모드 변경 시 상세 정보 로드
  useEffect(() => {
    if (isModifyMode) {
      detail();
    }
  }, [isModifyMode, boardId, detail]);

  return (
    <Container>
      <Row>
        <Col>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>제목</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={title}
                onChange={handleChange}
                placeholder="제목을 입력하세요"
              />
            </Form.Group>

            <Form.Group className="my-3">
              <Form.Label>내용</Form.Label>
              <Form.Control
                as="textarea"
                name="content"
                value={content}
                onChange={handleChange}
                placeholder="내용을 입력하세요"
              />
            </Form.Group>
          </Form>

          <div className="d-flex justify-content-end mt-4 mb-2">
            <ButtonGroup>
              <Button
                variant="primary"
                onClick={isModifyMode ? update : write}
              >
                완료
              </Button>
              <Button
                variant="danger"
                onClick={handleCancel}
              >
                취소
              </Button>
            </ButtonGroup>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Write;
