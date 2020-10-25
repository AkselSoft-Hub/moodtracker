import "eri/dist/index.css";
import { EriProvider } from "eri";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from "./components/App";
import AppState from "./components/AppState";
import store from "./store";

ReactDOM.render(
  <EriProvider>
    <Provider store={store}>
      <AppState>
        <App />
      </AppState>
    </Provider>
  </EriProvider>,
  document.getElementById("root")
);

if (process.env.NODE_ENV === "production" && navigator.serviceWorker)
  navigator.serviceWorker.register("service-worker.ts");
