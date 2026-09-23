Self-hosted web fonts (latin subset, variable weight), downloaded from Google Fonts on 2026-09-24.
Self-hosted instead of loading fonts.googleapis.com so the first paint doesn't wait on two
extra third-party connections (mobile performance). Declared in css/v2-theme.css.

- space-grotesk-latin.woff2  Space Grotesk  (weights 500-700)  © The Space Grotesk Project Authors
- nunito-latin.woff2         Nunito         (weights 400-800)  © The Nunito Project Authors
- jetbrains-mono-latin.woff2 JetBrains Mono (weights 500-700)  © The JetBrains Mono Project Authors

All three are licensed under the SIL Open Font License, Version 1.1: https://openfontlicense.org
To update: request the css2 URL with a modern browser user agent and copy the "/* latin */" woff2 URLs.
