/**
 * RN-INV-02 / RN-INV-05 — datas de execução não podem ser futuras, no fuso
 * canônico `America/Sao_Paulo` (a "data local" de conclusão).
 *
 * Comparamos por DIA-CALENDÁRIO em São Paulo (não por instante), para que um
 * registro feito hoje à noite no fuso local não seja recusado por causa de UTC.
 */

export const APP_TIMEZONE = "America/Sao_Paulo"

/** "YYYY-MM-DD" do instante `date` no fuso `America/Sao_Paulo`. */
export function toSaoPauloYMD(date: Date): string {
  // en-CA produz exatamente "YYYY-MM-DD".
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

/**
 * Verdadeiro se `date` NÃO é futura comparando o dia-calendário em São Paulo.
 * `now` é injetável para testes determinísticos.
 */
export function isNotFutureInSaoPaulo(date: Date, now: Date = new Date()): boolean {
  return toSaoPauloYMD(date) <= toSaoPauloYMD(now)
}
