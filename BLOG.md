# Building an Offline-First Desktop App With Electron + Powersync

> Introduction about what electron is.

asdf

> Why offline first is a great choice

## Main process vs renderer process - why should I care?

If you’ve only lived in the typical world of web development, Electron’s Process Model can feel a bit jarring at first glance.
However, if you already think in "frontend vs backend", the split maps quite well:

- **Main process**: the app's *orchestrator* (Node.js)
  - Creates browser windows
  - Owns native OS integrations (like file system IO, tray notifications, and the auto-updater)
- **Renderer process**: the *UI runtime* (Chromium)
  - Where you write your UI code (React, Svelte, etc.)
  - Creates a separate one per each window/webview (think tabs)

These two process, much like a frontend and server, cannot *directly* talk to each other.
Rather, you must make an API for them to talk to each other with serialized data.
In Electron development, this is called an **IPC Bridge** (Inter-process communication)

```mermaid
flowchart LR
  M["<b>Main Process</b><br/>━━━━━━━━━━━━<br/>Node.js Runtime<br/><br/>The app's orchestrator<br/>Creates windows & manages state"]
  R["<b>Renderer Process</b><br/>━━━━━━━━━━━━<br/>Chromium Runtime<br/><br/>The UI layer<br/>React, HTML, CSS"]

  M <===> |"IPC Bridge<br/>(Inter-Process Communication)"| R

  style M fill:#4a90e2,stroke:#2e5c8a,stroke-width:3px,color:#fff
  style R fill:#50c878,stroke:#2d7a4a,stroke-width:3px,color:#fff
```

The Electron documentation on their [Process Model](https://www.electronjs.org/docs/latest/tutorial/process-model) goes into greater depth on the subject.


