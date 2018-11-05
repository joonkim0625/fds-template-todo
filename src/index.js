import "@babel/polyfill"; // 이 라인을 지우지 말아주세요!
import axios from 'axios'

const api = axios.create({
  baseURL: "https://furtive-cornet.glitch.me/"
});

// 로컬스토리지에 토큰이 포함되어 있으면 요청에 포함시키고, 없다면 요청에 포함시키지 않는 설정이 되어있는 코드
api.interceptors.request.use(function(config) {
  // localStorage에 token이 있으면 요청에 헤더 설정, 없으면 아무것도 하지 않음
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = "Bearer " + token;
  }
  return config;
});



const templates = {
  loginForm: document.querySelector('#login-form').content,
  todoList: document.querySelector('#todo-list').content,
  todoItem: document.querySelector('#todo-item').content,
}

const rootEl = document.querySelector('.root')




// 이 함수를 선언하면 로그인폼을 그리도록 하는 함수
function drawLoginForm() {
  // 1. 템플릿 복사하기
  const fragment = document.importNode(templates.loginForm, true)
  // 2. 내용 채우고, 이벤트 리스너 등록하기
  const loginFormEl = fragment.querySelector('.login-form')
  // 로그인 과정에서 통신을 할 것이니 async를 사용
  loginFormEl.addEventListener('submit', async e => {

    e.preventDefault()
    // e: 이벤트 객체
    // e.target: 이벤트를 실제로 일으킨 요소 객체(여기서는 loginFormEl)
    // e.target.elements: 폼 내부에 들어있는 요소 객체를 편하게 가져올 수 있는 특이한 객체
    // e.target.elements.username: name 어트리뷰트에 username이라고 지정되어있는 input 요소 객체
    // .value: 사용자가 input 태그에 입력한 값
    const username = e.target.elements.username.value
    const password = e.target.elements.password.value

    const res = await api.post('/users/login', {
      username,
      password
    })
    localStorage.setItem('token', res.data.token)
    // 임시 테스트 코드 : 할 일을 추가한 적이 없으니까 빈 배열이 나와야 한다.
    // const res2 = await api.get('/todos')
    // alert(JSON.stringify(res2.data))

    // 로그인이 정상적으로 되었다면 drawTodoList()를 그려주면 된다.
    drawTodoList()

  })
  // 3. 문서 내부에 삽입하기

  rootEl.appendChild(fragment)

}

// 할 일 목록을 그리는 함수
async function drawTodoList() {
  // 서버의 할일 목록 불러오기

  const res = await api.get("/todos");
  const list = res.data;

  // 연습 ------------------
  // const list = [
  //   {
  //     id: 1,
  //     userId: 2,
  //     body: 'React 공부',
  //     complete: false
  //   },
  //   {
  //     id: 2,
  //     userId: 2,
  //     body: 'React Router 공부',
  //     complete: false
  //   }
  // ]
  // ----------------------
  // 역시 여기서도 같은 순서로
  // 1. 템플릿 복사
  const fragment = document.importNode(templates.todoList, true);
  // 2. 내용 채우고 이벤트 리스너 등록
  const todoListEl = fragment.querySelector(".todo-list");
  const todoFormEl = fragment.querySelector('.todo-form')


  // 할 일 목록 하나 그릴 때 그 위에다가 폼 하나를 그리면 되기 때문에 따로 템플릿을 만들어줄 이유가 없다.
  todoFormEl.addEventListener('submit', async e => {
    e.preventDefault()
    const body = e.target.elements.body.value
    const res = await api.post('/todos', {
      body,
      complete: false
    })
    if (res.status === 201) {
      drawTodoList()
    }
  })






  list.forEach(todoItem => {
    // 역시 이 안에서도 1.템플릿 복사, 2.내용 채운 뒤 이벤트 리스너 등록, 3.문서 내부에 삽입의 과정을 똑같이 실행
    // 1.
    const fragment = document.importNode(templates.todoItem, true);


    // 2.
    const bodyEl = fragment.querySelector(".body");
    bodyEl.textContent = todoItem.body;

    // 삭제 -------
    const deleteButtonEl = fragment.querySelector(".delete-button");
    deleteButtonEl.addEventListener('click', async e => {
      const body = todoItem.body
      const complete = todoItem.complete
      await api.delete('/todos/' + todoItem.id, {
        body,
        complete
      })

      drawTodoList()
    })
    // ------
    // 3.
    todoListEl.appendChild(fragment);
    //

  });

  // 3. 문서 내부에 삽입
  rootEl.textContent = ""; // 비우고 나서 추가를 시켜주면
  rootEl.appendChild(fragment);


}

drawLoginForm()
