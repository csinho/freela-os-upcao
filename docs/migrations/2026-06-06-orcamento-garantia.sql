-- Garantia do serviço no orçamento (quantidade + unidade)
alter table orcamentos add column if not exists garantia_quantidade integer;
alter table orcamentos add column if not exists garantia_unidade text;
