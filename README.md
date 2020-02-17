## Vanilla JS single page application with Node.js API

The aim was to create single page web app with routing and modal dialog in short amount of time, without use of any front-end libraries, frameworks, or css; vanilla JS only.

- Typescript
- REST Node.js back-end
- API CORS headers
- Simultaneous serving of API on port 3000 and static HTML on port 4200
- DOM manipulation
- XMLHttpRequest wrapped in a Promise
- Front-end routing with state saved in route url
- Pop-up modal dialog closable by close button, click outside dialog, and Escape key
- Pop-up modal dialog animation
- Jasmine tests

### Usage

Run:

```
npm i
node ./src/server.js
```

Open url:
http://localhost:4200/

### Comments

App is tested on Chrome. Needs to be checked on other browsers.

App is most probably not compatible with Internet Explorer, not tested.

REST is implemented in 4 methods: GET, PUT, POST, DELETE. Tried to be close to classical approach when implementing PUT and POST, actually, for tables with unique indices implementing both does not have particular sense, one of them would be enough.

No bundler has been set up for project. It's planned to be done later.
