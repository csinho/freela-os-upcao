/** Remove tudo que não for dígito */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Máscara CPF: 000.000.000-00 | CNPJ: 00.000.000/0000-00 */
export function maskDocumento(value: string): string {
  const d = onlyDigits(value).slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function allSameDigits(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

function cpfCheckDigit(digits: string, factor: number): number {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += Number(digits[i]) * (factor - i);
  }
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

export function isValidCPF(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 11 || allSameDigits(d)) return false;
  const d1 = cpfCheckDigit(d.slice(0, 9), 10);
  const d2 = cpfCheckDigit(d.slice(0, 10), 11);
  return d1 === Number(d[9]) && d2 === Number(d[10]);
}

export type DocumentoTipo = "cpf" | "cnpj" | null;

export function isCnpjFormat(value: string): boolean {
  return value.includes("/") || onlyDigits(value).length > 11;
}

export function documentoTipo(value: string): DocumentoTipo {
  const len = onlyDigits(value).length;
  if (len === 0) return null;
  if (isCnpjFormat(value)) return "cnpj";
  return "cpf";
}

/** Valida apenas CPF; CNPJ aceito sem verificação. */
export function validateDocumento(value: string): string | null {
  const d = onlyDigits(value);
  if (!d) return null;
  if (isCnpjFormat(value)) return null;

  if (d.length < 11) return "CPF incompleto";
  return isValidCPF(d) ? null : "CPF inválido";
}

/** Máscara: (71) 9 9675-5745 (celular) ou (71) 3456-7890 (fixo) */
export function maskTelefone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d[2] === "9") {
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d[2]} ${d.slice(3)}`;
    return `(${d.slice(0, 2)}) ${d[2]} ${d.slice(3, 7)}-${d.slice(7)}`;
  }
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d[2]} ${d.slice(3, 7)}-${d.slice(7, 11)}`;
}

export function validateTelefone(value: string): string | null {
  const d = onlyDigits(value);
  if (!d) return null;
  if (d.length < 10) return "Telefone incompleto";
  if (d.length === 11 && d[2] !== "9") return "Celular deve começar com 9 após o DDD";
  if (d.length > 11) return "Telefone inválido";
  return null;
}

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function validateEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  return EMAIL_RE.test(v) ? null : "E-mail inválido";
}

/** Máscara CEP: 00000-000 */
/** Máscara de percentual: dígitos + sufixo %, limitado a 0–100. */
export function maskPercent(value: string): string {
  const digits = onlyDigits(value).slice(0, 3);
  if (!digits) return "";
  const n = Math.min(100, parseInt(digits, 10));
  return `${n}%`;
}

export function parsePercent(masked: string): number {
  const digits = onlyDigits(masked);
  if (!digits) return 0;
  return Math.min(100, parseInt(digits, 10));
}

export function formatPercentInput(percentual: number): string {
  if (!percentual) return "";
  return `${percentual}%`;
}

export function maskCep(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function validateCep(value: string): string | null {
  const d = onlyDigits(value);
  if (!d) return null;
  if (d.length < 8) return "CEP incompleto";
  return null;
}
