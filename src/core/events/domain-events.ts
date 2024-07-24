import { AggregateRoot } from '../entities/aggregate-root'
import { UniqueEntityID } from '../entities/unique-entity-id'
import { DomainEvent } from './domain-event'

type DomainEventCallback = (event: unknown) => void

export class DomainEvents {
  /**
   * Esse Map armazena quais são as callbacks registradas para um determinado evento (Subscribers)
   */
  private static handlersMap: Record<string, DomainEventCallback[]> = {}

  /**
   * Esse array armazena os AggregateRoot que possuem eventos pendentes (propriedade ready como false)
   */
  private static markedAggregates: AggregateRoot<unknown>[] = []

  /**
   * Dispara os eventos (Normalmente será chamado pelo banco de dados que marca o evento como pronto)
   */
  private static dispatchAggregateEvents(aggregate: AggregateRoot<unknown>) {
    aggregate.domainEvents.forEach((event: DomainEvent) => this.dispatch(event))
  }

  /**
   * Remove um AggregateRoot da lista de pendentes (não estão prontos)
   */
  private static removeAggregateFromMarkedDispatchList(
    aggregate: AggregateRoot<unknown>,
  ) {
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate))

    this.markedAggregates.splice(index, 1)
  }

  /**
   * Busca pelo AggregateRoot na lista de pendentes baseado no ID passado pelo parâmetro
   */
  private static findMarkedAggregateByID(
    id: UniqueEntityID,
  ): AggregateRoot<unknown> | undefined {
    return this.markedAggregates.find((aggregate) => aggregate.id.equals(id))
  }

  /**
   * Adiciona um AggregateRoot a lista de AggregaRoot que possuem eventos pendentes
   */
  public static markAggregateForDispatch(aggregate: AggregateRoot<unknown>) {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id)

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate)
    }
  }

  /**
   * Normalmente será chamado pelo banco de dados para marcar o evento como pronto e liberar para os subscribers
   * Realiza a lógica de disparar os eventos de domínio que estão pendentes no Aggregate passado
   * Dispara os eventos de domínio armazenados no Aggregate
   * Limpa os eventos do Aggregate
   * Remove o AggregateRoot da lista de AggregateRoot que possuem eventos pendentes
   */
  public static dispatchEventsForAggregate(id: UniqueEntityID) {
    const aggregate = this.findMarkedAggregateByID(id)

    if (aggregate) {
      this.dispatchAggregateEvents(aggregate)
      aggregate.clearEvents()
      this.removeAggregateFromMarkedDispatchList(aggregate)
    }
  }

  /**
   * Registra uma Callback de Domain Event para o evento especificado (eventClassName)
   */
  public static register(
    callback: DomainEventCallback,
    eventClassName: string,
  ) {
    const wasEventRegisteredBefore = eventClassName in this.handlersMap

    if (!wasEventRegisteredBefore) {
      this.handlersMap[eventClassName] = []
    }

    this.handlersMap[eventClassName].push(callback)
  }

  /**
   * Dispara para todos os subscribers que o evento ocorreu, passando o Domain Event.
   *
   * Armazena o nome da class do DomainEvent como chave no Map de eventos com subscribers.
   *
   * Verifica se o evento não está cadastrado no Map de eventos com subscribers.
   *
   * Chama todos os subscribers
   */
  private static dispatch(event: DomainEvent) {
    const eventClassName: string = event.constructor.name

    const isEventRegistered = eventClassName in this.handlersMap

    if (isEventRegistered) {
      const handlers = this.handlersMap[eventClassName]

      for (const handler of handlers) {
        handler(event)
      }
    }
  }

  /**
   * Realiza a limpeza de todos Subscribers
   */
  public static clearHandlers() {
    this.handlersMap = {}
  }

  /**
   * Realiza a limpeza da lista dos Aggregates com eventos pendentes
   */
  public static clearMarkedAggregates() {
    this.markedAggregates = []
  }
}
