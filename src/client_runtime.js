import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { HashRouter as ReactRouterHashRouter, Routes as ReactRouterRoutes, Route as ReactRouterRoute, Link as ReactRouterLink, Navigate as ReactRouterNavigate, useNavigate as reactRouterUseNavigate, useLocation as reactRouterUseLocation, useParams as reactRouterUseParams } from "react-router-dom";
// Import jac-client (Vite handles CommonJS to ES module conversion)
import jacClient from 'jac-client';
function __jacJsx(tag, props, children) {
  if (tag === null) {
    tag = React.Fragment;
  }
  let childrenArray = [];
  if (children !== null) {
    if (Array.isArray(children)) {
      childrenArray = children;
    } else {
      childrenArray = [children];
    }
  }
  let reactChildren = [];
  for (const child of childrenArray) {
    if (child !== null) {
      reactChildren.push(child);
    }
  }
  if (reactChildren.length > 0) {
    let args = [tag, props];
    for (const child of reactChildren) {
      args.push(child);
    }
    return React.createElement.apply(React, args);
  } else {
    return React.createElement(tag, props);
  }
}
const Router = ReactRouterHashRouter;
const Routes = ReactRouterRoutes;
const Route = ReactRouterRoute;
const Link = ReactRouterLink;
const Navigate = ReactRouterNavigate;
const useNavigate = reactRouterUseNavigate;
const useLocation = reactRouterUseLocation;
const useParams = reactRouterUseParams;
function useRouter() {
  let navigate = reactRouterUseNavigate();
  let location = reactRouterUseLocation();
  let params = reactRouterUseParams();
  return {"navigate": navigate, "location": location, "params": params, "pathname": location.pathname, "search": location.search, "hash": location.hash};
}
function navigate(path) {
  window.location.hash = "#" + path;
}

async function __jacSpawn(left, right, fields) {
  // Custom implementation to avoid 'nd' parameter that jac-client adds
  // If right is provided, it's a nested walker call
  let walkerName = left;
  if (right !== "") {
    walkerName = `${left}/${right}`;
  }
  
  let token = __getLocalStorage("jac_token");
  let url = `/walker/${walkerName}`;
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : ""
    },
    // Don't include 'nd' parameter - walkers don't expect it
    body: JSON.stringify(fields)
  });
  
  if (!response.ok) {
    let error_text = await response.text();
    try {
      let error_json = JSON.parse(error_text);
      throw new Error(`Walker ${walkerName} failed: ${error_json.error || error_json.message || error_text}`);
    } catch {
      throw new Error(`Walker ${walkerName} failed: ${error_text}`);
    }
  }
  return await response.json();
}
function jacSpawn(left, right, fields) {
  return __jacSpawn(left, right, fields);
}
// Use jac-client functions directly
async function __jacCallFunction(function_name, args) {
  return await jacClient.jacCallFunction(function_name, args);
}

async function jacSignup(username, password) {
  return await jacClient.jacSignup(username, password);
}

async function jacLogin(username, password) {
  return await jacClient.jacLogin(username, password);
}

function jacLogout() {
  jacClient.jacLogout();
}

function jacIsLoggedIn() {
  return jacClient.jacIsLoggedIn();
}
function __getLocalStorage(key) {
  let storage = globalThis.localStorage;
  return storage ? storage.getItem(key) : "";
}
function __setLocalStorage(key, value) {
  let storage = globalThis.localStorage;
  if (storage) {
    storage.setItem(key, value);
  }
}
function __removeLocalStorage(key) {
  let storage = globalThis.localStorage;
  if (storage) {
    storage.removeItem(key);
  }
}
export { Link, Navigate, Route, Router, Routes, __getLocalStorage, __jacCallFunction, __jacJsx, __jacSpawn, __removeLocalStorage, __setLocalStorage, jacIsLoggedIn, jacLogin, jacLogout, jacSignup, jacSpawn, navigate, useLocation, useNavigate, useParams, useRouter };
