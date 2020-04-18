$(document).ready(function() {
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log("로그인 상태 ~~~");
      //  routing to main page
      // local에서 pushState를 사용할때 경로가 꼬이므로 앞에 #/을 붙여주면 됨
      window.history.pushState(null, null, "/#/home");
      router("/home");
      renderTodos();
    } else {
      console.log("로그아웃 상태 ~~~");
      // rendering to landing page
      window.history.pushState(null, null, "/#/");
      router("/");
    }
  });
});
