-- Desconto em percentual sobre o subtotal (coluna desconto guarda o valor em R$ calculado)
alter table orcamentos
  add column if not exists desconto_percentual numeric(5,2) default 0;
