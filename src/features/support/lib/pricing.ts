import { OPERATION_SUPPORT_PRICE_IN_CENTS } from "../config";

// Único ponto que calcula o valor do Suporte de Operação (mesmo padrão de
// calculateLogisticsCost) — nenhum componente de interface ou serviço calcula esse valor
// diretamente.
export function calculateOperationSupportCost(included: boolean): number {
  return included ? OPERATION_SUPPORT_PRICE_IN_CENTS : 0;
}
