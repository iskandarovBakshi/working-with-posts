// Write TypeScript code!
interface IPostItem {
  id: number;
  title: string;
  body: string;
}
const urls = {
  posts: "http://localhost:3000/posts", // GET, POST, PUT, PATCH, DELETE
};

async function getPosts() {
  const blob = await fetch(urls.posts, {
    method: "GET",
    headers: {
      "Content-type": "application/json",
    },
  });

  const data = await blob.json();

  return data.slice(0, 10);
}

async function deletePost(id) {
  const blob = await fetch(`${urls.posts}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
    },
  });

  const data = await blob.json();
  return data;
}

async function updatePost(id, data) {
  const blob = await fetch(`${urls.posts}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const json = await blob.json();

  return json;
}
async function createPost(data) {
  const blob = await fetch(urls.posts, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const json = await blob.json();

  return json;
}

const appContainer: any = document.getElementById("app");
const mainModal: any = document.getElementById("main-modal");
const warningModal: any = document.getElementById("warning-modal");
const modals: any = document.querySelectorAll(".modal");
const createPostElement: any = document.getElementById("modal-create");
const postsContainer: HTMLButtonElement = document.querySelector(".posts");

let freezeModals = false;

function updateModalContent(post: IPostItem, modalTitle = "") {
  mainModal.querySelector(".modal-title h4").innerHTML = modalTitle;
  mainModal.querySelector("form button").innerHTML = "Update";
  mainModal.querySelector("form input[name='title']").value = post.title;
  mainModal.querySelector("form textarea[name='body']").value = post.body;
}

// #region Modal controls

createPostElement.addEventListener("click", (e) => {
  openModal("#main-modal");
  updateModalContent(
    {
      title: "",
      body: "",
      id: null,
    },
    "Create Post"
  );
  mainModal.querySelector("form").onsubmit = (e) => {
    e.preventDefault();
    const postData = {
      body: e.target.elements.body.value,
      title: e.target.elements.title.value,
    };
    createPost(postData).then((d) => {
      mainModal.classList.remove("open");
      init();
    });
  };
});

modals.forEach((modal) => {
  const closeButtons = modal.querySelectorAll(".close-me");
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (freezeModals) {
        return;
      }
      modal.classList.remove("open");
    });
  });
  modal.addEventListener("click", (e) => {
    const target: HTMLElement = e.target as HTMLElement;
    if (target && !target.closest(".modal-content")) {
      if (freezeModals) {
        return;
      }
      modal.classList.remove("open");
    }
  });
});

function openModal(id) {
  document.querySelector(id).classList.add("open");

  // on modal open
  freezeModals = false;
}

// #endregion Modal controls

// #region Get Posts and render
function init() {
  postsContainer.innerHTML = "loading...";
  getPosts().then((posts) => {
    postsContainer.innerHTML = "";
    posts.forEach((post: IPostItem) => {
      const div = document.createElement("div");
      const h4 = document.createElement("h4");
      const p = document.createElement("p");
      const controls = document.createElement("div");
      const update = document.createElement("button");
      const deleteBtn = document.createElement("button");

      div.classList.add("post--element");
      controls.classList.add("post--controls");
      update.className = "btn btn-info";
      deleteBtn.className = "btn btn-delete";
      update.innerHTML = "Update";
      deleteBtn.innerHTML = "Delete";
      update.addEventListener("click", updatePostEvent.bind(update, post));
      deleteBtn.addEventListener(
        "click",
        deletePostEvent.bind(deleteBtn, post)
      );
      h4.innerHTML = post.title;
      p.innerHTML = post.body;

      controls.appendChild(update);
      controls.appendChild(deleteBtn);
      div.appendChild(h4);
      div.appendChild(p);
      div.appendChild(controls);
      postsContainer.appendChild(div);
    });
  });
}

init();

function updatePostEvent(post: IPostItem, e) {
  openModal("#main-modal");
  updateModalContent(post, `Update ${post.title}`);
  mainModal.querySelector("form").onsubmit = (e) => {
    e.preventDefault();
    const postData = {
      body: e.target.elements.body.value,
      title: e.target.elements.title.value,
    };
    updatePost(post.id, postData).then((d) => {
      mainModal.classList.remove("open");
      init();
    });
  };
}
function deletePostEvent(post: IPostItem, e) {
  openModal("#warning-modal");
  warningModal.querySelector(".modal-title h4").innerHTML = post.title;
  warningModal.querySelector(".submit-modal").disabled = false;
  warningModal.querySelector(".submit-modal").onclick = (e) => {
    deletePost(post.id).then((d) => {
      setTimeout(() => {
        init();
        warningModal.classList.remove("open");
      }, 5000);
    });
    freezeModals = true;
    warningModal.querySelector(".submit-modal").disabled = true;
  };
}

// #endregion
