import "./index.css";
import {
  enableValidation,
  config,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import { handleSubmit } from "../utils/helpers.js";
import logo from "../images/logo.svg";
import editIcon from "../images/pencil.svg";
import pencilLight from "../images/pencil-light.svg";
import postIcon from "../images/plus.svg";
import Api from "../utils/Api.js";
import closeWhitebtn from "../images/close-btn-light.svg";

document.getElementById("logo").src = logo;
document.querySelector(".profile__edit-icon").src = pencilLight;
document.getElementById("pencil").src = editIcon;
document.getElementById("plus").src = postIcon;

//Api instance
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "e0d99115-774a-4d40-9d24-e1bae166dd7d",
    "Content-Type": "application/json",
  },
});

//Profile Edit Modal Selectors
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);
const editProfileBtn = document.querySelector(".profile__edit-btn");
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");

//New Post Modal Selectors
const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostSubmitBtn = document.querySelector(".modal__submit-btn");
const newPostNameInput = newPostModal.querySelector("#post-caption-input");
const newPostLinkInput = newPostModal.querySelector("#post-image-input");
const newPostForm = newPostModal.querySelector(".modal__form");

//Avatar Modal Seletors
const profileAvatarEl = document.querySelector(".profile__avatar");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

//Delete Modal Selectors
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteCancelBtn = deleteModal.querySelector(".modal__btn-cancel");

const deleteModalCloseBtn = deleteModal.querySelector(
  ".modal__close_type_delete"
);
deleteModalCloseBtn.style.backgroundImage = `url(${closeWhitebtn})`;
deleteModalCloseBtn.style.backgroundColor = "transparent";

if (deleteCancelBtn) {
  deleteCancelBtn.addEventListener("click", () => {
    closeModal(deleteModal);
  });
}

// Preview Modal Selectors
const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(
  ".modal__close-btn_type_preview"
);
const previewImageEl = previewModal.querySelector(".modal__image");
const previewImageCaption = previewModal.querySelector(".modal__caption");

//Card Elements
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");

const cardsList = document.querySelector(".cards__list");

let selectedCard;
let selectedCardId;

// Init load

api
  .getAppInfo()
  .then(([cards, userData]) => {
    profileNameEl.textContent = userData.name;
    profileDescriptionEl.textContent = userData.about;
    profileAvatarEl.src = userData.avatar;

    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });
  })
  .catch(console.error);

function handleDeleteCard(cardElement, cardData) {
  selectedCard = cardElement;
  selectedCardId = cardData._id;
  openModal(deleteModal);
}

//Init Card Render
function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-btn");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  if (data.isLiked) {
    cardLikeBtnEl.classList.add("card__like-btn_active");
  }

  // Liked
  cardLikeBtnEl.addEventListener("click", (evt) => {
    handleLike(evt, data);
  });

  cardDeleteBtnEl.addEventListener("click", () => {
    handleDeleteCard(cardElement, data);
  });

  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewImageEl.alt = data.name;
    previewImageCaption.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

//Delete Card Submit Handle
function handleDeleteSubmit(evt) {
  function makeRequest() {
    return api.deleteCard(selectedCardId).then(() => {
      selectedCard.remove();
      selectedCard = null;
      selectedCardId = null;
      closeModal(deleteModal);
    });
  }

  handleSubmit(makeRequest, evt);
}

//Profile Edit Submit Handle
function handleEditProfileSubmit(evt) {
  function makeRequest() {
    evt.preventDefault();

    const newName = editProfileNameInput.value;
    const newAbout = editProfileDescriptionInput.value;

    return api
      .editUserInfo({ name: newName, about: newAbout })
      .then((updatedUser) => {
        profileNameEl.textContent = updatedUser.name;
        profileDescriptionEl.textContent = updatedUser.about;

        closeModal(editProfileModal);
        editProfileForm.reset();
      });
  }
  handleSubmit(makeRequest, evt);
}

editProfileForm.addEventListener("submit", handleEditProfileSubmit);

// New Post Handle
function handleAddCardSubmit(evt) {
  function makeRequest() {
    const newCardData = {
      name: newPostNameInput.value,
      link: newPostLinkInput.value,
    };

    return api.addCard(newCardData).then((cardServerData) => {
      const cardElement = getCardElement(cardServerData);
      cardsList.prepend(cardElement);
      disableButton(newPostSubmitBtn, config);
      closeModal(newPostModal);
    });
  }
  handleSubmit(makeRequest, evt);
}

newPostForm.addEventListener("submit", handleAddCardSubmit);

//Like evt handle
function handleLike(evt, cardData) {
  const likeBtn = evt.target;
  const isCurrentlyLiked = cardData.isLiked;

  api
    .changeLikeStatus(cardData._id, isCurrentlyLiked)
    .then((updatedCard) => {
      if (updatedCard.isLiked) {
        likeBtn.classList.add("card__like-btn_active");
      } else {
        likeBtn.classList.remove("card__like-btn_active");
      }
      cardData.isLiked = updatedCard.isLiked;
      cardData.likes = updatedCard.likes;
    })
    .catch(console.error);
}

//Modal functions
function openModal(modal) {
  modal.classList.add("modal_is-opened");
  function evtEscClose(evt) {
    if (evt.key === "Escape") {
      closeModal(modal);
    }
  }

  function evtOverlayClose(evt) {
    if (evt.target === modal) {
      closeModal(modal);
    }
  }
  document.addEventListener("keydown", evtEscClose);
  modal.addEventListener("mousedown", evtOverlayClose);

  modal._evtEscClose = evtEscClose;
  modal._evtOverlayClose = evtOverlayClose;
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");

  document.removeEventListener("keydown", modal._evtEscClose);
  modal.removeEventListener("mousedown", modal._evtOverlayClose);
}

const closeBtns = document.querySelectorAll(".modal__close-btn");

closeBtns.forEach((button) => {
  const modal = button.closest(".modal");
  button.addEventListener("click", () => closeModal(modal));
});

editProfileBtn.addEventListener("click", () => {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  openModal(editProfileModal);
});

newPostBtn.addEventListener("click", function () {
  openModal(newPostModal);
});

avatarModalBtn.addEventListener("click", function () {
  resetValidation(avatarForm, config);
  openModal(avatarModal);
});

previewModalCloseBtn.addEventListener("click", function () {
  closeModal(previewModal);
});

deleteForm.addEventListener("submit", handleDeleteSubmit);
deleteModalCloseBtn.addEventListener("click", function () {
  closeModal(deleteModal);
});

//Avatar Submit Handle
function handleAvatarSubmit(evt) {
  function makeRequest() {
    evt.preventDefault();

    const avatarLink = avatarInput.value;

    return api.editAvatarInfo(avatarLink).then((data) => {
      profileAvatarEl.src = data.avatar;

      avatarForm.reset();
      disableButton(avatarSubmitBtn, config);

      closeModal(avatarModal);
    });
  }
  handleSubmit(makeRequest, evt);
}

avatarForm.addEventListener("submit", handleAvatarSubmit);

//Enable Form Validation
enableValidation(config);
