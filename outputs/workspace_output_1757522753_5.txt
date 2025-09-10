# CaseBuddy – Upgraded Case Intelligence Portal

CaseBuddy is a lightweight legal case management portal designed to help you organise, analyse and manage legal cases without any server‑side dependencies.  It was rebuilt from the original Replit project as a modern static web application that runs entirely in the browser.

## Features

* **Case management** – create unlimited cases with titles and descriptions.  All cases are listed in a sidebar for quick access.
* **Document repository** – attach documents to a case with an optional file upload.  Files are stored in the browser using base64 encoding.
* **Evidence gallery** – add photographs or videos as evidence for each case.  Evidence is also stored locally in the browser.
* **Timeline** – record important events for a case.  If no date is provided, today’s date is used automatically.
* **FOIA requests** – log freedom‑of‑information requests with subject lines and optional descriptions.
* **Search** – quickly search across case titles, documents, evidence, timeline events and FOIA requests.  Selecting a search result opens the associated case.
* **Persistence** – all information is stored in your browser’s localStorage.  There is no backend server required.  Clearing your browser storage will remove all data.

## Running the app

1. Clone or download this repository.
2. Open `index.html` in your web browser.  No build steps are required.
3. Use the interface to add cases, documents, evidence and more.  All data is stored locally on your device.

### Serving locally with `http-server`

If you’d like to serve the app via a local web server, you can use the [`http-server`](https://www.npmjs.com/package/http-server) package (included in this environment):

```sh
npx http-server . -p 8000
```

Then navigate to `http://localhost:8000` in your browser.

## Notes

This upgraded version does not replicate every advanced feature of the original Replit project (such as authentication, analytics or integration with external services), but it provides a solid foundation for organising case information.  The application is completely static and can be deployed to any static hosting provider such as GitHub Pages or Netlify.
