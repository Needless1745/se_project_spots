class Api {
  constructor(options) {
    // constructor body
  }

  getInitialCards() {
    return fetch("https://around-api.en.tripleten-services.com/v1/cards", {
      headers: {
        authorization: "e0d99115-774a-4d40-9d24-e1bae166dd7d",
      },
    }).then((res) => res.json());
  }

  // other methods for working with the API
}

export default Api;
