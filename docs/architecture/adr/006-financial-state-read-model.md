# ADR-006 FinancialState as sole read model

Status: Accepted

`packages/financial-state` is the only read model for dashboards and planning. Screens must not import engine packages. SQLCipher stores facts; live UI recomputes `buildFinancialState`.
