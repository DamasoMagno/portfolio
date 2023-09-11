export function verifyDateIsCurrent(date: string) {
  if (!date) {
    return "Atual";
  }

  let dateForamted = new Date(date);
  return dateForamted.getFullYear();
}