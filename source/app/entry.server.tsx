import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";
import { installGlobals } from "@remix-run/node";
import type { EntryContext } from "@remix-run/node";

installGlobals();

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
