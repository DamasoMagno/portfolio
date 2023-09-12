const mounths = [
  "Janeiro", "Fervereiro", "Março", "Abriu", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export function verifyDateIsCurrent(date: string) {
  if (!date) {
    return "Atual";
  }

  const yearOfDate = new Date(date).getFullYear();
  const monthOfDate = new Date(date).getMonth();
  return `${mounths[monthOfDate]} de ${yearOfDate}`;
}