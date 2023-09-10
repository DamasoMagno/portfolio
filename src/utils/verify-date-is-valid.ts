export function verifyDateIsCurrent(date: string = "") {
  let dateForamted = new Date(date);

  if (!dateForamted) {
    return "Atual";
  }

  return dateForamted.getFullYear();
}