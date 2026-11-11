# Closepath for iPhone and Android

Closepath’s phone apps are a native shell around the site that already runs at [anzendigitalmedia.com](https://anzendigitalmedia.com). The shell is [Capacitor 8](https://capacitorjs.com/). The book, sign-in, and files stay in the Next.js app. The phone adds the camera, the photo library, the PDF picker, the share sheet, and the calendar.

An Expo or React Native rewrite would rebuild the book. This does not. The app id is `com.anzendigitalmedia.closepath`. The name on the home screen is Closepath. The owner is Anzen Digital Media, LLC.

The shell opens `https://anzendigitalmedia.com/closepath/sign-in`. A signed-in session is the same `closepath_session` cookie the website already sets. Deploy this repository before you submit the apps. Until that deploy, the live site does not yet know it is inside the shell, so it can still show checkout.

## Store billing

Apple’s guidelines 3.1.1 and 3.1.3 forbid selling a digital subscription inside an iOS app with Stripe, and they forbid showing the price or a link that starts that purchase. Google Play’s payments policy requires Google Play Billing when a digital subscription is sold in the Android app. Linking out to Stripe from the app is a rejection risk on both stores.

Both shells send `ClosepathNative/1 (ios)` or `ClosepathNative/1 (android)` on the user agent. For that user agent only, the site:

- does not render checkout, the monthly price, “Start free trial”, or Billing
- redirects `/`, `/products/closepath`, `/api/checkout`, and `/api/closepath/billing` to sign-in
- refuses those two POST routes even if the redirect is skipped

A normal phone browser does not send that token, so the website still offers the 7-day trial and Stripe Checkout. People subscribe in a browser, then sign in here. There is no in-app purchase in this phase.

Do not submit the iOS app until this website code is what production is serving.

## What the shell adds

Inside the shell, a deal file can:

- add one date with the phone’s calendar editor
- take a photo, pick a photo, or pick a PDF, then upload it through the existing attachment API (4.5 MB, same as the site)
- share the deal summary with the system share sheet

Outside the shell those controls stay the website’s file input, calendar links, and `navigator.share`.

## Build an Android debug APK

You need Node 22, JDK 21, and Android SDK 36 (this project’s `compileSdk` and `targetSdk`).

```bash
cd mobile
npm ci
npx cap sync android
cd android
./gradlew assembleDebug
```

The APK is `mobile/android/app/build/outputs/apk/debug/app-debug.apk`. It is signed with the Android debug key, which is enough to install on a device or emulator. It is not the key you upload to Play.

Point a local build at a dev server when you need to try the shell before a deploy:

```bash
cd mobile
CAPACITOR_SERVER_URL=http://10.0.2.2:3000/closepath/sign-in npx cap sync android
cd android && ./gradlew assembleDebug
```

`10.0.2.2` is the emulator’s name for the computer running `next dev`. Use the computer’s LAN address for a physical phone, and serve Next on `0.0.0.0`. Sync again without `CAPACITOR_SERVER_URL` before you keep a build. The committed config loads production.

## Run it

On an emulator or a phone with USB debugging:

```bash
adb install -r mobile/android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.anzendigitalmedia.closepath/.MainActivity
```

Sign in with an existing Closepath account. The book is the same book as the website.

Icons and the splash image are generated from `mobile/assets`, which is the mark in `app/icon.svg` on `#070708`. Regenerate after you change that art:

```bash
cd mobile
python3 scripts/render-brand.py
npm run assets
```

## iOS simulator

This environment has no Mac and no Xcode, so an iOS simulator build is not produced here. The Xcode project is `mobile/ios` and uses Swift Package Manager (no CocoaPods). On a Mac, or on the GitHub Actions macOS runner below:

```bash
cd mobile
npm ci
npx cap sync ios
cd ios/App
xcodebuild \
  -project App.xcodeproj \
  -scheme App \
  -sdk iphonesimulator \
  -configuration Debug \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath build \
  CODE_SIGNING_ALLOWED=NO \
  build
```

Open `mobile/ios/App/App.xcodeproj` in Xcode to run a simulator. The bundle id is `com.anzendigitalmedia.closepath`. Deployment target is iOS 15.

The app asks for the camera, the photo library, and calendar access. Those strings are in `mobile/ios/App/App/Info.plist`.

## Cloud builds

GitHub Actions builds both apps. No personal computer is required after the workflows are on the default branch.

- `.github/workflows/closepath-android.yml` builds a debug APK on every change under `mobile/`, and again every Monday, so a broken Android toolchain shows up before a release. A Play App Bundle is built only when you run the workflow by hand and choose the play track. A scheduled run does not build or sign a Play bundle.

### If the Android SDK setup fails

On 10 November 2026 the debug job died in `android-actions/setup-android@v3` before Gradle ran. That release still ran `sdkmanager tools`. Google no longer publishes the `tools` package, so sdkmanager exited with `Failed to find package 'tools'`.

The workflow now uses `android-actions/setup-android@v4.0.4` and tells it to install no packages. `mobile/scripts/install-android-sdk.sh` then installs only `platform-tools`, `platforms;android-<compileSdkVersion>`, and `build-tools;<buildToolsVersion>`. Those two versions are `compileSdkVersion` and `buildToolsVersion` in `mobile/android/variables.gradle`, and the app module uses the same values. The script stops if a package name is the old `tools` package. Dependabot opens a weekly pull request for GitHub Actions, so a later broken action pin shows up as an update instead of a silent failure. The Monday schedule runs the debug build even when nobody has pushed. GitHub only schedules the workflow that is on the default branch, so that Monday run starts after this change is merged.

If that step fails again, open the debug job log and read the `sdkmanager` line. Do not put `tools` back into the package list. Check that `variables.gradle` still has `compileSdkVersion` and `buildToolsVersion`, then run **Closepath Android** by hand with the debug track. `.github/dependabot.yml` also asks for weekly Gradle updates under `mobile/android` and weekly npm updates for the site.
- `.github/workflows/closepath-ios.yml` builds an unsigned simulator app on a macOS runner, and an App Store archive when you run it by hand after signing secrets exist.

### Secret names

Create these in the GitHub repository settings. Do not put the files in git. `.gitignore` already ignores keystores, `.p12`, `.mobileprovision`, and `.p8`.

Android, for the Play track:

| Secret | What it is |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64 of the upload keystore (`.jks`) |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |

iOS, for the App Store track, after Apple Developer enrollment:

| Secret | What it is |
| --- | --- |
| `IOS_DISTRIBUTION_CERTIFICATE_BASE64` | Base64 of the Apple Distribution `.p12` |
| `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD` | Password for that `.p12` |
| `IOS_PROVISIONING_PROFILE_BASE64` | Base64 of the App Store provisioning profile |
| `APP_STORE_CONNECT_API_KEY_ID` | App Store Connect API key id |
| `APP_STORE_CONNECT_ISSUER_ID` | Issuer id |
| `APP_STORE_CONNECT_API_KEY_BASE64` | Base64 of the `AuthKey_XXXX.p8` file |

The release jobs stop with the name of any missing secret. They do not invent a certificate.

Make the Android upload key once, on any computer, and store it somewhere the company controls:

```bash
keytool -genkeypair -v \
  -keystore closepath-upload.jks \
  -alias closepath \
  -keyalg RSA -keysize 2048 -validity 10000
```

Play App Signing can hold the app signing key. You keep the upload key. Lose the upload key and you cannot ship updates, so keep a second copy outside GitHub.

## Publish to Google Play

Use a Google Play Console account for the organization Anzen Digital Media, LLC (D-U-N-S 120523103).

1. Create the app. Package name: `com.anzendigitalmedia.closepath`. Default language English. App name Closepath.
2. Turn on Play App Signing. Register the upload key from the keystore above.
3. Put the four Android secrets on GitHub. Run **Closepath Android** with the track set to `play`. Download the `.aab` artifact.
4. Upload that App Bundle to a testing track first, then production. Play will not take the debug APK as a store build.
5. Store listing: short description, screenshots, the icon, and a feature graphic. Privacy policy URL: `https://anzendigitalmedia.com/privacy`.
6. Data safety: the app can read photos the person picks, use the camera, and add a calendar event when they ask. Sign-in uses an email and password. The book is stored on the existing site, not on the device as the source of truth.
7. Content rating questionnaire. The app has no ads and no in-app purchases.
8. Declare that the app does not use Play Billing because it does not sell anything. Subscriptions are started on the website. Do not add a store listing that says “buy in the app” or a link to Stripe.
9. Target API is 36, which is what `mobile/android/variables.gradle` sets. Raise it when Play’s current requirement moves past that.

A physical phone can install the debug APK for a last look before you upload the bundle.

## Publish to App Store Connect

There is no Apple Developer account yet. Enrollment is waiting on payment. Use an **organization** account for Anzen Digital Media, LLC, D-U-N-S 120523103. A personal team will not match the company name on the store.

After Apple accepts the organization:

1. Register the App ID `com.anzendigitalmedia.closepath` with no In-App Purchase capability.
2. Create an Apple Distribution certificate and an App Store provisioning profile for that App ID. Store them as the iOS secrets above. Create an App Store Connect API key with Developer access and store that too.
3. In App Store Connect, create the app Closepath under the Anzen team. Bundle ID `com.anzendigitalmedia.closepath`. SKU `closepath`.
4. Run **Closepath iOS** with the track set to `app-store`. The macOS runner archives and exports an `.ipa`. Upload it with the API key (Transporter, or `xcrun altool` / `notarytool` as the workflow does when the secrets exist).
5. Privacy nutrition labels: camera (photos attached to a deal), photo library (the person picks a picture), and calendar (a date is added when they ask). Contact info is the account email they type. Data is linked to the account because the book is stored for that email. The app does not track for advertising.
6. Age rating and export compliance: the app only uses HTTPS. It does not add its own encryption beyond the system.
7. Review notes: Closepath is sign-in only. Subscriptions, including the 7-day trial, are sold on anzendigitalmedia.com in a browser, not in the app. The build must not show a price, a trial button, or Stripe. Give review a real account that already has an active book.
8. Screenshots from the iPhone simulator sizes App Store asks for (6.7-inch and 6.5-inch, and iPad if you leave iPad on). The project supports iPhone and iPad.

App Review guideline 4.2 (minimum functionality) is why the shell is not only a web view. Calendar, camera, photos, PDFs, and the share sheet are native. If review still calls it a website, the reply is those features and the fact that purchase stays on the website on purpose.

## Before the first submission

- This branch is deployed, so production sends the store-safe pages to the shell.
- A reviewer account exists and can open a book.
- Android upload key and, once Apple enrollment finishes, the iOS certificate and profile are in GitHub secrets and nowhere in git.
- You have read the listing on a device and confirmed there is no price and no checkout button.
