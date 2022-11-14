const books = [];
const RENDER_EVENT = "render-books";
let isEditing = false;
let bookContent = {};

const bookTitle = document.getElementById("inputBookTitle");
const bookAuthor = document.getElementById("inputBookAuthor");
const bookYear = document.getElementById("inputBookYear");
const checkComplete = document.getElementById("inputBookIsComplete");
const formTitle = document.getElementById("formtitle");
const buttonSubmit = document.getElementById("bookSubmit");

document.addEventListener("DOMContentLoaded", function () {
  const submitData = document.getElementById("inputBook");
  submitData.addEventListener("submit", function (e) {
    e.preventDefault();
    isEditing ? updateBook() : addBook();
    clearInput();
  });

  const searchBook = document.getElementById("searchBook");
  searchBook.addEventListener("keyup", function (e) {
    e.preventDefault();
    searchBookFunction();
  });

  searchBook.addEventListener("submit", function (e) {
    e.preventDefault();
    searchBookFunction();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function clearInput() {
  bookTitle.value = "";
  bookAuthor.value = "";
  bookYear.value = "";
}

function updateView() {
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  return;
}

checkComplete.addEventListener("change", function () {
  checkComplete.checked
    ? (buttonSubmit.innerHTML =
        "Masukkan Buku ke rak <span>Selesai Dibaca</span>")
    : (buttonSubmit.innerHTML =
        "Masukkan Buku ke rak <span>Belum Selesai Dibaca</span>");
});

function toastNotif(message) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-right",
    iconColor: "white",
    customClass: {
      popup: "colored-toast",
    },
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });
  Toast.fire({
    icon: "success",
    title: message,
  });

  return Toast;
}

function addBook() {
  const generatedID = generateRandomID();

  const bookCollections = generateBookCollections(
    generatedID,
    bookTitle.value,
    bookAuthor.value,
    bookYear.value,
    checkComplete.checked
  );

  books.push(bookCollections);

  updateView();

  toastNotif("Berhasil Menambahkan Buku");
}

function generateRandomID() {
  return +new Date();
}

function generateBookCollections(id, title, author, year, isComplete) {
  return { id, title, author, year, isComplete };
}

document.addEventListener(RENDER_EVENT, function () {
  const incompleteList = document.getElementById("incompleteBookshelfList");
  const completeList = document.getElementById("completeBookshelfList");

  incompleteList.innerHTML = "";
  completeList.innerHTML = "";

  for (bookSingle of books) {
    const bookElement = createBook(bookSingle);
    bookSingle.isComplete
      ? completeList.append(bookElement)
      : incompleteList.append(bookElement);
  }
});

function createBook(bookCollections) {
  const { id, title, author, year, isComplete } = bookCollections;

  const createTitle = document.createElement("h3");
  createTitle.innerHTML = title;
  const createAuthor = document.createElement("p");
  createAuthor.innerHTML = author;
  const createYear = document.createElement("p");
  createYear.innerHTML = year;

  const actionBtn = document.createElement("div");
  actionBtn.classList.add("action");
  const doneBtn = document.createElement("i");
  doneBtn.classList.add("fa-solid", "fa-check", "done");
  const deleteBtn = document.createElement("i");
  deleteBtn.classList.add("fa-solid", "fa-trash-can", "delete");
  const undoBtn = document.createElement("i");
  undoBtn.classList.add("fa-solid", "fa-rotate-left", "done");
  const editBtn = document.createElement("i");
  editBtn.classList.add("fa-solid", "fa-pencil", "edit");

  const theContainer = document.createElement("article");
  theContainer.setAttribute("id", `book-${id}`);
  theContainer.classList.add("book_item");
  theContainer.append(createTitle, createAuthor, createYear, actionBtn);

  if (isComplete) {
    actionBtn.append(undoBtn, editBtn, deleteBtn);

    undoBtn.addEventListener("click", function () {
      undoCompleted(id);
    });

    deleteBtn.addEventListener("click", function () {
      deleteItem(id);
    });

    editBtn.addEventListener("click", function () {
      editItem(id);
    });
  } else {
    actionBtn.append(doneBtn, editBtn, deleteBtn);

    doneBtn.addEventListener("click", function () {
      bookCompleted(id);
    });

    deleteBtn.addEventListener("click", function () {
      deleteItem(id);
    });

    editBtn.addEventListener("click", function () {
      editItem(id);
    });
  }

  return theContainer;
}

function findBook(id) {
  for (const book of books) {
    if (book.id === id) {
      return book;
    }
  }
  return null;
}

function bookCompleted(id) {
  const bookTarget = findBook(id);

  if (bookTarget === null) return;

  bookTarget.isComplete = true;
  updateView();
}

function undoCompleted(id) {
  const bookTarget = findBook(id);

  if (bookTarget === null) return;

  bookTarget.isComplete = false;
  updateView();
}

function findBookIndex(id) {
  for (const index in books) {
    if (books[index].id === id) return index;
  }
  return -1;
}

function editItem(id) {
  isEditing = true;
  const bookTarget = findBook(id);
  bookContent = findBook(id);

  if (bookTarget === null) return;

  bookTitle.value = bookTarget.title;
  bookAuthor.value = bookTarget.author;
  bookYear.value = bookTarget.year;
  checkComplete.checked = bookTarget.isComplete;

  const editSubmitBtn = document.querySelector("#bookSubmit");
  formTitle.innerText = "Edit Data Buku";
  editSubmitBtn.innerText = "Udate Buku";
}

function updateBook() {
  books.splice(findBookIndex(bookContent.id), 1, bookContent);
  isEditing = false;
  if (
    bookContent.title != bookTitle.value ||
    bookContent.author != bookAuthor.value ||
    bookContent.year != bookYear.value ||
    bookContent.isComplete != checkComplete.checked
  ) {
    toastNotif("Data Berhasil Diupdate");
    bookContent.title = bookTitle.value;
    bookContent.author = bookAuthor.value;
    bookContent.year = bookYear.value;
    bookContent.isComplete = checkComplete.checked;
  }
  updateView();
  formTitle.innerText = "Masukkan Buku Baru";
  buttonSubmit.innerHTML = "Masukkan Buku ke rak <span></span>";
}

function deleteItem(id) {
  const bookTarget = findBookIndex(id);

  if (bookTarget === -1) return;

  Swal.fire({
    title: "Apakah kamu yakin menghapus buku?",
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Iya",
    denyButtonText: "No",
    customClass: {
      cancelButton: "order-2 right-gap",
      confirmButton: "order-1",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      toastNotif("Berhasil Menghapus Buku");
      books.splice(bookTarget, 1);
      updateView();
    }
  });
}

function searchBookFunction() {
  const searchBookInput = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  const bookItem = document.querySelectorAll(
    "section.book_shelf > .book_list > .book_item"
  );
  for (let i = 0; i < bookItem.length; i++) {
    valueText = bookItem[i].textContent || bookItem[i].innerText;
    if (valueText.toLowerCase().indexOf(searchBookInput) > -1) {
      bookItem[i].style.display = "";
    } else {
      bookItem[i].style.display = "none";
    }
  }
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_DATA));
  }
}

const SAVED_DATA = "saved-book";
const STORAGE_KEY = "BOOK_LIST";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
