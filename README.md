# Anzen Digital Media

Closepath is the listing-to-close book at [anzendigitalmedia.com](https://anzendigitalmedia.com). The site is a Next.js app. Accounts, the book, and Stripe stay on that server.

## Closepath on iPhone and Android

The native apps live in [`mobile`](mobile/README.md). They are a Capacitor shell around this site, not a second book. The app id is `com.anzendigitalmedia.closepath`. Anzen Digital Media, LLC is the store account (D-U-N-S 120523103).

Build a debug APK from `mobile/` with `npm ci`, `npx cap sync android`, and `./gradlew assembleDebug`. iOS builds on a Mac or the GitHub Actions macOS runner. Signing secrets stay in GitHub, not in the repo.

The iOS app does not show Stripe checkout, a price, or an upgrade link (Apple guidelines 3.1.1 and 3.1.3). The Android app is sign-in only for the same reason under Google Play’s payments policy. People subscribe on the website, then sign in. The full build and store steps are in [mobile/README.md](mobile/README.md).
