export class JobsConflict extends Error { constructor() { super("As vagas foram alteradas em outra janela. Atualize a lista antes de salvar ou analisar novamente."); } }
