/**
 * Atua como subscriber
 * Interface/Contrato que todos os subscribers para os Domain Events devem seguir
 */
export interface EventHandler {
  setupSubscriptions(): void
}
