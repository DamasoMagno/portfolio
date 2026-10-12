export class RevisionConflict extends Error {
  constructor() { super("O conteúdo foi alterado em outra tela. Atualize a lista antes de salvar novamente."); }
}
