// document.cookie = "SameSite=None; Secure";

let todos = [];
let btnId = "";

const filters = {
  searchText: "",
  hideCompleted: false
};

// window.addEventListener("popstate", e => {
//   // e.state는 pushState 메소드의 첫번째 인수
//   console.log("[popstate]", e.state);
//   // 이전페이지 / 다음페이지 button이 클릭되면 router를 호출
//   router(e.state.path);
// });

// make different modal contents
const buildModal = contents => {
  const { title, body } = contents;
  const modalHeader = `
  <h3>${title}</h3>
  <p>${body}</p>
  `;
  return modalHeader;
};

const displayTodosByCheckbox = () => {
  if ($(".hide-todo ion-icon").attr("name") === "checkbox-outline") {
    hideCompleted(todos, filters);
  } else {
    createList(todos, filters);
  }
};

// update todo
const toggleTodo = element => {
  db.collection("todos")
    .doc(element.id)
    .update(element)
    .then(() => {
      console.log("updated successfully :)");
      displayTodosByCheckbox();
    })
    .catch(error => {
      console.log("error occured :(", error);
    });
};

// delete todo
const deleteTodo = element => {
  console.log(element.name);
  db.collection("todos")
    .doc(element.id)
    .delete()
    .then(() => {
      console.log("Selected todo deleted successfully !");
      const deleteIndex = todos.findIndex(todo => todo.id === element.id);
      if (deleteIndex !== -1) {
        todos.splice(deleteIndex, 1);
        displayTodosByCheckbox();
      }
    });
};

// filter and make a list of todos
const createList = function(todos, filters) {
  let count = 0;
  let filteredTodos = $.grep(todos, element => {
    return `${element.name} ${element.publishedDate}`
      .toLowerCase()
      .includes(filters.searchText.toLowerCase());
  });
  $(".todos").empty();

  if (todos.length === 0) {
    $(".todos").append("<p>Empty todos. You can add some now !</p>");
  } else {
    filteredTodos.forEach((element, index) => {
      $(".todos").append(
        `<div class="item-line">
        <ion-icon id="comp-${index}" class="check-isCompleted" name="logo-octocat"></ion-icon>
        <p class=${element.isCompleted ? "completed" : ""}>${element.name} (${
          element.publishedDate
        })</p>
        <ion-icon  id="${index}" class="delete-todo" name="trash-outline"></ion-icon>
        </div>`
      );
      $(`#comp-${index}`).click(() => {
        //
        element.isCompleted = !element.isCompleted;
        toggleTodo(element);
      });
      $(`#${index}`).click(() => {
        deleteTodo(element);
      });
      if (!element.isCompleted) count++;
    });
  }

  const compledRate =
    ((filteredTodos.length - count) / filteredTodos.length) * 100;
  $(".todo-left").text(
    `You have ${count} todo left ... (${compledRate.toFixed(1)} % completed)`
  );
};

// hide completed todos
const hideCompleted = (todos, filters) => {
  const filteredTodos = $.grep(todos, element => {
    if (element.isCompleted === filters.hideCompleted) {
      return element;
    }
  });
  createList(filteredTodos, filters);
};

// read todos
const renderTodos = function() {
  db.collection("todos")
    .where("uid", "==", auth.currentUser.uid) // filter todos connected to current user
    .get()
    .then(data => {
      data.docs.forEach(element => {
        const singleTodo = element.data();
        todos.push(singleTodo);
      });
      console.log(todos);
      createList(todos, filters);
    });
};

const modalFormToAutorize = `
<input class="email" type="text" placeholder="Email">
<input class="password" type="password" placeholder="Password">
<button class="sign-complete" type="submit">Okay</button>
`;

// landing page object
const landing = {
  page: `
  <div class="home-container">
      <div class="btn-wrapper">
        <button id="sign-up" class="register-btns ">Sign Up</button>
        <button id="log-in" class="register-btns">Log In</button>
        <button id="google-login" class="register-btns">Google Login</button>
      </div>
    </div>
  `,
  bindEvent: () => {
    // signup, login button click event
    $(".register-btns").click(function() {
      $(".register-btns").blur();
      btnId = this.id;
      let modalHeader = "";
      if (this.id === "sign-up") {
        modalHeader = buildModal({
          title: "Register",
          body: "Do you want to join us for better service?"
        });
      } else if (this.id === "log-in") {
        modalHeader = buildModal({
          title: "Log in",
          body: "Let's add more to-do in your account :)"
        });
      } else if (this.id === "google-login") {
        console.log("google login");
        const provider = new firebase.auth.GoogleAuthProvider();
        auth
          .signInWithPopup(provider)
          .then(result => {
            console.log(
              "logged in with google account successfully :)",
              result
            );
          })
          .catch(error => {
            console.log("failed to login with google account", error);
          });
      }
      if (this.id !== "google-login") {
        $(".header").append(modalHeader);
        $(".signup-form").append(modalFormToAutorize);

        // execute siginup or login
        $(".sign-complete").click(function(event) {
          event.preventDefault();
          const email = $(".email").val();
          const password = $(".password").val();

          if (btnId === "sign-up") {
            // create user
            auth
              .createUserWithEmailAndPassword(email, password)
              .then(userCredential => {
                login(email, password); // login automatically
              })
              .catch(e => {
                alert("your email or password is wrong !", e);
              });
          } else if (btnId === "log-in") {
            login(email, password);
          }
        });
        $(".modal").addClass("show");
      }
    });
  }
};

const modalFormToUpload = `
<input class="file" type="file">
<button class="update-complete" type="submit">Upload</button>
`;

// home page object
const home = {
  page: `
  <div class="container">
      <div class="settings">
        <button class="upload-profile-pic">Update Profile</button>
        <button class="logout">Logout</button>
      </div>

      <div class="contents">
      <div class="title-header">
        <img class="profile-image" src="" alt="profile-image"/>
        <h1>Todo Application</h1>
      </div>
        <p>Track todos that never before</p>
  
        <form class="todo-form">
          <input type="text" class="new-todo" placeholder="Enter todo" />
          <button type="submit" class="submit-todo">Add todo</button>
          <div class="hide-todo">
            <ion-icon name="square-outline"></ion-icon
            ><span>Hide completed</span>
          </div>
        </form>
  
        <input type="text" class="search-todo" placeholder="filter todos" />
        <div class="todo-left"></div>
        <div class="todos"></div>
      </div>
  
      <div class="footer">
        <p>Design and Developed by syleemomo (c)</p>
      </div>
    </div>
  `,
  bindEvent: () => {
    console.log(auth.currentUser.photoURL); // firebase로 설정한 사진
    console.log(auth.currentUser.providerData[0].photoURL); // 구글계정 또는 페이스북 계정 자체 프로필 사진
    console.log(auth.currentUser.uid);

    $(".profile-image").attr(
      "src",
      auth.currentUser.photoURL || "default-profile.png"
    ); // 새로고침시 파이어베이스에서 설정한 사진 가져오기
    $(".upload-profile-pic").click(event => {
      $(".upload-profile-pic").blur(); // if this code is removed, then button focused, so this code execute whenever pressing enter
      let profilePic;
      const modalHeader = buildModal({
        title: "Upload Profile Picture",
        body: "You can choose your awesome profile picture :)"
      });

      $(".header").append(modalHeader);
      $(".signup-form").append(modalFormToUpload);
      $(".file").change(e => {
        // console.log(e.target.files[0]);
        profilePic = e.target.files[0];
      });
      $(".update-complete").click(event => {
        event.preventDefault();

        if (profilePic) {
          const metadata = { contentType: profilePic.type };
          storageRef
            .child(`photoUpload/${profilePic.name}`)
            .put(profilePic, metadata)
            .then(snapshot => {
              // console.log(snapshot);
              snapshot.ref
                .getDownloadURL()
                .then(url => {
                  auth.currentUser
                    .updateProfile({
                      photoURL: `${url}`
                    })
                    .then(() => {
                      console.log("photo updated");
                      $(".profile-image").attr("src", url);
                      initModal();
                    })
                    .catch(error => {
                      alert("Error downloading photo");
                      console.log("Error downloading photo", error);
                    });
                })
                .catch(error => {
                  alert("Error uploading profile picture");
                  console.log("Error uploading profile picture", error);
                });
            });
        } else {
          alert(
            "There's no picture selected. you need to choose picture first "
          );
        }
      });
      $(".modal").addClass("show");
    });
    //  logout
    $(".logout").click(function() {
      todos = []; // 로그아웃 할때 투두 리스트를 비우거나 서버에서 값 읽어오기 전에 비우기
      auth.signOut().then(() => {
        console.log("logged out successfully !");
        // rendering to landing page
      });
    });
    // create todo
    $(".submit-todo").click(event => {
      const d = new Date();
      const publishedDate = `${d.getFullYear()}-${
        d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1
      }-${d.getDate()}`;
      event.preventDefault();
      const id = uuidv4();
      const todo = {
        name: $(".new-todo").val(),
        isCompleted: false,
        id: id,
        uid: auth.currentUser.uid,
        publishedDate: publishedDate
      };
      db.collection("todos")
        .doc(id)
        .set(todo)
        .then(() => {
          console.log("Todo added successfully !");
          $(".new-todo").val("");
          todos.push(todo);
          console.log(todos);
          displayTodosByCheckbox();
        })
        .catch(error => {
          console.log("error occured", error);
        });
    });
    // check or uncheck input box
    $(".hide-todo").click(() => {
      if ($(".hide-todo ion-icon").attr("name") === "square-outline") {
        $(".hide-todo ion-icon").attr("name", "checkbox-outline");
        hideCompleted(todos, filters);
      } else {
        $(".hide-todo ion-icon").attr("name", "square-outline");
        createList(todos, filters);
      }
    });
    // search todos
    $(".search-todo").on("input", () => {
      filters.searchText = $(".search-todo").val();
      displayTodosByCheckbox();
    });
  }
};

const routes = {
  "/": landing,
  "/home": home
};

const render = page => {
  $(".app").html(page);
};

const router = path => {
  const notFound = `${path} Not Found`;
  render(routes[path].page || notFound);
  routes[path].bindEvent();
};
