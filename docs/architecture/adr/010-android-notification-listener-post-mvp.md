# ADR-010 Android NotificationListener post-MVP

Status: Accepted

`NotificationListenerService` is not part of MVP. Default adapter is `NullNotificationIngestionAdapter`. iOS has no equivalent and must remain fully useful. No SMS permission.
