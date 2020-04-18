/******* *******
 modal related
***************/

// initialize modal
const initModal = () => {
  btnId = "";
  $(".email").val("");
  $(".password").val("");
  $(".header").empty();
  $(".signup-form").empty();
  $(".modal").removeClass("show");
};
// process login
const login = (email, password) => {
  auth
    .signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log("logged in successfully.");
      console.log(userCredential);
      initModal();

      // 로그인하면 다시 렌더링이 일어나므로 loading.js에서 아래 코드를 실행함
      // 그러므로 아래 코드는 중복되므로 제거함
      // // routing to main page
      // router("/home");
      // renderTodos();

      // console.log(userCredential.user.uid);
      // console.log(userCredential.user.email);
    })
    .catch(e => {
      alert("failed to log in :(");
    });
};

$(".close-modal").click(function() {
  initModal();
});
