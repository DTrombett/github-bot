/* eslint-disable @typescript-eslint/sort-type-union-intersection-members */
import { is } from "superstruct";
import type { APIRouter, RequestOptions } from "../../Util";
import { sLowercaseRequestMethod } from "../../Util";
import type RESTManager from "./RESTManager";

// eslint-disable-next-line @typescript-eslint/no-empty-function
const empty = (() => {}) as APIRouter;
const reflectors = [
	"toString",
	"valueOf",
	"inspect",
	"constructor",
	Symbol.toPrimitive,
	Symbol.for("nodejs.util.inspect.custom"),
];

export function buildRoute(manager: RESTManager): APIRouter {
	const route = [""];
	const handler: ProxyHandler<APIRouter> = {
		get(_, name) {
			if (reflectors.includes(name) || typeof name === "symbol") return () => route.join("/");
			if (is(name, sLowercaseRequestMethod))
				return (options: RequestOptions = {}) =>
					manager.request(name.toUpperCase() as Uppercase<typeof name>, route.join("/"), {
						...options,
					});
			route.push(name);
			return new Proxy<APIRouter>(empty, { ...handler });
		},
		apply(_, __, args: (string | null | undefined)[]) {
			route.push(...args.filter((x): x is string => x != null));
			return new Proxy<APIRouter>(empty, { ...handler });
		},
	};
	return new Proxy<APIRouter>(empty, { ...handler });
}

export default buildRoute;
