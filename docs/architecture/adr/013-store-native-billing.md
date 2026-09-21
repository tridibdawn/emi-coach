# ADR-013 Store-native billing

Status: Accepted

Subscriptions use StoreKit 2 and Play Billing behind `SubscriptionAdapter`. Receipts are store identifiers, not the user’s bank ledger. Default adapter is null (free). Do not add RevenueCat without a privacy review.
