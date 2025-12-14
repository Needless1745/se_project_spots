export function handleSubmit(request, evt) {
  evt.preventDefault();
  request()
    .then(() => {
      // reset the form on success
      evt.target.reset();
    })
    .catch(console.error);
}
