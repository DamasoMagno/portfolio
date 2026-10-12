export class PostsConflict extends Error { constructor() { super("Os posts foram alterados em outra tela. Atualize os dados antes de salvar."); } }
