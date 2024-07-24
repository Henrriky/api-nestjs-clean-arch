import { UniqueEntityID } from '../entities/unique-entity-id'

/**
 * Interface/Contrato que todos os eventos de domínio concreto devem seguir
 */
export interface DomainEvent {
  ocurredAt: Date
  getAggregateId(): UniqueEntityID
}
