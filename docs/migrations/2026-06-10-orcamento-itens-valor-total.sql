-- Up Serviços — Total editável por linha do orçamento
-- Permite valor_total diferente de quantidade × valor_unitario (negociação).

alter table orcamento_itens
  add column if not exists valor_total numeric(12,2);

update orcamento_itens
set valor_total = round((quantidade * valor_unitario)::numeric, 2)
where valor_total is null;
